module Modifiers
    def self.isVowel(c)
        return ['a', 'e', 'i', 'o', 'u'].member?(c.downcase)
    end

    def self.pluralize(s)
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
    end
    
    def self.baseEngModifiers
        {
            "replace" => lambda do |s, params|
                return s.gsub(/#{Regexp.quote(params[0])}/, params[1])
            end,

            "capitalizeAll" => lambda do |s|
                return s.gsub(/\w+/) {|word| word.capitalize}
            end,
            
            "capitalize" => lambda do |s|
                return s.capitalize
            end,
            
            "a" => lambda do |s|
                if(s.length > 0) then
                    if(s =~ /^u((\wi)|(\W))/) then
                        #catches "university" and "u-boat"
                        return "a #{s}"
                    end
                    
                    if(isVowel(s[0])) then
                        return "an #{s}"
                    end
                end
                
                return "a #{s}"
            end,

            "firstS" => lambda do |s|
                words = s.split(" ")
                if(words.length > 0) then
                    words[0] = pluralize words[0]
                end
                return words.join " "
            end,
            
            "s" => lambda do |s|
                return pluralize(s)
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