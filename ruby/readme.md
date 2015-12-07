# Tracery for Ruby

## Basic usage

Please refer to the Tracery readme for information about how to build grammars.

Using the ruby port is very similar to the Javascript version:
```ruby
require './tracery'
require './mods-eng-basic'
include Tracery
grammar = createGrammar({"origin" => "foo"});
grammar.addModifiers(Modifiers.baseEngModifiers);
puts grammar.flatten("#origin#")
```

## Known issues

* Currently does not support rulesets with conditionals, distributions, or ranked fallbacks
* No current plan to support visualizations
* Lacks robust test suite (similar to the js demo website)
* Needs to be manually tested to ensure all features are working
* Not yet compatible with `:symbolic` hash inputs
* Ruby gem
* ~See if it works with JSON input grammars~ works fine with JSON