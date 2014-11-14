/**
 * @author Kate Compton
 */

var app = {};
$(document).ready(function() {
    var images = ["brain", "cone", "eye2", "dive1", "dive2", "fish", "pies"];

    var side = false;
    function createImage(src, parent) {
        var holder = $("<div>", {
            class : "illustration",

        });

        if (side) {
            holder.css({
                float : "right"
            });
        }
        side = !side;
        var div = $("<div>", {
            class : "blended",

        });
        parent.append(holder);

        holder.append(div);

        div.css({
            "background-image" : 'url("' + src + '"), url("css/img/PaperTile.jpg")'
        });

        div.append($("<img/>", {
            src : src,

            style : "visibility : hidden",

        }));

        //  var caption = app.grammar.createFlattened("caption");
        holder.append($("<div/>", {
            class : "caption",

        }));

    }

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

    var count = 10;
    var traces = [];
    app.grammar = tracery.createGrammar(spellbook);

    var holder = $("#spells");

    for (var i = 0; i < count; i++) {
        traces[i] = app.grammar.createTraceFromSymbol();
        traces[i].expand();
        var story = traces[i].flatten();
        holder.append("<p>" + story + "</p>");

        for (var j = 0; j < 1; j++) {
            createImage("css/img/adventure/" + images[Math.floor(Math.random() * 7)] + ".png", holder);
        }
    }

    //   storygami.createTree($("#stories"), traces[0]);

});

