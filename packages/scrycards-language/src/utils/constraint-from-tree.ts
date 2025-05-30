import { EditorView } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

interface TagString {
    prefix?: string;
    argument: string;
    operator: string;
    value: string;
}

interface Constraint {
    type: "tag" | "and" | "or";
    tags?: TagString[];
    children?: Constraint[];
    position?: { from: number; to: number };
}

interface ConstraintContext {
    required: TagString[];

    alternatives: TagString[][];

    forbidden: TagString[];

    currentNode: Constraint;
}

export function parseConstraintsFromTree(
    view: EditorView,
    pos: number
): Constraint | null {
    const cursor = syntaxTree(view.state).cursorAt(pos, -1);

    while (cursor.name !== "Program" && cursor.parent()) {}
    if (cursor.name !== "Program") {
        return null;
    }

    return parseConstraintNode(view, cursor);
}

function parseConstraintNode(view: EditorView, cursor: any): Constraint | null {
    const nodeName = cursor.name;
    const nodePos = { from: cursor.node.from, to: cursor.node.to };

    switch (nodeName) {
        case "Program":
            if (cursor.firstChild()) {
                const children: Constraint[] = [];
                do {
                    const child = parseConstraintNode(view, cursor);
                    if (child) children.push(child);
                } while (cursor.nextSibling());
                cursor.parent();

                if (children.length === 1) {
                    return children[0];
                } else {
                    return {
                        type: "and",
                        children,
                        position: nodePos,
                    };
                }
            }
            break;

        case "Tag":
            return {
                type: "tag",
                tags: [parseTagFromCursor(view, cursor)],
                position: nodePos,
            };

        case "Or":
            return {
                type: "or",
                children: [],
                position: nodePos,
            };

        case "And":
            return {
                type: "and",
                children: [],
                position: nodePos,
            };

        case "Clause":
            if (cursor.firstChild()) {
                const children: Constraint[] = [];
                let currentOperator: "and" | "or" = "and";
                let operandNodes: Constraint[] = [];

                do {
                    if (cursor.name === "Or") {
                        if (operandNodes.length > 0) {
                            children.push(
                                operandNodes.length === 1
                                    ? operandNodes[0]
                                    : { type: "and", children: operandNodes }
                            );
                        }
                        operandNodes = [];
                        currentOperator = "or";
                    } else if (cursor.name === "And") {
                        currentOperator = "and";
                    } else {
                        const child = parseConstraintNode(view, cursor);
                        if (child) operandNodes.push(child);
                    }
                } while (cursor.nextSibling());

                if (operandNodes.length > 0) {
                    children.push(
                        operandNodes.length === 1
                            ? operandNodes[0]
                            : { type: "and", children: operandNodes }
                    );
                }

                cursor.parent();

                if (children.length === 1) {
                    return children[0];
                } else {
                    return {
                        type: currentOperator,
                        children,
                        position: nodePos,
                    };
                }
            }
            break;

        default:
            if (cursor.firstChild()) {
                const child = parseConstraintNode(view, cursor);
                cursor.parent();
                return child;
            }
    }
    return null;
}

function parseTagFromCursor(view: EditorView, cursor: any): TagString {
    const tag: Partial<TagString> = {};

    if (cursor.firstChild()) {
        do {
            const nodeName = cursor.name;
            const nodeText = view.state.sliceDoc(
                cursor.node.from,
                cursor.node.to
            );

            switch (nodeName) {
                case "Prefix":
                    tag.prefix = nodeText;
                    break;
                case "Argument":
                    tag.argument = nodeText;
                    break;
                case "Operator":
                    tag.operator = nodeText;
                    break;
                case "Value":
                case "StringLiteral":
                    if (cursor.firstChild()) {
                        tag.value = view.state.sliceDoc(
                            cursor.node.from,
                            cursor.node.to
                        );
                        cursor.parent();
                    } else {
                        tag.value = nodeText;
                    }
                    break;
            }
        } while (cursor.nextSibling());
        cursor.parent();
    }

    return tag as TagString;
}

export function getConstraintContext(
    view: EditorView,
    pos: number
): ConstraintContext | null {
    const rootConstraint = parseConstraintsFromTree(view, pos);
    if (!rootConstraint) return null;

    const currentNode = findConstraintAtPosition(rootConstraint, pos);
    if (!currentNode) return null;

    return extractContext(rootConstraint, currentNode);
}

function findConstraintAtPosition(
    constraint: Constraint,
    pos: number
): Constraint | null {
    if (
        constraint.position &&
        pos >= constraint.position.from &&
        pos <= constraint.position.to
    ) {
        if (constraint.children) {
            for (const child of constraint.children) {
                const found = findConstraintAtPosition(child, pos);
                if (found) return found;
            }
        }
        return constraint;
    }
    return null;
}

function extractContext(
    rootConstraint: Constraint,
    currentNode: Constraint
): ConstraintContext {
    const context: ConstraintContext = {
        required: [],
        alternatives: [],
        forbidden: [],
        currentNode,
    };

    collectConstraints(rootConstraint, context, currentNode);

    return context;
}

function collectConstraints(
    constraint: Constraint,
    context: ConstraintContext,
    excludeNode?: Constraint
): void {
    if (constraint === excludeNode) return;

    switch (constraint.type) {
        case "tag":
            if (constraint.tags) {
                context.required.push(...constraint.tags);
            }
            break;

        case "and":
            if (constraint.children) {
                for (const child of constraint.children) {
                    collectConstraints(child, context, excludeNode);
                }
            }
            break;

        case "or":
            if (constraint.children) {
                const orGroup: TagString[] = [];
                for (const child of constraint.children) {
                    if (child.type === "tag" && child.tags) {
                        orGroup.push(...child.tags);
                    }
                }
                if (orGroup.length > 0) {
                    context.alternatives.push(orGroup);
                }
            }
            break;
    }
}

export function getValidTagsForPosition(
    view: EditorView,
    pos: number,
    allPossibleTags: TagString[]
): TagString[] {
    const context = getConstraintContext(view, pos);
    if (!context) return allPossibleTags;

    return allPossibleTags.filter((tag) => {
        if (context.required.some((req) => tagsEqual(req, tag))) {
            return false;
        }

        if (context.forbidden.some((forbidden) => tagsEqual(forbidden, tag))) {
            return false;
        }

        return true;
    });
}

function tagsEqual(tag1: TagString, tag2: TagString): boolean {
    return (
        tag1.argument === tag2.argument &&
        tag1.operator === tag2.operator &&
        tag1.value === tag2.value &&
        tag1.prefix === tag2.prefix
    );
}

export function debugConstraintTree(view: EditorView, pos: number): void {
    const constraint = parseConstraintsFromTree(view, pos);
    console.log("Parsed constraint tree:", JSON.stringify(constraint, null, 2));

    const context = getConstraintContext(view, pos);
    console.log("Constraint context:", context);
}
