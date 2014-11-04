/**
 * @author Kate Compton
 */

define(["inheritance"], function() {
    function createNode(parent, childIndex, traceNode) {
        if (childIndex < 0) {
            this.childIndex = 0;
            this.depth = 0;
            this.parent = parent;
        } else {
            this.parent = parent;
            this.childIndex = childIndex;
            this.depth = this.parent.depth;
        }

        this.traceNode = traceNode;

        var div = $("<div/>", {
            class : "storyFold " + this.traceNode.type,
        });

        parent.div.append(div);

        var children = $("<div/>", {
            class : "storyFoldChildren",
        });

        var header = this.symbol;

        switch(this.traceNode.type) {
            case "plainText":
                div.append(this.traceNode.flatten());
                break;

            case "ruleExpansion":
                div.append(this.traceNode.rule.source);
                div.append(children);
                div.append(this.traceNode.flatten());
                break;

            case "symbolExpansion":
                div.append(this.traceNode.symbol + ": " + this.traceNode.rule.source);
                div.append(children);
                div.append(this.traceNode.flatten());
                break;
        }

        var node = {
            div : children,
            open : false,
        };
        this.traceNode.children.forEach(function(child, index) {
            if (!child.isPlainText) {
                createNode(node, index, child);
            }
        });

        div.click(function() {
            div.open = !open;

            if (div.open) {
                children.show();
                div.addClass("open");
            } else {
                children.hide();
                div.removeClass("open");
            }

        });
    }

    return {
        createTree : function(div, trace) {
            console.log(trace);
            var root = createNode({
                div : div
            }, -1, trace.root);
        }
    };

});
