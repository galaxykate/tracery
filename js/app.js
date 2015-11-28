/**
 * @author Kate
 */
var app = {
    generateCount : 1,
    mode : undefined,
    grammar : grammar,
    seedLocked : false
};
$(document).ready(function() {
    console.log("start");
    setMode("authoring");
});
// Ways to interact

function setVisualization(vizMode) {
    console.log("set viz mode: " + vizMode);
    $("#visualization").show();
    app.vizMode = vizMode;
    refreshVisualization();
};

function setMode(mode) {

    app.grammar = tracery.createGrammar();
    app.grammar.addModifiers(baseEngModifiers);

    currentMode = mode;
    console.log("Set mode " + currentMode);
    // Set to default view
    $("#nav-col").hide();
    $("#edit-col").show();
    $("#content-col").show();
    app.editMode = "json";
    $("#grammar-mode-select").val("json");
    $("#grammar-mode-select").val("json");

    // Clear headers

    switch(currentMode) {
    case "authoring":

        // Various controls for the output
        var outputControls = $("#output .content-header .controls");

        // Origin word select
        var originSelect = $("<select/>", {
            id : "origin-select",
        }).appendTo(outputControls).change(function() {
            app.origin = $(this).val();
            generate();
        });

        var vizSelect = $("<select/>", {
            id : "visualization-select",
            html : ["expansion", "distribution"].map(function(item) {
                return "<option>" + item + "</option>";
            }).join("")
        }).appendTo($("#visualization .controls")).change(function() {
            var viz = $(this).val();
            setVisualization(viz);
        });

       
        var count = $("<select/>", {
            id : "generate-count",
            html : [1, 2, 3, 4, 5, 7, 10, 15, 20, 30, 60, 100].map(function(num) {
                return "<option>" + num + "</option>";
            }).join(""),
        }).appendTo(outputControls).change(function() {
            app.generateCount = parseInt($(this).val());
            generate();
        });
        var reroll = $("<button/>", {
            text : "reroll"
        }).appendTo(outputControls).click(function() {
            if (app.seedLocked) {
                toggleSeedLock();
            }
            generate();
        });

        var stepTimer;
        var stepButton = $("<button/>", {
            text : "step"
        }).appendTo(outputControls).click(function() {

            // generate, but suppress recursion
            generate(true);

            if (app.isStepping) {
                clearInterval(stepTimer);
            } else {
                var stepTimer = setInterval(function() {
                    app.stepIterator.node.expand(true);
                    var action = app.stepIterator.next();
                    if (app.stepIterator.mode === 2 || app.stepIterator.mode === 0) {
                        //  console.log(action.log);
                        app.stepIterator.next();
                    }
                    if (!action)
                        clearInterval(stepTimer);
                    else {
                        //  console.log(action.log);

                    }
                    refreshVisualization();
                    refreshGrammarOutput();
                }, 40);

            }

        });

        var genseedDiv = $("<div/>", {
            id : "gen-seed",
        }).appendTo(outputControls).attr('contenteditable', 'true').keyup(function() {
            if (!app.seedLocked)
                toggleSeedLock();
            setSeed($(this).text(), false, true);
        });
        var genseedLock = $("<div/>", {
            id : "gen-seed-lock",
        }).appendTo(outputControls).click(function() {
            toggleSeedLock();
        });

        // Grammar and info controls

        var grammarControls = $("#grammar .controls");
        // Create an error log

        // Title and renaming
        var name = $("<div/>", {
            class : "grammar-title",
            text : "My Grammar"
        }).appendTo($("#grammar .content-header .title")).attr('contenteditable', 'true').keyup(function() {
            renameGrammar($(this).text());
        });

        var grammarSelect = $("<select/>", {
            id : "grammar-select",
            html : Object.keys(testGrammars).map(function(item) {
                return "<option>" + item + "</option>";
            }).join("")
        }).appendTo(grammarControls).change(function() {
            var grammarName = $(this).val();
            loadGrammar(testGrammars[grammarName]);
            generate();
        });

        // Login/id
        var login = $("<span/>", {
            html : "login",
            class : "login-id"
        }).appendTo(grammarControls);

        // Toggle visual editing mode
        /*
         var grammarMode = $("<div/>", {
         id : "grammar-mode",
         }).appendTo(grammarControls).click(function() {
         toggleGrammarMode();
         });
         */

        var editMode = $("<select/>", {
            id : "grammar-mode-select",
            html : ["json", "visual", "step"].map(function(item) {
                return "<option>" + item + "</option>";
            }).join("")
        }).appendTo(grammarControls).change(function() {
            app.editMode = $(this).val();
            refreshGrammarOutput();
        });

        break;
    case "tutorial" :
        break;
    case "browsing" :
        break;
    }
    setSeed(Math.floor(Math.random() * 9999999), true);

   $("#grammar-select").val("landscape");
    loadGrammar(testGrammars[$("#grammar-select").val()]);
    generate();
    setVisualization("expansion");
}

