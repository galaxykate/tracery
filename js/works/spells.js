/**
 * @author Kate Compton
 */

var app = {};
$(document).ready(function() {

    var spellbook = {
        adventure : "lament story epic tear sight sigh wish desire dance mystery enigma drama path training sorrows joy tragedy comedy riddle puzzle regret victory loss song adventure question quest vow oath tale travel".split(" "),
        animal : "amoeba mongoose capybara yeti dragon unicorn sphinx kangaroo boa nematode sheep quail goat corgi agouti zebra giraffe rhino skunk dolphin whale bullfrog okapi sloth monkey orangutan grizzly moose elk dikdik ibis stork finch nightingale goose robin eagle hawk iguana tortoise panther lion tiger gnu reindeer raccoon opossum".split(" "),
        mood : "angry bemused elated skeptical morose gleeful curious sleepy hopeful ashamed alert energetic exhausted giddy grateful groggy grumpy irate jealous jubilant lethargic sated lonely opportunistic relaxed restless surprised tired thankful".split(" "),
        building : "temple hall mines fortress sanctuary castle monestary abbey palace mausoleum".split(" "),
        noun : "wind arrow sky ice hexagram circle temple blood iron gold storm wolf mountain river north east south west earth forest stone sword".split(" "),
        verb : "confess betray entangle ensnare awaken detect discern desecrate restore summon espy".split(" "),
        title : ["#noun# of the #mood# #noun#", "To #verb# the #noun# of #noun#"],
        ingredient : ["the #animalPart# of #animal.a#"],
        animalPart : ["talon", "wing", "egg", "claw", "shinbone", "eye", "tongue", "down", "fur", "feather"],
        ingredientSource : ["in the #building# of the #noun#"],
        gatherIngredients : ["#ingredientSource.capitalize#, gather #ingredient1#.<p>#ingredientSource.capitalize#, gather #ingredient2#.<p>#ingredientSource.capitalize#, gather #ingredient3#."],
        mixIngredients : ["Mix #ingredient1# with #ingredient2#."],

        origin : ["<h2>#title.capitalizeAll#</h2><a href='http://www.xkcd.com'>hello</a><p>[ingredient1:#ingredient#][ingredient2:#ingredient#][ingredient3:#ingredient#]#gatherIngredients# #mixIngredients# [ingredient1:POP][ingredient2:POP][ingredient3:POP]</p>"]
    };

    var testGrammar = {
        animal : "amoeba mongoose capybara yeti dragon unicorn sphinx kangaroo boa nematode sheep quail goat corgi agouti zebra giraffe rhino skunk dolphin whale bullfrog okapi sloth monkey orangutan grizzly moose elk dikdik ibis stork finch nightingale goose robin eagle hawk iguana tortoise panther lion tiger gnu reindeer raccoon opossum".split(" "),
        "emotion" : "happy sad reflective morose gleeful jealous resentful appreciative proud".split(" "),
        "name" : "Jamal Aisha Marcel Pearl Gertrude Bailey Logan Aiden Scout Ambrose Beverly Takashi Hilda Nadya Salim Carmen Ming Lakshmi Naveen Ginger".split(" "),
        "placeAdj" : "delightful haunted faraway sunlit magical enchanted serene scenic".split(" "),
        "place" : "lagoon lake forest island grotto mountain desert wasteland meadow river".split(" "),
        "story" : ["Once #mainCharacter# went on an adventure to the #placeAdj.capitalize# #destination.capitalize#. Seeing such a #placeAdj# #destination# made #mainCharacter# #emotion#."],
        "origin" : ["[mainCharacter:#name# the #animal.capitalize#][destination:#place#]#story#[mainCharacter:pop]"],
    };

    console.log(JSON.stringify(testGrammar));

    var count = 10;
    var traces = [];
    app.grammar = tracery.createGrammar(testGrammar);

    var holder = $("#spells");

    for (var i = 0; i < count; i++) {
        traces[i] = app.grammar.createTraceFromSymbol();
        traces[i].expand();
        var story = traces[i].flatten();
        holder.append("<p>" + story + "</p>");

    }

    //   storygami.createTree($("#stories"), traces[0]);

});

