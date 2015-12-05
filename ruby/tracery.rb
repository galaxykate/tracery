module Tracery
	# Parses a plaintext rule in the tracery syntax
	def createGrammar(raw)
		return Grammar.new(raw)
	end
	
	def parseTag(tagContents)
		parsed = {
				symbol: nil,
				preactions: [],
				postactions: [],
				modifiers: []
			}
		
		sections = parse(tagContents)[:sections]
		symbolSection = nil;
		sections.each do |section|
			if(section[:type] == 0) then
				if(symbolSection.nil?) then
					symbolSection = section[:raw]
				else
					raise "multiple main sections in #{tagContents}"
				end
			else
				parsed.preactions.push(section)
			end
		end
		
		raise "no main section in #{tagContents}" if(symbolSection.nil?)
		
		components = symbolSection.split(".");
		parsed[:symbol] = components.first
		parsed[:modifiers] = components.drop(1)
		
		return parsed
	end
	
	#TODO_: needs heavy refactoring -- no nesting in ruby (ie. move entire parser to another class w/ shared state)
	def createSection(start, finish, type, results, lastEscapedChar, escapedSubstring, rule)
		if(finish - start < 1) then
			results[:errors].push("#{start}: 0-length section of type #{type}");
		end
		rawSubstring = ""
		if(!lastEscapedChar.nil?) then
			rawSubstring = escapedSubstring + rule[(lastEscapedChar+1)..-1]
		else
			rawSubstring = rule[start...finish]
		end
		
		results[:sections].push({
				type: type,
				raw: rawSubstring
			})
	end
	
	def parse(rule)
		depth = 0
		inTag = false
		results = {errors: [], sections: []}
		escaped = false
		
		start = 0
		
		escapedSubstring = ""
		lastEscapedChar = nil
		
		rule.each_char.with_index do |c, i|
			if(!escaped) then
				case(c)
					when '[' then
						# Enter a deeper bracketed section
						if(depth == 0 && !inTag) then
							if(start < i) then
								createSection(start, i, 0, results, lastEscapedChar, escapedSubstring, rule)
								lastEscapedChar = nil
								escapedSubstring = ""
							end
							start = i + 1
						end
						depth += 1
					when ']' then
						depth -= 1
						# End a bracketed section
						if(depth == 0 && !inTag) then
							createSection(start, i, 2, results, lastEscapedChar, escapedSubstring, rule)
							lastEscapedChar = nil
							escapedSubstring = ""
							start = i + 1
						end
					when '#' then
						# Hashtag
						#	ignore if not at depth 0, that means we are in a bracket
						if(depth == 0) then
							if(inTag) then
								createSection(start, i, 1, results, lastEscapedChar, escapedSubstring, rule)
								lastEscapedChar = nil
								escapedSubstring = ""
								start = i + 1
							else
								if(start < i) then
									createSection(start, i, 0, results, lastEscapedChar, escapedSubstring, rule)
									lastEscapedChar = nil
									escapedSubstring = ""
								end
								start = i + 1
							end
							inTag = !inTag
						end
					when '\\' then
						escaped = true;
						escapedSubstring = escapedSubstring + rule[start..i];
						start = i + 1;
						lastEscapedChar = i;
				end
			else
				escaped = false
			end
		end #each character in rule
		
		if(start < rule.length) then
			createSection(start, rule.length, 0, results, lastEscapedChar, escapedSubstring, rule)
			lastEscapedChar = nil
			escapedSubstring = ""
		end
		
		results[:errors].push("Unclosed tag") if inTag
		results[:errors].push("Too many [") if depth > 0
		results[:errors].push("Too many ]") if depth < 0
		
		return results
	end
end

