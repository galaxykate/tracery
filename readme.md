# Welcome to Tracery!

## A text-expansion library

There are many new examples of Tracery [in use](http://www.crystalcodepalace.com/tracery.html "Examples")
I also have an exciting new *interactive* [tutorial](http://www.crystalcodepalace.com/traceryTut.html "Tutorial")

I strongly recommend using the [minified library](https://github.com/galaxykate/tracery/blob/master/js/tracery.min.js "Minified")

### Write grammar objects, get generative stories

#### An example grammar
```
{
	"name": ["Arjun","Yuuma","Darcy","Mia","Chiaki","Izzi","Azra","Lina"],
	"animal": ["unicorn","raven","sparrow","scorpion","coyote","eagle","owl","lizard","zebra","duck","kitten"],
	"mood": ["vexed","indignant","impassioned","wistful","astute","courteous"],
	"story": ["#hero# traveled with her pet #heroPet#.  #hero# was never #mood#, for the #heroPet# was always too #mood#."],
	"origin": ["#[hero:#name#][heroPet:#animal#]story#"]
}
```

#### Output of that grammar.
Of course, many grammars are more complex!
```
Lina traveled with her pet duck. Lina was never indignant, for the duck was always too indignant.
Yuuma traveled with her pet unicorn. Yuuma was never wistful, for the unicorn was always too indignant.
Azra traveled with her pet coyote. Azra was never wistful, for the coyote was always too impassioned.
Yuuma traveled with her pet owl. Yuuma was never wistful, for the owl was always too courteous.
Azra traveled with her pet zebra. Azra was never impassioned, for the zebra was always too astute.
```

### How to use Tracery as a broswer library

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

### How to use Tracery as a Node.js library

Use this Node library created by George Buckenham: https://github.com/v21/tracery

## Input

### Syntax overview
####  Grammar
A grammar is a key-value storage system for rules.

####  Rule syntax
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
 `#animal.capitalize#` or `#animal.a#` or `#animal.s#`
```
name: ["Brittany"],
animal: ["wombat"],
story : ["This is a story about #name# the #animal.capitalize#"]
```
