/**
 * @author Kate
 */

tracery.Grammar.prototype.calculateDepth = function(originWord) {
    // Iterate through the grammar and tag each symbol with the depth it's visited at
    var keys = Object.keys(this.symbols);
    var symbols = this.symbols;
    $.each(keys, function(index, key) {
       
        var symbol = symbols[key];
        symbol.stats = {
            visits : [],
            leafPct : 0,
        };

        // Flag if a leaf symbol
        var rules = symbol.getActiveRules();
     //   console.log(rules);

    });
};

tracery.Grammar.prototype.distributionVisualization = function(holder, settings) {
    // Create the visualization of usages
    // For each symbol in the grammar, count how many times it was used
    holder.html("");
    var keys = Object.keys(this.symbols);
    var unused = [];
    var symbols = this.symbols;
    $.each(keys, function(index, key) {
        var s = symbols[key];
        if (s.uses.length > 0) {
            // Analyze use data
            var totalDepth = 0;
            for (var i = 0; i < s.uses.length; i++) {
                totalDepth += s.uses[i].node.depth;
            }
            totalDepth /= s.uses.length;

            var div = $("<div/>", {
                class : "tracery-usage-graph",
            }).appendTo(holder);

            var label = $("<div/>", {
                class : "label",
                text : key + ": " + s.uses.length + " d:" + totalDepth.toFixed(1)
            }).appendTo(div);

            var graph = $("<div/>", {
                class : "bars",
            }).appendTo(div);

            /*
             $.each(s.uses, function(index, use) {
             var use = $("<div/>", {
             class : "use",
             html : use.node.raw + " " + use.node.depth,
             }).appendTo(graph);
             });
             */

            if (s.baseRules.defaultRules) {
                var count = s.baseRules.defaultRules.length;
                var max = 0;
                $.each(s.baseRules.defaultRules, function(index, rule) {
                    if (s.baseRules.defaultUses[index])
                        max = Math.max(s.baseRules.defaultUses[index], max);
                });
                $.each(s.baseRules.defaultRules, function(index, rule) {

                    var useCount = 0;
                    var h = 1;
                    if (s.baseRules.defaultUses[index]) {
                        h = s.baseRules.defaultUses[index] / max * 100;
                        useCount = s.baseRules.defaultUses[index];
                    }
                    var bar = $("<div/>", {
                        class : "bar",
                    }).appendTo(graph).css({
                        width : h + "%",
                        top : ((index / count) * 100) + "%",
                        height : ((1 / count) * 100) + "%",

                    });

                    var label = $("<div/>", {
                        class : "bar-label",
                        text : useCount + " " + rule ,
                    }).appendTo(bar);

                });
            }
        } else {
            unused.push(s);
        }
        // console.log(unused);
    });

};

tracery.Grammar.prototype.cascadeVisualization = function(holder, settings) {
    var symbols = $("<div/>", {
        class : "grammar-viz",
    }).appendTo(holder);

    for (var key in this.symbols) {
        var symbol = this.symbols[key];

        var symbolDiv = $("<div/>", {
            class : "symbol",
        }).appendTo(symbols);

        var header = $("<div/>", {
            class : "header",
            text : key
        }).appendTo(symbolDiv);

        // Show all the rules

        var baseRuleHolder = $("<div/>", {
            class : "rules",

        }).appendTo(symbolDiv);

        var rules = symbol.baseRules;
        if (!rules) {
            console.log(symbol);
        }

        for (var i = 0; i < rules.length; i++) {
            ruleToDiv(rules[i]).appendTo(baseRuleHolder);
        }
    }
};

function ruleToDiv(rule) {
    var sections = tracery.parse(rule);

    var div = $("<div/>", {
        class : "rule",

    });

    for (var i = 0; i < sections.length; i++) {
        var sectionDiv = $("<div/>", {
            class : "section section" + sections[i].type,
            text : sections[i].raw,
        }).appendTo(div);
    }

    return div;
};

tracery.Grammar.prototype.referenceVisualization = function(holder, settings) {

};

tracery.TraceryNode.prototype.visualizeExpansion = function(holder, settings) {

    var div = $("<div/>", {
        class : "tracery-node tracery-node" + this.type,
    }).appendTo(holder);

    if (this === settings.active) {
        div.addClass("active");
    }

    if (this.grammar.symbols[this.symbol]) {

        if (this.grammar.symbols[this.symbol].isDynamic) {
            div.addClass("dynamic");
        }
    } else {
        div.addClass("missing");

    }

    var header = $("<div/>", {
        class : "header",
    }).appendTo(div);

    if (this.type === 1) {
        header.text(this.symbol);
    } else {
        header.text(this.finishedText);
    }

    if (this.preActions) {
        $.each(this.preActions, function(index, action) {
            var command = $("<div/>", {
                class : "action-command",
                text : action.target + ":" + action.rule
            }).appendTo(div);

            var text = $("<div/>", {
                class : "action-text",
                text : action.ruleText
            }).appendTo(div);
        });
    }

    if (this.children) {
        var childHolder = $("<div/>", {
            class : "children",

        }).appendTo(div);

        for (var i = 0; i < this.children.length; i++) {
            this.children[i].visualizeExpansion(childHolder, settings);
        }
    }
};

tracery.rawGrammarToPrettyHTML = function(raw) {

    // Escape any raw html
    var s = "";
    var keyOutputs = [];
    for (var key in raw) {
        if (raw.hasOwnProperty(key)) {
            var rules = JSON.stringify(raw[key]);
            rules = escapeHTML(rules);
            keyOutputs.push("<b>\"" + key + "\":</b>" + rules);
        }
    }
    return keyOutputs.join(",<br>");
};