class TraceryNode
	attr_accessor :grammar, :depth, :finishedText, :expansionErrors, :children
	
	include Tracery

	def initialize(parent, childIndex, settings)
		raise "No raw input for node" if(settings[:raw].nil?)
		
		if(parent.is_a? Grammar)
			@grammar = parent
			@parent = nil
			@depth = 0
			@childIndex = 0
		else
			@grammar = parent.grammar
			@parent = parent
			@depth = parent.depth + 1
			@childIndex = childIndex
		end

		@raw = settings[:raw]
		@type = settings[:type]
		@isExpanded = false
		
        puts "No grammar specified for this node #{self}" if (@grammar.nil?)
	end
	
	def to_s
		"Node('#{@raw}' #{@type} d:#{@depth})"
	end
	
	def expandChildren(childRule, preventRecursion)
		@children = []
		@finishedText = ""
		@childRule = childRule
		
		if(!@childRule.nil?)
			sections = parse(childRule)[:sections]
			sections.each_with_index do |section, i|
				child = TraceryNode.new(self, i, section)
				if(!preventRecursion)
					child.expand(preventRecursion)
				end
				@finishedText += child.finishedText
				@children << child
			end
		else
			puts "No child rule provided, can't expand children"
		end
	end
	
	# Expand this rule (possibly creating children)
	def expand(preventRecursion)
		if(@isExpanded) then
			puts "Already expanded #{self}"
			return
		end
		
		@isExpanded = true
		@expansionErrors = []
				
		# Types of nodes
		# -1: raw, needs parsing
		#  0: Plaintext
		#  1: Tag ("#symbol.mod.mod2.mod3#" or "#[pushTarget:pushRule]symbol.mod#")
		#  2: Action ("[pushTarget:pushRule], [pushTarget:POP]", more in the future)
		
		case(@type)
			when -1 then
				#raw rule
				expandChildren(@raw, preventRecursion)
			when 0 then
				#plaintext, do nothing but copy text into finished text
				@finishedText = @raw
			when 1 then
				#tag - Parse to find any actions, and figure out what the symbol is
				@preactions = [] #erroneous?
				parsed = parseTag(@raw)
				@symbol = parsed[:symbol]
				@modifiers = parsed[:modifiers]
				if(parsed[:preactions].size > 0) then
					puts parsed[:preactions]
					@preactions = parsed[:preactions].map{|preaction|
						NodeAction.new(self, preaction.raw)
					}
					
					# Make undo actions for all preactions (pops for each push)
                    # TODO
					
					@preactions.each { |preaction| preaction.activate }
				end
				
				@finishedText = @raw
				# Expand (passing the node, this allows tracking of recursion depth)
				selectedRule = @grammar.selectRule(@symbol, self)
				if(selectedRule.nil?) #validate this is the return -- and not boolean
					@expansionErrors << {log: "Child rule not created"}
				end
				
				expandChildren(selectedRule, preventRecursion)
				
				# Apply modifiers
				@modifiers.each{|modifier| 
					mod = @grammar.modifiers[modifier]
					if(mod.nil?)
						@finishedText += "((.#{modifier}))"
					else
						@finishedText = mod.call(@finishedText)
					end
				}
			when 2 then
				#perform post-actions
				# Just a bare action? Expand it!
				@preActions = [NodeAction.new(self, @raw)]
				@preActions.first.activate()
				
				# No visible text for an action
				# TODO: some visible text for if there is a failure to perform the action?
				@finishedText = ""
		end
	end
end

# Types of actions:
# 0 Push: [key:rule]
# 1 Pop: [key:POP]
# 2 function: [functionName(param0,param1)] (TODO!)
class NodeAction
	attr_accessor :node, :target, :type, :ruleNode
	def initialize(node, raw)
		puts("No node for NodeAction") if(node.nil?)
		puts("No raw commands for NodeAction") if(raw.empty?)
		
		@node = node
		
		sections = raw.split(":")
		@target = sections.first
		if(sections.size == 1) then
			# No colon? A function!
			@type = 2
		else
			# Colon? It's either a push or a pop
			@rule = sections[1]
			if(@rule == "POP")
				@type = 1;
			else
				@type = 0;
			end
		end
	end
	
	def activate
		grammar = @node.grammar
		case(@type)
			when 0 then
				@ruleNode = TraceryNode.new(grammar, 0, {
								type: -1,
								raw: @rule
							})
				@ruleNode.expand(false)
				@ruleText = @ruleNode.finishedText
				
				grammar.pushRules(@target, @ruleText, self)
				puts("Push rules: #{@target} #{@ruleText}")
			when 1 then
			when 2 then
		end
	end
end

# Sets of rules
# (Can also contain conditional or fallback sets of rulesets)
class RuleSet
	def initialize(grammar, raw)
		@raw = raw
		@grammar = grammar
		@falloff = 1
		@random = Random.new
		@distribution = "random"
		
		@distribution = @grammar.distribution if(!@grammar.distribution.nil?)
		
		@defaultUses = {}
		
		if(raw.is_a? Array) then
			@defaultRules = raw
		else
			if(raw.is_a? String) then
				@defaultRules = [raw];
			else
				# TODO: support for conditional and hierarchical rule sets
			end
		end
	end
	
	def getRule
		# puts "Get rule #{@raw}"
		
		#TODO_ : RuleSet.getRule @ conditionalRule
		#TODO_ : RuleSet.getRule @ ranking
		
		return if(@defaultRules.nil?)
		
		index = 0
		# Select from this basic array of rules
		# Get the distribution
		case(@distribution)
			when "shuffle" then
				#create a shuffled deck
				if(@shuffledDeck.nil? || @shuffledDeck.empty?)
					#TODO_ - use fyshuffle and falloff
					@shuffledDeck = (0...@defaultRules.size).to_a.shuffle
				end
				index = @shuffledDeck.pop
			when "weighted" then
			when "falloff" then
			else
				index = ((@random.rand ** @falloff) * @defaultRules.size).floor
		end
		
		@defaultUses[index] = (@defaultUses[index] || 0) + 1
		return @defaultRules[index]
	end
	
	def clearState
		@defaultUses = {}
		#TODO_ should clear shuffled deck too?
	end
