/**
 * @author Kate
 */

function isVowel(c) {
    var c2 = c.toLowerCase();
    return (c2 === 'a') || (c2 === 'e') || (c2 === 'i') || (c2 === 'o') || (c2 === 'u');
};

function isAlphaNum(c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
};

var baseEngModifiers = {

    varyTune : function(s) {
        var s2 = "";
        var d = Math.ceil(Math.random() * 5);
        for (var i = 0; i < s.length; i++) {
            var c = s.charCodeAt(i) - 97;
            if (c >= 0 && c < 26) {
                var v2 = (c + d) % 13 + 97;
                s2 += String.fromCharCode(v2);
            } else {
                s2 += String.fromCharCode(c + 97);
            }

        }
        return s2;
    },

    capitalizeAll : function(s) {
        var s2 = "";
        var capNext = true;
        for (var i = 0; i < s.length; i++) {

            if (!isAlphaNum(s.charAt(i))) {
                capNext = true;
                s2 += s.charAt(i);
            } else {
                if (!capNext) {
                    s2 += s.charAt(i);
                } else {
                    s2 += s.charAt(i).toUpperCase();
                    capNext = false;
                }

            }
        }
        return s2;
    },

    capitalize : function(s) {
        return s.charAt(0).toUpperCase() + s.substring(1);
    },

    a : function(s) {
        if (s.length > 0) {
            if (s.charAt(0).toLowerCase() === 'u') {
                if (s.length > 2) {
                    if (s.charAt(2).toLowerCase() === 'i')
                        return "a " + s;
                }
            }

            if (isVowel(s.charAt(0))) {
                return "an " + s;
            }
        }

        return "a " + s;

    },

    firstS : function(s) {
        console.log(s);
        var s2 = s.split(" ");
  
        var finished =  baseEngModifiers.s(s2[0]) + " " + s2.slice(1).join(" ");
        console.log(finished);
        return finished;
    },

    s : function(s) {
        switch (s.charAt(s.length -1)) {
        case 's':
            return s + "es";
            break;
        case 'h':
            return s + "es";
            break;
        case 'x':
            return s + "es";
            break;
        case 'y':
            if (!isVowel(s.charAt(s.length - 2)))
                return s.substring(0, s.length - 1) + "ies";
            else
                return s + "s";
            break;
        default:
            return s + "s";
        }
    },
    ed : function(s) {
        switch (s.charAt(s.length -1)) {
        case 's':
            return s + "ed";
            break;
        case 'e':
            return s + "d";
            break;
        case 'h':
            return s + "ed";
            break;
        case 'x':
            return s + "ed";
            break;
        case 'y':
            if (!isVowel(s.charAt(s.length - 2)))
                return s.substring(0, s.length - 1) + "ied";
            else
                return s + "d";
            break;
        default:
            return s + "ed";
        }
    }
};

