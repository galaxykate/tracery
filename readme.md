# tracery
Tracery: a story-grammar generation library for javascript

This is my attempt to package up [Tracery](https://github.com/galaxykate/tracery/) as a Node library.

## Installation

This is hosted at npm, so it can be installed like so:

```bash
$ npm install tracery-grammar --save
```

## Example usage

```javascript
var tracery = require('tracery-grammar');

var grammar = tracery.createGrammar({
  'animal': ['panda','fox','capybara','iguana'],
  'emotion': ['sad','happy','angry','jealous'],
  'origin':['I am #emotion.a# #animal#.'],
});

grammar.addModifiers(tracery.baseEngModifiers); 

console.log(grammar.flatten('#origin#'));
```

Sample output:

```plaintext
I am a happy iguana.
I am an angry fox.
I am a sad capybara.
```
