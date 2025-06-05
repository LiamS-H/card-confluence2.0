import { EditorView } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

interface TagString {
    prefix?: string;
    argument: string;
    operator: string;
    value: string;
}

// AST Node types
interface ASTNode {
    type: string;
}

interface TagNode extends ASTNode {
    type: "tag";
    tag: TagString;
}

interface BinaryOpNode extends ASTNode {
    type: "or" | "and";
    left: ASTNode;
    right: ASTNode;
}

interface ClauseNode extends ASTNode {
    type: "clause";
    content: ASTNode;
}

type AST = ASTNode;

function parseTagFromCursor(view: EditorView, cursor: any): TagString {
    const tag: TagString = {
        argument: "",
        operator: "",
        value: "",
    };

    cursor.firstChild();

    // Check for prefix
    if (cursor.name === "Prefix") {
        tag.prefix = view.state.sliceDoc(cursor.node.from, cursor.node.to);
        cursor.nextSibling();
    }

    // Get argument
    tag.argument = view.state.sliceDoc(cursor.node.from, cursor.node.to);
    cursor.nextSibling();

    // Get operator
    tag.operator = view.state.sliceDoc(cursor.node.from, cursor.node.to);
    cursor.nextSibling();

    // Get value
    tag.value = view.state.sliceDoc(cursor.node.from, cursor.node.to);

    cursor.parent(); // Return to parent
    return tag;
}

function parseASTFromCursor(view: EditorView, cursor: any): AST | null {
    const nodeName = cursor.name;

    switch (nodeName) {
        case "Tag":
            return {
                type: "tag",
                tag: parseTagFromCursor(view, cursor),
            } as TagNode;

        case "Argument":
            // Standalone argument becomes tag with "n:" prefix
            const argValue = view.state.sliceDoc(
                cursor.node.from,
                cursor.node.to
            );
            return {
                type: "tag",
                tag: {
                    argument: "n",
                    operator: ":",
                    value: argValue,
                },
            } as TagNode;

        case "StringLiteral":
            // String literal becomes tag with "n:" prefix
            const strValue = view.state.sliceDoc(
                cursor.node.from,
                cursor.node.to
            );
            return {
                type: "tag",
                tag: {
                    argument: "n",
                    operator: ":",
                    value: strValue,
                },
            } as TagNode;

        case "Or":
            cursor.firstChild();
            const orLeft = parseASTFromCursor(view, cursor);
            cursor.nextSibling();
            const orRight = parseASTFromCursor(view, cursor);
            cursor.parent();

            return {
                type: "or",
                left: orLeft!,
                right: orRight!,
            } as BinaryOpNode;

        case "And":
            cursor.firstChild();
            const andLeft = parseASTFromCursor(view, cursor);
            cursor.nextSibling();
            const andRight = parseASTFromCursor(view, cursor);
            cursor.parent();

            return {
                type: "and",
                left: andLeft!,
                right: andRight!,
            } as BinaryOpNode;

        case "Clause":
            cursor.firstChild();
            // Skip opening parenthesis if present
            if (cursor.name === "(") {
                cursor.nextSibling();
            }

            const clauseContent = parseASTFromCursor(view, cursor);

            // Skip closing parenthesis if present
            if (cursor.nextSibling() && cursor.name === ")") {
                // Already moved to closing paren
            }

            cursor.parent();
            return {
                type: "clause",
                content: clauseContent!,
            } as ClauseNode;

        case "Program":
            cursor.firstChild();
            const result = parseASTFromCursor(view, cursor);
            cursor.parent();
            return result;

        default:
            // Handle sequences of nodes (implicit AND)
            const children: ASTNode[] = [];

            if (cursor.firstChild()) {
                do {
                    const child = parseASTFromCursor(view, cursor);
                    if (child) {
                        children.push(child);
                    }
                } while (cursor.nextSibling());
                cursor.parent();
            }

            if (children.length === 0) {
                return null;
            } else if (children.length === 1) {
                return children[0];
            } else {
                // Create implicit AND chain
                let result = children[0];
                for (let i = 1; i < children.length; i++) {
                    result = {
                        type: "and",
                        left: result,
                        right: children[i],
                    } as BinaryOpNode;
                }
                return result;
            }
    }
}

export function astFromView(view: EditorView): AST | null {
    const cursor = syntaxTree(view.state).cursor();
    return parseASTFromCursor(view, cursor);
}

export function astToString(ast: AST): string {
    switch (ast.type) {
        case "tag":
            const tagNode = ast as TagNode;
            const tag = tagNode.tag;
            let result = "";
            if (tag.prefix) {
                result += tag.prefix;
            }
            result += tag.argument + tag.operator + tag.value;
            return result;

        case "and":
            const andNode = ast as BinaryOpNode;
            return `${astToString(andNode.left)} ${astToString(andNode.right)}`;

        case "or":
            const orNode = ast as BinaryOpNode;
            const leftStr = astToString(orNode.left);
            const rightStr = astToString(orNode.right);

            // Add parentheses around AND expressions when they're operands of OR
            const leftNeedsParens = orNode.left.type === "and";
            const rightNeedsParens = orNode.right.type === "and";

            const leftFormatted = leftNeedsParens ? `(${leftStr})` : leftStr;
            const rightFormatted = rightNeedsParens
                ? `(${rightStr})`
                : rightStr;

            return `${leftFormatted} or ${rightFormatted}`;

        case "clause":
            const clauseNode = ast as ClauseNode;
            return `(${astToString(clauseNode.content)})`;

        default:
            return "";
    }
}
