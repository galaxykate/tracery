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

        var caption = app.grammar.createFlattened("caption");
        holder.append($("<div/>", {
            class : "caption",
            html : caption,
        }));

    }

    var adventureGrammar = {
        adventure : "lament story epic tear sight sigh wish desire dance mystery enigma drama path training sorrows joy tragedy comedy riddle puzzle regret victory loss song adventure question quest vow oath tale travel".split(" "),
        abstractNoun : ["#adventure#"],
        bookTitle : ["The #adventure.capitalize# of a #abstractNoun.capitalize#"],
        animal : "amoeba mongoose capybara yeti dragon unicorn sphinx kangaroo boa nematode sheep quail goat corgi agouti zebra giraffe rhino skunk dolphin whale bullfrog okapi sloth monkey orangutan grizzly moose elk dikdik ibis stork finch nightingale goose robin eagle hawk iguana tortoise panther lion tiger gnu reindeer raccoon opossum".split(" "),
        mood : "angry bemused elated skeptical morose gleeful curious sleepy hopeful ashamed alert energetic exhausted giddy grateful groggy grumpy irate jealous jubilant lethargic sated lonely opportunistic relaxed restless surprised tired thankful".split(" "),
        emotion : "gratitude terror fear glee giddiness sorrow pride".split(" "),
        color : "ivory white silver ecru scarlet red burgundy ruby crimson carnelian pink rose grey pewter charcoal slate onyx black mahogany brown green emerald blue sapphire turquoise aquamarine teal gold yellow carnation orange lavender purple magenta lilac ebony amethyst garnet".split(" "),
        author : ["Sir #maleName# #surname#"],
        maleName : ["Simon", "Ramsey", "Octavius", "Owen", "Johnathan", "Jefferson", "Richard", "Rufus", "Thaddeus", "Zebulon", "Ulysses", "Garrett", "Maurice", "Maxwell", "Harland", "Harrison", "Dudley", "Julius", "Winston", "Clarence", "Barnabas", "Archibald", "Hiram", "Ambrose", "Bartholomew", "Eldon", "Edwin"],
        surnameStart : "Up West Long East North River South Snith Cross Aft Aver Ever Down Whit Rob Rod Hesel Kings Queens Ed Sift For Farring Coven Craig Cath Chil Clif Grit Grand Orla Prat Milt Wilt Berk Draft Red Black".split(" "),
        surnameEnd : "castle end wrench bottom hammer wick shire gren glen swith bury every stern ner brath mill bly ham tine field groat sythe well bow bone wind storm horn thorne cart bry ton man watch leath heath ley".split(" "),

        surname : ["#surnameStart##surnameEnd#"],
        chapterTitle : ["In which #animal.pluralize# are revealed as less #mood# than believed"],
        unexpected : ["unexpected", "astonishing", "unanticipated", "suprising", "unusual"],
        caption : ["No-one expected what we saw next", "The #emotion# we were shown was #unexpected#", "A stunning reveal.", "Assistance came from #unexpected.a# source"],
        introClause : ["without further #adventure#,", "though we were still #mood#,", "alas,", "unexpectly", "with no warning", "to our immense #emotion#"],
        "event" : ["#introClause# #event#", "#introClause# #event#", "#introClause# #event#", "#introClause# #event#", "we travelled many days.", "we rested a while.", "a thrilling battle ensued.", "many tears were shed.", "celebrations lasted into the night."],
        origin : ["#event.capitalize# #event.capitalize# #event.capitalize# #event.capitalize# #event.capitalize# #event.capitalize# #event.capitalize# #event.capitalize# #event.capitalize# #event.capitalize# #event.capitalize# #event.capitalize#"],
    };

    var count = 10;
    var traces = [];
    app.grammar = tracery.createGrammar(adventureGrammar);
    for (var i = 0; i < count; i++) {
        traces[i] = app.grammar.createTraceFromSymbol();
    }

    for (var i = 0; i < count; i++) {
        traces[i].expand();
    }

    $("#bookTitle").html(app.grammar.createFlattened("bookTitle"));
    $("#bookAuthor").html(app.grammar.createFlattened("author"));

    var holder = $("#stories");

    for (var i = 0; i < count; i++) {
        var story = traces[i].flatten();
        //console.log(story);

        holder.append("<div class='chapterTitle'>Chapter " + (i + 1) + ": " + app.grammar.createFlattened("chapterTitle") + "</div>");
        holder.append("<p>" + story + "</p>");

        for (var j = 0; j < 1; j++) {
            createImage("css/img/adventure/" + images[Math.floor(Math.random() * 7)] + ".png", holder);
        }
    }

    //   storygami.createTree($("#stories"), traces[0]);

});

