/**
 * @author Kate Compton
 */

define(["./modifiers", "./node", "./symbol", "./rule/rule"], function(universalModifiers, Node, Symbol, Rule) {
    'use strict';

    function Grammar() {
        this.clear();
    };

    Grammar.prototype.clear = function() {
        // Symbol library
        this.symbols = {};

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

    Grammar.prototype.toText = function() {

        return this.toJSON();
    };

    Grammar.prototype.toJSON = function() {
        var s = "{\n";
        // get all json keys
        var keys = Object.keys(this.symbols);

        this.symbolNames = [];
        var count = 0;
        for (var i = 0; i < keys.length; i++) {

            var key = keys[i];
            var symbol = this.symbols[key];

            if (symbol && symbol.baseRules) {
                if (count > 0)
                    s += ",";
                count++;

                s += "\t" + this.symbols[key].toJSON();

                s += "\n";
            }
        }

        s += "\n}";
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
        var root = new Node(this, raw);

        root.expand();

        return root;
    };

    Grammar.prototype.flatten = function(raw) {

        // Start a new tree
        var root = new Node(this, raw);

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

    //===============

    return Grammar;
});
