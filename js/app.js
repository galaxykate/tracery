/**
 * @author Kate Compton
 */

var app = {
};
define(["./tracery", "./storygami"], function(tracery, storygami) {

    var testGrammar = {
        "emotion" : "happy sad reflective morose gleeful jealous resentful appreciative proud".split(" "),
        "mainCharacter" : ["nobody"],
        "destination" : ["nowhere"],
        "name" : "Jamal Aisha Marcel Pearl Gertrude Bailey Logan Aiden Scout Ambrose Beverly Takashi Hilda Nadya Salim Carmen Ming Lakshmi Naveen Ginger".split(" "),
        "placeAdj" : "delightful haunted faraway sunlit magical enchanted serene scenic".split(" "),
        "place" : "lagoon lake forest island grotto mountain desert wasteland meadow river".split(" "),
        "story" : ["Once #mainCharacter# went on an adventure to the #placeAdj.capitalize# #destination.capitalize#. Seeing such a #placeAdj# #destination# made #mainCharacter# #emotion#."],
        "origin" : ["[mainCharacter:#name# the #animal.capitalize#][destination:#place#]#story#[mainCharacter:pop]"],
    };

    var testGrammar2 = {
        "origin" : ["#story#"],
        "animal" : "anaconda beaver capybara dolphin echidna ferret gopher hyena iguana jerboa kangaroo leopard moose".split(" "),
        "character" : ["#occupation#", "#animal#", "#emotion# #occupation#", "#emotion# #animal#"],
        "emotion" : "happy sad reflective morose gleeful jealous resentful appreciative proud".split(" "),
        "story" : ["[mainCharacter:#name# the #character.capitalizeAll#]This is the story of #mainCharacter#. #toldAStory#[mainCharacter:pop]"],
        "toldAStory" : ["#mainCharacter# couldn't think of an interesting story.", "#mainCharacter# was sad, and called for royal storyteller.  This was their story: #story#. The storyteller bowed. #mainCharacter# applauded politely, but thought that the story was too #emotion#"],
        "name" : "Jamal Aisha Marcel Pearl Gertrude Bailey Logan Aiden Scout Ambrose Beverly Takashi Hilda Nadya Salim Carmen Ming Lakshmi Naveen Ginger".split(" "),
        "occupation" : "priest baker soldier king peasant witch traveller merchant tailor hunter wizard dancer".split(" "),

    };

    app.start = function() {

        var count = 10;
        var traces = [];
        app.grammar = tracery.createGrammar(testGrammar2);
        for (var i = 0; i < count; i++) {
            traces[i] = app.grammar.createTraceFromSymbol();
        }

        for (var i = 0; i < count; i++) {
            traces[i].expand();
            console.log(traces[i]);
        }
        for (var i = 0; i < count; i++) {
            var story = traces[i].flatten();
            console.log(story);
        }

        storygami.createTree($("#stories"), traces[0]);
    };
});
