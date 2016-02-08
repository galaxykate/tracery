require 'json'


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
    def createSection(start, finish, type, results, lastEscapedChar, escapedSubstring, rule, errors)
        if(finish - start < 1) then
            if(type == 1) then
                errors << "#{start}: empty tag"
            else
                if(type == 2) then
                    errors << "#{start}: empty action"
                end
            end
        end
        rawSubstring = ""
        if(!lastEscapedChar.nil?) then
            rawSubstring = escapedSubstring + "\\" + rule[(lastEscapedChar+1)..-1]
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
        
        errors = []
        start = 0
        
        escapedSubstring = ""
        lastEscapedChar = nil

        if(rule.nil?) then
            sections = {errors: errors, sections: []}
            return sections
        end
        
        rule.each_char.with_index do |c, i|
            if(!escaped) then
                case(c)
                    when '[' then
                        # Enter a deeper bracketed section
                        if(depth == 0 && !inTag) then
                            if(start < i) then
                                createSection(start, i, 0, results, lastEscapedChar, escapedSubstring, rule, errors)
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
                            createSection(start, i, 2, results, lastEscapedChar, escapedSubstring, rule, errors)
                            lastEscapedChar = nil
                            escapedSubstring = ""
                            start = i + 1
                        end
                    when '#' then
                        # Hashtag
                        #   ignore if not at depth 0, that means we are in a bracket
                        if(depth == 0) then
                            if(inTag) then
                                createSection(start, i, 1, results, lastEscapedChar, escapedSubstring, rule, errors)
                                lastEscapedChar = nil
                                escapedSubstring = ""
                                start = i + 1
                            else
                                if(start < i) then
                                    createSection(start, i, 0, results, lastEscapedChar, escapedSubstring, rule, errors)
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
            createSection(start, rule.length, 0, results, lastEscapedChar, escapedSubstring, rule, errors)
            lastEscapedChar = nil
            escapedSubstring = ""
        end
        
        errors.push("Unclosed tag") if inTag
        errors.push("Too many [") if depth > 0
        errors.push("Too many ]") if depth < 0

        # Strip out empty plaintext sections
        results[:sections].select! {|section| 
            if(section[:type] == 0 && section[:raw].empty?) then
                false
            else
                true
            end
        }
        results[:errors] = errors;
        return results
    end
end

class TraceryNode
    attr_accessor :grammar, :depth, :finishedText, :children, :errors
    
    include Tracery

    def initialize(parent, childIndex, settings)
        @errors = []

        if(settings[:raw].nil?) then
            @errors << "Empty input for node"
            settings[:raw] = ""
        end
        
        # If the root node of an expansion, it will have the grammar passed as the 'parent'
        # set the grammar from the 'parent', and set all other values for a root node
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
            parsed = parse(childRule)
            sections = parsed[:sections]

            @errors.concat(parsed[:errors])

            sections.each_with_index do |section, i|
                child = TraceryNode.new(self, i, section)
                if(!preventRecursion)
                    child.expand(preventRecursion)
                end
                @finishedText += child.finishedText
                @children << child
            end
        else
            # In normal operation, this shouldn't ever happen
            @errors << "No child rule provided, can't expand children"
            puts "No child rule provided, can't expand children"
        end
    end
    
    # Expand this rule (possibly creating children)
    def expand(preventRecursion = false)
        if(@isExpanded) then
            puts "Already expanded #{self}"
            return
        end
        
        @isExpanded = true
        #this is no longer used
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
                @preactions = []
                @postactions = []
                parsed = parseTag(@raw)
                @symbol = parsed[:symbol]
                @modifiers = parsed[:modifiers]

                # Create all the preactions from the raw syntax
                @preactions = parsed[:preactions].map{|preaction|
                    NodeAction.new(self, preaction.raw)
                }

                # @postactions = parsed[:preactions].map{|postaction|
                #     NodeAction.new(self, postaction.raw)
                # }
                
                # Make undo actions for all preactions (pops for each push)
                @postactions = @preactions.
                                select{|preaction| preaction.type == 0 }.
                                map{|preaction| preaction.createUndo() }
                
                @preactions.each { |preaction| preaction.activate }
                
                @finishedText = @raw

                # Expand (passing the node, this allows tracking of recursion depth)
                selectedRule = @grammar.selectRule(@symbol, self, @errors)

                expandChildren(selectedRule, preventRecursion)
                
                # Apply modifiers
                # TODO: Update parse function to not trigger on hashtags within parenthesis within tags,
                # so that modifier parameters can contain tags "#story.replace(#protagonist#, #newCharacter#)#"
                @modifiers.each{|modName|
                    modParams = [];
                    if (modName.include?("(")) then
                        #match something like `modifier(param, param)`, capture name and params separately
                        match = /([^\(]+)\(([^)]+)\)/.match(modName)
                        if(!match.nil?) then
                            modParams = match.captures[1].split(",")
                            modName = match.captures[0]
                        end
                    end

                    mod = @grammar.modifiers[modName]

                    # Missing modifier?
                    if(mod.nil?)
                        @errors << "Missing modifier #{modName}"
                        @finishedText += "((.#{modifier}))"
                    else
                        @finishedText = mod.call(@finishedText, modParams)
                    end
                }
                # perform post-actions
                @postactions.each{|postaction| postaction.activate()}
            when 2 then
                # Just a bare action? Expand it!
                @action = NodeAction.new(self, @raw)
                @action.activate()
                
                # No visible text for an action
                # TODO: some visible text for if there is a failure to perform the action?
                @finishedText = ""
        end
    end

    def clearEscapeCharacters
        @finishedText = @finishedText.gsub(/\\\\/, "DOUBLEBACKSLASH").gsub(/\\/, "").gsub(/DOUBLEBACKSLASH/, "\\")
    end
