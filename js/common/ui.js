/**
 * @author Kate Compton
 */

define([], function() {
    return {
        addSlider : function(parent, key, defaultValue, minValue, maxValue, onChange) {

            // Create an empty slider div
            var optionDiv = $("<div/>", {
            });
            optionDiv.css({
                "pointer-events" : "auto"
            });
            parent.append(optionDiv);

            var slider = $('<div />', {
                id : 'slider_' + key,
                class : "tuning_slider",
                value : key
            });

            var step = maxValue - minValue;
            if (step < 10)
                step = .1;
            else
                step = 1;

            slider.appendTo(optionDiv);
            slider.slider({
                range : "min",
                value : defaultValue,
                min : minValue,
                max : maxValue,
                step : step,
                slide : function(event, ui) {
                    $("#" + key + "amt").text(ui.value);
                    console.log("Slide " + ui.value);
                    if (onChange !== undefined) {
                        onChange(key, ui.value);
                    }
                }
            });

            // Create a lable
            $('<label />', {
                'for' : 'slider_' + key,
                text : key + ": "
            }).appendTo(optionDiv);

            // Create a lable
            $('<span />', {
                id : key + "amt",
                text : defaultValue
            }).appendTo(optionDiv);

            return slider;
        }
    };

});
