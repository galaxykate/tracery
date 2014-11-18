/**
 * @author Kate Compton
 */

var statsViz = function() {
    console.log("stats!");

    function SymbolViz(symbol) {
        this.symbol = symbol;
    };

    // Exposed
    return {
        openWith : function(analysis) {
            var holder = $("#vizPane");
            holder.html("");
            holder.addClass("open");

            // Add stuff to the pane
            console.log(analysis);

            analysis.keyList.forEach(function(key, index) {
                var maxWidth = 50;
                // Create a div for each symbol
                var div = $("<div/>", {
                    class : "symbolViz item",
                });

                var label = $("<div/>", {
                    class : "symbolVizLabel",
                    html : key,
                });
                var barHolder = $("<div/>", {
                    class : "barHolder",
                });

                holder.append(div);
                div.append(barHolder);
                div.append(label);
                analysis.symbols[key].div = div;

                var barHeight = 14;
                // create bars
                analysis.symbols[key].rules.map(function(rule, index) {
                    // Create the components of the bar
                    var bar = $("<div/>", {
                        class : "bar",
                    });

                    var barWidth = 0;

                    // create sections
                    rule.rule.sections.forEach(function(section, i) {
                        var section = rule.rule.sections[i];
                        var sectionDiv = $("<div/>", {
                            class : "barSection",

                        });

                        var style = {
                            left : barWidth + "px",
                            top : "0px",

                        };
                        var w = 0;
                        var color = "gray";
                        var text = "";
                        var charWidth = 5;
                        switch(section.type) {
                            case 0:
                                color = "rgba(255, 155, 255, .5)";
                                w = section.text.length * charWidth;

                                //http://stackoverflow.com/questions/822452/strip-html-from-text-javascript
                                text = section.text;
                                text = text.replace(/<(?:.|\n)*?>/gm, '');
                                break;
                            case 1:

                                color = "Aqua";
                                if (section.command === "POP")
                                    color = "DarkTurquoise";
                                w = 10;
                                break;

                            case 2:
                                color = "rgba(255, 255, 255, .5)";
                                text = section.symbol;
                                w = text.length * charWidth;

                                break;
                        };

                        style.width = w + "px";
                        style.backgroundColor = color;

                        sectionDiv.append(text);
                        sectionDiv.css(style);
                        barWidth += w;

                        bar.append(sectionDiv);
                        if (section.type === 2) {
                            sectionDiv.mouseenter(function() {
                                console.log(section.symbol);
                                analysis.symbols[section.symbol].div.addClass("selected");

                            });
                            sectionDiv.mouseleave(function() {
                                analysis.symbols[section.symbol].div.removeClass("selected");

                            });
                        }
                    });

                    bar.css({
                        width : barWidth + "px",
                        top : barHeight * index + "px",
                        height : barHeight + "px",

                    });

                    maxWidth = Math.max(maxWidth, barWidth);

                    barHolder.append(bar);
                });
                var fullHeight = Math.max(50, barHeight * analysis.symbols[key].rules.length);

                div.css({
                    width : maxWidth + "px",
                    height : (fullHeight + 12) + "px"
                });
            });

            var wall = new freewall("#vizPane");
            wall.reset({
                gutterX : 4,
                gutterY : 4,

            });
            wall.fitWidth();

            // Go through all the symbol
        },

        close : function(grammar) {
            $("#vizPane").removeClass("open");
        },
    };

}();
