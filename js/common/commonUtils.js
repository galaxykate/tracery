/**
 * @author Kate Compton
 */

var utilities = {};
var prefix = "modules/shared/common/";
define(["inheritance", "noise", prefix + "transform", prefix + "vector", prefix + "rect", prefix + "kcolor", prefix + "utilities", prefix + "ui", "jQueryUI", "underscore"], function(Inheritance, _Noise, _Transform, _Vector, _Rect, _KColor, _utilities, uiUtils, JQUERY, _) {
    var common = {
        Vector : _Vector,
        KColor : _KColor,
        Rect : _Rect,

        Transform : _Transform,

    };
    console.log(uiUtils);
    $.extend(utilities, _utilities);
    $.extend(utilities, common);
    $.extend(utilities, uiUtils);
    //=============================================================
    //=============================================================
    //=============================================================
    // Add watching
    /*
    * object.watch polyfill
    *
    * 2012-04-03
    *
    * By Eli Grey, http://eligrey.com
    * Public Domain.
    * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
    */

    // object.watch
    if (!Object.prototype.watch) {
        Object.defineProperty(Object.prototype, "watch", {
            enumerable : false,
            configurable : true,
            writable : false,
            value : function(prop, handler) {
                var oldval = this[prop], newval = oldval, getter = function() {
                    return newval;
                }, setter = function(val) {
                    oldval = newval;
                    return newval = handler.call(this, prop, oldval, val);
                };

                if (
                delete this[prop]) {// can't watch constants
                    Object.defineProperty(this, prop, {
                        get : getter,
                        set : setter,
                        enumerable : true,
                        configurable : true
                    });
                }
            }
        });
    }

    // object.unwatch
    if (!Object.prototype.unwatch) {
        Object.defineProperty(Object.prototype, "unwatch", {
            enumerable : false,
            configurable : true,
            writable : false,
            value : function(prop) {
                var val = this[prop];
                delete this[prop];
                // remove accessors
                this[prop] = val;
            }
        });
    }

    //=============================================================
    //=============================================================
    //=============================================================

    utilities.noiseObj = new _Noise();
    utilities.noise = function() {
        // use the correct number of args
        switch(arguments.length) {
            case 1:
                return utilities.noiseObj.noise2D(arguments[0], 1000);
                break;
            case 2:
                return utilities.noiseObj.noise2D(arguments[0], arguments[1]);
                break;
            case 3:
                return utilities.noiseObj.noise3D(arguments[0], arguments[1], arguments[2]);
                break;
            case 4:
                return utilities.noiseObj.noise4D(arguments[0], arguments[1], arguments[2], arguments[3]);
                break;
            default:
                console.log("Attempting to use Noise with " + arguments.length + " arguments: not supported!");
                return 0;
                break;
        }
    };

    // renormalized to between [0, 1]
    utilities.unitNoise = function() {
        return utilities.noise.apply(undefined, arguments) * .5 + .5;
    };

    //==================================================
    return utilities;
});
