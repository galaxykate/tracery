/**
 * @author Kate Compton
 */

var app = {};
$(document).ready(function() {
    var bgImages = ["space.png", "glitter2.jpeg", "dusk.gif", "dusk2.png", "dusk3.png", "fractal.jpg", "glitter.jpg", "silk.jpg", "snow.jpg", "spirals.jpg", "stars.jpg", "starsanim.gif", "swirl.jpg", "trees.jpg"];
    var bgIndex = 0;
    $('body').css('background-image', 'url(css/img/' + bgImages[bgIndex] + ')');

    $('body').click(function() {
        bgIndex = (bgIndex + 1) % bgImages.length;
        $('body').css('background-image', 'url(css/img/' + bgImages[bgIndex] + ')');
    });
    var grammar = {
        introTheWeather : ["And now, the weather."],
        instrument : ["ukulele", "vocals", "guitar", "piano", "harp", "dulcimer", "violin", "accordion", "concertina", "fiddle", "tamborine", "bagpipe", "harpsichord", "euphonium"],
        musicModifier : ["heavy", "soft", "acoustic", "light", "orchestral", "operatic", "distorted", "echoing", "melodic", "atonal", "arhythmic", "rhythmic", "electronic"],
        musicGenre : ["metal", "electofunk", "jazz", "blues", "mariachi", "flamenco", "pop", "rap", "soul", "gospel", "buegrass", "swing", "folk"],
        musicPlays : ["echoes out", "reverberates", "rises", "plays"],
        musicAdv : ["too quietly to hear", "into dissonance", "into a minor chord", "changing tempo", "to a major chord", "staccatto", "into harmony", "without warning", "briskly", "under the melody", "gently", "becoming #musicGenre#"],
        song : ["melody", "dirge", "ballad", "poem", "beat poetry", "slam poetry", "spoken word performance", "hymn", "song", "tone poem", "symphony"],
        musicAdj : ["yielding", "firm", "joyful", "catchy", "folksy", "harsh", "strong", "soaring", "rising", "falling", "fading", "frantic", "calm", "childlike", "rough", "sensual", "erotic", "frightened", "sorrowful", "gruff", "smooth"],
        themeAdj : ["lost", "desired", "redeemed", "awakened", "forgotten", "promised", "broken", "forgiven", "remembered", "betrayed"],
        themeNoun : ["the future", "love", "drinking",  "space travel", "the railroad", "your childhood", "summertime", "the ocean", "sexuality", "wanderlust", "war", "divorce", "nature", "pain", "hope", "a home", "a lover", "a friend", "a marriage", "family", "death"],
        theme : ["#themeNoun# #themeAdj#"],
        weatherSentence : ["You recall #themeNoun# and #themeNoun#.", "It reminds you of the time you had #themeAdj# #themeNoun#.", "This is #musicAdj.a# #song# about #musicTopic#.", "#musicTopic.capitalize# is like #theme#, #musicAdj#.", "The singer's voice is #musicAdj#, #musicAdj#, yet #musicAdj#.", "#musicModifier.capitalize# #musicGenre# #instrument# #musicPlays# #musicAdv#."],
        weatherDescription : ["[musicTopic:#theme#]#weatherSentence# #weatherSentence# #weatherSentence# [musicTopic:POP]"],
        theWeather : ["#introTheWeather#<p class='weather'>#weatherDescription#</p><p class='weather'>#weatherDescription#</p><p class='weather'>#weatherDescription#</p><p class='weather'>#weatherDescription#</p><p class='weather'>#weatherDescription#</p><p class='weather'>#weatherDescription#</p><p class='weather'>#weatherDescription#</p>"],

        truly : ["safely", "truly", "legally", "ever"],
        episode : ["Nothing much happened today. #theWeather# <p>Should anything #truly# happen, #truly#?"],
        anyway : ["anyway", "in such a world as this", "if it were truly so", "if anything ever was"],
        butThen : ["but then", "if you could imagine", "for certain", "as we know"],
        ominousStatement : ["who could you #truly# trust, #anyway#?"],
        asMyGrandmotherSaid : ["as my grandmother always said", "as the revised Pledge of Allegiance tells us", "as the voices in our heads command"],
        pithySaying : ["never trust anyone"],
        saying : ["#asMyGrandmotherSaid.capitalize#, #pithySaying#. #butThen.capitalize# #ominousStatement#"],
        origin : ["#saying#<p>Welcome to Night Vale. <p>...</p>#episode#<p>...</p>Goodnight, Night Vale, goodnight."]
    };

    var count = 10;
    var traces = [];
    app.grammar = tracery.createGrammar(grammar);

    var storyHolder = $("#generated");
    var s = app.grammar.createFlattened();
    console.log(s);
    storyHolder.append(s);
});