function setEditMode(editMode) {
    app.editMode = setEditMode;

}

//===============================================================
//===============================================================
// Generate
function setSeed(val, updateDisplay, regenerate) {
    if (regenerate)
        generate();
    if (updateDisplay)
        $("#gen-seed").text(app.genSeed);
    app.genSeed = val;
}

function toggleSeedLock() {
    app.seedLocked = !app.seedLocked;
    if (app.seedLocked)
        $("#gen-seed-lock").addClass("locked");
    else
        $("#gen-seed-lock").removeClass("locked");
    console.log(app.seedLocked);
}

function reparseGrammar(raw) {
    var errors = [];
    // attempt to validate JSON
    if (raw !== undefined) {
        console.log("reparsing from raw: " + raw);

        raw = raw.trim();
        if (raw.length === 0) {
            errors.push({
                index : 0,
                log : "Empty grammar, can't parse yet.",
            });
        }
        if (raw.charAt(0) !== "{")
            errors.push({
                index : 0,
                log : "JSON must start with {, missing {",
            });
        if (raw.charAt(raw.length - 1) !== "}")
            errors.push({
                index : raw.length - 1,
                log : "JSON must end with }, missing }",
            });

        console.log(errors.length + " errors");

        var json = {};
        try {
            json = JSON.parse(raw);

        } catch(e) {
            console.log(e);
            errors.push({
                log : e
            });

        }

        app.grammar.loadFromRawObj(json);

        if (errors.length !== 0) {
            $("#errors").show();
            $("#errors").html("");
            for (var i = 0; i < errors.length; i++) {
                $("#errors").append("<div class='error'>" + errors[i].index + ": " + errors[i].log + "</div>");
            }

        }
    }
    rebuildSymbolList();

}

function rebuildSymbolList() {
    var originOptions = Object.keys(app.grammar.symbols).map(function(symbol) {
        return "<option>" + symbol + "</option>";
    }).join("");
    $("#origin-select").html("<option>origin</option>" + originOptions);
}

// Use the current grammar to generate a parseable object
function generateRoot() {
    var origin = app.origin;
    if (!origin) {
        origin = "origin";
    }
    return app.grammar.createRoot("#" + origin + "#");
}

function generate(preventRecursion) {

    if (app.seedLocked) {
    } else {
        setSeed(Math.floor(Math.random() * 99999999), true);
    }
    Math.seedrandom(app.genSeed);

    // Clear the grammar
    app.grammar.clearState();

    var outputDiv = $("#output .content");
    outputDiv.html("");

    app.generatedRoots = [];
    for (var i = 0; i < app.generateCount; i++) {
        var root = generateRoot();
        root.expand(preventRecursion);
        app.generatedRoots[i] = root;
        //  root.visualizeExpansion($("#output .content"));

        outputDiv.append("<div class='generated-output'>" + root.finishedText + "</div>");

        app.stepIterator = new NodeIterator(root);

    }
    refreshVisualization();

};
//===============================================================
//===============================================================
// UI
function renameGrammar(name) {
    app.grammar.title = name;
    console.log("grammar now named: " + name);
};
function toggleGrammarMode() {
    app.grammarViz = !app.grammarViz;
    console.log("  app.grammarViz" + app.grammarViz);
    if (app.grammarViz)
        $("#grammar-mode").addClass("enabled");
    else
        $("#grammar-mode").removeClass("enabled");
    // Set the view mode to either JSON or graphical
    refreshGrammarOutput();
}

