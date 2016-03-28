/**
 * @author Kate
 */

var verbs = ["accept", "allow", "ask", "believe", "borrow", "break", "bring", "buy", "can”,”be able", "cancel", "change", "clean", "comb", "complain", "cough", "count", "cut", "dance", "draw", "drink", "drive", "eat", "explain", "fall", "fill", "find", "finish", "fit", "fix", "fly", "forget", "give", "go", "have", "hear", "hurt", "know", "learn", "leave", "listen", "live", "look", "lose", "make”,”do", "need", "open", "close", "shut", "organise", "pay", "play", "put", "rain", "read", "reply", "run", "say", "see", "sell", "send", "sign", "sing", "sit", "sleep", "smoke", "speak", "spell", "spend", "stand", "start”,”begin", "study", "succeed", "swim", "take", "talk", "teach", "tell", "think", "translate", "travel", "try", "turn off", "turn on", "type", "understand", "use", "wait", "wake up", "want", "watch", "work", "worry", "write"];

function getRandom(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function randomString(key) {
	var count = Math.floor(Math.random() * Math.random() * Math.random() * 5) + 1;
	var s = "";
	for (var i = 0; i < count; i++) {

		s += String.fromCharCode(97 + (key.charCodeAt(0) - 65));

	}
	return s;
	//return getRandom(verbs);
}

function inQuotes(s) {
	return '"' + s + '"';
}

// Create a grammar that can itself create valid tracery grammars
function makeGrammar() {
	var keys = "ABCDEFGH".split("");

	var ruleGrammar = tracery.createGrammar({
		key : keys,
		modifier : ["capitalize", "s", "ed"],
		plaintext : ["foo", "bar", "zum"],
		tagContents : ["#key#", "#key#.#modifier#"],
		section : ["#plaintext#", "#plaintext#", "#plaintext#", "#tagContents.inTags#"],
		rule : ["#section#", "#section##section#", "#section##section##section#"],
		multiRuleSet : ["#rule.inQuotes#,#rule.inQuotes#,#rule.inQuotes#,#rule.inQuotes#"],
		ruleset : ["#rule.inQuotes#", "#multiRuleSet.inBrackets#", "#multiRuleSet.inBrackets#"],
	});

	ruleGrammar.modifiers.inQuotes = function(s) {
		return '"' + s + '"';
	};
	ruleGrammar.modifiers.inTags = function(s) {
		return '\\#' + s + '\\#';
	};
	ruleGrammar.modifiers.inBrackets = function(s) {
		return '\\[' + s + '\\]';
	};

	var symbols = keys.map(function(key, index) {
		var rules = ruleGrammar.flatten("#ruleset#");
		return inQuotes(key) + ": " + rules;
	});
	var raw = "{" + symbols.join(",\n") + "}";

	var grammar = tracery.createGrammar(JSON.parse(raw));
	grammar.addModifiers(baseEngModifiers);

	console.log(raw);
	for (var i = 0; i < keys.length; i++) {
		var expansions = [];
		for (var j = 0; j < 5; j++) {
			expansions.push(grammar.flatten("#" + keys[i] + "#"));
		}
		console.log("Expand " + keys[i] + ": " + expansions.join(", "));

	}
}


$(document).ready(function() {
	console.log("metagrammar");
	makeGrammar();
});
