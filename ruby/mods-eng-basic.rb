

module Modifiers
	def self.isVowel(c)
		return ['a', 'e', 'i', 'o', 'u'].member?(c.downcase)
	end
	
	def self.isAlphaNum(c)
		return ('A'..'z').member?(c) || ('0'..'9').member?(c)
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
			end
		}
	end
end

    # s : function(s) {
        # switch (s.charAt(s.length -1)) {
        # case 's':
            # return s + "es";
            # break;
        # case 'h':
            # return s + "es";
            # break;
        # case 'x':
            # return s + "es";
            # break;
        # case 'y':
            # if (!isVowel(s.charAt(s.length - 2)))
                # return s.substring(0, s.length - 1) + "ies";
            # else
                # return s + "s";
            # break;
        # default:
            # return s + "s";
        # }
    # },
    # ed : function(s) {
        # switch (s.charAt(s.length -1)) {
        # case 's':
            # return s + "ed";
            # break;
        # case 'e':
            # return s + "d";
            # break;
        # case 'h':
            # return s + "ed";
            # break;
        # case 'x':
            # return s + "ed";
            # break;
        # case 'y':
            # if (!isVowel(s.charAt(s.length - 2)))
                # return s.substring(0, s.length - 1) + "ied";
            # else
                # return s + "d";
            # break;
        # default:
            # return s + "ed";
        # }
    # }
# };