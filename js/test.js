/**
 * @author Kate
 * Test cases
 */

function runTests() {
	console.log("Run tests");
	// Test all test cases
	var grammar = tracery.createGrammar({

		deepHash : ["\\#00FF00", "\\#FF00FF"],
		deeperHash : ["#deepHash#"],
		animal : ["bear", "cat", "dog", "fox", "giraffe", "hippopotamus"],
		mood : ["quiet", "morose", "gleeful", "happy", "bemused", "clever", "jovial", "vexatious", "curious", "anxious", "obtuse", "serene", "demure"],

		nonrecursiveStory : ["The #pet# went to the beach."],
		//  story : ["#recursiveStory#", "#recursiveStory#", "#nonrecursiveStory#"],
		recursiveStory : ["The #pet# opened a book about[pet:#mood# #animal#] #pet.a#. #story#[pet:POP] The #pet# closed the book."],

		svgColor : ["rgb(120,180,120)", "rgb(240,140,40)", "rgb(150,45,55)", "rgb(150,145,125)", "rgb(220,215,195)", "rgb(120,250,190)"],
		svgStyle : ['style="fill:#svgColor#;stroke-width:3;stroke:#svgColor#"'],

		"name" : ["Cheri", "Fox", "Morgana", "Jedoo", "Brick", "Shadow", "Krox", "Urga", "Zelph"],
		"story" : ["#hero.capitalize# was a great #occupation#, and this song tells of #heroTheir# adventure. #hero.capitalize# #didStuff#, then #heroThey# #didStuff#, then #heroThey# went home to read a book."],
		"monster" : ["dragon", "ogre", "witch", "wizard", "goblin", "golem", "giant", "sphinx", "warlord"],
		"setPronouns" : ["[heroThey:they][heroThem:them][heroTheir:their][heroTheirs:theirs]", "[heroThey:she][heroThem:her][heroTheir:her][heroTheirs:hers]", "[heroThey:he][heroThem:him][heroTheir:his][heroTheirs:his]"],
		"setOccupation" : ["[occupation:baker][didStuff:baked bread,decorated cupcakes,folded dough,made croissants,iced a cake]", "[occupation:warrior][didStuff:fought #monster.a#,saved a village from #monster.a#,battled #monster.a#,defeated #monster.a#]"],
		"origin" : ["#[#setPronouns#][#setOccupation#][hero:#name#]story#"]

	});

	grammar.addModifiers(baseEngModifiers);

	// Use fixed number instead of random.
	// Math.seedrandom(Math.random());
	tracery.setRng(function() { return 0; });

	// Create all the test cases
	var tests = {

		plaintextShort : {
			src : "a",
		},
		plaintextLong : {
			src : "Emma Woodhouse, handsome, clever, and rich, with a comfortable home and happy disposition, seemed to unite some of the best blessings of existence; and had lived nearly twenty-one years in the world with very little to distress or vex her.",
		},

		// Escape chars
		escapeCharacter : {
			src : "\\#escape hash\\# and escape slash\\\\"
		},

		escapeDeep : {
			src : "#deepHash# [myColor:#deeperHash#] #myColor#",
		},

		escapeQuotes : {
			src : "\"test\" and \'test\'"
		},
		escapeBrackets : {
			src : "\\[\\]"
		},
		escapeHash : {
			src : "\\#"
		},
		unescapeCharSlash : {
			src : "\\\\"
		},
		escapeMelange1 : {
			src : "An action can have inner tags: \[key:\#rule\#\]"
		},
		escapeMelange2 : {
			src : "A tag can have inner actions: \"\\#\\[myName:\\#name\\#\\]story\\[myName:POP\\]\\#\""
		},

		// Web-specifics
		emoji : {
			src : "💻🐋🌙🏄🍻"
		},

		unicode : {
			src : "&\\#x2665; &\\#x2614; &\\#9749; &\\#x2665;"
		},

		svg : {
			src : '<svg width="100" height="70"><rect x="0" y="0" width="100" height="100" #svgStyle#/> <rect x="20" y="10" width="40" height="30" #svgStyle#/></svg>'
		},

		// Push
		pushBasic : {
			src : "[pet:#animal#]You have a #pet#. Your #pet# is #mood#."
		},

		pushPop : {
			src : "[pet:#animal#]You have a #pet#. [pet:#animal#]Pet:#pet# [pet:POP]Pet:#pet#"
		},

		tagAction : {
			src : "#[pet:#animal#]nonrecursiveStory# post:#pet#"
		},

		testComplexGrammar : {
			src : "#origin#"
		},

		missingModifier : {
			src : "#animal.foo#"
		},

		modifierWithParams : {
			src : "[pet:#animal#]#nonrecursiveStory# -> #nonrecursiveStory.replace(beach,mall)#"
		},

		recursivePush : {
			src : "[pet:#animal#]#recursiveStory#"
		},

		// Errors

		unmatchedHash : {
			src : "#unmatched"
		},
		missingSymbol : {
			src : "#unicorns#"
		},
		missingRightBracket : {
			src : "[pet:unicorn"
		},
		missingLeftBracket : {
			src : "pet:unicorn]"
		},
		justALotOfBrackets : {
			src : "[][]][][][[[]]][[]]]]"
		},
		bracketTagMelange : {
			src : "[][#]][][##][[[##]]][#[]]]]"
		},

	};

	var testNames = Object.keys(tests);
	// Run and report
	for (var i = 0; i < testNames.length; i++) {
		grammar.clearState();
		console.log("Run test " + testNames[i]);
		var test = tests[testNames[i]];
		var root = grammar.expand(test.src);
		console.log(root);
		test.resultRoot = root;
		test.resultGen = root.finishedText;

	}

	var testTable = $("#test-table");

	// Display results to the DOM
	for (var i = 0; i < testNames.length; i++) {
		var test = tests[testNames[i]];
		var data = $("<tr/>").appendTo(testTable);
		$("<td/>", {
			html : testNames[i]
		}).appendTo(data);
		$("<td/>", {
			text : test.src
		}).appendTo(data);

		var expansionCell = $("<td/>", {
			class : "tracery-expansion-root"
		}).appendTo(data);
		rootToDiv(test.resultRoot, expansionCell);

		$("<td/>", {
			html : test.resultGen
		}).appendTo(data);
	}
}

