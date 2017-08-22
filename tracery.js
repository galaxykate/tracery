/**
 * @author Kate
 */

'use strict';

var Promise = require('bluebird');

var tracery = function() {

    var TraceryNode = function(parent, childIndex, settings) {
        this.errors = [];

        // No input? Add an error, but continue anyways
        if (settings.raw === undefined) {
            this.errors.push("Empty input for node");
            settings.raw = "";
        }

        // If the root node of an expansion, it will have the grammar passed as the 'parent'
        //  set the grammar from the 'parent', and set all other values for a root node
        if ( parent instanceof tracery.Grammar) {
            this.grammar = parent;
            this.parent = null;
            this.depth = 0;
            this.childIndex = 0;
        } else {
            this.grammar = parent.grammar;
            this.parent = parent;
            this.depth = parent.depth + 1;
            this.childIndex = childIndex;
        }

        this.raw = settings.raw;
        this.type = settings.type;
        this.isExpanded = false;

        if (!this.grammar) {
            console.warn("No grammar specified for this node", this);
        }

    };

    TraceryNode.prototype.toString = function() {
        return "Node('" + this.raw + "' " + this.type + " d:" + this.depth + ")";
    };

    // Expand the node (with the given child rule)
    //  Make children if the node has any
    TraceryNode.prototype.expandChildren = function(childRule, preventRecursion) {
        this.children = [];
        this.finishedText = "";

        // Set the rule for making children,
        // and expand it into section
        this.childRule = childRule;
        if (this.childRule !== undefined) {
            var sections = tracery.parse(childRule);

            // Add errors to this
            if (sections.errors.length > 0) {
                this.errors = this.errors.concat(sections.errors);

            }

            for (var i = 0; i < sections.length; i++) {
                this.children[i] = new TraceryNode(this, i, sections[i]);
                if (!preventRecursion)
                    this.children[i].expand(preventRecursion);

                // Add in the finished text
                this.finishedText += this.children[i].finishedText;
            }
        } else {
            // In normal operation, this shouldn't ever happen
            this.errors.push("No child rule provided, can't expand children");
            console.warn("No child rule provided, can't expand children");
        }
    };

    // Expand this rule (possibly creating children)
    TraceryNode.prototype.expand = function(preventRecursion) {
        var promise = Promise.resolve();
        if (!this.isExpanded) {
            this.isExpanded = true;

            this.expansionErrors = [];

            // Types of nodes
            // -1: raw, needs parsing
            //  0: Plaintext
            //  1: Tag ("#symbol.mod.mod2.mod3#" or "#[pushTarget:pushRule]symbol.mod")
            //  2: Action ("[pushTarget:pushRule], [pushTarget:POP]", more in the future)

            switch(this.type) {
              // Raw rule
              case -1: {
                  this.expandChildren(this.raw, preventRecursion);
                  break;
              }
              // plaintext, do nothing but copy text into finsihed text
              case 0: {
                  this.finishedText = this.raw;
                  break;
              }
              // Tag
              case 1: {
                // Parse to find any actions, and figure out what the symbol is
                this.preactions = [];
                this.postactions = [];

                var parsed = tracery.parseTag(this.raw);

                // Break into symbol actions and modifiers
                this.symbol = parsed.symbol;
                this.modifiers = parsed.modifiers;

                // Create all the preactions from the raw syntax
                for (let i = 0; i < parsed.preactions.length; i++) {
                    this.preactions[i] = new NodeAction(this, parsed.preactions[i].raw);
                }
                for (let i = 0; i < parsed.postactions.length; i++) {
                    //   this.postactions[i] = new NodeAction(this, parsed.postactions[i].raw);
                }

                // Make undo actions for all preactions (pops for each push)
                for (let i = 0; i < this.preactions.length; i++) {
                    if (this.preactions[i].type === 0)
                        this.postactions.push(this.preactions[i].createUndo());
                }

                // Activate all the preactions
                for (let i = 0; i < this.preactions.length; i++) {
                    this.preactions[i].activate();
                }

                this.finishedText = this.raw;

                // Expand (passing the node, this allows tracking of recursion depth)

                var selectedRule = this.grammar.selectRule(this.symbol, this, this.errors);

                this.expandChildren(selectedRule, preventRecursion);

                // Apply modifiers
                // TODO: Update parse function to not trigger on hashtags within parenthesis within tags,
                //   so that modifier parameters can contain tags "#story.replace(#protagonist#, #newCharacter#)#"

                const reducer = (text, modName, index) => {
                  var modParams = [];
                  if (modName.indexOf("(") > 0) {
                    var regExp = /\(([^)]+)\)/;

                    // Todo: ignore any escaped commas.  For now, commas always split
                    var results = regExp.exec(this.modifiers[index]);
                    if (!results || results.length < 2) {
                    } else {
                        modParams = results[1].split(",");
                        modName = this.modifiers[index].substring(0, modName.indexOf("("));
                    }
                  }
                  var mod = this.grammar.modifiers[modName];

                  // Missing modifier?
                  if (!mod) {
                    this.errors.push("Missing modifier " + modName);
                    text += "((." + modName + "))";
                  } else {
                    text = mod(text, modParams);
                  }
                  return text;
                };

                promise = Promise.reduce(this.modifiers, reducer, this.finishedText)
                  .then(finishedText => {
                    this.finishedText = finishedText;
                    for (var i = 0; i < this.postactions.length; i++) {
                        this.postactions[i].activate();
                    }
                    return Promise.resolve(this);
                  });

                // Perform post-actions

                break;
              }
              case 2: {
                // Just a bare action?  Expand it!
                this.action = new NodeAction(this, this.raw);
                this.action.activate();

                // No visible text for an action
                // TODO: some visible text for if there is a failure to perform the action?
                this.finishedText = "";
                break;
              }
            }
            return promise;
        } else {
          return promise;
          //console.warn("Already expanded " + this);
        }

    };

    TraceryNode.prototype.clearEscapeChars = function() {

        this.finishedText = this.finishedText.replace(/\\\\/g, "DOUBLEBACKSLASH").replace(/\\/g, "").replace(/DOUBLEBACKSLASH/g, "\\");
    };

    // An action that occurs when a node is expanded
    // Types of actions:
    // 0 Push: [key:rule]
    // 1 Pop: [key:POP]
    // 2 function: [functionName(param0,param1)] (TODO!)
    function NodeAction(node, raw) {
        /*
         if (!node)
         console.warn("No node for NodeAction");
         if (!raw)
         console.warn("No raw commands for NodeAction");
         */

        this.node = node;

        var sections = raw.split(":");
        this.target = sections[0];

        // No colon? A function!
        if (sections.length === 1) {
            this.type = 2;

        }

        // Colon? It's either a push or a pop
        else {
            this.rule = sections[1];
            if (this.rule === "POP") {
                this.type = 1;
            } else {
                this.type = 0;
            }
        }
    }


    NodeAction.prototype.createUndo = function() {
        if (this.type === 0) {
            return new NodeAction(this.node, this.target + ":POP");
        }
        // TODO Not sure how to make Undo actions for functions or POPs
        return null;
    };

    NodeAction.prototype.activate = function() {
        var grammar = this.node.grammar;
        switch(this.type) {
        case 0:
            // split into sections (the way to denote an array of rules)
            this.ruleSections = this.rule.split(",");
            this.finishedRules = [];
            this.ruleNodes = [];
            for (var i = 0; i < this.ruleSections.length; i++) {
                var n = new TraceryNode(grammar, 0, {
                    type : -1,
                    raw : this.ruleSections[i]
                });

                n.expand();

                this.finishedRules.push(n.finishedText);
            }

            // TODO: escape commas properly
            grammar.pushRules(this.target, this.finishedRules, this);
            break;
        case 1:
            grammar.popRules(this.target);
            break;
        case 2:
            grammar.flatten(this.target, true);
            break;
        }

    };

    NodeAction.prototype.toText = function() {
        switch(this.type) {
        case 0:
            return this.target + ":" + this.rule;
        case 1:
            return this.target + ":POP";
        case 2:
            return "((some function))";
        default:
            return "((Unknown Action))";
        }
    };

    // Sets of rules
    // Can also contain conditional or fallback sets of rulesets)
    function RuleSet(grammar, raw) {
        this.raw = raw;
        this.grammar = grammar;
        this.falloff = 1;

        if (Array.isArray(raw)) {
            this.defaultRules = raw;
        } else if ( typeof raw === 'string' || raw instanceof String) {
            this.defaultRules = [raw];
        } else if (raw === 'object') {
            // TODO: support for conditional and hierarchical rule sets
        }
    }

    RuleSet.prototype.selectRule = function(errors) {
        // console.log("Get rule", this.raw);
        // Is there a conditional?
        if (this.conditionalRule) {
            let value = this.grammar.expand(this.conditionalRule, true);
            // does this value match any of the conditionals?
            if (this.conditionalValues[value]) {
                let v = this.conditionalValues[value].selectRule(errors);
                if (v !== null && v !== undefined)
                    return v;
            }
            // No returned value?
        }

        // Is there a ranked order?
        if (this.ranking) {
            for (let i = 0; i < this.ranking.length; i++) {
                let v = this.ranking.selectRule();
                if (v !== null && v !== undefined)
                    return v;
            }

            // Still no returned value?
        }

        if (this.defaultRules !== undefined) {
            var index = 0;
            // Select from this basic array of rules

            // Get the distribution from the grammar if there is no other
            var distribution = this.distribution;
            if (!distribution)
                distribution = this.grammar.distribution;

            switch(distribution) {
            case "shuffle":

                // create a shuffle desk
                if (!this.shuffledDeck || this.shuffledDeck.length === 0) {
                    // make an array
                    this.shuffledDeck = fyshuffle(Array.apply(null, {
                        length : this.defaultRules.length
                    }).map(Number.call, Number), this.falloff);
                }

                index = this.shuffledDeck.pop();

                break;
            case "weighted":
                errors.push("Weighted distribution not yet implemented");
                break;
            case "falloff":
                errors.push("Falloff distribution not yet implemented");
                break;
            default:

                index = Math.floor(Math.pow(Math.random(), this.falloff) * this.defaultRules.length);
                break;
            }

            if (!this.defaultUses)
                this.defaultUses = [];
            this.defaultUses[index] = ++this.defaultUses[index] || 1;
            return this.defaultRules[index];
        }

        errors.push("No default rules defined for " + this);
        return null;

    };

    RuleSet.prototype.clearState = function() {

        if (this.defaultUses) {
            this.defaultUses = [];
        }
    };

    function fyshuffle(array, falloff) {
        var currentIndex = array.length,
            temporaryValue,
            randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    var Symbol = function(grammar, key, rawRules) {
        // Symbols can be made with a single value, and array, or array of objects of (conditions/values)
        this.key = key;
        this.grammar = grammar;
        this.rawRules = rawRules;

        this.baseRules = new RuleSet(this.grammar, rawRules);
        this.clearState();

    };

    Symbol.prototype.clearState = function() {

        // Clear the stack and clear all ruleset usages
        this.stack = [this.baseRules];

        this.uses = [];
        this.baseRules.clearState();
    };

    Symbol.prototype.pushRules = function(rawRules) {
        var rules = new RuleSet(this.grammar, rawRules);
        this.stack.push(rules);
    };

    Symbol.prototype.popRules = function() {
        this.stack.pop();
    };

    Symbol.prototype.selectRule = function(node, errors) {
        this.uses.push({
            node : node
        });

        if (this.stack.length === 0) {
            errors.push("The rule stack for '" + this.key + "' is empty, too many pops?");
            return "((" + this.key + "))";
        }

        return this.stack[this.stack.length - 1].selectRule();
    };

    Symbol.prototype.getActiveRules = function() {
        if (this.stack.length === 0) {
            return null;
        }
        return this.stack[this.stack.length - 1].selectRule();
    };

    Symbol.prototype.rulesToJSON = function() {
        return JSON.stringify(this.rawRules);
    };

    var Grammar = function(raw, settings) {
        this.modifiers = {};
        this.loadFromRawObj(raw);
    };

    Grammar.prototype.clearState = function() {
        var keys = Object.keys(this.symbols);
        for (var i = 0; i < keys.length; i++) {
            this.symbols[keys[i]].clearState();
        }
    };

    Grammar.prototype.addModifiers = function(mods) {
      // copy over the base modifiers
      for (var key in mods) {
        if (mods.hasOwnProperty(key)) {
            this.modifiers[key] = mods[key];
        }
      }
    };

    Grammar.prototype.loadFromRawObj = function(raw) {

        this.raw = raw;
        this.symbols = {};
        this.subgrammars = [];

        if (this.raw) {
            // Add all rules to the grammar
            for (var key in this.raw) {
                if (this.raw.hasOwnProperty(key)) {
                    this.symbols[key] = new Symbol(this, key, this.raw[key]);
                }
            }
        }
    };

    Grammar.prototype.createRoot = function(rule) {
        // Create a node and subnodes
        var root = new TraceryNode(this, 0, {
            type : -1,
            raw : rule,
        });

        return root;
    };

    Grammar.prototype.expand = function(rule, allowEscapeChars) {
        var root = this.createRoot(rule);
        root.expand();
        if (!allowEscapeChars)
            root.clearEscapeChars();

        return root;
    };

    Grammar.prototype.flatten = function(rule, allowEscapeChars) {
        var root = this.expand(rule, allowEscapeChars);

        return root.finishedText;
    };

    Grammar.prototype.toJSON = function() {
        var keys = Object.keys(this.symbols);
        var symbolJSON = [];
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            symbolJSON.push(' "' + key + '" : ' + this.symbols[key].rulesToJSON());
        }
        return "{\n" + symbolJSON.join(",\n") + "\n}";
    };

    // Create or push rules
    Grammar.prototype.pushRules = function(key, rawRules, sourceAction) {

        if (this.symbols[key] === undefined) {
            this.symbols[key] = new Symbol(this, key, rawRules);
            if (sourceAction)
                this.symbols[key].isDynamic = true;
        } else {
            this.symbols[key].pushRules(rawRules);
        }
    };

    Grammar.prototype.popRules = function(key) {
        if (!this.symbols[key])
            this.errors.push("Can't pop: no symbol for key " + key);
        this.symbols[key].popRules();
    };

    Grammar.prototype.selectRule = function(key, node, errors) {
        if (this.symbols[key]) {
            var rule = this.symbols[key].selectRule(node, errors);

            return rule;
        }

        // Failover to alternative subgrammars
        for (var i = 0; i < this.subgrammars.length; i++) {

            if (this.subgrammars[i].symbols[key])
                return this.subgrammars[i].symbols[key].selectRule();
        }

        // No symbol?
        errors.push("No symbol for '" + key + "'");
        return "((" + key + "))";
    };

    // Parses a plaintext rule in the tracery syntax
    tracery = {
        createGrammar : function(raw) {
            return new Grammar(raw);
        },

        // Parse the contents of a tag
        parseTag : function(tagContents) {

            var parsed = {
                symbol : undefined,
                preactions : [],
                postactions : [],
                modifiers : []
            };
            var sections = tracery.parse(tagContents);
            var symbolSection = undefined;
            for (var i = 0; i < sections.length; i++) {
                if (sections[i].type === 0) {
                    if (symbolSection === undefined) {
                        symbolSection = sections[i].raw;
                    } else {
                        throw ("multiple main sections in " + tagContents);
                    }
                } else {
                    parsed.preactions.push(sections[i]);
                }
            }

            if (symbolSection === undefined) {
                //   throw ("no main section in " + tagContents);
            } else {
                var components = symbolSection.split(".");
                parsed.symbol = components[0];
                parsed.modifiers = components.slice(1);
            }
            return parsed;
        },

        parse : function(rule) {
            var depth = 0;
            var inTag = false;
            var sections = [];
            var escaped = false;

            var errors = [];
            var start = 0;

            var escapedSubstring = "";
            var lastEscapedChar = undefined;

            if (rule === null) {
                sections = [];
                sections.errors = errors;

                return sections;
            }

            function createSection(start, end, type) {
                if (end - start < 1) {
                    if (type === 1)
                        errors.push(start + ": empty tag");
                    if (type === 2)
                        errors.push(start + ": empty action");

                }
                var rawSubstring;
                if (lastEscapedChar !== undefined) {
                    rawSubstring = escapedSubstring + "\\" + rule.substring(lastEscapedChar + 1, end);

                } else {
                    rawSubstring = rule.substring(start, end);
                }
                sections.push({
                    type : type,
                    raw : rawSubstring
                });
                lastEscapedChar = undefined;
                escapedSubstring = "";
            }

            for (var i = 0; i < rule.length; i++) {

                if (!escaped) {
                    var c = rule.charAt(i);

                    switch(c) {

                    // Enter a deeper bracketed section
                    case '[':
                        if (depth === 0 && !inTag) {
                            if (start < i)
                                createSection(start, i, 0);
                            start = i + 1;
                        }
                        depth++;
                        break;

                    case ']':
                        depth--;

                        // End a bracketed section
                        if (depth === 0 && !inTag) {
                            createSection(start, i, 2);
                            start = i + 1;
                        }
                        break;

                    // Hashtag
                    //   ignore if not at depth 0, that means we are in a bracket
                    case '#':
                        if (depth === 0) {
                            if (inTag) {
                                createSection(start, i, 1);
                                start = i + 1;
                            } else {
                                if (start < i)
                                    createSection(start, i, 0);
                                start = i + 1;
                            }
                            inTag = !inTag;
                        }
                        break;

                    case '\\':
                        escaped = true;
                        escapedSubstring = escapedSubstring + rule.substring(start, i);
                        start = i + 1;
                        lastEscapedChar = i;
                        break;
                    }
                } else {
                    escaped = false;
                }
            }
            if (start < rule.length)
                createSection(start, rule.length, 0);

            if (inTag) {
                errors.push("Unclosed tag");
            }
            if (depth > 0) {
                errors.push("Too many [");
            }
            if (depth < 0) {
                errors.push("Too many ]");
            }

            // Strip out empty plaintext sections

            sections = sections.filter(function(section) {
                if (section.type === 0 && section.raw.length === 0)
                    return false;
                return true;
            });
            sections.errors = errors;
            return sections;
        },
    };

    function isVowel(c) {
        var c2 = c.toLowerCase();
        return (c2 === 'a') || (c2 === 'e') || (c2 === 'i') || (c2 === 'o') || (c2 === 'u');
    }

    function isAlphaNum(c) {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
    }

    function escapeRegExp(str) {
      return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    var baseEngModifiers = {

        replace : function(s, params) {
            //http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
            return s.replace(new RegExp(escapeRegExp(params[0]), 'g'), params[1]);
        },

        capitalizeAll : function(s) {
            var s2 = "";
            var capNext = true;
            for (var i = 0; i < s.length; i++) {

                if (!isAlphaNum(s.charAt(i))) {
                    capNext = true;
                    s2 += s.charAt(i);
                } else {
                    if (!capNext) {
                        s2 += s.charAt(i);
                    } else {
                        s2 += s.charAt(i).toUpperCase();
                        capNext = false;
                    }

                }
            }
            return s2;
        },

        capitalize : function(s) {
            return s.charAt(0).toUpperCase() + s.substring(1);
        },

        a : function(s) {
            if (s.length > 0) {
                if (s.charAt(0).toLowerCase() === 'u') {
                    if (s.length > 2) {
                        if (s.charAt(2).toLowerCase() === 'i')
                            return "a " + s;
                    }
                }

                if (isVowel(s.charAt(0))) {
                    return "an " + s;
                }
            }

            return "a " + s;

        },

        firstS : function(s) {
            console.log(s);
            var s2 = s.split(" ");

            var finished = baseEngModifiers.s(s2[0]) + " " + s2.slice(1).join(" ");
            console.log(finished);
            return finished;
        },

        s : function(s) {
            switch (s.charAt(s.length -1)) {
              case 's':
                return s + "es";
              case 'h':
                return s + "es";
              case 'x':
                 return s + "es";
              case 'y':
                if (!isVowel(s.charAt(s.length - 2)))
                  return s.substring(0, s.length - 1) + "ies";
                else
                  return s + "s";
              default:
                  return s + "s";
            }
        },
        ed : function(s) {
            switch (s.charAt(s.length -1)) {
              case 's':
                return s + "ed";
              case 'e':
                return s + "d";
              case 'h':
                return s + "ed";
              case 'x':
                return s + "ed";
              case 'y':
                if (!isVowel(s.charAt(s.length - 2)))
                  return s.substring(0, s.length - 1) + "ied";
                else
                  return s + "d";
              default:
                return s + "ed";
            }
        }
    };

    tracery.baseEngModifiers = baseEngModifiers; 
    // Externalize
    tracery.TraceryNode = TraceryNode;

    tracery.Grammar = Grammar;
    tracery.Symbol = Symbol;
    tracery.RuleSet = RuleSet;
    return tracery;
}();

