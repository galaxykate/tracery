# Welcome to Tracery!

## Tracery is a modular grammar-generation tool

```
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

```

