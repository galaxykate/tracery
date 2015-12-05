# Tracery for Ruby

## Basic usage

Please refer to the Tracery readme for information about how to build grammars.

Using the ruby port is very similar to the Javascript version:
    require 'tracery'
	include Tracery
    grammar = createGrammar({"origin" => "foo"});
	grammar.addModifiers(Modifiers.baseEngModifiers);
	puts grammar.flatten("#origin#")

## Known issues

* Currently does not support rulesets with conditionals, distributions, or ranked fallbacks
* No current plan to support visualizations
* Lacks robust test suite (similar to the js demo website)