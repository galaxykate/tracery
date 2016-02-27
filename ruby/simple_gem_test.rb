#a simple test grammar to see that the gem is working correctly

require 'tracery'
require 'mods-eng-basic'

include Tracery

grammar = createGrammar({"origin" => "just a simple grammar to test it out! If you're seeing this, it worked."})
grammar.addModifiers(Modifiers.baseEngModifiers);
result = grammar.flatten("#origin.capitalize#")
puts result