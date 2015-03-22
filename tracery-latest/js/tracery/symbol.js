/**
 * @author Kate Compton
 */

define(["./rule/ruleset"], function(RuleSet) {
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
        return '"' + this.key + '"' + ": [" + rules + "]";
    };

    return Symbol;
});
