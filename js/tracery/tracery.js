/**
 * @author Kate
 */

var tracery = function() {

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

    Symbol.prototype.selectRule = function(node) {
        this.uses.push({
            node : node
        });

        if (this.stack.length === 0)
            throw ("No rules for " + this.key);
        return this.stack[this.stack.length - 1].getRule();
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
        };

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

    Grammar.prototype.expand = function(rule) {
        var root = this.createRoot(rule);
        root.expand();
        return root;
    };

    Grammar.prototype.flatten = function(rule) {
        return this.expand(rule).finishedText;
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
            throw ("No symbol for key " + key);
        this.symbols[key].popRules();
    };

    Grammar.prototype.selectRule = function(key, node) {
        if (this.symbols[key])
            return this.symbols[key].selectRule(node);

        // Failover to alternative subgrammars
        for (var i = 0; i < this.subgrammars.length; i++) {

            if (this.subgrammars[i].symbols[key])
                return this.subgrammars[i].symbols[key].selectRule();
        }

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

            sections.errors = [];
            var start = 0;

            var escapedSubstring = "";
            var lastEscapedChar = undefined;
            function createSection(start, end, type) {
                if (end - start < 1) {
                    sections.errors.push(start + ": 0-length section of type " + type);
                }
                var rawSubstring;
                if (lastEscapedChar !== undefined) {
                    rawSubstring = escapedSubstring + rule.substring(lastEscapedChar + 1, end);
                } else {
                    rawSubstring = rule.substring(start, end);
                }
                sections.push({
                    type : type,
                    raw : rawSubstring
                });
                lastEscapedChar = undefined;
                escapedSubstring = "";
            };

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
                sections.errors.push("Unclosed tag");
            }
            if (depth > 0) {
                sections.errors.push("Too many [");
            }
            if (depth < 0) {
                sections.errors.push("Too many ]");
            }

            return sections;
        },

        test : function() {
            var content = $("#content-col");
            var testlog = $("<div/>", {
                class : "card debug-output",
            }).appendTo(content);

            var tests = {
                basic : ["", "a", "tracery"],
                hashtag : ["#a#", "a#b#", "aaa#b##cccc#dd#eee##f#"],
                hashtagWrong : ["##", "#", "a#a", "#aa#aa###"],
                escape : ["\\#test\\#", "\\[#test#\\]"],
            };

            var testGrammar = tracery.createGrammar({
                animal : ["capybara", "unicorn", "university", "umbrella", "u-boat", "boa", "ocelot", "zebu", "finch", "fox", "hare", "fly"],
                color : ["yellow", "maroon", "indigo", "ivory", "obsidian"],
                mood : ["elated", "irritable", "morose", "enthusiastic"],
                story : ["[mc:#animal#]Once there was #mc.a#, a very #mood# #mc#"]
            });

            var toParse = [];
            for (var i = 0; i < 20; i++) {
                var expansion = testGrammar.expand("[test:#foo#]foo");
                console.log(expansion.finishedText);
            }

            /*
             $.each(tests, function(index, testSet) {
             for (var i = 0; i < testSet.length; i++) {
             var parsed = tracery.parse(testSet[i]);
             var output = "<span class='section-raw'>" + testSet[i] + "</span> ";
             output += tracery.parsedSectionsToHTML(parsed);
             output = output.replace(/\\/g, "&#92;");
             testlog.append(output + "<p>");

             }
             });
             */
        },

        parsedSectionsToHTML : function(sections) {
            var output = "";
            for (var i = 0; i < sections.length; i++) {
                output += "<span class='section-" + sections[i].type + "'>" + sections[i].raw + "</span> ";
            }
            if (sections.errors) {
                for (var i = 0; i < sections.errors.length; i++) {
                    output += "<span class='section-error'>" + sections.errors[i] + "</span> ";
                }
            }
            return output;
        },
    };

    // Externalize
    tracery.TraceryNode = TraceryNode;

    tracery.Grammar = Grammar;
    tracery.Symbol = Symbol;
    tracery.RuleSet = RuleSet;
    return tracery;
}();
