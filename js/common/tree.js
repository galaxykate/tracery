/**
 * @author Kate Compton
 */

define(["common"], function(common) {
    var nodeCount = 0;

    var Tree = Class.extend({
        init : function() {
            // Set the depth if there's a parent
            this.depth = 0;

            this.idNumber = nodeCount;
            this.children = [];
            nodeCount++;
        },

        compileNodes : function(list, query) {

            if (query(this))
                list.push(this);
            if (this.children) {
                $.each(this.children, function(index, child) {
                    child.compileNodes(list, query);
                });
            }
        },

        removeChildren : function() {
            $.each(this.children, function(index, child) {
                child.removeParent();
            });
            this.children = [];
        },

        removeParent : function() {
            this.parent = undefined;
            this.depth = 0;
        },

        setParent : function(parent) {

            this.parent = parent;
            this.depth = this.parent !== undefined ? this.parent.depth + 1 : 0;

            // this NEEDS TO HAVE CHILDREN DEFINED
            if (this.parent) {
                if (this.parent.children === undefined)
                    this.parent.children = [];

                this.parent.children.push(this);
            }
        },

        getChildren : function() {
            return this.children;
        },

        debugPrint : function() {
            var spacer = "";
            for (var i = 0; i < this.depth; i++) {
                spacer += "   ";
            }
            console.log(spacer + this);

            var children = this.getChildren();
            if (children !== undefined) {
                $.each(children, function(index, node) {
                    node.debugPrint();
                });
            }
        },

        reduceDown : function(f, base) {
            console.log(this.depth + " Reduce down " + this);
            base = f(base, this);

            if (this.children !== undefined) {
                $.each(this.children, function(index, node) {
                    base = node.reduceDown(f, base);
                });
            }

            return base;
        },

        toString : function() {
            return "Node" + this.idNumber;
        },

        generateTree : function(initNode) {
            initNode(this);
            var children = this.getChildren();
            $.each(children, function(index, node) {
                node.generateTree(initNode);
            });
        }
    });

    return Tree;

});
