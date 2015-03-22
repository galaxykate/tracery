/**
 * @author Kate Compton

 */

define(["./utilities", "./grammar", "./node"], function(traceryUtilities, Grammar, Node) {
    'use strict';

var tracery = {};
    console.log("in main tracery");

    $.extend(tracery, traceryUtilities);

    tracery.createGrammar = function(obj) {
        var grammar = new Grammar();
        grammar.loadFrom(obj);
        return grammar;
    };

    tracery.addError = function(error) {
        console.warn(error);
    };

    tracery.test = function() {

        console.log("==========================================");
        console.log("test tracery");
        /*
        // good
        tracery.testParse("");
        tracery.testParse("fooo");
        tracery.testParse("####");
        tracery.testParse("#[]#[]##");
        tracery.testParse("#someSymbol# and #someOtherSymbol#");
        tracery.testParse("#someOtherSymbol.cap.pluralize#");
        tracery.testParse("#[#do some things#]symbol.mod[someotherthings[and a function]]#");
        tracery.testParse("#[fxn][fxn][fxn[subfxn]]symbol[[fxn]]#");
        tracery.testParse("#[fxn][#fxn#][fxn[#subfxn#]]symbol[[fxn]]#");
        tracery.testParse("#hero# ate some #color# #animal.s#");

        // bad
        tracery.testParse("#someSymbol# and #someOtherSymbol");
        tracery.testParse("#[fxn][fxn][fxn[subfxn]]symbol[fxn]]#");
        */

        /*
        // good
        tracery.testParseTag("[action]symbol.mod1.mod2[postAction]");
        // bad
        tracery.testParseTag("stuff[action]symbol.mod1.mod2[postAction]");
        tracery.testParseTag("[action]symbol.mod1.mod2[postAction]stuff");

        */
        //    tracery.testParse("#hero# ate some #color# #animal.s#");
        tracery.testParse("#[#setPronouns#][#setOccupation#][hero:#name#]story#");

    };

    return tracery;
});
