# Welcome to Tracery!

## A text-expansion library
### How to use Tracery as a library

Import tracery 
`<script defer src="js/libs/tracery.js"></script>`

Use the `tracery` object to create a `Grammar` object from a source object (specification below)
`tracery.createGrammar(spellbook);`

The grammar can create `Trace` objects.  A `Trace` is one possible expansion of a grammar.  
`var trace = app.grammar.createTrace();`

The trace can be expanded into a tree structure, step by step, or all at once.
`trace.expand();`
Once expanded, the trace can create a 'flattened' version of itself: a single string of text.
var myString = trace.flatten();

Or the grammar can generate a trace and flatten it, all in one step
`var myTitle = app.grammar.createFlattened()`

Traces will start their expansions with the 'origin' symbol by default, but you can also create one from a rule (see "Rule Syntax" below), or from a symbol
`var trace = app.grammar.createTrace("A story about #character#");`
`var trace = app.grammar.createTraceFromSymbol("bookTitle");`

Many traces can be working on a single grammar at the same time, without getting in each others way.

## Input 


### Syntax overview
####  Grammar
A grammar is a key-value storage system for rules
```

```




```
    var testGrammar = {
        "emotion" : "happy sad reflective morose gleeful jealous resentful appreciative proud".split(" "),
        "name" : "Jamal Aisha Marcel Pearl Gertrude Bailey Logan Aiden Scout Ambrose Beverly Takashi Hilda Nadya Salim Carmen Ming Lakshmi Naveen Ginger".split(" "),
        "placeAdj" : "delightful haunted faraway sunlit magical enchanted serene scenic".split(" "),
        "place" : "lagoon lake forest island grotto mountain desert wasteland meadow river".split(" "),
        "story" : ["Once #mainCharacter# went on an adventure to the #placeAdj.capitalize# #destination.capitalize#. Seeing such a #placeAdj# #destination# made #mainCharacter# #emotion#."],
        "origin" : ["[mainCharacter:#name# the #animal.capitalize#][destination:#place#]#story#[mainCharacter:pop]"],
    };

```

