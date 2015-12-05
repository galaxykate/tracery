

module Modifiers
	def self.isVowel(c)
		return ['a', 'e', 'i', 'o', 'u'].member?(c.downcase)
	end
	
	def self.baseEngModifiers
		{
			"varyTune" => lambda do |s|
				r = Random.new
				d = (r.rand * 5).ceil
				s2 = s.each_char.collect do |chr|
					c = chr.ord - 97
					v2 = 0
					if(c >= 0 && c < 26) then
						v2 = (c + d) % 13 + 97
					else
						v2 = c + 97
					end
					
					v2.chr
				end
				return s2.join
			end,
			
			"capitalizeAll" => lambda do |s|
				return s.gsub(/\w+/) {|word| word.capitalize}
			end,
			
			"capitalize" => lambda do |s|
				return s.capitalize
			end,
			
			"a" => lambda do |s|
				if(s.length > 0) then
					if(s =~ /^u(?:\wi)|(?:\W)/) then
						#catches "university" and "u-boat"
						return "a #{s}"
					end
					
					if(isVowel(s[0])) then
						return "an #{s}"
					end
				end
				
				return "a #{s}"
			end,
			
			"s" => lambda do |s|
				case(s[-1])
					when 's' then
						return s + "es"
					when 'h' then
						return s + "es"
					when 'x' then
						return s + "es"
					when 'y' then
						if(!isVowel(s[-2])) then
							return s[0...-1] + "ies"
						else
							return s + "s"
						end
					else
						return s + "s"
				end
			end,
			
			"ed" => lambda do |s|
				case(s[-1])
					when 's' then
						return s + "ed"
					when 'e' then
						return s + "d"
					when 'h' then
						return s + "ed"
					when 'x' then
						return s + "ed"
					when 'y' then
						if(!isVowel(s[-2])) then
							return s[0...-1] + "ied"
						else
							return s + "d"
						end
					else
						return s + "ed"
				end
			end
		}
	end
end