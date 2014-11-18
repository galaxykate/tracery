/**
 * @author Kate Compton
 */

// Reusable Vector class

define(["inheritance"], function(Inheritance) {
    // convert angle to -PI, PI
    var normalizeAngle = function(angle) {
        angle = angle % (Math.PI * 2);
        if (angle > Math.PI)
            angle -= Math.PI * 2;
        return angle;
    };

    Vector = Class.extend({

        init : function(x, y, z) {
            // actually another vector, clone it
            if (x === undefined) {
                this.x = 0;
                this.y = 0;
                this.z = 0;
            } else {
                if (x.x !== undefined) {
                    this.x = x.x;
                    this.y = x.y;
                    this.z = x.z;
                } else {
                    this.x = x;
                    this.y = y;

                    this.z = 0;
                    if (z !== undefined)
                        this.z = z;

                }
            }

            if (!this.isValid())
                throw new Error(this.invalidToString() + " is not a valid vector");
        },

        clone : function() {
            return new Vector(this);
        },

        cloneInto : function(v) {
            v.x = this.x;
            v.y = this.y;
            v.z = this.z;

        },

        addMultiple : function(v, m) {
            this.x += v.x * m;
            this.y += v.y * m;
            this.z += v.z * m;
        },
        addPolar : function(r, theta) {
            this.x += r * Math.cos(theta);
            this.y += r * Math.sin(theta);
        },

        addSpherical : function(r, theta, phi) {
            this.x += r * Math.cos(theta) * Math.cos(phi);
            this.y += r * Math.sin(theta) * Math.cos(phi);
            this.z += r * Math.sin(phi);
        },

        addRotated : function(v, theta) {
            var cs = Math.cos(theta);
            var sn = Math.sin(theta);
            var x = v.x * cs - v.y * sn;
            var y = v.x * sn + v.y * cs;
            this.x += x;
            this.y += y;
            return this;
        },

        setToAverage : function(array) {
            if (array.length === 0) {
                this.setTo(0, 0);
            } else {
                this.mult(0);
                for (var i = 0; i < array.length; i++) {
                    this.add(array[i]);
                }
                this.div(array.length);
            }
        },

        setToPolar : function(r, theta) {
            this.x = r * Math.cos(theta);
            this.y = r * Math.sin(theta);
            return this;
        },
        setToCylindrical : function(r, theta, z) {
            this.x = r * Math.cos(theta);
            this.y = r * Math.sin(theta);
            this.z = z;
            return this;
        },
        setToPolarOffset : function(v, r, theta) {
            this.x = v.x + r * Math.cos(theta);
            this.y = v.y + r * Math.sin(theta);
            this.z = v.z;
            return this;
        },
        setToMultiple : function(v, m) {
            this.x = v.x * m;
            this.y = v.y * m;
            this.z = v.z * m;
            return this;
        },
        setToLerp : function(v0, v1, m) {
            var m1 = 1 - m;
            this.x = v0.x * m1 + v1.x * m;
            this.y = v0.y * m1 + v1.y * m;
            this.z = v0.z * m1 + v1.z * m;
            return this;
        },

        setToAddMultiple : function(v0, m0, v1, m1) {
            this.x = v0.x * m0 + v1.x * m1;
            this.y = v0.y * m0 + v1.y * m1;
            this.z = v0.z * m0 + v1.z * m1;
            return this;
        },

        setToAdd : function(v0, v1) {
            this.x = v0.x + v1.x;
            this.y = v0.y + v1.y;
            this.z = v0.z + v1.z;

            return this;
        },
        setToAddMultiple : function(v0, v1, m) {
            this.x = v0.x + v1.x * m;
            this.y = v0.y + v1.y * m;
            this.z = v0.z + v1.z * m;

            return this;
        },

        setToDifference : function(v0, v1) {
            this.x = v0.x - v1.x;
            this.y = v0.y - v1.y;
            this.z = v0.z - v1.z;
            return this;
        },

        setTo : function(x, y, z) {
            // Just in case this was passed a vector
            if (x.x !== undefined) {
                this.x = x.x;
                this.y = x.y;
                this.z = x.z;
                if (this.z === undefined)
                    this.z = 0;

            } else {
                this.x = x;
                this.y = y;
                if (z !== undefined)
                    this.z = z;
            }
            if (!this.isValid())
                throw new Error(this.invalidToString() + " is not a valid vector");

            return this;
        },

        magnitude : function() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        },

        normalize : function() {
            this.div(this.magnitude());
            return this;

        },

        constrainMagnitude : function(min, max) {
            var d = this.magnitude();
            if (d !== 0) {
                var d2 = utilities.constrain(d, min, max);
                this.mult(d2 / d);
            }
        },

        getDistanceTo : function(p) {
            var dx = this.x - p.x;
            var dy = this.y - p.y;
            var dz = this.z - p.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        },

        getDistanceToIgnoreZ : function(p) {
            var dx = this.x - p.x;
            var dy = this.y - p.y;

            return Math.sqrt(dx * dx + dy * dy);
        },

        getAngleTo : function(p) {
            var dx = p.x - this.x;
            var dy = p.y - this.y;
            //var dz = this.z - p.z;
            return Math.atan2(dy, dx);
        },

        getNormalTo : function(p) {
            var offset = this.getOffsetTo(p);
            offset.normalize();
            var temp = offset.x;
            offset.x = offset.y;
            offset.y = -temp;
            return offset;
        },

        //===========================================================
        //===========================================================
        // Complex geometry

        dot : function(v) {
            return v.x * this.x + v.y * this.y + v.z * this.z;
        },
        cross : function(v) {
            return new Vector(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
        },

        getAngleBetween : function(v) {
            return Math.acos(this.dot(v) / (this.magnitude() * v.magnitude()));
        },

        getCrossAngleBetween : function(v) {
            var cross = this.cross(v);
            if (cross.z > 0)
                return -Math.asin(cross.magnitude() / (this.magnitude() * v.magnitude()));
            else
                return Math.asin(cross.magnitude() / (this.magnitude() * v.magnitude()));
        },

        getNormalizedAngleBetween : function(v) {
            var theta0 = this.getAngle();
            var theta1 = v.getAngle();
            return normalizeAngle(theta1 - theta0);
        },

        isInTriangle : function(triangle) {

            //credit: http://www.blackpawn.com/texts/pointinpoly/default.html
            var ax = triangle[0].x;
            var ay = triangle[0].y;
            var bx = triangle[1].x;
            var by = triangle[1].y;
            var cx = triangle[2].x;
            var cy = triangle[2].y;

            var v0 = [cx - ax, cy - ay];
            var v1 = [bx - ax, by - ay];
            var v2 = [this.x - ax, this.y - ay];

            var dot00 = (v0[0] * v0[0]) + (v0[1] * v0[1]);
            var dot01 = (v0[0] * v1[0]) + (v0[1] * v1[1]);
            var dot02 = (v0[0] * v2[0]) + (v0[1] * v2[1]);
            var dot11 = (v1[0] * v1[0]) + (v1[1] * v1[1]);
            var dot12 = (v1[0] * v2[0]) + (v1[1] * v2[1]);

            var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);

            var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
            var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

            return ((u >= 0) && (v >= 0) && (u + v < 1));

        },

        isInPolygon : function(poly) {
            var pt = this;
            for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
                ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && ( c = !c);
            return c;
        },

        //===========================================================
        //===========================================================
        // Add and sub and mult and div functions

        add : function(x, y, z) {
            if (y !== undefined) {
                this.x += x;
                this.y += y;
                if (z !== undefined)
                    this.z += z;
            } else {
                this.x += x.x;
                this.y += x.y;
                this.z += x.z;
            }
        },

        sub : function(v) {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
        },
        mult : function(m) {
            this.x *= m;
            this.y *= m;
            this.z *= m;
        },
        div : function(m) {
            this.x /= m;
            this.y /= m;
            this.z /= m;
        },

        getOffsetTo : function(v) {
            return new Vector(v.x - this.x, v.y - this.y, v.z - this.z);
        },

        getAngle : function() {
            return Math.atan2(this.y, this.x);
        },

        rotate : function(theta) {
            var cs = Math.cos(theta);
            var sn = Math.sin(theta);
            var x = this.x * cs - this.y * sn;
            var y = this.x * sn + this.y * cs;
            this.x = x;
            this.y = y;
        },

        //===========================================================
        //===========================================================

        // Lerp a vector!
        lerp : function(otherVector, percent) {
            var lerpVect = new Vector(utilities.lerp(this.x, otherVector.x, percent), utilities.lerp(this.y, otherVector.y, percent), utilities.lerp(this.z, otherVector.z, percent));
            return lerpVect;
        },

        //===========================================================
        //===========================================================
        isValid : function() {
            var hasNaN = isNaN(this.x) || isNaN(this.y) || isNaN(this.z);
            var hasUndefined = this.x === undefined || this.y === undefined || this.z === undefined;
            var hasInfinity = Math.abs(this.x) === Infinity || Math.abs(this.y) === Infinity || Math.abs(this.z) === Infinity;

            var valid = !(hasNaN || hasUndefined || hasInfinity);
            // if (!valid)
            //   console.log(hasNaN + " " + hasUndefined + " " + hasInfinity);
            return valid;
        },

        //===========================================================
        //===========================================================
        translateTo : function(g) {
            g.translate(this.x, this.y);
        },

        //===========================================================
        //===========================================================

        bezier : function(g, c0, c1) {
            g.bezierVertex(c0.x, c0.y, c1.x, c1.y, this.x, this.y);
        },

        bezierTo : function(g, c0, c1, p) {
            g.bezier(this.x, this.y, c0.x, c0.y, c1.x, c1.y, p.x, p.y);
        },
        bezierWithRelativeControlPoints : function(g, p, c0, c1) {
            // "x" and "y" were not defined, so I added "this." in front. Hopefully that's the intended action (April)
            g.bezierVertex(p.x + c0.x, p.y + c0.y, this.x + c1.x, this.y + c1.y, this.x, this.y);
        },

        setToBezierPoint : function(p0, c0, c1, p1, t0) {
            // (1-t)^3 P_0 + 3(1-t)^2t P_1 + 3(1-t)t^2 P_2 + t^3 P_3
            var t1 = 1 - t0;
            this.setTo(0, 0, 0);
            this.addMultiple(p0, t1 * t1 * t1);
            this.addMultiple(c0, 3 * t1 * t1 * t0);
            this.addMultiple(c1, 3 * t1 * t0 * t0);
            this.addMultiple(p1, t0 * t0 * t0);
        },

        vertex : function(g) {
            g.vertex(this.x, this.y);
        },

        offsetVertex : function(g, offset, m) {
            if (m === undefined)
                m = 1;
            g.vertex(this.x + offset.x * m, this.y + offset.y * m);
        },

        draw : function(g) {
            var radius = 5;
            g.ellipse(this.x, this.y, radius, radius);
        },
        drawCircle : function(g, radius, radius2) {
            if (radius2 === undefined)
                radius2 = radius;
            g.ellipse(this.x, this.y, radius, radius2);
        },

        drawScreenCircle : function(g, camera, radius, radius2) {
            this.setScreenPos(camera);
            this.screenPos.drawCircle(g, radius, radius2);
        },

        drawOffsetCircle : function(g, offset, radius) {
            g.ellipse(this.x + offset.x, this.y + offset.y, radius, radius);
        },

        drawLineTo : function(g, v, offset, inset0, inset1) {
            if (offset) {
                var n = this.getNormalTo(v);
                var m = this.getOffsetTo(v);
                m.normalize();
                n.mult(offset);

                g.line(this.x + n.x + m.x * inset0, this.y + n.y + m.y * inset0, v.x + n.x + -m.x * inset1, v.y + n.y + -m.y * inset1);
            } else
                g.line(this.x, this.y, v.x, v.y);
        },

        drawOffsetLineTo : function(g, v, m, offset) {
            var mx = m * offset.x;
            var my = m * offset.y;

            g.line(this.x + mx, this.y + my, v.x + mx, v.y + my);
        },

        drawLerpedLineTo : function(g, v, startLerp, endLerp) {
            var dx = v.x - this.x;
            var dy = v.y - this.y;

            g.line(this.x + dx * startLerp, this.y + dy * startLerp, this.x + dx * endLerp, this.y + dy * endLerp);
        },

        drawArrow : function(g, v, m, headSize, endSpace) {

            if (headSize) {
                g.pushMatrix();
                g.translate(this.x + v.x * m, this.y + v.y * m);
                g.rotate(v.getAngle());

                endSpace = (endSpace === undefined) ? 2 : endSpace;

                g.line(-(v.magnitude() * m - endSpace), 0, -endSpace, 0);
                g.noStroke();

                g.beginShape();
                g.vertex(-headSize, 0);
                g.vertex(-headSize, headSize * .4);
                g.vertex(0, 0);
                g.vertex(-headSize, -headSize * .4);
                g.endShape();
                g.popMatrix();
            } else {
                g.line(this.x, this.y, v.x * m + this.x, v.y * m + this.y);

            }
        },

        drawAngle : function(g, r, theta) {
            g.line(this.x, this.y, r * Math.cos(theta) + this.x, r * Math.sin(theta) + this.y);
        },

        drawAngleBall : function(g, r, theta, radius) {
            g.ellipse(r * Math.cos(theta) + this.x, r * Math.sin(theta) + this.y, radius, radius);
        },

        drawArc : function(g, r, theta0, theta1) {
            var range = theta1 - theta0;
            var segments = Math.ceil(range / .2);
            for (var i = 0; i < segments + 1; i++) {
                var theta = theta0 + range * (i / segments);
                g.vertex(this.x + r * Math.cos(theta), this.y + r * Math.sin(theta));
            }
        },

        drawText : function(g, s, xOffset, yOffset) {
            g.text(s, this.x + xOffset, this.y + yOffset);
        },
        //===========================================================
        //===========================================================

        setScreenPos : function(camera) {
            if (!this.screenPos)
                this.screenPos = new Vector();
            camera.toScreenPos(this, this.screenPos);
        },

        toThreeVector : function() {
            return new THREE.Vector3(this.x, this.y, this.z);
        },
        toSVG : function() {
            return Math.round(this.x) + " " + Math.round(this.y);
        },

        toB2D : function() {
            return new Box2D.b2Vec2(this.x, -this.y);
        },

        toCSSDimensions : function() {
            return {
                width : this.x + "px",
                height : this.y + "px",

            }
        },

        //===========================================================
        //===========================================================

        toString : function(precision) {
            if (precision === undefined)
                precision = 2;

            return "(" + this.x.toFixed(precision) + ", " + this.y.toFixed(precision) + ", " + this.z.toFixed(precision) + ")";
        },

        toSimpleString : function() {
            precision = 1;
            return "(" + this.x.toFixed(precision) + ", " + this.y.toFixed(precision) + ")";

        },

        invalidToString : function() {

            return "(" + this.x + ", " + this.y + ", " + this.z + ")";
        },
    });

    // Class functions
    Vector.sub = function(a, b) {
        return new Vector(a.x - b.x, a.y - b.y, a.z - b.z);
    };

    Vector.dot = function(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    };

    Vector.polar = function(r, theta) {
        return new Vector(r * Math.cos(theta), r * Math.sin(theta));
    };

    Vector.polarOffset = function(v, r, theta) {
        return new Vector(v.x + r * Math.cos(theta), v.y + r * Math.sin(theta), v.z);
    };

    Vector.angleBetween = function(a, b) {
        return Math.acos(Vector.dot(a, b) / (a.magnitude() * b.magnitude()));
    };

    Vector.addMultiples = function(u, m, v, n, w, o) {
        var p = new Vector();
        p.addMultiple(u, m);
        p.addMultiple(v, n);
        if (w)
            p.addMultiple(w, o);

        return p;
    };

    Vector.add = function(u, v) {
        var p = new Vector();
        p.add(u);
        p.add(v);
        return p;
    };

    Vector.average = function(array) {
        var avg = new Vector();
        $.each(array, function(index, v) {
            avg.add(v);
        });
        avg.div(array.length);
        return avg;
    };

    Vector.getBezierPoint = function(p0, c0, c1, p1, t0) {
        var p = new Vector();
        p.setToBezierPoint(p0, c0, c1, p1, t0);
        return p;
    };

    Vector.calculateRayIntersection = function(p, q, u, v) {
        var s = Vector.sub(p, u);
        var m = (s.y / v.y - s.x / v.x) / (q.x / v.x - q.y / v.y);

        var n0 = s.x / v.x + m * q.x / v.x;

        // for verification
        //var n1 = s.y / v.y + m * q.y / v.y;
        return [m, n0];
    };

    Vector.calculateSegmentIntersection = function(p, p1, u, u1) {
        var s = Vector.sub(p, u);

        var q = Vector.sub(p1, p);
        var v = Vector.sub(u1, u);

        var m = (s.y / v.y - s.x / v.x) / (q.x / v.x - q.y / v.y);

        var n0 = s.x / v.x + m * q.x / v.x;

        // for verification
        //var n1 = s.y / v.y + m * q.y / v.y;
        return [m, n0];
    };

    return Vector;

});
