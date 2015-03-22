/**
 * @author Kate Compton
 */

define(["./action", "./inheritance"], function(Action, inheritance) {

    // A tracery expansion node
    var nodeCount = 0;

    var Node = Class.extend({
        init : function() {
            this.depth = 0;
            this.id = nodeCount;
            nodeCount++;
            this.childText = "[[UNEXPANDED]]";
        },

        setParent : function(parent) {
            if (parent) {
                this.depth = parent.depth + 1;
                this.parent = parent;
                this.grammar = parent.grammar;
            }
        },

        expand : function() {
            // do nothing
            return "???";
        },

        expandChildren : function() {

            if (this.children) {
                this.childText = "";
                for (var i = 0; i < this.children.length; i++) {
                    this.children[i].expand();
                    this.childText += this.children[i].finalText;
                }
                this.finalText = this.childText;
            }

        },

        createChildrenFromSections : function(sections) {
            var root = this;
            this.children = sections.map(function(section) {

                if ( typeof section == 'string' || section instanceof String) {
                    // Plaintext
                    return new TextNode(root, section);
                } else {
                    return new TagNode(root, section);
                }
            });
        }
    });

    var RootNode = Node.extend({
        init : function(grammar, rawRule) {
            this._super();
            this.grammar = grammar;
            this.parsedRule = tracery.parseRule(rawRule);
        },

        expand : function() {
            var root = this;
            this.createChildrenFromSections(this.parsedRule);

            // expand the children
            this.expandChildren();
        },
    });

    var TagNode = Node.extend({
        init : function(parent, parsedTag) {
            this._super();

            if (!(parsedTag !== null && typeof parsedTag === 'object')) {
                if ( typeof parsedTag == 'string' || parsedTag instanceof String) {
                    console.warn("Can't make tagNode from unparsed string!");
                    parsedTag = tracery.parseTag(parsedTag);

                } else {
                    console.log("Unknown tagNode input: ", parsedTag);
                    throw ("Can't make tagNode from strange tag!");

                }
            }

            this.setParent(parent);
            $.extend(this, parsedTag);
        },

        expand : function() {
            if (tracery.outputExpansionTrace)
                console.log(r.sections);

            this.rule = this.grammar.getRule(this.symbol);

            if (this.rule.error) {
                this.error = this.rule.error;
             
                tracery.addError(this.error);
            }
            this.actions = [];

            // Parse the rule if it hasn't been already
            this.createChildrenFromSections(this.rule.getParsed());

            // Do any pre-expansion actions!
            for (var i = 0; i < this.preActions.length; i++) {
                var action = new Action(this, this.preActions[i]);
                action.activate();
            }

            // Map each child section to a node
            if (!this.rule.sections)
                console.log(this.rule);

            this.expandChildren();

            for (var i = 0; i < this.actions.length; i++) {

                this.actions[i].deactivate();
            }

            this.finalText = this.childText;
            for (var i = 0; i < this.mods.length; i++) {
                this.finalText = this.grammar.applyMod(this.mods[i], this.finalText);
            }

        },

        toLabel : function() {
            return this.symbol;
        },
        toString : function() {
            return "TagNode '" + this.symbol + "' mods:" + this.mods + ", preactions:" + this.preActions + ", postactions" + this.postActions;
        }
    });

    var TextNode = Node.extend({
        isLeaf : true,
        init : function(parent, text) {
            this._super();

            this.setParent(parent);

            this.text = text;

            this.finalText = text;
        },
        expand : function() {
            // do nothing
        },

        toLabel : function() {
            return this.text;
        }
    });

    return RootNode;

});