function rootToDiv(root, holder) {
	var div = $("<div/>", {
		"class" : "tracery-exp"
	}).appendTo(holder).mouseenter(function() {
		//	console.log(root);
	});

	if (root.type >= 0) {
		div.addClass("tracery-exp-type" + root.type);
	}
	var header = $("<div/>", {
		text : root.finishedText,
		"class" : "tracery-exp-header"
	}).appendTo(div);

	if (root.errors.length > 0) {
		var errors = $("<div/>", {
			html : root.errors.map(function(err) {
				return "<div class='tracery-exp-error'>" + err + "</div>\n";
			}),
			"class" : "tracery-exp-errors"
		}).appendTo(div);
	}

	switch(root.type) {
	// plaintext
	case 0:
		break;

	// Tags
	case 1:
		var txt = "<span class='tracery-exp-symbol'>" + root.symbol + "</span>:<span class='tracery-exp-childrule'>" + root.childRule + "</span>";
		header.html(txt);

		break;

	// Actions
	case 2:

		console.log(root.action);
		var txt = root.action.toText();
		header.html(txt);
		switch(root.action.type) {
		// Push
		case 0:
			div.addClass("tracery-exp-push");
			break;
		//Pop

		case 1:
			div.addClass("tracery-exp-pop");
			break;
		}
	}

	if (root.children && root.children.length) {
		var contents = $("<div/>", {
			"class" : "tracery-exp-contents"
		}).appendTo(div);
		for (var i = 0; i < root.children.length; i++) {
			rootToDiv(root.children[i], contents);
		}
	}

}

runTests();