end

# Types of actions:
# 0 Push: [key:rule]
# 1 Pop: [key:POP]
# 2 function: [functionName(param0,param1)] (TODO!)
class NodeAction
    attr_accessor :node, :target, :type, :ruleNode
    def initialize(node, raw)
        # puts("No node for NodeAction") if(node.nil?)
        # puts("No raw commands for NodeAction") if(raw.empty?)
        
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
                # split into sections (the way to denote an array of rules)
                ruleSections = @rule.split(",")
                finishedRules = ruleSections.map{|ruleSection|
                    n = TraceryNode.new(grammar, 0, {
                            type: -1,
                            raw: ruleSection
                        })
                    n.expand()
                    n.finishedText
                }
                
                # TODO: escape commas properly
                grammar.pushRules(@target, finishedRules, self)
                puts("Push rules: #{@target} #{@ruleText}")
            when 1 then
                grammar.popRules(@target);
            when 2 then
                grammar.flatten(@target, true);
        end
    end

    def createUndo
        if(@type == 0) then
            return NodeAction.new(@node, "#{@target}:POP")
        end
        # TODO Not sure how to make Undo actions for functions or POPs
        return nil
    end

    def toText
        case(@type)
            when 0 then
                return "#{@target}:#{@rule}"
            when 1 then
                return "#{@target}:POP"
            when 2 then
                return "((some function))"
            else
                return "((Unknown Action))"
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
    
    def selectRule
        # puts "Get rule #{@raw}"
        
        #TODO_ : RuleSet.getRule @ conditionalRule
        #TODO_ : RuleSet.getRule @ ranking
        
        if(!@defaultRules.nil?) then
            index = 0
            # Select from this basic array of rules
            # Get the distribution from the grammar if there is no other
            distribution = @distribution || @grammar.distribution
            case(distribution)
                when "shuffle" then
                    #create a shuffled deck
                    if(@shuffledDeck.nil? || @shuffledDeck.empty?)
                        #TODO_ - use fyshuffle and falloff
                        @shuffledDeck = (0...@defaultRules.size).to_a.shuffle
                    end
                    index = @shuffledDeck.pop
                when "weighted" then
                    @errors << "Weighted distribution not yet implemented"
                when "falloff" then
                    @errors << "Falloff distribution not yet implemented"
                else
                    index = ((@random.rand ** @falloff) * @defaultRules.size).floor
            end
        
            @defaultUses[index] = (@defaultUses[index] || 0) + 1
            return @defaultRules[index]
        end

        @errors << "No default rules defined for #{self}"
        return nil
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
    
    def selectRule(node, errors)
        @uses.push({ node: node })
        if(@stack.empty?) then
            errors << "The rule stack for '#{@key}' is empty, too many pops?"
            return "((#{@key}))"
        end
        return @stack.last.selectRule
    end

    def getActiveRules
        return nil if @stack.empty?
        return @stack.last.selectRule 
    end

    def rulesToJSON
        return @rawRules.to_json
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
    
    def expand(rule, allowEscapeChars)
        createRoot(rule)
        @root.expand
        @root.clearEscapeCharacters if(!allowEscapeChars)
        return @root
    end
    
    def flatten(rule, allowEscapeChars)
        return expand(rule, allowEscapeChars).finishedText
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
        errors << "No symbol for key #{key}" if(@symbols[key].nil?)
        @symbols[key].popRules
    end
    
    def selectRule(key, node, errors)
        if(@symbols.has_key? key) then
            return @symbols[key].selectRule(node, errors)
        end
        
        # Failover to alternative subgrammars
        @subgrammars.each do |subgrammar|
            if(subgrammar.symbols.has_key? key) then
                return subgrammar.symbols[key].selectRule
            end
        end
        
        # No symbol?
        errors << "No symbol for '#{key}'"
        return "((#{key}))"
    end

    def toJSON
        symbols = @symbols.each.collect{|symkey, symval| "\"#{symkey}\": #{symval.rulesToJSON}"}
        return "{\n#{symbols.join("\n")}\n}"
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
        puts testGrammar.flatten("#story#", true)
        
        grammar = createGrammar({"origin" => "foo"});
        grammar.addModifiers(Modifiers.baseEngModifiers);
        puts grammar.flatten("#origin#", true)
    end
end

if($PROGRAM_NAME == __FILE__) then
    tests = TraceryTests.new
    tests.test
end