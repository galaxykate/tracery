# Tracery

## About
Tracery was developed by Kate Compton, beginning March 2013 as a class assignment.
This is version 0.7
(This is the first numbered version of Tracery, chosen arbitrarily. All basic syntax is stable, but some advanced features like nested rules, if-statements, and modifiers with parameters are still in flux)


## Basic usage

### Create a grammar

Create an empty grammar:

    grammar = tracery.createGrammar();

Create a grammar from a Tracery-formatted object:
	
    grammar = tracery.createGrammar({origin:"foo"});

Add modifiers to the grammar (import "mods-eng-basic.js" for basic English modifiers, or write your own)

    grammar.addModifiers(baseEngModifiers);
    
### Expand rules 
Get the fully-expanded string from a rule

    grammar.flatten("#origin#");

Get the fully-expanded node from a rule, this will return a root node containing a full expanded tree with many potentially interesting properties, including "finishedText" for each node.

    grammar.expand("#origin#");
    
Get the root node from a rule *not* fully expanded (this allows for animating the expansion of the tree) TODO, this is still buggy and does not correctly set the "finishedText"

    grammar.expand("#origin#", true);
    
    // animate the expansion over time
    var stepTimer = setInterval(function() {
                   app.stepIterator.node.expand(true);
                   var action = app.stepIterator.next();
                   if (!action)
                        clearInterval(stepTimer);
                   refreshVisualization();
                   refreshGrammarOutput();
                }, 40);
    
## Library Concepts
### Grammar

A Grammar is

* *a dictionary of symbols*: a key-value object matching keys (the names of symbols) to expansion rules
* optional metadata such as a title, edit data, and author
* optional connectivity graphs describing how symbols call each other

*clearState*: symbols and rulesets have state (the stack, and possible ruleset state recording recently called rules).  This function clears any state, returning the dictionary to its original state;

Grammars are usually created by feeding in a raw JSON grammar, which is then parsed into symbols and rules.  You can also build your own Grammar objects from scratch, without using this utility function, and can always edit the grammar after creating it.

### Symbol
A symbol is a **key** (usually a short human-readable string) and a set of expansion rules
* the key
* rulesetStack: the stack of expansion **rulesets** for this symbol.  This stack records the previous, inactive rulesets, and the current one.
* optional connectivity data, such as average depth and average expansion length

Putting a **key** in hashtags, in a Tracery syntax object, will create a expansion node for that symbol within the text.

Each top-level key-value pair in the raw JSON object creates a **symbol**.  The symbol's *key* is set from the key, and the *value* determines the **ruleset**.

### Modifier
A function that takes a string (and optionally parameters) and returns a string.  A set of these is included in mods-eng-basic.js.  Modifiers are applied, in order, after a tag is fully expanded.

To apply a modifier, add its name after a period, after the tag's main symbol:
	#animal.capitalize#
	#booktitle.capitalizeAll#
	Hundreds of #animal.s#

Modifiers can have parameters, too! (soon they will can have parameter that contain tags, which will be expanded when applying the modifier, but not yet)
	#story.replace(he,she).replace(him,her).replace(his,hers)#

### Action
An action that occurs when its node is expanded.  Built-in actions are 
* Generating some rules "[key:#rule#]" and pushing them to the "key" symbol's rule stack.  If that symbol does not exist, it creates it.
* Popping rules off of a rule stack, "[key:POP]"
* Other functions

TODO: figure out syntax and implementation for generating *arrays* of rules, or other complex rulesets to push onto symbols' rulestacks

TODO: figure out syntax and storage for calling other functions, especially for async APIs.

### Ruleset
A ruleset is an object that defines a *getRule* function.  Calling this function may change the internal state of the ruleset, such as annotating which rules were most recently returned, or drawing and removing a rule from a shuffled list of available rules.

#### Basic ruleset
A basic ruleset is just an array of options.

They can be created by raw JSON by having an *array* or a *string* as the value, like this:
"someKey":["rule0", "rule1", "some#complicated#rule"]
If there is only one rule, it is acceptable short hand to leave off the array, but this only works with Strings.
"someKey":"just one rule"

These use the default distribution of the Grammar that owns them, which itself defaults to regular stateless pseudo-randomness.

#### Rulesets with conditions, distributions, or ranked fallbacks
### **this feature is under development, coming soon
These rulesets are created when the raw JSON has an *object* rather than an *array* as the value.

Some attributes of this object can be:

* baseRules: a single ruleset,
* ruleRanking: an array of rulesets, call *getRule* on each in order until one returns a value, if none do, return *baseRules*.*getRule*,
* distribution: a new distribution to override the default)
* conditionRule: a rule to expand
* conditionValue: a value to match the expansion against
* conditionSuccess: a ruleset to use if expanding *conditionRule* returns *conditionValue*, otherwise use *baseRules*  These can be nested, so it is possible to make a ruleset 