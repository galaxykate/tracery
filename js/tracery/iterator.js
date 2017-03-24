/**
 * @author Kate
 */

function NodeIterator(node) {
    this.node = node;
    this.childIndex = -1;

    this.mode = 0;

};

var itSpacer = "";
// Go to the next
NodeIterator.prototype.next = function() {

    // Actions for this node
    // 0: Just entered
    // 1: Start children
    // 2: Children finished, exit

    switch(this.mode) {
    case 0:
        itSpacer += "   ";
        this.mode = 1;
        return {
            log : itSpacer + "Enter " + this.node
        };

        break;
    case 1:
        if (!this.node.children || this.node.children.length === 0) {
            this.mode = 2;
            return {
                log : itSpacer + "start children: no children"
            };
        } else {
            var childCount = this.node.children.length;
            this.node = this.node.children[0];
            this.mode = 0;
            return {
                log : itSpacer + "starting 0 of " + childCount + " children"
            };
        }
        break;
    case 2:
        itSpacer = itSpacer.substring(3);

        // Find a sibling
        if (this.node.parent) {

            // Attempt sibling
            var nextSib = (this.node.childIndex + 1);
            if (this.node.parent.children[nextSib] !== undefined) {
                this.node = this.node.parent.children[nextSib];
                this.mode = 0;
                return {
                    log : itSpacer + " starting sibling " + nextSib
                };
            } else {
                this.node = this.node.parent;
                this.mode = 2;
                return {
                    log : itSpacer + " no remaining siblings, exit to parent"
                };
            }

        } else {

            return null;

        }

        break;
    };

};
