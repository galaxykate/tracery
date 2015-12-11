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
* Not yet compatible with `:symbolic` hash inputs

## TODO

* Manually test to ensure all features are working
* Robust test suite (similar to the js demo website)
* Ruby gem (versioning, etc.)
* Create new modifiers based on Rails inflection library 