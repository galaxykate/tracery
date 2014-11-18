define(["inheritance", "./timespan"], function(Inheritance, TimeSpan) {
    var Time = Class.extend({
        init : function(name) {
            this.name = name;
            this.ellapsed = 0;
            this.frameCount = 0;
            this.total = 0;
            this.timespans = new TimeSpan.Manager();

        },

        addTimeSpan : function(timespan) {
            this.timespans.add(timespan);
        },

        addEllapsed : function(t) {
            this.ellapsed = t;
            this.total += t;
        },

        updateTime : function(t) {
            if (isNaN(t)) {
                throw ("Update time " + this.name + " with bad total value " + t);
            }

            this.ellapsed = t - this.total;

            if (isNaN(this.ellapsed) || this.ellapsed < .001 || this.ellapsed > 1) {
                // throw ("Update time " + this.name + " with bad ellapsed value " + this.ellapsed);

            }
            if (this.ellapsed < .01)
                this.ellapsed = .01;
            if (this.ellapsed > .5)
                this.ellapsed = .5;
            if (isNaN(this.ellapsed))
                this.ellapsed = .05;

            this.total = t;
            this.timespans.update(this.ellapsed);
        },
        toString : function() {
            return this.name + ": " + this.total.toFixed(2) + "(" + this.ellapsed.toFixed(3) + ")";
        }
    });

    return Time;
});
