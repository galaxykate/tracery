# Welcome to Tracery!

## A text-expansion library


### Write grammar objects, get generative stories

#### An example grammar
```
{
	"animal":["amoeba","mongoose","capybara","yeti","dragon","unicorn","sphinx","kangaroo","boa","nematode","sheep","quail","goat","corgi","agouti","zebra","giraffe","rhino","skunk","dolphin","whale","bullfrog","okapi","sloth","monkey","orangutan","grizzly","moose","elk","dikdik","ibis","stork","finch","nightingale","goose","robin","eagle","hawk","iguana","tortoise","panther","lion","tiger","gnu","reindeer","raccoon","opossum"],
	"emotion":["happy","sad","reflective","morose","gleeful","jealous","resentful","appreciative","proud"],
	"name":["Jamal","Aisha","Marcel","Pearl","Gertrude","Bailey","Logan","Aiden","Scout","Ambrose","Beverly","Takashi","Hilda","Nadya","Salim","Carmen","Ming","Lakshmi","Naveen","Ginger"],
	"placeAdj":["delightful","haunted","faraway","sunlit","magical","enchanted","serene","scenic"],
	"place":["lagoon","lake","forest","island","grotto","mountain","desert","wasteland","meadow","river"],
	"story":["Once #mainCharacter# went on an adventure to the #placeAdj.capitalize# #destination.capitalize#. Seeing such a #placeAdj# #destination# made #mainCharacter# #emotion#."],
	"origin":["[mainCharacter:#name# the #animal.capitalize#][destination:#place#]#story#[mainCharacter:pop][destination:pop]"]
} 
    ```
    
#### Output of that grammar.  Of course, many grammars are more complex!
    ```
Once Gertrude the Elk went on an adventure to the Magical Forest. Seeing such a enchanted forest made Gertrude the Elk resentful.
Once Carmen the Okapi went on an adventure to the Haunted Forest. Seeing such a faraway forest made Carmen the Okapi appreciative.
Once Lakshmi the Lion went on an adventure to the Delightful Lagoon. Seeing such a scenic lagoon made Lakshmi the Lion jealous.
Once Aiden the Quail went on an adventure to the Magical Island. Seeing such a magical island made Aiden the Quail reflective.
Once Pearl the Skunk went on an adventure to the Serene Forest. Seeing such a delightful forest made Pearl the Skunk gleeful.
```


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
A grammar is a key-value storage system for rules.

Each symbol should be followed by an array of text strings representing rules
```
  "emotion" : ["happy", "sad", "proud"],   
```
or, if you're writing a long string of single words, you can use 'split'
```
  "emotion" : "happy sad reflective morose proud".split(" "),   
```

Rules can also contain expansion symbols, words surrounded by #'s:
```
mainCharacter: ["Brittany the Wombat"],
story : ["This is a story about #mainCharacter#"]
```

Expansion symbols can have modifiers.  Modifiers can change something about the string expansion of that symbol. 
 `#animal.capitalize#` or `#animal.a#` or `#animal.plural#`
```
name: ["Brittany"],
animal: ["wombat"],
story : ["This is a story about #name# the #animal.capitalize#"]
```