end

class TracerySymbol
	attr_accessor :isDynamic
	
	def initialize(grammar, key, rawRules)
		# Symbols can be made with a single value, and array, or array of objects of (conditions/values)
		@key = key
		@grammar = grammar
		@rawRules = rawRules
		
		@baseRules = RuleSet.new(@grammar, @rawRules)
		clearState
	end
	
	def clearState
		# Clear the stack and clear all ruleset usages
		@stack = [@baseRules]
		@uses = []
		@baseRules.clearState
	end
	
	def pushRules(rawRules)
		rules = RuleSet.new(@grammar, rawRules)
		@stack.push rules
	end
	
	def popRules
		@stack.pop
	end
	
	def selectRule(node)
		@uses.push({ node: node })
		raise "No rules for #{@key}" if(@stack.empty?)
		return @stack.last.getRule
	end
end

class Grammar
	attr_accessor :distribution, :root, :modifiers

	def initialize(raw) #, settings
		@modifiers = {}
		loadFromRawObj(raw)
	end
	
	def clearState
		keys.each{|key| key.clearState} # TODO_ check for nil keys 
	end
	
	def addModifiers(mods)
		# copy over the base modifiers
		mods.each{|k,v| @modifiers[k] = v}
	end
	
	def loadFromRawObj(raw)
		@raw = raw
		@symbols = {}
		@subgrammars = []
		return if(@raw.nil?)
		@raw.each{|k,v|
			@symbols[k] = TracerySymbol.new(self, k, v)
		}
	end
	
	def createRoot(rule)
		# Create a node and subnodes
		@root = TraceryNode.new(self, 0, {
					type: -1,
					raw: rule
				})
	end
	
	def expand(rule)
		createRoot(rule)
		@root.expand(false)
		return @root
	end
	
	def flatten(rule)
		return expand(rule).finishedText
	end
	
	def pushRules(key, rawRules, sourceAction)
		# Create or push rules
		if(@symbols[key].nil?) then
			@symbols[key] = TracerySymbol.new(self, key, rawRules)
			@symbols[key].isDynamic = true if(sourceAction)
		else
			@symbols[key].pushRules(rawRules)
		end
	end
	
	def popRules(key)
		raise "No symbol for key #{key}" if(@symbols[key].nil?)
		@symbols[key].popRules
	end
	
	def selectRule(key, node)
		if(@symbols.has_key? key) then
			return @symbols[key].selectRule(node)
		end
		
		# Failover to alternative subgrammars
		@subgrammars.each do |subgrammar|
			if(subgrammar.symbols.has_key? key) then
				return subgrammar.symbols[key].selectRule
			end
		end
		
		return "((#{key}))"
	end
end

class TraceryTests
	include Tracery
	require 'pp'
	
	def test
		tests = {
			basic: ["", "a", "tracery"],
			hashtag: ["#a#", "a#b#", "aaa#b##cccc#dd#eee##f#"],
			hashtagWrong: ["##", "#", "a#a", "#aa#aa###"],
			escape: ["\\#test\\#", "\\[#test#\\]"],
		}
		
		tests.each do |key, testSet|
			puts "For #{key}:"
			testSet.each do |t|
				result = parse(t)
				puts "\tTesting \"#{t}\": #{result}"
			end
		end
		
		testGrammar = createGrammar({
			"animal" => ["capybara", "unicorn", "university", "umbrella", "u-boat", "boa", "ocelot", "zebu", "finch", "fox", "hare", "fly"],
			"color" => ["yellow", "maroon", "indigo", "ivory", "obsidian"],
			"mood" => ["elated", "irritable", "morose", "enthusiastic"],
			"story" => ["[mc:#animal#]Once there was #mc.a#, a very #mood# #mc#. In a pack of #color.ed# #mc.s#!"]
		});
		
		require "./mods-eng-basic"
		testGrammar.addModifiers(Modifiers.baseEngModifiers);
		puts testGrammar.flatten("#story#")
		
		grammar = createGrammar({"origin" => "foo"});
		grammar.addModifiers(Modifiers.baseEngModifiers);
		puts grammar.flatten("#origin#")
	end
end

if($PROGRAM_NAME == __FILE__) then
	tests = TraceryTests.new
	tests.test
end