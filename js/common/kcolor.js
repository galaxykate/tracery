/**
 * @author Kate Compton
 */

// Color utility class
//  Create KColors (stored as HSBA [0, 1], so that (.45, .3, 1, .5) would be a half-transparent sky-blue)

function toRGB(h, s, v) {
    var r, g, b;
    h *= 6;
    h = h % 6;

    var i = Math.floor(h);
    var f = h - i;
    var p = v * (1 - s);
    var q = v * (1 - (s * f));
    var t = v * (1 - (s * (1 - f)));
    if (i == 0) {
        r = v;
        g = t;
        b = p;
    } else if (i == 1) {
        r = q;
        g = v;
        b = p;
    } else if (i == 2) {
        r = p;
        g = v;
        b = t;
    } else if (i == 3) {
        r = p;
        g = q;
        b = v;
    } else if (i == 4) {
        r = t;
        g = p;
        b = v;
    } else if (i == 5) {
        r = v;
        g = p;
        b = q;
    }
    r = Math.floor(r * 255);
    g = Math.floor(g * 255);
    b = Math.floor(b * 255);
    return [r, g, b];
};
// Private functions

// Make the Vector class
function KColor(h, s, b, a) {
    this.h = h;
    this.s = s;
    this.b = b;
    if (a !== undefined)
        this.a = a;
    else
        this.a = 1;
};

// Add lots of utilty, modification, lerping, etc functions to deal with colors

KColor.prototype.toString = function() {
    return "hsb: " + this.h.toFixed(2) + " " + this.s.toFixed(2) + " " + this.b.toFixed(2) + " " + this.a.toFixed(2);

};

KColor.prototype.clone = function() {
    return new KColor(this.h, this.s, this.b, this.a);
};

KColor.prototype.constrainToUnit = function(v) {
    return Math.min(Math.max(v, 0), 1);
};

KColor.prototype.cloneShade = function(shade, fade) {
    var clone;

    this.use(function(h, s, b, a) {
        clone = new KColor(h, s, b, a);
    }, shade, fade);

    return clone;
};

KColor.prototype.creatMutant = function() {
    var clone;

    var hMutation = .2 * (Math.random() - .5);
    var sMutation = .2 * (Math.random() - .5);
    var bMutation = .2 * (Math.random() - .5);

    return new KColor(this.h + hMutation, this.s + sMutation, this.b + bMutation, this.a);

};

// shade goes from -1 to 1, as does fade.
KColor.prototype.fill = function(g, shade, fade) {
    return this.use(g.fill, shade, fade);
};

KColor.prototype.stroke = function(g, shade, fade) {
    return this.use(g.stroke, shade, fade);
};

KColor.prototype.background = function(g, shade, fade) {
    return this.use(g.background, shade, fade);
};

KColor.prototype.use = function(gFunc, shade, fade) {

    var s1 = this.s;
    var h1 = this.h;
    var b1 = this.b;
    var a1 = this.a;

    if (shade !== undefined) {
        if (shade > 0) {
            s1 = this.constrainToUnit(s1 - shade * (s1));
            b1 = this.constrainToUnit(b1 + shade * (1 - b1));
        } else {
            s1 = this.constrainToUnit(s1 - shade * (1 - s1));
            b1 = this.constrainToUnit(b1 + shade * (b1));
        }

        h1 = (h1 + -.06 * shade + 1) % 1;
    }

    // Increase (or decrease) the alpha for this
    if (fade !== undefined) {
        if (fade < 0) {
            a1 = this.constrainToUnit(a1 * (1 + fade));
        } else {
            a1 = this.constrainToUnit((1 - a1) * fade + a1);
        }
    }

    gFunc(h1, s1, b1, a1);
};

//=================================================================
//=================================================================
//=================================================================

KColor.prototype.toCSS = function(shade, fade) {

    if (shade !== undefined) {
        var css;
        this.use(function(h, s, b, a) {
            var rgb = toRGB(h, s, b, a);
            var vals = "";
            $.each(rgb, function(index, val) {
                vals += Math.round(val) + ", ";
            });
            vals += a;
            css = "rgba(" + vals + ")";
        }, shade, fade);

        return css;
    }

    var rgb = toRGB(this.h, this.s, this.b, this.a);
    var vals = "";
    $.each(rgb, function(index, val) {
        vals += Math.round(val) + ", ";
    });
    vals += this.a;
    return "rgba(" + vals + ")";
};

// From the internet
KColor.prototype.toRGB = function() {
    return toRGB(this.h, this.s, this.b, this.a);
};

var toHexString = function(v) {
    var v2 = v.toString(16);
    if (v2.length == 0)
        v2 = "0" + v2;
    if (v2.length == 1)
        v2 = "0" + v2;
    return v2;
};

KColor.prototype.toHex = function() {
    var rgb = this.toRGB();

    var hex = rgb[0] << 16 | rgb[1] << 8 | rgb[2];
    hex = toHexString(rgb[0]) + toHexString(rgb[1]) + toHexString(rgb[2]);
    return hex;
};

KColor.makeIDColor = function(idNumber) {
    return new KColor((idNumber * .31299 + .42) % 1, 1, 1);
};

