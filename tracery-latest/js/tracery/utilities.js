/**
 * @author Kate Compton
 */

define([], function() {
    'use strict';
    function inQuotes(s) {
        return '"' + s + '"';
    };

    function parseAction(action) {
        return action;
    };

    // tag format
    // a thing to expand, plus actions

    function parseTag(tag) {
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
                    tracery.addError("multiple possible expansion symbols in tag!" + tag);
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
            var error = "Too many '[' in rule " + inQuotes(rule);
            tracery.addError(error);
            return;
        }

        if (lvl < 0) {
            var error = "Too many ']' in rule " + inQuotes(rule);
            tracery.addError(error);
            return;
        }

        return {
            preActions : prefxns,
            postActions : postfxns,
            symbol : symbol,
            mods : mods,
            raw : tag
        };
    };

    // Split a rule into sections
    function parseRule(rule) {
        var sections = [];
        if (!( typeof rule == 'string' || rule instanceof String)) {
            tracery.addError("Cannot parse non-string rule " + rule);
            return;
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
            tracery.addError(error);
            console.warn(error);
            return;
        }

        if (lvl < 0) {
            var error = "Too many ']' in rule " + inQuotes(rule);
            tracery.addError(error);
            console.warn(error);
            return;
        }

        if (inTag) {
            var error = "Odd number of '#' in rule " + inQuotes(rule);
            tracery.addError(error);
            console.warn(error);
            return;
        }

        createSection(rule.length);

        return sections;
    };

    function testParse(rule) {
        console.log("Test: " + inQuotes(rule));
        var parsed = parseRule(rule);
        if (parsed)
            console.log("SUCCESS:", parsed);
        else
            console.log("FAILED:", parsed);
    }

    function testParseTag(tag) {
        console.log("Test: " + inQuotes(tag));
        var parsed = parseTag(tag);
        if (parsed)
            console.log("SUCCESS:", parsed);
        else
            console.log("FAILED:", parsed);
    }

    function spacer(size) {
        var s = "";
        for (var i = 0; i < size * 3; i++) {
            s += " ";
        }
        return s;
    }

    return {
        parseTag : parseTag,
        parseRule : parseRule,
        testParse : testParse,
        testParseTag : testParseTag,
        spacer : spacer
    };

});
