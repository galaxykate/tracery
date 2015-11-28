/**
 * @author Kate
 */

/*
 * Node class
 * The nodes are
 */

var TraceryNode = function(parent, childIndex, settings) {
    if (settings.raw === undefined) {
        throw ("No raw input for node");
    }
    if ( parent instanceof tracery.Grammar) {
        this.grammar = parent;
        this.parent = null;
        this.depth = 0;
        this.childIndex = 0;
    } else {
        this.grammar = parent.grammar;
        this.parent = parent;
        this.depth = parent.depth + 1;
        this.childIndex = childIndex;
    }

    this.raw = settings.raw;
    this.type = settings.type;
    this.isExpanded = false;

    if (!this.grammar) {
        console.warn("No grammar specified for this node", this);
    }

};

TraceryNode.prototype.toString = function() {
    return "Node('" + this.raw + "' " + this.type + " d:" + this.depth + ")";
};

// Expand the node (with the given child rule)
//  Make children if the node has any
TraceryNode.prototype.expandChildren = function(childRule, preventRecursion) {
    this.children = [];
    this.finishedText = "";

    // Set the rule for making children,
    // and expand it into section
    this.childRule = childRule;
    if (this.childRule !== undefined) {
        var sections = tracery.parse(childRule);
        for (var i = 0; i < sections.length; i++) {
            this.children[i] = new TraceryNode(this, i, sections[i]);
            if (!preventRecursion)
                this.children[i].expand(preventRecursion);

            // Add in the finished text
            this.finishedText += this.children[i].finishedText;
        }
    } else {

         console.warn("No child rule provided, can't expand children");
    }
};

// Expand this rule (possibly creating children)
TraceryNode.prototype.expand = function(preventRecursion) {

    if (!this.isExpanded) {
        this.isExpanded = true;

        this.expansionErrors = [];

        // Types of nodes
        // -1: raw, needs parsing
        //  0: Plaintext
        //  1: Tag ("#symbol.mod.mod2.mod3#" or "#[pushTarget:pushRule]symbol.mod")
        //  2: Action ("[pushTarget:pushRule], [pushTarget:POP]", more in the future)

        switch(this.type) {
        // Raw rule
        case -1:

            this.expandChildren(this.raw, preventRecursion);
            break;

        // plaintext, do nothing but copy text into finsihed text
        case 0:
            this.finishedText = this.raw;
            break;

        // Tag
        case 1:
            // Parse to find any actions, and figure out what the symbol is
            this.preactions = [];

            var parsed = tracery.parseTag(this.raw);

            // Break into symbol actions and modifiers
            this.symbol = parsed.symbol;
            this.modifiers = parsed.modifiers;

            // Create all the preactions from the raw syntax
            if (parsed.preactions.length > 0) {
                this.preactions = [];
                console.log(parsed.preactions);
                for (var i = 0; i < parsed.preactions.length; i++) {
                    this.preactions[i] = new NodeAction(this, parsed.preactions[i].raw);
                }

                // Make undo actions for all preactions (pops for each push)
                // TODO

                // Activate all the preactions
                for (var i = 0; i < this.preactions.length; i++) {
                    this.preactions[i].activate();
                }

            }

            this.finishedText = this.raw;

            // Expand (passing the node, this allows tracking of recursion depth)
            var selectedRule = this.grammar.selectRule(this.symbol, this);

            if (!selectedRule) {
                this.expansionErrors.push({
                    log : "Child rule not created",
                });
            }
            this.expandChildren(selectedRule, preventRecursion);

            // Apply modifiers
            for (var i = 0; i < this.modifiers.length; i++) {
                var mod = this.grammar.modifiers[this.modifiers[i]];
                if (!mod)
                    this.finishedText += "((." + this.modifiers[i] + "))";
                else
                    this.finishedText = mod(this.finishedText);
            }
            // Perform post-actions
            break;
        case 2:

            // Just a bare action?  Expand it!
            this.preActions = [new NodeAction(this, this.raw)];
            this.preActions[0].activate();

            // No visible text for an action
            // TODO: some visible text for if there is a failure to perform the action?
            this.finishedText = "";
            break;

        }
    } else {
        //console.warn("Already expanded " + this);
    }
};

// An action that occurs when a node is expanded
// Types of actions:
// 0 Push: [key:rule]
// 1 Pop: [key:POP]
// 2 function: [functionName(param0,param1)] (TODO!)
function NodeAction(node, raw) {
    if (!node)
        console.warn("No node for NodeAction");
    if (!raw)
        console.warn("No raw commands for NodeAction");

    this.node = node;

    var sections = raw.split(":");
    this.target = sections[0];

    // No colon? A function!
    if (sections.length === 1) {
        this.type = 2;
    }

    // Colon? It's either a push or a pop
    else {
        this.rule = sections[1];
        if (this.rule === "POP") {
            this.type = 1;
        } else {
            this.type = 0;
        }
    }
}

NodeAction.prototype.activate = function() {
    var grammar = this.node.grammar;
    switch(this.type) {
    case 0:
        this.ruleNode = new TraceryNode(grammar, 0, {
            type : -1,
            raw : this.rule
        });
        this.ruleNode.expand();
        this.ruleText = this.ruleNode.finishedText;

        grammar.pushRules(this.target, this.ruleText, this);
        console.log("Push rules:" + this.target + " " + this.ruleText);
        break;
    case 1:
        break;
    case 2:
        break;
    }

};

