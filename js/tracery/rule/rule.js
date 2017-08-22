/**
 * @author Kate
 */

define([], function() {

    var Rule = function(raw) {
        this.raw = raw;
        this.sections = tracery.parseRule(raw);

    };

    Rule.prototype.getParsed = function() {
        if (!this.sections)
            this.sections = tracery.parseRule(raw);

        return this.sections;
    };

    Rule.prototype.toString = function() {
        return this.raw;
    };

    Rule.prototype.toJSONString = function() {
        return this.raw;
    };

    return Rule;

});
