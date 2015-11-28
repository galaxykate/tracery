/**
 * @author Kate
 */

// Sets of rules
// Can also contain conditional or fallback sets of rulesets)
function RuleSet(grammar, raw) {
    this.raw = raw;
    this.grammar = grammar;
    this.falloff = 1;
    this.distribution = "random";
    if (this.grammar.distribution)
        this.distribution = this.grammar.distribution;

    if (Array.isArray(raw)) {
        this.defaultRules = raw;
    } else if ( typeof raw === 'string' || raw instanceof String) {
        this.defaultRules = [raw];
    } else if (raw === 'object') {
        // TODO: support for conditional and hierarchical rule sets
    }

};

RuleSet.prototype.getRule = function() {
    // console.log("Get rule", this.raw);
    // Is there a conditional?
    if (this.conditionalRule) {
        var value = this.grammar.expand(this.conditionalRule);
        // does this value match any of the conditionals?
        if (this.conditionalValues[value]) {
            var v = this.conditionalValues[value].getRule();
            if (v !== null && v !== undefined)
                return v;
        }
        // No returned value?
    }

    // Is there a ranked order?
    if (this.ranking) {
        for (var i = 0; i < this.ranking.length; i++) {
            var v = this.ranking.getRule();
            if (v !== null && v !== undefined)
                return v;
        }

        // Still no returned value?
    }

    if (this.defaultRules !== undefined) {
        var index = 0;
        // Select from this basic array of rules

        // Get the distribution

        switch(this.distribution) {
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
            break;
        case "falloff":
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
