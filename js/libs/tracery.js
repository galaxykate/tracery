/**
 * @author Kate Compton
 */

var tracery = (function() {
    var traceCount = 0;
    function getSpacer(count) {
        var s = "";
        for (var i = 0; i < count; i++) {
            s += " ";
        }
        return s;
    };

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

    var modificationFunctions = {
        capitalizeAll : function(s) {
            return s.replace(/(?:^|\s)\S/g, function(a) {
                return a.toUpperCase();
            });

        },

        capitalize : function(s) {
            return s.charAt(0).toUpperCase() + s.slice(1);

        },

        a : function(s) {
            if (!isConsonant(s.charAt()))
                return "an " + s;
            return "a " + s;

        },

        pluralize : function(s) {
            return s + "s";
        }
    };
    // From http://stackoverflow.com/questions/521295/javascript-random-seeds
    var m_w = 123456789;
    var m_z = 987654321;
    var mask = 0xffffffff;

    // Returns number between 0 (inclusive) and 1.0 (exclusive),
    // just like Math.random().
    function random() {
        m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
        m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
        var result = ((m_z << 16) + m_w) & mask;
        result /= 4294967296;
        return result + 0.5;
    }

    //=================================================================================
    //=================================================================================
    //=================================================================================
    function Rule(source) {
        this.source = source;
        // parse this source
        //split into sections

        this.sections = parseBrackets(source, '[', ']', '#');
        // Bare text?

        for (var i = 0; i < this.sections.length; i++) {
            var section = this.sections[i];

            // symbol with mods
            if (section.type === 2) {
                var subsections = section.text.split(".");
                section.modifiers = subsections.slice(1);

                section.text = subsections[0];
            }

            // action
            if (section.type === 1) {
                var index = section.text.indexOf(":");
                var symbol = section.text.slice(0, index);
                var command = section.text.slice(index + 1);
                section.symbol = symbol;
                section.command = command;
            }
        }

    };

    Rule.prototype.execute = function(node) {
        for (var i = 0; i < this.sections.length; i++) {
            var section = this.sections[i];
            switch(section.type) {

                // Text only
                case 0:
                    node.addText(section.text);
                    break;

                // Pushpop
                case 1:
                    var traceID = node.trace.id;
                    if (section.command === "POP" || section.command === "pop") {
                        node.trace.grammar.popRules(section.symbol, traceID);
                    } else {

                        var subtrace = node.trace.grammar.createTraceFromCommand(section.command);
                        subtrace.expand();
                        var flat = subtrace.flatten();
                        node.trace.grammar.pushRules(section.symbol, [flat], traceID);
                    }

                    break;

                // symbol
                case 2:
                    node.addSymbol(section.text, section.modifiers);
                    break;
            }
        }

    };

    Rule.prototype.toString = function() {
        return this.source;
    };

    // Return an array of strings, tagged 0 for plaintext, 1 for brackets, and 2 for tags

    function parseBrackets(s, openBracket, closeBracket, tag) {
        var lvl = 0;
        var lastStart = 0;
        var inTag = false;
        var sections = [];

        function addSection(type, start, end) {
            if (start !== end) {
                sections.push({
                    text : s.slice(start, end),
                    type : type,
                });
            }
        }

        for (var i = 0; i < s.length; i++) {
            var c = s.charAt(i);
            switch(c) {
                case openBracket:
                    // Create a text section from whatever came before
                    if (lvl === 0) {
                        addSection(0, lastStart, i);
                        lastStart = i + 1;
                    }

                    lvl++;
                    break;
                case closeBracket:
                    lvl--;
                    if (lvl === 0) {

                        // Slice from the last start to this
                        addSection(1, lastStart, i);
                        lastStart = i + 1;
                    }
                    break;
                case tag:
                    if (lvl === 0) {
                        if (inTag)
                            addSection(2, lastStart, i);
                        else
                            addSection(0, lastStart, i);
                        lastStart = i + 1;
                        inTag = !inTag;

                        break;
                    }
            }
        }

        if (lvl > 0)
            throw ("Too many " + openBracket + " in " + s);
        if (lvl < 0)
            throw ("Too many " + closeBracket + " in " + s);
        addSection(0, lastStart, i);

        /*
         console.log(utilities.arrayToString(sections, function(s) {
         return "'" + s.type + ":" + s.text + "'";
         }));
         */
        return sections;
    };

    //=================================================================================
    //=================================================================================
    //=================================================================================

    function RuleSet(symbol, rawRules, distribution) {
        this.symbol = symbol;
        this.distribution = distribution;
        this.uses = [];
        //  this.rules = rules.slice();
        this.rules = rawRules.map(function(rawSource) {
            return new Rule(rawSource);
        });
    };

    RuleSet.prototype.getRule = function() {
        var choicePct = Math.random();
        if (this.distribution)
            choicePct = this.distribution.getRandom();

        var which = Math.floor(this.rules.length * choicePct);
        //   console.log("....picked " + which + "/" + this.rules.length + ": '" + this.rules[which] + "'");
        this.uses[which]++;
        return this.rules[which];

    };

    RuleSet.prototype.toString = function() {
        return "[" + this.rules.join(",") + "]";
    };

    RuleSet.setSeed = function(seed) {
        m_w = seed;
    };

    //=================================================================================
    //=================================================================================
    //=================================================================================
    // Node object
    function Node(parent, childIndex, options) {
        if (childIndex < 0) {
            this.trace = parent;
            this.childIndex = 0;
            this.depth = 0;
        } else {
            this.trace = parent.trace;
            this.parent = parent;
            this.depth = parent.depth + 1;
        }

        if (options.symbol) {
            this.type = "symbolExpansion";
            this.symbol = options.symbol;
            this.modifiers = options.modifiers;
        }

        if (options.rule) {
            this.type = "ruleExpansion";
            this.rule = options.rule;
        }

        if (options.plainText) {
            this.type = "plainText";
            this.finishedText = options.plainText;
        }

        this.children = [];
    };

    // Turn into bare text
    Node.prototype.flatten = function() {
        if (this.type === "plainText")
            return this.finishedText;

        var s = "";
        for (var i = 0; i < this.children.length; i++) {

            s += this.children[i].flatten();
        }

        if (this.modifiers) {
            for (var i = 0; i < this.modifiers.length; i++) {
                s = modificationFunctions[this.modifiers[i]](s);
            }
        }
        return s;
    };

    Node.prototype.expand = function() {
        if (this.symbol && !this.rule) {
            this.rule = this.trace.grammar.getRule(this.symbol, this.trace.id);
        }
        this.rule.execute(this);
    };

    Node.prototype.addText = function(text) {
        var n = new Node(this, this.children.length, {
            plainText : text
        });

        this.children.push(n);

    };

    Node.prototype.addSymbol = function(symbol, modifiers) {
        var n = new Node(this, this.children.length, {
            symbol : symbol,
            modifiers : modifiers
        });
        this.children.push(n);
        n.expand();
    };

    //=================================================================================
    //=================================================================================
    //=================================================================================
    // Trace object
    function Trace(grammar, options) {
        this.id = traceCount;
        traceCount++;

        this.grammar = grammar;
        this.root = new Node(this, -1, options);
        //   this.expand(true);
    };

    Trace.prototype.expand = function(recursively) {
        this.root.expand(recursively);
        var traceID = this.id;
        // Did all the overwrites get undone?
        this.grammar.forAllSymbols(function(symbol) {
            if (symbol.ruleOverrides[traceID] && symbol.ruleOverrides[traceID].length !== 0)
                throw (symbol.key + " still has " + symbol.ruleOverrides[traceID].length + " overrides! " + symbol.ruleOverrides[traceID].join(","));
        });
        return this.root;
    };

    Trace.prototype.flatten = function() {

        return this.root.flatten();
    };

    Trace.prototype.expandAndFlatten = function() {
        this.expand();
        return this.flatten();
    };

    Trace.prototype.debugOutput = function() {

    };

    //=================================================================================
    //=================================================================================
    //=================================================================================
    function Symbol(grammar, key) {
        this.key = key;
        this.grammar = grammar;

        // Rule sets can be overidden
        this.ruleOverrides = { };

    };

    Symbol.prototype.getRule = function(traceID) {
        var override = this.ruleOverrides[traceID];

        if (override) {
            return override[override.length - 1].getRule();
        } else {
            return this.baseRules.getRule();
        }
    };

    Symbol.prototype.createBaseRules = function(rawRules) {
        this.baseRules = new RuleSet(this, rawRules);
    };
    //========================================================================
    Symbol.prototype.pushRules = function(rawRules, traceID) {
        var ruleSet = new RuleSet(this, rawRules);
        if (!this.ruleOverrides[traceID])
            this.ruleOverrides[traceID] = [];

        this.ruleOverrides[traceID].push(ruleSet);
    };

    Symbol.prototype.popRules = function(traceID) {
        if (this.ruleOverrides[traceID]) {
            if (this.ruleOverrides[traceID].length > 0)
                return this.ruleOverrides[traceID].pop();
            else
                throw ("Can't pop from empty rule list for " + this.toString() + " traceid:" + traceID);

        }
        throw ("TOO MANY POP OPERATIONS: No override rules remaining for " + this.toString() + " traceid:" + traceID);
    };
    //========================================================================

    Symbol.prototype.debugOutput = function() {
        console.log("  " + this.key + this.baseRules);

    };

    //=================================================================================
    //=================================================================================
    //=================================================================================
    // Grammar object
    function Grammar(source) {
        var grammar = this;
        this.expansionCount = 0;
        //   variable = (condition) ? true-value : false-value;
        this.title = (source.traceryTitle) ? source.traceryTitle : "Untitled Grammar";
        this.originWord = (source.traceryOrigin) ? source.traceryOrigin : "origin";
        this.sourceRules = (source.rules) ? source.rules : source;

        // Set up the symbol library
        this.symbols = [];
        var symbolList = Object.keys(this.sourceRules);

        for (var i = 0; i < symbolList.length; i++) {
            var key = symbolList[i];

            // Create a symbol object
            grammar.symbols[key] = new Symbol(this, key);
            grammar.symbols[key].createBaseRules(this.sourceRules[key]);
        }

    };

    Grammar.prototype.forAllSymbols = function(f) {
        var symbolList = Object.keys(this.symbols);
        for (var i = 0; i < symbolList.length; i++) {
            f(this.symbols[symbolList[i]]);
        }
    };

    Grammar.prototype.getRule = function(key, traceID) {
        if (!this.symbols[key]) {
            throw ("No symbol found for key " + key);
        } else {
            return this.symbols[key].getRule(traceID);
        }
    };

    Grammar.prototype.pushRules = function(key, rawRules, traceID) {
        if (!this.symbols[key])
            this.symbols[key] = new Symbol(this, key);
        this.symbols[key].pushRules(rawRules, traceID);

    };

    Grammar.prototype.popRules = function(key, traceID) {
        if (this.symbols[key])
            this.symbols[key].popRules(traceID);
    };

    // Call with nothing, will use the base trace
    Grammar.prototype.createTrace = function(symbol) {
        return this.createTraceFromSymbol(symbol);
    };

    Grammar.prototype.createFlattened = function(symbol) {

        var trace = this.createTraceFromSymbol(symbol);

        var flat = trace.expandAndFlatten();

        return flat;
    };

    // Add methods like this.  All Person objects will be able to invoke this
    Grammar.prototype.createTraceFromSymbol = function(symbol) {
        this.expansionCount++;

        symbol = symbol ? symbol : this.originWord;

        return new Trace(this, {
            symbol : symbol
        });
    };

    Grammar.prototype.createTraceFromCommand = function(command) {
        this.expansionCount++;

        command = command ? command : "#" + this.originWord + "#";

        return new Trace(this, {
            rule : new Rule(command)
        });
    };

    Grammar.prototype.debugOutput = function() {
        var symbolList = Object.keys(this.symbols);
        for (var i = 0; i < symbolList.length; i++) {
            this.symbols[symbolList[i]].debugOutput();
        }

    };
    //=================================================================================
    //=================================================================================
    //=================================================================================

    return {

        createGrammar : function(obj) {
            console.log("load grammar: " + obj);
            return new Grammar(obj);
        },
    };

})();

