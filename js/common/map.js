/**
 * @author Kate Compton
 */

// Reusable Vector class

define(["./vector"], function(Vector) {
    var Map = Class.extend({
        init : function() {
            this.values = [];
        },

        setDimensions : function(width, height, spacing) {
            this.columns = Math.round(width / spacing);
            this.rows = Math.round(height / spacing);
            this.xSpacing = width / this.columns;
            this.ySpacing = height / this.rows;

            for (var i = 0; i < this.columns; i++) {
                this.values[i] = [];
                for (var j = 0; j < this.rows; j++) {
                    this.values[i][j] = .5 * (j / this.rows) + .5 * Math.random();
                }
            }
        },

        setFill : function(g, value) {
            g.fill((value * 1.5) % 1, .3 + .7 * value, 1 - value);
        },

        sampleAt : function(p) {
            var x = p.x / this.xSpacing;
            var y = p.y / this.ySpacing;
            var column = Math.floor(x);
            var row = Math.floor(y);
            column = utilities.constrain(column, 0, this.columns - 1);
            row = utilities.constrain(row, 0, this.rows - 1);
            return this.values[column][row];
        },

        draw : function(g, t) {
            if (app.options.debugDrawLightmap) {
                for (var i = 0; i < this.columns; i++) {
                    for (var j = 0; j < this.rows; j++) {
                        var v = this.values[i][j];
                        this.setFill(g, v);
                        g.rect(i * this.xSpacing, j * this.ySpacing, this.xSpacing, this.ySpacing);
                    }
                }
            }
        }
    })
    return Map;

});