module.exports = tracery; 
=======
* @author Kate Compton
*/
     
var tracery = {
    utilities : {}
};

(function() {

    function inQuotes(s) {
        return '"' + s + '"';
    };

    function parseAction(action) {
        return action;
    };

    // tag format
    // a thing to expand, plus actions

    function parseTag(tag) {
        var errors = [];
        var prefxns = [];
        var postfxns = [];

        var lvl = 0;
        var start = 0;

        var inPre = true;

        var symbol,
            mods;

        function nonAction(end) {
            if (start !== end) {
                var section = tag.substring(start, end);
                if (!inPre) {
                    errors.push("multiple possible expansion symbols in tag!" + tag);
                } else {
                    inPre = false;
                    var split = section.split(".");
                    symbol = split[0];
                    mods = split.slice(1, split.length);
                }

            }
            start = end;
        };

        for (var i = 0; i < tag.length; i++) {
            var c = tag.charAt(i);

            switch(c) {
            case '[':
                if (lvl === 0) {
                    nonAction(i);
                }

                lvl++;
                break;
            case ']':
                lvl--;
                if (lvl === 0) {
                    var section = tag.substring(start + 1, i);
                    if (inPre)
                        prefxns.push(parseAction(section));
                    else
                        postfxns.push(parseAction(section));
                    start = i + 1;
                }
                break;

            default:
                if (lvl === 0) {

                }
                break;

            }
        }
        nonAction(i);

        if (lvl > 0) {
            var error = "Too many '[' in rule " + inQuotes(tag);
            errors.push(error);

        }

        if (lvl < 0) {
            var error = "Too many ']' in rule " + inQuotes(tag);
            errors.push(error);

        }

        return {
            preActions : prefxns,
            postActions : postfxns,
            symbol : symbol,
            mods : mods,
            raw : tag,
            errors : errors,
        };
    };

    // Split a rule into sections
    function parseRule(rule) {
        var sections = [];
        var errors = [];
        if (!( typeof rule == 'string' || rule instanceof String)) {
            errors.push("Cannot parse non-string rule " + rule);
            sections.errors = errors;
            return sections;
        }

        if (rule.length === 0) {
            return [];
        }

        var lvl = 0;
        var start = 0;
        var inTag = false;

        function createSection(end) {
            var section = rule.substring(start, end);
            if (section.length > 0) {
                if (inTag)
                    sections.push(parseTag(section));
                else
                    sections.push(section);
            }
            inTag = !inTag;
            start = end + 1;

        }

        for (var i = 0; i < rule.length; i++) {
            var c = rule.charAt(i);

            switch(c) {
            case '[':
                lvl++;
                break;
            case ']':
                lvl--;
                break;
            case '#':
                if (lvl === 0) {
                    createSection(i);
                }
                break;
            default:
                break;

            }

        }

        if (lvl > 0) {
            var error = "Too many '[' in rule " + inQuotes(rule);
            errors.push(error);

        }

        if (lvl < 0) {
            var error = "Too many ']' in rule " + inQuotes(rule);
            errors.push(error);

        }

        if (inTag) {
            var error = "Odd number of '#' in rule " + inQuotes(rule);
            errors.push(error);
        }

        createSection(rule.length);
        sections.errors = errors;
        return sections;
    };

    function testParse(rule, shouldFail) {
        console.log("-------");
        console.log("Test parse rule: " + inQuotes(rule) + " " + shouldFail);
        var parsed = parseRule(rule);
        if (parsed.errors && parsed.errors.length > 0) {
            for (var i = 0; i < parsed.errors.length; i++) {
                console.log(parsed.errors[i]);
            }
        }

    }

    function testParseTag(tag, shouldFail) {
        console.log("-------");
        console.log("Test parse tag: " + inQuotes(tag) + " " + shouldFail);
        var parsed = parseTag(tag);
        if (parsed.errors && parsed.errors.length > 0) {
            for (var i = 0; i < parsed.errors.length; i++) {
                console.log(parsed.errors[i]);
            }
        }
    }


    tracery.testParse = testParse;
    tracery.testParseTag = testParseTag;
    tracery.parseRule = parseRule;
    tracery.parseTag = parseTag;

    function spacer(size) {
        var s = "";
        for (var i = 0; i < size * 3; i++) {
            s += " ";
        }
        return s;
    }

    /* Simple JavaScript Inheritance
     * By John Resig http://ejohn.org/
     * MIT Licensed.
     */

    function extend(destination, source) {
        for (var k in source) {
            if (source.hasOwnProperty(k)) {
                destination[k] = source[k];
            }
        }
        return destination;
    }

    // Inspired by base2 and Prototype
    (function() {
        var initializing = false,
            fnTest = /xyz/.test(function() { xyz;
        }) ? /\b_super\b/ : /.*/;

        // The base Class implementation (does nothing)
        this.Class = function() {
        };

        // Create a new Class that inherits from this class
        Class.extend = function(prop) {
            var _super = this.prototype;

            // Instantiate a base class (but only create the instance,
            // don't run the init constructor)
            initializing = true;
            var prototype = new this();
            initializing = false;

            // Copy the properties over onto the new prototype
            for (var name in prop) {
                // Check if we're overwriting an existing function
                prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ? (function(name, fn) {
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) : prop[name];
            }

            // The dummy class constructor
            function Class() {
                // All construction is actually done in the init method
                if (!initializing && this.init)
                    this.init.apply(this, arguments);
            }

            // Populate our constructed prototype object
            Class.prototype = prototype;

            // Enforce the constructor to be what we expect
            Class.prototype.constructor = Class;

            // And make this class extendable
            Class.extend = arguments.callee;

            return Class;
        };
    })();

    /**
     * @author Kate
     */

    var Rule = function(raw) {
        this.raw = raw;
        this.sections = parseRule(raw);

    };

    Rule.prototype.getParsed = function() {
        if (!this.sections)
            this.sections = parseRule(raw);

        return this.sections;
    };

    Rule.prototype.toString = function() {
        return this.raw;
    };

    Rule.prototype.toJSONString = function() {
        return this.raw;
    };

    /**
     * @author Kate
     */

    var RuleWeighting = Object.freeze({
        RED : 0,
        GREEN : 1,
        BLUE : 2
    });

    var RuleSet = function(rules) {
        // is the rules obj an array? A RuleSet, or a string?
        if (rules.constructor === Array) {
            // make a copy
            rules = rules.slice(0, rules.length);
        } else if (rules.prototype === RuleSet) {
            // clone
        } else if ( typeof rules == 'string' || rules instanceof String) {
            var args = Array.prototype.slice.call(arguments);
            rules = args;
        } else {
            console.log(rules);
            throw ("creating ruleset with unknown object type!");
        }

        // create rules and their use counts

        this.rules = rules;
        this.parseAll();

        this.uses = [];
        this.startUses = [];
        this.totalUses = 0;
        for (var i = 0; i < this.rules.length; i++) {
            this.uses[i] = 0;
            this.startUses[i] = this.uses[i];
            this.totalUses += this.uses[i];
        }

    };

    //========================================================
    // Iterating over rules

    RuleSet.prototype.parseAll = function(fxn) {
        for (var i = 0; i < this.rules.length; i++) {
            if (this.rules[i].prototype !== Rule)
                this.rules[i] = new Rule(this.rules[i]);
        }

    };

    //========================================================
    // Iterating over rules

    RuleSet.prototype.mapRules = function(fxn) {
        return this.rules.map(function(rule, index) {
            return fxn(rule, index);
        });
    };

    RuleSet.prototype.applyToRules = function(fxn) {
        for (var i = 0; i < this.rules.length; i++) {
            fxn(this.rules[i], i);
        }
    };
    //========================================================
    RuleSet.prototype.get = function() {
        var index = this.getIndex();

        return this.rules[index];
    };

    RuleSet.prototype.getRandomIndex = function() {
        return Math.floor(this.uses.length * Math.random());
    };

    RuleSet.prototype.getIndex = function() {
        // Weighted distribution
        // Imagine a bar of length 1, how to divide the length
        // s.t. a random dist will result in the dist we want?

        var index = this.getRandomIndex();
        // What if the uses determine the chance of rerolling?

        var median = this.totalUses / this.uses.length;

        var count = 0;
        while (this.uses[index] > median && count < 20) {
            index = this.getRandomIndex();
            count++;
        }

        // reroll more likely if index is too much higher

        return index;
    };

    RuleSet.prototype.decayUses = function(pct) {
        this.totalUses = 0;
        for (var i = 0; i < this.uses; i++) {

            this.uses[index] *= 1 - pct;
            this.totalUses += this.uses[index];
        }
    };

    RuleSet.prototype.testRandom = function() {
        console.log("Test random");
        var counts = [];
        for (var i = 0; i < this.uses.length; i++) {
            counts[i] = 0;
        }

        var testCount = 10 * this.uses.length;
        for (var i = 0; i < testCount; i++) {

            var index = this.getIndex();
            this.uses[index] += 1;

            counts[index]++;
            this.decayUses(.1);
        }

        for (var i = 0; i < this.uses.length; i++) {
            console.log(i + ":\t" + counts[i] + " \t" + this.uses[i]);
        }
    };

    RuleSet.prototype.getSaveRules = function() {
        var jsonRules = this.rules.map(function(rule) {
            return rule.toJSONString();
        });

        return jsonRules;
    };

    /**
     * @author Kate Compton
     */

    var Action = function(node, raw) {

        this.node = node;
        this.grammar = node.grammar;
        this.raw = raw;

    };

    Action.prototype.activate = function() {

        var node = this.node;
        node.actions.push(this);

        // replace any hashtags
        this.amended = this.grammar.flatten(this.raw);

        var parsed = parseTag(this.amended);
        var subActionRaw = parsed.preActions;
        if (subActionRaw && subActionRaw.length > 0) {
            this.subactions = subActionRaw.map(function(action) {
                return new Action(node, action);
            });

        }

        if (parsed.symbol) {
            var split = parsed.symbol.split(":");

            if (split.length === 2) {
                this.push = {
                    symbol : split[0],

                    // split into multiple rules
                    rules : split[1].split(","),
                };
                // push
                node.grammar.pushRules(this.push.symbol, this.push.rules);

            } else
                throw ("Unknown action: " + parsed.symbol);
        }

        if (this.subactions) {
            for (var i = 0; i < this.subactions.length; i++) {
                this.subactions[i].activate();
            }
        }

    };

    Action.prototype.deactivate = function() {
        if (this.subactions) {
            for (var i = 0; i < this.subactions.length; i++) {
                this.subactions[i].deactivate();
            }
        }

        if (this.push) {
            this.node.grammar.popRules(this.push.symbol, this.push.rules);
        }
    };

    /**
     * @author Kate Compton
     */

    var isConsonant = function(c) {
        c = c.toLowerCase();
        switch(c) {
        case 'a':
            return false;
        case 'e':
            return false;
        case 'i':
            return false;
        case 'o':
            return false;
        case 'u':
            return false;

        }
        return true;
    };

    function endsWithConY(s) {
        if (s.charAt(s.length - 1) === 'y') {
            return isConsonant(s.charAt(s.length - 2));
        }
        return false;
    };

    var universalModifiers = {
        capitalizeAll : function(s) {
            return s.replace(/(?:^|\s)\S/g, function(a) {
                return a.toUpperCase();
            });

        },

        capitalize : function(s) {
            return s.charAt(0).toUpperCase() + s.slice(1);

        },

        inQuotes : function(s) {
            return '"' + s + '"';
        },

        comma : function(s) {
            var last = s.charAt(s.length - 1);
            if (last === ",")
                return s;
            if (last === ".")
                return s;
            if (last === "?")
                return s;
            if (last === "!")
                return s;
            return s + ",";
        },

        beeSpeak : function(s) {
            //            s = s.replace("s", "zzz");

            s = s.replace(/s/, 'zzz');
            return s;
        },

        a : function(s) {
            if (!isConsonant(s.charAt()))
                return "an " + s;
            return "a " + s;

        },

        s : function(s) {

            var last = s.charAt(s.length - 1);

            switch(last) {
            case 'y':

                // rays, convoys
                if (!isConsonant(s.charAt(s.length - 2))) {
                    return s + "s";
                }
                // harpies, cries
                else {
                    return s.slice(0, s.length - 1) + "ies";
                }
                break;

            // oxen, boxen, foxen
            case 'x':
                return s.slice(0, s.length - 1) + "xen";
            case 'z':
                return s.slice(0, s.length - 1) + "zes";
            case 'h':
                return s.slice(0, s.length - 1) + "hes";

            default:
                return s + "s";
            };

        },

        ed : function(s) {

            var index = s.indexOf(" ");
            var s = s;
            var rest = "";
            if (index > 0) {
                rest = s.substring(index, s.length);
                s = s.substring(0, index);

            }

            var last = s.charAt(s.length - 1);

            switch(last) {
            case 'y':

                // rays, convoys
                if (isConsonant(s.charAt(s.length - 2))) {
                    return s.slice(0, s.length - 1) + "ied" + rest;

                }
                // harpies, cries
                else {
                    return s + "ed" + rest;
                }
                break;
            case 'e':
                return s + "d" + rest;

                break;

            default:
                return s + "ed" + rest;
            };
        }
    };
    /**
     * @author Kate Compton
     */

    // A tracery expansion node
    var nodeCount = 0;

    var ExpansionNode = Class.extend({
        init : function() {
            this.depth = 0;
            this.id = nodeCount;
            nodeCount++;
            this.childText = "[[UNEXPANDED]]";
        },

        setParent : function(parent) {
            if (parent) {
                this.depth = parent.depth + 1;
                this.parent = parent;
                this.grammar = parent.grammar;
            }
        },

        expand : function() {
            // do nothing
            return "???";
        },

        expandChildren : function() {

            if (this.children) {
                this.childText = "";
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].expand();
                    this.childText += this.children[i].finalText;
                }
                this.finalText = this.childText;
            }

        },

        createChildrenFromSections : function(sections) {
            var root = this;
            this.children = sections.map(function(section) {

                if ( typeof section == 'string' || section instanceof String) {
                    // Plaintext
                    return new TextNode(root, section);
                } else {
                    return new TagNode(root, section);
                }
            });
        }
    });

    var RootNode = ExpansionNode.extend({
        init : function(grammar, rawRule) {
            this._super();
            this.grammar = grammar;
            this.parsedRule = parseRule(rawRule);
        },

        expand : function() {
            var root = this;
            this.createChildrenFromSections(this.parsedRule);

            // expand the children
            this.expandChildren();
        },
    });

    var TagNode = ExpansionNode.extend({
        init : function(parent, parsedTag) {
            this._super();

            if (!(parsedTag !== null && typeof parsedTag === 'object')) {
                if ( typeof parsedTag == 'string' || parsedTag instanceof String) {
                    console.warn("Can't make tagNode from unparsed string!");
                    parsedTag = parseTag(parsedTag);

                } else {
                    console.log("Unknown tagNode input: ", parsedTag);
                    throw ("Can't make tagNode from strange tag!");

                }
            }

            this.setParent(parent);
            $.extend(this, parsedTag);
        },

        expand : function() {
            if (tracery.outputExpansionTrace)
                console.log(r.sections);

            this.rule = this.grammar.getRule(this.symbol);

            this.actions = [];

            // Parse the rule if it hasn't been already
            this.createChildrenFromSections(this.rule.getParsed());

            // Do any pre-expansion actions!
            for (var i = 0; i < this.preActions.length; i++) {
                var action = new Action(this, this.preActions[i]);
                action.activate();
            }

            // Map each child section to a node
            if (!this.rule.sections)
                console.log(this.rule);

            this.expandChildren();

            for (var i = 0; i < this.actions.length; i++) {

                this.actions[i].deactivate();
            }

            this.finalText = this.childText;
            for (var i = 0; i < this.mods.length; i++) {
                this.finalText = this.grammar.applyMod(this.mods[i], this.finalText);
            }

        },

        toLabel : function() {
            return this.symbol;
        },
        toString : function() {
            return "TagNode '" + this.symbol + "' mods:" + this.mods + ", preactions:" + this.preActions + ", postactions" + this.postActions;
        }
    });

    var TextNode = ExpansionNode.extend({
        isLeaf : true,
        init : function(parent, text) {
            this._super();

            this.setParent(parent);

            this.text = text;

            this.finalText = text;
        },
        expand : function() {
            // do nothing
        },

        toLabel : function() {
            return this.text;
        }
    });

    /**
     * @author Kate Compton
     */

    function Symbol(grammar, key) {
        this.grammar = grammar;
        this.key = key;
        this.currentRules = undefined;
        this.ruleSets = [];

    };

    Symbol.prototype.loadFrom = function(rules) {

        rules = this.wrapRules(rules);
        this.baseRules = rules;

        this.ruleSets.push(rules);
        this.currentRules = this.ruleSets[this.ruleSets.length - 1];

    };

    //========================================================
    // Iterating over rules

    Symbol.prototype.mapRules = function(fxn) {

        return this.currentRules.mapRules(fxn);
    };

    Symbol.prototype.applyToRules = function(fxn) {
        this.currentRules.applyToRules(fxn);
    };

    //==================================================
    // Rule pushpops
    Symbol.prototype.wrapRules = function(rules) {
        if (rules.prototype !== RuleSet) {
            if (Array.isArray(rules)) {
                return new RuleSet(rules);
            } else if ( typeof rules == 'string' || rules instanceof String) {
                return new RuleSet(rules);
            } else {
                throw ("Unknown rules type: " + rules);
            }
        }
        // already a ruleset
        return rules;
    };

    Symbol.prototype.pushRules = function(rules) {
        rules = this.wrapRules(rules);
        this.ruleSets.push(rules);
        this.currentRules = this.ruleSets[this.ruleSets.length - 1];
    };

    Symbol.prototype.popRules = function() {
        var exRules = this.ruleSets.pop();

        if (this.ruleSets.length === 0) {
            //console.warn("No more rules for " + this + "!");
        }
        this.currentRules = this.ruleSets[this.ruleSets.length - 1];
    };

    // Clear everything and set the rules
    Symbol.prototype.setRules = function(rules) {

        rules = this.wrapRules(rules);
        this.ruleSets = [rules];
        this.currentRules = rules;

    };

    Symbol.prototype.addRule = function(rule) {
        this.currentRules.addRule(seed);
    };

    //========================================================
    // selection

    Symbol.prototype.select = function() {
        this.isSelected = true;

    };

    Symbol.prototype.deselect = function() {
        this.isSelected = false;
    };

    //==================================================
    // Getters

    Symbol.prototype.getRule = function(seed) {
        return this.currentRules.get(seed);
    };

    //==================================================

    Symbol.prototype.toString = function() {
        return this.key + ": " + this.currentRules + "(overlaying " + (this.ruleSets.length - 1) + ")";
    };
    Symbol.prototype.toJSON = function() {

        var rules = this.baseRules.rules.map(function(rule) {
            return '"' + rule.raw + '"';
        });
        return '"' + this.key + '"' + ": [" + rules.join(", ") + "]";
    };

    Symbol.prototype.toHTML = function(useSpans) {
        var keySpan = '"' + this.key + '"';
        if (useSpans)
            keySpan = "<span class='symbol symbol_" + this.key + "'>" + keySpan + "</span>";

        var rules = this.baseRules.rules.map(function(rule) {
            // replace any anglebrackets for html
            var cleaned = rule.raw.replace(/&/g, "&amp;");
            cleaned = cleaned.replace(/>/g, "&gt;");
            cleaned = cleaned.replace(/</g, "&lt;");

            var s = '"' + cleaned + '"';
            if (useSpans)
                s = "<span class='rule'>" + s + "</span>";
            return s;
        });
        return keySpan + ": [" + rules.join(", ") + "]";
    };

    /**
     * @author Kate Compton
     */

    function Grammar() {
        this.clear();
    };

    Grammar.prototype.clear = function() {
        // Symbol library
        this.symbols = {};

        this.errors = [];

        // Modifier library
        this.modifiers = {};

        // add the universal mods
        for (var mod in universalModifiers) {
            if (universalModifiers.hasOwnProperty(mod))
                this.modifiers[mod] = universalModifiers[mod];
        }
    };
    //========================================================
    // Loading

    Grammar.prototype.loadFrom = function(obj) {
        var symbolSrc;

        this.clear();

        if (obj.symbols !== undefined) {
            symbolSrc = obj.symbols;
        } else {
            symbolSrc = obj;
        }

        // get all json keys
        var keys = Object.keys(symbolSrc);

        this.symbolNames = [];
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            this.symbolNames.push(key);

            this.symbols[key] = new Symbol(this, key);
            this.symbols[key].loadFrom(symbolSrc[key]);
        }

    };

    Grammar.prototype.toHTML = function(useSpans) {
        // get all json keys
        var keys = Object.keys(this.symbols);

        this.symbolNames = [];

        var lines = [];

        var count = 0;
        for (var i = 0; i < keys.length; i++) {

            var key = keys[i];
            var symbol = this.symbols[key];

            if (symbol && symbol.baseRules) {

                lines.push("    " + this.symbols[key].toHTML(useSpans));

            }
        };

        var s;
        s = lines.join(",</p><p>");
        s = "{<p>" + s + "</p>}";
        return s;
    };

    Grammar.prototype.toJSON = function() {
        // get all json keys
        var keys = Object.keys(this.symbols);

        this.symbolNames = [];

        var lines = [];

        var count = 0;
        for (var i = 0; i < keys.length; i++) {

            var key = keys[i];
            var symbol = this.symbols[key];

            if (symbol && symbol.baseRules) {

                lines.push("    " + this.symbols[key].toJSON());

            }
        };

        var s;
        s = lines.join(",\n");
        s = "{\n" + s + "\n}";
        return s;
    };

    //========================================================
    // selection

    Grammar.prototype.select = function() {
        this.isSelected = true;
    };

    Grammar.prototype.deselect = function() {
        this.isSelected = false;
    };

    //========================================================
    // Iterating over symbols

    Grammar.prototype.mapSymbols = function(fxn) {
        var symbols = this.symbols;
        return this.symbolNames.map(function(name) {
            return fxn(symbols[name], name);
        });
    };

    Grammar.prototype.applyToSymbols = function(fxn) {
        for (var i = 0; i < this.symbolNames.length; i++) {
            var key = this.symbolNames[i];
            fxn(this.symbols[key], key);
        }
    };

    //========================================================
    Grammar.prototype.addOrGetSymbol = function(key) {
        if (this.symbols[key] === undefined)
            this.symbols[key] = new Symbol(key);

        return this.symbols[key];
    };

    Grammar.prototype.pushRules = function(key, rules) {
        var symbol = this.addOrGetSymbol(key);
        symbol.pushRules(rules);
    };

    Grammar.prototype.popRules = function(key, rules) {
        var symbol = this.addOrGetSymbol(key);
        var popped = symbol.popRules();

        if (symbol.ruleSets.length === 0) {
            // remove symbol
            this.symbols[key] = undefined;
        }
    };

    Grammar.prototype.applyMod = function(modName, text) {
        if (!this.modifiers[modName]) {
            console.log(this.modifiers);
            throw ("Unknown mod: " + modName);
        }
        return this.modifiers[modName](text);
    };

    //============================================================
    Grammar.prototype.getRule = function(key, seed) {
        var symbol = this.symbols[key];
        if (symbol === undefined) {
            var r = new Rule("{{" + key + "}}");

            r.error = "Missing symbol " + key;
            return r;
        }

        var rule = symbol.getRule();
        if (rule === undefined) {
            var r = new Rule("[" + key + "]");
            console.log(r.sections);
            r.error = "Symbol " + key + " has no rule";
            return r;
        }

        return rule;
    };

    //============================================================
    // Expansions
    Grammar.prototype.expand = function(raw) {

        // Start a new tree
        var root = new RootNode(this, raw);

        root.expand();

        return root;
    };

    Grammar.prototype.flatten = function(raw) {

        // Start a new tree
        var root = new RootNode(this, raw);

        root.expand();

        return root.childText;
    };

    //===============

    Grammar.prototype.analyze = function() {
        this.symbolNames = [];
        for (var name in this.symbols) {
            if (this.symbols.hasOwnProperty(name)) {
                this.symbolNames.push(name);
            }
        }

        // parse every rule

        for (var i = 0; i < this.symbolNames.length; i++) {
            var key = this.symbolNames[i];
            var symbol = this.symbols[key];
            // parse all
            for (var j = 0; j < symbol.baseRules.length; j++) {
                var rule = symbol.baseRules[j];
                rule.parsed = tracery.parse(rule.raw);
                //   console.log(rule);

            }
        }

    };

    Grammar.prototype.selectSymbol = function(key) {
        console.log(this);
        var symbol = this.get(key);
    };
    /**
     * @author Kate Compton

     */

    tracery.createGrammar = function(obj) {
        var grammar = new Grammar();
        grammar.loadFrom(obj);
        return grammar;
    };

    tracery.test = function() {

        console.log("==========================================");
        console.log("test tracery");

        // good
        tracery.testParse("", false);
        tracery.testParse("fooo", false);
        tracery.testParse("####", false);
        tracery.testParse("#[]#[]##", false);
        tracery.testParse("#someSymbol# and #someOtherSymbol#", false);
        tracery.testParse("#someOtherSymbol.cap.pluralize#", false);
        tracery.testParse("#[#do some things#]symbol.mod[someotherthings[and a function]]#", false);
        tracery.testParse("#[fxn][fxn][fxn[subfxn]]symbol[[fxn]]#", false);
        tracery.testParse("#[fxn][#fxn#][fxn[#subfxn#]]symbol[[fxn]]#", false);
        tracery.testParse("#hero# ate some #color# #animal.s#", false);
        tracery.testParseTag("[action]symbol.mod1.mod2[postAction]", false);

        // bad
        tracery.testParse("#someSymbol# and #someOtherSymbol", true);
        tracery.testParse("#[fxn][fxn][fxn[subfxn]]symbol[fxn]]#", true);

        // bad
        tracery.testParseTag("stuff[action]symbol.mod1.mod2[postAction]", true);
        tracery.testParseTag("[action]symbol.mod1.mod2[postAction]stuff", true);

        tracery.testParse("#hero# ate some #color# #animal.s#", true);
        tracery.testParse("#[#setPronouns#][#setOccupation#][hero:#name#]story#", true);

    };

})();
