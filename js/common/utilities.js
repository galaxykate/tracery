/**
 * @author Kate Compton
 */

define([], function() {
    function toShort(s) {
        if (s.length < 20)
            return s;
        else
            return s.substring(0, 17) + "...";
    }

    var entityMap = {
        "&" : "&amp;",
        "<" : "&lt;",
        ">" : "&gt;",
        '"' : '&quot;',
        "'" : '&#39;',
        "/" : '&#x2F;'
    };

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'\/]/g, function(s) {
            return entityMap[s];
        });
    }

    var randomCap = function(array) {
        return utilities.capitaliseFirstLetter(utilities.getRandom(array));
    };

    var utilities = {

        // courtesy of http://www.zacwitte.com/javascript-sigmoid-function
        sigmoid : function(t, min, max) {
            // [0, 1]
            var v = 1 / (1 + Math.pow(Math.E, -t));
            if (min !== undefined) {
                v = v * (max - min) + min;
            }
            return v;
        },
        
       

        remove : function(list, item) {

            var index = list.indexOf(item);

            if (index > -1) {
                list.splice(index, 1);
            }
        },

        splitSections : function(s, open, close, splitter) {

            var levels = this.splitParens(s, open, close);
            var sections = [];
            for (var i = 0; i < levels.outer.length; i++) {

                // add the outer's split

                if (levels.outer[i].length > 0) {
                    //  console.log("outer:" + toShort(levels.outer[i]));

                    var split = levels.outer[i].split(splitter);
                    // Odds are in quotes, evens are in

                    if (split.length % 2 !== 1) {
                        console.log(split);
                        throw ("Uneven number of splitters in section: " + levels.outer[i]);

                    }

                    for (var j = 0; j < split.length; j++) {
                        var type = "in";
                        if (j % 2 === 0)
                            type = "out";

                        sections.push({
                            type : type,
                            text : split[j]
                        });

                    }
                }

                // Add the inner
                if (i < levels.inner.length) {
                    sections.push({
                        type : "hidden",
                        text : levels.inner[i]
                    });
                }

            }
            return sections;
        },

        splitParens : function(s, open, close) {
            var level = 0;
            var outer = [];
            var inner = [];
            var start = 0;
            for (var i = 0; i < s.length; i++) {
                var c = s.charAt(i);
                if (level === 0) {
                    if (c === open) {
                        var section = s.substring(start, i);
                        outer.push(section);
                        start = i + 1;
                        level++;
                    } else {

                    }

                } else {
                    if (c === close) {
                        level--;
                        if (level === 0) {
                            var section = s.substring(start, i);
                            inner.push(section);
                            start = i + 1;
                        }
                    }

                    if (c === open) {
                        level++;
                    }
                }

            }

            outer.push(s.substring(start, i));
            return {
                inner : inner,
                outer : outer
            };
        },

        isDuplicate : function(a, b, ignoreKeys) {

            var joint = {};
            $.extend(joint, a);
            $.extend(joint, b);

            var keys = Object.keys(joint);
            var comparisons = 0;
            var differences = [];
            var similarities = [];
            for (var i = 0; i < keys.length; i++) {

                var key = keys[i];
                if (!$.inArray(key, ignoreKeys)) {
                    comparisons++;

                    if (a[key] !== b[key]) {
                        differences.push(key);
                    } else {
                        similarities.push(key + ": " + b[key]);
                    }
                } else {

                }
            }

            var pct = differences.length / comparisons;
            if (pct === 1)
                return false;

            if (pct === 0) {
                return true;
            }

            if (pct < .9) {
                console.log(a.id + " is similar to " + b.id);
                console.log("  differences: " + differences);
                console.log("  similarities: " + similarities);
            }
            return pct < .5;
        },

        escapeHTML : escapeHtml,

        // put noise in here too?
        capitaliseFirstLetter : function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        lowerCaseFirstLetter : function(string) {
            return string.charAt(0).toLowerCase() + string.slice(1);
        },
        loremIpsum : function(length) {
            var start = Math.floor((Math.random() * (this.loremIpsumSource.length - length)));
            return this.loremIpsumSource.substring(start, start + length);
        },
        loremIpsumSentences : function() {
            var s = utilities.getRandom(this.sentences) + ".";
            /*
             var count = 0;
             while (Math.random() > .6 && count < 3) {
             // if (Math.random() > .5)
             s += "<br/>";

             count++;
             s += "  " + utilities.getRandom(this.sentences) + ".";
             }
             */
            return s;
        },
        words : {
            syllables : {
                first : "B C D F G H J K L M N P Qu R S T V W X Y Z St Fl Bl Pr Kr Ll Chr Sk Br Sth Ch Dhr Dr Sl Sc Sh Thl Thr Pl Fr Phr Phl Wh".split(" "),
                middle : "an all ar art air aean af av ant app ab er en eor eon ent enth irt ian ion iont ill il ipp in is it ik ob ov orb oon ion uk uf un ull urk".split(" "),
                composites : "estr antr okl ackl".split(" "),
                last : "a ia ea u y en am is on an o io i el ios ius ian ean ekang anth ".split(" "),
            },
            animals : "amoeba mongoose capybara yeti dragon unicorn sphinx kangaroo boa nematode sheep quail goat corgi agouti zebra giraffe rhino skunk dolphin whale bullfrog okapi sloth monkey orangutan grizzly moose elk dikdik ibis stork finch nightingale goose robin eagle hawk iguana tortoise panther lion tiger gnu reindeer raccoon opossum".split(" "),
            moods : "angry bemused elated skeptical morose gleeful curious sleepy hopeful ashamed alert energetic exhausted giddy grateful groggy grumpy irate jealous jubilant lethargic sated lonely relaxed restless surprised tired thankful".split(" "),
            colors : "ivory white silver ecru scarlet red burgundy ruby crimson carnelian pink rose grey pewter charcoal slate onyx black mahogany brown green emerald blue sapphire turquoise aquamarine teal gold yellow carnation orange lavender purple magenta lilac ebony amethyst garnet".split(" "),
            adventures : "lament story epic tears wish desire dance mystery enigma drama path training sorrows joy tragedy comedy riddle puzzle regret victory loss song adventure question quest vow oath tale travels".split(" "),
            personTitle : "Dr. Ms. Rev. St. Mr Professor".split(" "),
            personName : "Nara Alphonse Miranda Gertrude Zhangwei Lichiang LiJing Aiysha Alesandro Enrik Seo-yun Ji-woo Oisha Tarik Antoni Tereza Freja Ionnis Lukas Lorenzo Zhangyan Shu-hui Mei-ling Youssef Althea Gabriel Valentina Hala Noor Omar Sai Pranav Mikhail Ezekiel Sebastian Ibrahim Fatma Mariam Isabel Loretta Phoebe Nigel Amaya Maia Zelda".split(" "),
            getRandomPhrase : function() {
                return utilities.getRandom(utilities.words.moods) + " " + utilities.getRandom(utilities.words.colors) + " " + utilities.getRandom(utilities.words.animals);
            },
            getRandomName : function() {
                var s = utilities.getRandom(this.personName) + " " + this.getRandomWord();
                if (Math.random() > .5)
                    s = utilities.getRandom(this.personTitle) + " " + s;
                return s;
            },
            getRandomTitle : function() {
                var adj = randomCap(this.moods);
                if (Math.random() > .5)
                    adj = randomCap(this.colors);
                return "The " + randomCap(this.adventures) + " of the " + adj + " " + randomCap(this.animals);
            },
            getRandomWord : function(lengthMult) {
                if (!lengthMult)
                    lengthMult = 1;
                var s = utilities.getRandom(this.syllables.first);
                if (Math.random() < .4)
                    s = utilities.capitaliseFirstLetter(utilities.getRandom(this.syllables.middle));

                var count = Math.floor(Math.random() * lengthMult * 3);
                for (var i = 0; i < count; i++) {
                    var mid = utilities.getRandom(this.syllables.middle);
                    s += mid;

                }
                s += utilities.getRandom(this.syllables.last);

                if (s.length > 6 * lengthMult && Math.random < .8)
                    s = utilities.words.getRandomWord();
                if (s.length > 9 * lengthMult && Math.random < .9)
                    s = utilities.words.getRandomWord();

                if (s.length < 6 * lengthMult && Math.random() < .2)
                    s += "-" + utilities.words.getRandomWord();
                else if (s.length < 6 * lengthMult && Math.random() < .2)
                    s += "'" + utilities.getRandom(this.syllables.last);

                return s;
            }
        },
        arrayToString : function(array) {
            s = "";
            $.each(array, function(index, obj) {
                if (index !== 0)
                    s += ", ";
                s += obj;
            });
            return s;
        },
        inSquareBrackets : function(s) {
            return "[" + s + "]";
        },

        join : function(array, spacer, f) {
            var s = "";
            for (var i = 0; i < array.length; i++) {
                if (s.length === 0)
                    s += f(array[i]);
                else
                    s += spacer + f(array[i]);
            }
            return s;
        },

        spaceTo : function(txt, length) {
            var label = txt;
            label = label.substring(0, length - 1);
            if (length) {

                label = label + utilities.getSpacer(length - label.length);
            }
            return label;
        },

        getSpacer : function(count) {
            var s = "";
            for (var i = 0; i < count; i++) {
                s += " ";
            }
            return s;
        },
        sCurve : function(v, iterations) {
            if (iterations === undefined)
                iterations = 1;
            for (var i = 0; i < iterations; i++) {
                var v2 = .5 - .5 * Math.cos(v * Math.PI);
                v = v2;
            }
            return v;
        },
        within : function(val, min, max) {
            return (val >= min) && (val <= max);
        },

        // Inefficient, fix someday
        // the weight is determined by the function getWeight(index, item, list)
        getWeightedRandomIndex : function(array) {
            var totalWeight = 0;
            var length = array.length;

            for (var i = 0; i < length; i++) {

                totalWeight += array[i];
            };

            var target = Math.random() * totalWeight;
            var cumWeight = 0;

            for (var i = 0; i < length; i++) {
                cumWeight += array[i];

                if (target <= cumWeight) {
                    return i;
                }

            };

        },

        // Get a random, from an array
        getRandom : function(array, power) {
            if (power)
                return array[Math.floor(Math.pow(Math.random(), power) * array.length)];
            else
                return array[Math.floor(Math.random() * array.length)];
        },
        getRandomIndex : function(array) {
            return Math.floor(Math.random() * Math.round(array.length - 1));
        },
        getRandomKey : function(obj) {
            return this.getRandom(Object.keys(obj));
        },
        constrain : function(val, lowerBound, upperBound) {
            if (Math.max(val, upperBound) === val)
                return upperBound;
            if (Math.min(val, lowerBound) === val)
                return lowerBound;
            return val;
        },
        lerp : function(start, end, percent) {
            return (start + percent * (end - start));
        },
        lerpAngles : function(start, end, pct) {
            var dTheta = end - start;
        },

        // angle between 0 and 2 PI
        normalizeAngle : function(theta) {
            var twopi = Math.PI * 2;
            theta = (((theta % twopi) + twopi) % twopi);
            return theta;
        },

        // Rertun a random, possible between two numbers
        random : function() {
            if (arguments.length === 0)
                return Math.random();
            if (arguments.length === 1)
                return Math.random() * arguments[i];
            if (arguments.length === 2)
                return Math.random() * (arguments[1] - arguments[0]) + arguments[0];

            return Math.random();
        },
        roundNumber : function(num, places) {
            // default 2 decimal places
            if (places === undefined) {
                return parseFloat(Math.round(num * 100) / 100).toFixed(2);
            } else {
                return parseFloat(Math.round(num * 100) / 100).toFixed(places);
            }
        },
        angleBetween : function(a, b) {
            var dTheta = b - a;
            dTheta = ((dTheta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            if (dTheta > Math.PI)
                dTheta -= Math.PI * 2;
            return dTheta;
        },
        isString : function(s) {
            return ( typeof s == 'string' || s instanceof String);
        }
    };

    utilities.loremIpsumSource = "PREFACE  WHY is it that a little spice of deviltry lends not an unpleasantly titillating twang to the great mass of respectable flour that goes to make up the pudding of our modern civilization? And pertinent to this question another--Why is it that the pirate has, and always has had, a certain lurid glamour of the heroical enveloping him round about? Is there, deep under the accumulated debris of culture, a hidden groundwork of the old-time savage? Is there even in these well-regulated times an unsubdued nature in the respectable mental household of every one of us that still kicks against the pricks of law and order? To make my meaning more clear, would not every boy, for instance--that is, every boy of any account--rather be a pirate captain than a Member of Parliament? And we ourselves--would we not rather read such a story as that of Captain Avery's capture of the East Indian treasure ship, with its beautiful princess and load of jewels (which gems he sold by the handful, history sayeth, to a Bristol merchant), than, say, one of Bishop Atterbury's sermons, or the goodly Master Robert Boyle's religious romance of 'Theodora and Didymus'? It is to be apprehended that to the unregenerate nature of most of us there can be but one answer to such a query.  In the pleasurable warmth the heart feels in answer to tales of derring-do Nelson's battles are all mightily interesting, but, even in spite of their romance of splendid courage, I fancy that the majority of us would rather turn back over the leaves of history to read how Drake captured the Spanish treasure ship in the South Sea, and of how he divided such a quantity of booty in the Island of Plate (so named because of the tremendous dividend there declared) that it had to be measured in quart bowls, being too considerable to be counted.  Courage and daring, no matter how mad and ungodly, have always a redundancy of vim and life to recommend them to the nether man that lies within us, and no doubt his desperate courage, his battle against the tremendous odds of all the civilized world of law and order, have had much to do in making a popular hero of our friend of the black flag. But it is not altogether courage and daring that endear him to our hearts. There is another and perhaps a greater kinship in that lust for wealth that makes one's fancy revel more pleasantly in the story of the division of treasure in the pirate's island retreat, the hiding of his godless gains somewhere in the sandy stretch of tropic beach, there to remain hidden until the time should come to rake the doubloons up again and to spend them like a lord in polite society, than in the most thrilling tales of his wonderful escapes from commissioned cruisers through tortuous channels between the coral reefs.  And what a life of adventure is his, to be sure! A life of constant alertness, constant danger, constant escape! An ocean Ishmaelite, he wanders forever aimlessly, homelessly; now unheard of for months, now careening his boat on some lonely uninhabited shore, now appearing suddenly to swoop down on some merchant vessel with rattle of musketry, shouting, yells, and a hell of unbridled passions let loose to rend and tear. What a Carlislean hero! What a setting of blood and lust and flame and rapine for such a hero!  Piracy, such as was practiced in the flower of its days--that is, during the early eighteenth century--was no sudden growth. It was an evolution, from the semi-lawful buccaneering of the sixteenth century, just as buccaneering was upon its part, in a certain sense, an evolution from the unorganized, unauthorized warfare of the Tudor period.  For there was a deal of piratical smack in the anti-Spanish ventures of Elizabethan days. Many of the adventurers--of the Sir Francis Drake school, for instance--actually overstepped again and again the bounds of international law, entering into the realms of de facto piracy. Nevertheless, while their doings were not recognized officially by the government, the perpetrators were neither punished nor reprimanded for their excursions against Spanish commerce at home or in the West Indies; rather were they commended, and it was considered not altogether a discreditable thing for men to get rich upon the spoils taken from Spanish galleons in times of nominal peace. Many of the most reputable citizens and merchants of London, when they felt that the queen failed in her duty of pushing the fight against the great Catholic Power, fitted out fleets upon their own account and sent them to levy good Protestant war of a private nature upon the Pope's anointed.  Some of the treasures captured in such ventures were immense, stupendous, unbelievable. For an example, one can hardly credit the truth of the 'purchase' gained by Drake in the famous capture of the plate ship in the South Sea.  One of the old buccaneer writers of a century later says: 'The Spaniards affirm to this day that he took at that time twelvescore tons of plate and sixteen bowls of coined money a man (his number being then forty-five men in all), insomuch that they were forced to heave much of it overboard, because his ship could not carry it all.'  Maybe this was a very greatly exaggerated statement put by the author and his Spanish authorities, nevertheless there was enough truth in it to prove very conclusively to the bold minds of the age that tremendous profits--'purchases' they called them--were to be made from piracy. The Western World is filled with the names of daring mariners of those old days, who came flitting across the great trackless ocean in their little tublike boats of a few hundred tons burden, partly to explore unknown seas, partly--largely, perhaps--in pursuit of Spanish treasure: Frobisher, Davis, Drake, and a score of others.  In this left-handed war against Catholic Spain many of the adventurers were, no doubt, stirred and incited by a grim, Calvinistic, puritanical zeal for Protestantism. But equally beyond doubt the gold and silver and plate of the 'Scarlet Woman' had much to do with the persistent energy with which these hardy mariners braved the mysterious, unknown terrors of the great unknown ocean that stretched away to the sunset, there in faraway waters to attack the huge, unwieldy, treasure-laden galleons that sailed up and down the Caribbean Sea and through the Bahama Channel.  Of all ghastly and terrible things old-time religious war was the most ghastly and terrible. One can hardly credit nowadays the cold, callous cruelty of those times. Generally death was the least penalty that capture entailed. When the Spaniards made prisoners of the English, the Inquisition took them in hand, and what that meant all the world knows. When the English captured a Spanish vessel the prisoners were tortured, either for the sake of revenge or to compel them to disclose where treasure lay hidden. Cruelty begat cruelty, and it would be hard to say whether the Anglo-Saxon or the Latin showed himself to be most proficient in torturing his victim.  When Cobham, for instance, captured the Spanish ship in the Bay of Biscay, after all resistance was over and the heat of the battle had cooled, he ordered his crew to bind the captain and all of the crew and every Spaniard aboard--whether in arms or not--to sew them up in the mainsail and to fling them overboard. There were some twenty dead bodies in the sail when a few days later it was washed up on the shore.  Of course such acts were not likely to go unavenged, and many an innocent life was sacrificed to pay the debt of Cobham's cruelty.  Nothing could be more piratical than all this. Nevertheless, as was said, it was winked at, condoned, if not sanctioned, by the law; and it was not beneath people of family and respectability to take part in it. But by and by Protestantism and Catholicism began to be at somewhat less deadly enmity with each other; religious wars were still far enough from being ended, but the scabbard of the sword was no longer flung away when the blade was drawn. And so followed a time of nominal peace, and a generation arose with whom it was no longer respectable and worthy--one might say a matter of duty--to fight a country with which one's own land was not at war. Nevertheless, the seed had been sown; it had been demonstrated that it was feasible to practice piracy against Spain and not to suffer therefor. Blood had been shed and cruelty practiced, and, once indulged, no lust seems stronger than that of shedding blood and practicing cruelty.  Though Spain might be ever so well grounded in peace at home, in the West Indies she was always at war with the whole world--English, French, Dutch. It was almost a matter of life or death with her to keep her hold upon the New World. At home she was bankrupt and, upon the earthquake of the Reformation, her power was already beginning to totter and to crumble to pieces. America was her treasure house, and from it alone could she hope to keep her leaking purse full of gold and silver. So it was that she strove strenuously, desperately, to keep out the world from her American possessions--a bootless task, for the old order upon which her power rested was broken and crumbled forever. But still she strove, fighting against fate, and so it was that in the tropical America it was one continual war between her and all the world. Thus it came that, long after piracy ceased to be allowed at home, it continued in those far-away seas with unabated vigor, recruiting to its service all that lawless malign element which gathers together in every newly opened country where the only law is lawlessness, where might is right and where a living is to be gained with no more trouble than cutting a throat. {signature Howard Pyle His Mark}     HOWARD PILE'S BOOK OF PIRATES     Chapter I. BUCCANEERS AND MAROONERS OF THE SPANISH MAIN  JUST above the northwestern shore of the old island of Hispaniola--the Santo Domingo of our day--and separated from it only by a narrow channel of some five or six miles in width, lies a queer little hunch of an island, known, because of a distant resemblance to that animal, as the Tortuga de Mar, or sea turtle. It is not more than twenty miles in length by perhaps seven or eight in breadth; it is only a little spot of land, and as you look at it upon the map a pin's head would almost cover it; yet from that spot, as from a center of inflammation, a burning fire of human wickedness and ruthlessness and lust overran the world, and spread terror and death throughout the Spanish West Indies, from St. Augustine to the island of Trinidad, and from Panama to the coasts of Peru.  About the middle of the seventeenth century certain French adventurers set out from the fortified island of St. Christopher in longboats and hoys, directing their course to the westward, there to discover new islands. Sighting Hispaniola 'with abundance of joy,' they landed, and went into the country, where they found great quantities of wild cattle, horses, and swine.  Now vessels on the return voyage to Europe from the West Indies needed revictualing, and food, especially flesh, was at a premium in the islands of the Spanish Main; wherefore a great profit was to be turned in preserving beef and pork, and selling the flesh to homeward-bound vessels.  The northwestern shore of Hispaniola, lying as it does at the eastern outlet of the old Bahama Channel, running between the island of Cuba and the great Bahama Banks, lay almost in the very main stream of travel. The pioneer Frenchmen were not slow to discover the double advantage to be reaped from the wild cattle that cost them nothing to procure, and a market for the flesh ready found for them. So down upon Hispaniola they came by boatloads and shiploads, gathering like a swarm of mosquitoes, and overrunning the whole western end of the island. There they established themselves, spending the time alternately in hunting the wild cattle and buccanning(1) the meat, and squandering their hardly earned gains in wild debauchery, the opportunities for which were never lacking in the Spanish West Indies.";
    utilities.sentences = utilities.loremIpsumSource.split(".");
    return utilities;
});