// Set the info to be small
function miniInfo() {
    $("#info .content").hide();
}

// Set the info to be small
function maxiInfo() {
    $("#info .content").show();
}

function loadGrammar(grammar) {
    // Just a raw grammar?
    app.grammar.loadFromRawObj(grammar);
    rebuildSymbolList();
    refreshGrammarOutput();
};

function refreshVisualization() {
    var holder = $("#visualization .holder");
    holder.html("");
    switch(app.vizMode) {
    case "distribution":
        var virtualGen = 100;
        for (var i = 0; i < virtualGen; i++) {
            var root = generateRoot();
            root.expand();
        }
        app.grammar.distributionVisualization(holder);
        break;
    case "expansion":
        for (var i = 0; i < app.generatedRoots.length; i++) {
            app.generatedRoots[i].visualizeExpansion(holder, {
                active : app.stepIterator.node
            });
        }

    };
    //   $("#visualization .output-text").html(app.generatedRoots[0].finishedText);

}

function refreshGrammarOutput() {
    var holder = $("#grammar-holder");
    holder.html("");
    var raw = app.grammar.raw;
    var keys = Object.keys(raw);

    switch(app.editMode) {
    case "visual":
        $.each(keys, function(index, key) {
            var div = $("<div/>", {
                class : "vizedit-symbol"
            }).appendTo(holder);

            var keyDiv = $("<div/>", {
                text : key,
                class : "vizedit-key"
            }).appendTo(div);

            var rulesDiv = $("<div/>", {
                class : "vizedit-rules"
            }).appendTo(div);

            var addRule = $("<button/>", {
                class : "vizedit-add",
                text : "+"
            }).appendTo(div);

            if (Array.isArray(raw[key])) {
                $.each(raw[key], function(index, rule) {
                    var ruleDiv = $("<div/>", {
                        text : rule,
                        class : "vizedit-rule"
                    }).appendTo(rulesDiv).click(function() {
                        app.selectedRule = {
                            key : key,
                            index : index,
                            rule : rule
                        };

                        $(".vizedit-rule").removeClass("selected");
                        ruleDiv.addClass("selected");

                        ruleDiv.attr('contenteditable', 'true').keyup(function(ev) {
                            // Do something with this text
                            generate();
                        });
                    });

                });
            }

        });
        break;

    case "step":

        var keys = Object.keys(app.grammar.symbols);
        $.each(keys, function(index, key) {
            var symbol = app.grammar.symbols[key];

            var div = $("<div/>", {
                class : "vizedit-symbol"
            }).appendTo(holder);

            var keyDiv = $("<div/>", {
                text : key,
                class : "vizedit-key"
            }).appendTo(div);

            if (symbol.isDynamic) {
                keyDiv.addClass("dynamic");
            }

            var rulesDiv = $("<div/>", {
                class : "vizedit-rules"
            }).appendTo(div);

            // What are the currently active rules?

            // Create the rulestack
            $.each(symbol.stack, function(index, ruleset) {
                var rulesetDiv = $("<div/>", {
                    class : "vizedit-ruleset"
                }).appendTo(rulesDiv);

                if (index === symbol.stack.length - 1) {
                    rulesetDiv.addClass("active");
                }

                // Create rulesets within the stack
                $.each(ruleset.defaultRules, function(index, rule) {
                    var ruleDiv = $("<div/>", {
                        class : "vizedit-rule",
                        text : rule
                    }).appendTo(rulesetDiv);
                });
            });

        });

        break;
    default:
        var grammarHolder = $("<div>", {
            class : "grammar-json",
        }).appendTo(holder);
        var lines = keys.map(function(key, index) {
            var line = "\"" + "<b>" + key + "\":</b>";

            if (Array.isArray(raw[key])) {
                line += "[" + raw[key].map(function(item, index) {
                    return '"' + item + '"';
                }).join(", ") + "]";
            } else {
                line += "[\"" + raw[key] + "\"]";
            }
            return line;
        });

        grammarHolder.append("{<br>" + lines.join(",<br>") + "<br>}");

        grammarHolder.attr('contenteditable', 'true').keyup(function() {
            reparseGrammar($(this).text());
            generate();
        });
        break;
    }

}
