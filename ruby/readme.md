# Tracery for Ruby

[![Gem Version](https://badge.fury.io/rb/tracery.svg)](https://badge.fury.io/rb/tracery)

## Basic usage

Please refer to the Tracery readme for information about how to build grammars.

Using the ruby port is very similar to the Javascript version. First, install the tracery gem: `gem install tracery`.

```ruby
require 'tracery'
require 'mods-eng-basic'
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

* Create new modifiers based on Rails inflection library 