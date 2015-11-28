/**
 * @author Kate
 */
/**
 * @author Kate Compton
 */
var testGrammars = {

    webtest : {
        hashtag : ["tracery", "botally", "fiction", "games", "ftw", "literature", "bobross", "twitch", "procjam", "icids15", "nanogenmo"],
        digit : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
        emoji : ["&\\#128169;", "&\\#12816#digit#;", "&\\#128#digit##digit##digit#;", "&\\#128#digit##digit##digit#;", "&\\#128#digit##digit##digit#;", "&\\#128#digit##digit##digit#;"],
        imgURL : ["https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Cucciolo_gatto_Bibo.jpg/1920px-Cucciolo_gatto_Bibo.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Young_cats.jpg/1920px-Young_cats.jpg", "https://upload.wikimedia.org/wikipedia/commons/c/cf/Stray_kitten_Rambo001.jpg"],
        img : "<img src='#imgURL#' width=200 /><br>",
        style : 'style="color:blue;display:inline-block;"',
        origin : "<div #style#>#img# \\##hashtag# \\##hashtag# #emoji# #emoji# #emoji# #emoji#</div>"
    },

    art : {
        hexDigit : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"],
        digit : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],

        color : ["\\##hexDigit##hexDigit##hexDigit##hexDigit##hexDigit##hexDigit#"],
        shape : ['rect width="#num#" height="#num#" x="#num#" y="#num#"', 'circle cx="#num#" cy="#num#" r="#num#"', 'polygon points="#num#,#num# #num#,#num# #num#,#num#"'],

        num : ["#digit##digit#"],
        stroke : ['stroke="#color#" stroke-width="#digit#" stroke-opacity="0.#digit#"', ""],
        fill : ['fill="#color#" fill-opacity="0.#digit#"'],
        makeShape : ["<#shape# #stroke# #fill# />"],
        bg : ["<rect width='300' height='300' x='-100' y='-100' fill='#color#' />"],
        origin : ['<svg width="100" height="100">#bg##makeShape##makeShape##makeShape##makeShape##makeShape##makeShape##makeShape#</svg>']
    },

    landscape : {
        origin : "[myPlace:#path#]#line#",
        line : ["#mood.capitalize# and #mood#, the #myPlace# was #mood# with #substance#", "#nearby.capitalize# #myPlace.a# #move.ed# through the #path#, filling me with #substance#"],

        nearby : ["beyond the #path#", "far away", "ahead", "behind me"],
        substance : ["light", "reflections", "mist", "shadow", "darkness", "brightness", "gaiety", "merriment"],
        mood : ["overcast", "alight", "clear", "darkened", "blue", "shadowed", "illuminated", "silver", "cool", "warm", "summer-warmed"],
        path : ["stream", "brook", "path", "ravine", "forest", "fence", "stone wall"],
        move : ["spiral", "twirl", "curl", "dance", "twine", "weave", "meander", "wander", "flow"],
    },

    nightvale : {
        introTheWeather : ["And now, the weather."],
        instrument : ["ukulele", "vocals", "guitar", "clarinet", "piano", "harmonica", "sitar", "tabla", "harp", "dulcimer", "violin", "accordion", "concertina", "fiddle", "tamborine", "bagpipe", "harpsichord", "euphonium"],
        musicModifier : ["heavy", "soft", "acoustic", "psychedelic", "light", "orchestral", "operatic", "distorted", "echoing", "melodic", "atonal", "arhythmic", "rhythmic", "electronic"],
        musicGenre : ["metal", "electofunk", "jazz", "salsa", "klezmer", "zydeco", "blues", "mariachi", "flamenco", "pop", "rap", "soul", "gospel", "buegrass", "swing", "folk"],
        musicPlays : ["echoes out", "reverberates", "rises", "plays"],
        musicAdv : ["too quietly to hear", "into dissonance", "into a minor chord", "changing tempo", "to a major chord", "staccatto", "into harmony", "without warning", "briskly", "under the melody", "gently", "becoming #musicGenre#"],
        song : ["melody", "dirge", "ballad", "poem", "beat poetry", "slam poetry", "spoken word performance", "hymn", "song", "tone poem", "symphony"],
        musicAdj : ["yielding", "firm", "joyful", "catchy", "folksy", "harsh", "strong", "soaring", "rising", "falling", "fading", "frantic", "calm", "childlike", "rough", "sensual", "erotic", "frightened", "sorrowful", "gruff", "smooth"],
        themeAdj : ["lost", "desired", "redeemed", "awakened", "forgotten", "promised", "broken", "forgiven", "remembered", "betrayed"],
        themeNoun : ["the future", "love", "drinking", "space travel", "the railroad", "your childhood", "summertime", "the ocean", "sexuality", "wanderlust", "war", "divorce", "nature", "pain", "hope", "a home", "a lover", "a friend", "a marriage", "family", "death"],
        theme : ["#themeNoun# #themeAdj#"],
        weatherSentence : ["You recall #themeNoun# and #themeNoun#.", "It reminds you of the time you had #themeAdj# #themeNoun#.", "This is #musicAdj.a# #song# about #musicTopic#.", "#musicTopic.capitalize# is like #theme#, #musicAdj#.", "The singer's voice is #musicAdj#, #musicAdj#, yet #musicAdj#.", "#musicModifier.capitalize# #musicGenre# #instrument# #musicPlays# #musicAdv#."],
        weatherDescription : ["#weatherSentence# #weatherSentence#"],
        theWeather : ["#introTheWeather#<p class='weather'>Music plays. #[musicTopic:#theme#]weatherDescription#"],
        react : ["shake", "moan", "cry", "scream", "wail", "rejoice", "dance", "cower", "howl"],

        color : "orange blue white black grey purple indigo".split(" "),
        animal : "spider raven crow scorpion coyote eagle owl lizard deer".split(" "),
        concept : "#substance# #emotion# darkness love childhood time loss victory memory art thought belief life death caring".split(" "),
        transitiveEmotion : ["fear", "regret", "long for", "love", "distrust", "trust", "envy", "care for"],
        sense : ["feel", "hear", "see", "know"],

        natureNoun : ["ocean", "mountain", "forest", "cloud", "river", "tree", "sky", "earth", "void", "desert"],
        concreteNoun : ["#animal#", "#natureNoun#"],
        verb : ["#transitiveEmotion#", "#react#"],
        never : ["never", "never again", "hardly ever", "barely", "almost always", "always", "probably never", "even"],

        glowing : ["glowing", "rising", "hovering", "pulsing", "blinking", "glistening"],
        beingWith : ["talking to", "walking with", "listening to"],
        weirdAdj : ["weird", "arcane", "dark"],
        truly : ["safely", "truly", "legally", "ever", "already"],
        person : ["angel", "woman", "man", "figure"],
        character : ["#charAdj# #person#"],
        charAdj : ["old", "young", "hooded", "headless", "dead-eyed", "faceless"],
        charDescription : ["#never# #react.s# when they #sense# the #natureNoun#"],
        arentReal : ["are illegal", "don't exist"],
        ofCourse : ["obviously", "well, clearly", "seriously", "as we #truly# know", "as everybody knows"],

        youKnow : ["#ofCourse#", "I mean", "well", "I guess", "you know", "#maybe#"],
        episode : ["This is a story about #mc.a#. You know, the #mc# who #mcDesc#. Well, I was #beingWith# the #mc#, when we both saw this #myNoun#.  #glowing.capitalize#, #color#...well, more of #color.a#ish #color#.   We backed away because #ofCourse#, #myNoun.s# #arentReal#. That was the last we saw of it. #theWeather#  <p>You know, I miss the #myNoun#.  It was #evaluationAdj#.  I mean, #evaluationAdj#, for a #myNoun#.  #someday.capitalize#, I hope it comes back.  We'll see it, #glowing#, #color#...well, more of #color.a#ish #color#.  But it'll be back. #youKnow.capitalize#, #someday#. If not, #vagueReaction#. "],

        anyway : ["anyway", "in such a world as this", "if it were truly so", "if anything ever was"],
        butThen : ["but then", "if you could imagine", "for certain"],
        ominousStatement : ["who could you #truly# #transitiveEmotion#, #anyway#?", "if you understand my meaning.", "everyone knows that.", "you had known that for years.", "you knew that already."],
        recommend : ["mandate", "recommend", "advise", "suggest"],
        asMyGrandmotherSaid : ["as #authority# always said", "as #authority# tells us", "as #recommend.ed# by #authority#"],
        substance : "blood sand dust nothingness darkness light soil earth mud tar water bones flies honey".split(" "),
        emotion : "fear love trust desire pride sorrow regret confusion glee happiness contentment terror anger rage jealousy".split(" "),
        evaluationAdjBare : ["good", "great", "wonderful", "terrifying", "bewildering", "perfect", "beautiful", "terrible"],
        evaluationAdj : ["just #evaluationAdjBare#", "pretty #evaluationAdjBare#", "#evaluationAdjBare#", "really #evaluationAdjBare#"],
        maybe : ["I think", "maybe", "probably", "almost certainly"],
        someday : ["in the end", "if the sun rises again", "when the time comes", "in a while", "eventually", "sooner or later"],
        relative : ["mother", "father", "grandmother", "grandfather"],
        authority : ["the government", "the sheriff's secret police", "the law", "the radiochip implanted in your mind", "the Constitution", "a secret, yet menacing government society", "your own #relative#", "my own #relative#"],
        fullOf : ["full of", "covered in", "made of"],

        vagueReaction : ["we all #react# and #react# in #emotion#", "it's about time", "it's #evaluationAdj#", "it's just so #evaluationAdj#", "I couldn't be happier", "isn't that #evaluationAdj#", "there's nothing that can be done", "but it hasn't always been that way", "but it won't always be that way"],
        foo : ["#never# trust a #concreteNoun#. You can trust a #concreteNoun#, #maybe#", "I #verb#, therefore I am", "it's #concreteNoun.s# all the way down", "#concept# is the new #concept#", "the only good #concreteNoun# is a dead #concreteNoun#"],

        saying : ["Don't #transitiveEmotion# the #myThing# because the #myThing# is #fullOf# #mySub#.  You will be #fullOf# #mySub#, too, #someday#.", "The #myThing# #react.s#.  The #myThing# #react.s#. The #myThing# #react.s# with #emotion# because it #sense.s# the #concept# that it will never have.", "We #sense# the #myThing# and #react# with #emotion#.  You #sense# the #myThing# and #react# with #emotion#.  The #myThing# #sense.s# you but does not #react#.", "The #natureNoun# is made of #mySub#. The #natureNoun# is made of #mySub#. We are all made of #mySub# and #vagueReaction#.", "[emo1:#transitiveEmotion#]#never.capitalize# #emo1# #concept#. Only ever #emo1# #concept#.  How could you #emo1# what you can #never# #sense#?"],
        origin : ["[myThing:#concreteNoun#][mySub:#substance#]#saying#<p>Welcome to Night Vale. <p>...</p>[mc:#character#][mcDesc:#charDescription#][myNoun:#concreteNoun#]#episode#<p>...</p>Goodnight, Night Vale, goodnight."]
    },

    poem : {
        move : ["flock", "race", "glide", "dance", "flee", "lie"],

        bird : ["swan", "heron", "sparrow", "swallow", "wren", "robin"],
        agent : ["cloud", "wave", "#bird#", "boat", "ship"],

        transVerb : ["forget", "plant", "greet", "remember", "embrace", "feel", "love"],
        emotion : ["sorrow", "gladness", "joy", "heartache", "love", "forgiveness", "grace"],
        substance : ["#emotion#", "mist", "fog", "glass", "silver", "rain", "dew", "cloud", "virtue", "sun", "shadow", "gold", "light", "darkness"],
        adj : ["fair", "bright", "splendid", "divine", "inseparable", "fine", "lazy", "grand", "slow", "quick", "graceful", "grave", "clear", "faint", "dreary"],
        doThing : ["come", "move", "cry", "weep", "laugh", "dream"],

        verb : ["fleck", "grace", "bless", "dapple", "touch", "caress", "smooth", "crown", "veil"],
        ground : ["glen", "river", "vale", "sea", "meadow", "forest", "glade", "grass", "sky", "waves"],

        poeticAdj : ["#substance#-#verb.ed#"],
        poeticDesc : ["#poeticAdj#", "by #substance# #verb#'d", "#adj# with #substance#", "#verb.ed# with #substance#"],

        ah : ["ah", "alas", "oh", "yet", "but", "and"],
        on : ["on", "in", "above", "beneath", "under", "by"],

        punctutation : [",", ":", " ", "!", ".", "?"],

        noun : ["#ground#", "#agent#"],
        line : ["My #noun#, #poeticDesc#, my #adj# one", "More #adj# than #noun# #poeticDesc#", "#move.capitalize# with me #on# #poeticAdj# #ground#", "The #agent.s# #move#, #adj# and #adj#", "#poeticDesc.capitalize#, #poeticDesc#, #ah#, #poeticDesc#", "How #adj# is the #poeticDesc# #sub#", "#poeticDesc.capitalize# with #emotion#, #transVerb.s# the #noun#"],
        poem : ["#line##punctutation#<br>#line##punctutation#<br>#line##punctutation#<br>#line#."],
        origin : "#[sub:#noun#]poem#",
    },

    conference : {
        "greetings" : ["Salud", "Bonjour", "Shalom", "Nihao", "Hello", "Aloha"],
        "subjectAdj" : ["Digital", "Electronic", "Telekinetic", "Virtual", "Interactive"],
        "subjectNoun" : ["Storytelling", "Narrative", "Intelligence", "Art", "Media", "Games"],
        "subject" : ["#subjectAdj# #subjectNoun#", "#reimagining# #subjectAdj# #subjectNoun#"],
        "reimagining" : ["Advancing", "The Future of", "Reimagining", "Inventing", "Reinventing", "New Directions in"],
        "area" : ["Brazil", "Kauai", "Cape Verde", "Shanghai", "Barsoom", "Utopia", "Anchorage", "Europa", "Discworld", "world", "Miami", "Santa Cruz"],
        "institute" : ["Academy", "Guild", "Symposium", "Hall", "Center", "University", "Laboratory", "Library", "Association"],
        "conference" : ["Conference", "Workshop", "Symposium", "Forum"],
        "place" : ["#area# #institute# of #subject#", "#subject# #institute# of #area#", "#conference# on #subject#"],

        "controls" : ["keyboard", "mouse", "interpretive dance", "set of mechanical levers", "series of yelps and howls", "pattern of vocal ululations", "joystick", "Kinect", "EEG headset", "DDR mat", "Powerglove", "midi keyboard", "plastic guitar"],
        "hardware" : ["Arduino", "Raspberry PI", "XBox360", "Android", "Altair 8800", "Commodore 64", "hacked toaster", "jail-broken iPhone", "Apple Lisa", "computer running Windows 95"],
        "display" : ["shadow puppetry screen", "a set of teleprescence robots", "70mm film projector", "Sony Aibo", "vintage VCR", "Atari 2600", "Soviet-era military screen", "VirtualBoy", "Oculus Rift", "1957 oscilloscope", "1977 Apple II", "40ft projection"],
        "showSpace" : ["the outside of DANM", "the inside of the DARC lab", "the DANM stairwell", "the women's restroom", "the UCSC cattle pens"],
        "useCase" : ["exploring themes of #abstractThing#", "using the lens of #litDevice# from #field#", "in a one-time performance", "for the blind", "to be projected on #showSpace#", "played on a #hardware#", "running on a #hardware#", "shown on a #display#"],
        "culturalProduction" : ["drama", "reality television show", "children's game", "playground rhyme", "poem", "novel", "jazz perfomance", "folk song", "puppet show", "opera", "theater performance", "poem", "musical production", "religious ceremony"],
        "digitalArtifact" : ["webapp", "tabletop RPG", "open world game", "interactive #culturalProduction#", "digitally-enhanced #culturalProduction#", "hypertext fiction", "chose-your-own-adventure", "text adventure", "Flash-animated #culturalProduction#", "interactive #culturalProduction#", "Twine game"],
        "litDevice" : ["iambic pentameter", "intersectional feminism", "alliteration", "parody", "the feeling of agency", "first-person narration", "magical realism", "unreliable narration", "foreshadowing", "irony", "frame stories", "breaking the fourth wall", "oral storytelling", "the 'hero' journey'", "the American dream", "gender roles", "plot structure", "character development", "the myth of Sisyphus", "the 'other'", "technological literacy", "narrative structure"],
        "field" : ["the #nationality# diaspora", "contemporary American #culturalProduction.s#", "the #nationality#-American experience", "traditional #nationality# #culturalProduction.s#"],
        "setting" : ["Edo Japan", "Medieval France", "graduate school", "the basement of the British Museum", "a neighborhood bar", "a suburban home", "a coffeeshop at closing time", "Weimar Germany", "a prison in an unnamed country", "1950s San Francisco", "pre-Columbian Mesoamerica", "ancient Egypt", "an era of space exploration", "a time far in the future", "a time before #abstractThing#", "London in the 60s", "high school in the 1980s", "the height of the drug wars"],
        "abstractThing" : ["internal turmoil", "regret", "alcoholism", "body dysmorphia", "first dates", "coming-of-age", "passion", "love", "quiet desperation", "deperate loneliness", "hatred", "world-changing choices", "#nationality# imperialism", "#nationality# pride", "deep sorrows", "immeasurable loss", "rising hope", "boundless despair", "laughter", "societal disapproval", "instability", "difficult choices", "sacrifice", "cruel betrayal"],
        "someDramaticStuff" : ["#abstractThing# in a time of #abstractThing#"],
        "influence" : ["influence"],
        "person" : ["a Mary-Sue character", "a strugging artist", "a teenage girl", "a nameless child", "an elderly woman", "an invisible observer", "an old man", "a young boy", "the author", "a cat", "a famous historical figure", "a high-ranking official"],
        "aProtagonist" : ["#person#", "#person# lost in #setting#", "#person# in #setting#"],
        "tellTheStory" : ["relate a tale", "paint a picture", "simulate the experience", "spin a story", "describe a world", "tell"],
        "examination" : ["examination", "reimagining", "interpretation", "appropriation", "mythologization", "colonization", "deconstruction", "(de)#examination#", "(re)#examination#"],
        "complexTopic" : ["#litDevice# in #field#"],
        "system" : ["a neural network", "a procedural system", "an advanced AI", "a decision tree"],
        "explore" : ["navigate", "control", "explore", "interact"],
        "implementedOn" : ["as instantiated on", "proceduralized with", "controlled by", "simulated on"],
        "project" : ["#litDevice.capitalize# and #litDevice# #tellTheStory# of #abstractThing# in this #digitalArtifact# about #aProtagonist#.", "#abstractThing.capitalize# in #setting# is explored with #litDevice# #implementedOn# a #digitalArtifact#.", "#useCase.capitalize#, #aProtagonist# is used to #tellTheStory# of #abstractThing# using #litDevice#, as #implementedOn# a #hardware#.", "A #examination# of #litDevice# to explore #abstractThing# in a #digitalArtifact#", "The user #explore.s# with #aProtagonist# and must defeat #abstractThing# using a #controls# to activate #abstractThing#, but can only experience their world through a #display#.", "A #culturalProduction# performed on #display#, which the user #explore.s# with a #controls#.", "A project to #tellTheStory# of #aProtagonist# and their #abstractThing#, with a #digitalArtifact#.", "#system.capitalize# to implement #litDevice# for #digitalArtifact.s#, #useCase#.", "A #examination# of themes of #abstractThing#,  using #litDevice# in a #digitalArtifact#.", "A #digitalArtifact# about #complexTopic#, #useCase#.", "A #digitalArtifact# using #litDevice# and #litDevice# to #tellTheStory# of #someDramaticStuff#"],
        "nationality" : ["North #nationality#", "West #nationality#", "Outer #nationality#", "New #nationality#", "Mongolian", "Merovingian", "Californian", "Texan", "Viennese", "Indonesian", "Malaysian", "Gibraltan", "Roman", "Hungarian", "Transylvanian", "Iowan", "Minnesotan", "Guatemalan", "Cantonese", "Irish", "Caspian", "Eurasian", "Pan-American", "Frankish", "Byzantine", "Alexandrian", "Persian", "Mongolian"],
        "titlePart" : ["#subjectAdj# ", "Psycho", "Out", "Neuro", "Tele", "Cyber", "Flash", "Re:", "De", "Un", "Dys"],
        "titleNoun" : ["#culturalProduction#", " Spaces", "the Praxis", "Text", "the Text", "Academia", "Presence", "Experience", "the Divine", "the diaspora", "#field#", "#field#"],
        "titleMod" : ["No", "Only", "New", "#titleVerb#"],
        "titleVerb" : ["finding", "interrogating", "stabilizing", "navigating", "being", "uncovering", "mixing", "freeing", "appropriating", "searching"],
        "title" : ["#titleMod# #titleNoun#", "#titlePart.capitalize##titlePart.capitalize##titleVerb# #titleNoun#", "#titlePart.capitalize##titleVerb.capitalize#"],

        "projectDesc" : "<b>#title#:</b> #project#",
        "origin" : "<h3>#greetings#, and welcome to the #place#</h3><p>Schedule:</p><p>#projectDesc#<p>#projectDesc#<p>#projectDesc#"
    },

    scifi : {

        firstSyl : "B C D F G Z St Fl Bl Pr Kr Ll Chr Sk Br Sth  H J K L M N P Qu R S T V W X Y Z  Ch Dhr Dr Sl Sc Sh Thl Thr Pl Fr Phr Phl Wh".split(" "),
        middleSyl : "an all ar art air aean af av ant app ab er en eor eon ent enth irt ian ion iont ill il ipp in is it ik ob ov orb oon ion uk uf un ull urk estr antr okl ackl".split(" "),
        lastSyl : "a ia ea u y en am is on an o io i el ios ax ox ix ex izz ius ian ean ekang anth".split(" "),

        butchName : ["Chesty", "Manley", "Brock", "Stone", "Brick", "Butch", "Bruce", "Steel", "Saber", "Tex", "Rock", "Drake", "Ace", "Knute", "Wolf", "Thorax", "Brad", "Abs", "Burt", "Slate", "Bret", "Duke"],
        alienName : ["#firstSyl##middleSyl##lastSyl#", "#firstSyl##lastSyl#", "#firstSyl##lastSyl#-#firstSyl##lastSyl#"],

        physicsParticle : ["quark", "photon", "lepton", "muon"],
        scienceVerb : ["evaporate", "decay", "phase-shift", "teleport", "destabilize", "sublimate"],
        scienceBlargleStart : ["holo", "hyper", "transmuto", "digi", "nano", "electro", "transma", "magna"],

        communicationDevice : ["#physicsParticle#-transmitter", "#scienceBlargleStart#phone", "#scienceBlargleStart#pager", "#scienceBlargleStart#beeper", "#scienceBlargleStart#view", "#scienceBlargleStart#scope", "#scienceBlargleStart#cam"],

        shortTime : ["in a sec", "right now", "two clicks", "a moment's time", "the blink of an eye", "no time at all", "the time it takes a single unstable #physicsParticle# to #scienceVerb#", "#firstSyl##middleSyl#sday"],
        conversationally : ["expressively", "noncommitally", "with relief", "dispassionately"],
        mcResponded : ["'That was unexpected,' #mc# said.", "#mc# shrugged #conversationally#", "#mc# sighed #conversationally#"],

        transitPlain : ["bus", "plane", "jet", "tram", "rail", "tube", "beam"],
        transitMod : ["nonstop", "express", "commuter", "prismatic", "red-eye", "pneumatic", "crosstown"],
        transportSystem : ["#scienceBlargleStart##transitPlain#", "#transitMod# #scienceBlargleStart# #transitPlain#"],
        travelPlot : ["#mc# punched '#mcDestinationSystem#' into the #communicationDevice#. There was still one ticket left on the #transportSystem#, but he'd have to take a #transportSystem# the rest of the way to Planet #mcDestination#.'"],

        sexy : ["muscled", "sexy", "dark", "well-dressed", "masculine", "dramatic", "dramatically lit", "boyish", "burly", "handsome", "erotic", "many-bossomed", "supple", "nude"],
        occupation : ["lumberjack", "firefighter", "scientist", "spy", "wizard", "radio broadcaster", "smuggler", "mechanic", "astronaut", "adventurer", "pirate", "cowboy", "vampire", "detective", "soldier", "marine", "doctor", "ninja", "waitress", "burlesque dancer", "ballerina", "opera singer", "gogo dancer", "rollerskater"],

        vipTitle : ["Vice President", "Mr.", "Detective", "Senator", "Chairman", "Princess", "Lord", "Lady", "Professor", "Grand Inquisistor", "High Priest", "President"],
        boss : ["#vipTitle# #alienName#"],

        artFormBasic : ["novel", "sculpture", "film", "painting", "poem", "play"],
        artForm : ["prisma#artFormBasic#", "holo#artFormBasic#", "photo#artFormBasic#", "hyper#artFormBasic#"],
        artDemand : ["'Your #mcArt# is late, #mc#', shrieked #mcBoss# over the #communicationDevice#.", "'I need that #mcArt# by #shortTime#' yelled #mcBoss#.", "'Where's the #mcArt#, #mc#? You promised it'd be finished by last #firstSyl##middleSyl#sday,' #mcBoss#'s voice came through the #communicationDevice#."],
        artQuest : ["The only thing that could really, I mean really, inspire a #mcArt# would be the famously #sexy# #occupation.s# of Planet #mcDestination# and for that, he'd have to go to the #mcDestinationSystem# system. #travelPlot#"],
        artPlot : ["#artDemand#  'Yeah, I'll have it done in #shortTime#', #mc# promised, hanging up the #communicationDevice#. #mcResponded#.#[mcDestination:#alienName#][mcDestinationSystem:#alienName#]artQuest#"],

        plot : ["#[mcArt:#artForm#][mcBoss:#boss#]artPlot#"],

        origin : ["#[mc:#butchName#]plot#"]

    },

};

