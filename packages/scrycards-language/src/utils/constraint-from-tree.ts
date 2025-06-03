import { EditorView } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

interface TagString {
    prefix?: string;
    argument: string;
    operator: string;
    value: string;
}

interface Constraint {
    required: TagString[];
    options: TagString[][];
}

export function capturingTagStringsFromTree(
    view: EditorView
): Constraint | null {
    const tree = syntaxTree(view.state);
    const cursor = tree.cursor();

    if (cursor.name !== "Program") {
        return null;
    }

    // Parse the program content
    const result = parseNode(cursor, view);
    if (!result) {
        return null;
    }

    return result;
}

function parseNode(cursor: any, view: EditorView): Constraint | null {
    const nodeName = cursor.name as string;

    switch (nodeName) {
        case "Program":
            return parseProgram(cursor, view);
        case "Or":
            return parseOr(cursor, view);
        case "And":
            return parseAnd(cursor, view);
        case "Clause":
            return parseClause(cursor, view);
        case "Tag":
            return parseTag(cursor, view);
        case "Argument":
            return parseStandaloneArgument(cursor, view);
        case "StringLiteral":
            return parseStringLiteral(cursor, view);
        default:
            // Skip unknown nodes and try children
            if (cursor.firstChild()) {
                const result = parseNode(cursor, view);
                cursor.parent();
                return result;
            }
            return null;
    }
}

function parseProgram(cursor: any, view: EditorView): Constraint | null {
    if (!cursor.firstChild()) {
        return null;
    }

    const children: Constraint[] = [];

    do {
        const childResult = parseNode(cursor, view);
        if (childResult) {
            children.push(childResult);
        }
    } while (cursor.nextSibling());

    cursor.parent();

    if (children.length === 0) {
        return null;
    }

    // Combine all children with AND logic (since they're at program level)
    return combineWithAnd(children);
}

function parseOr(cursor: any, view: EditorView): Constraint | null {
    // For OR nodes, we need to collect the operands before and after
    // Since OR has lower precedence, we need to look at siblings
    cursor.parent(); // Go back to parent to collect all operands

    const operands: Constraint[] = [];
    let foundOr = false;

    if (cursor.firstChild()) {
        do {
            if (cursor.name === "Or") {
                foundOr = true;
                continue;
            }

            const operand = parseNode(cursor, view);
            if (operand) {
                operands.push(operand);
            }
        } while (cursor.nextSibling());

        cursor.parent();
    }

    if (!foundOr || operands.length < 2) {
        return null;
    }

    return combineWithOr(operands);
}

function parseAnd(cursor: any, view: EditorView): Constraint | null {
    // AND is mostly implicit, but when explicit, treat like program
    cursor.parent();

    const operands: Constraint[] = [];

    if (cursor.firstChild()) {
        do {
            if (cursor.name === "And") {
                continue;
            }

            const operand = parseNode(cursor, view);
            if (operand) {
                operands.push(operand);
            }
        } while (cursor.nextSibling());

        cursor.parent();
    }

    return combineWithAnd(operands);
}

function parseClause(cursor: any, view: EditorView): Constraint | null {
    if (!cursor.firstChild()) {
        return null;
    }

    const children: Constraint[] = [];
    let hasOr = false;

    do {
        if (cursor.name === "Or") {
            hasOr = true;
            continue;
        }

        const childResult = parseNode(cursor, view);
        if (childResult) {
            children.push(childResult);
        }
    } while (cursor.nextSibling());

    cursor.parent();

    if (children.length === 0) {
        return null;
    }

    if (hasOr) {
        return combineWithOr(children);
    } else {
        return combineWithAnd(children);
    }
}

function parseTag(cursor: any, view: EditorView): Constraint | null {
    if (!cursor.firstChild()) {
        return null;
    }

    let prefix: string | undefined;
    let argument: string = "";
    let operator: string = "";
    let value: string = "";

    // Check for prefix first
    if (cursor.name === "Prefix") {
        prefix = view.state.sliceDoc(cursor.node.from, cursor.node.to);
        cursor.nextSibling();
    }

    // Get argument
    if (cursor.name === "Argument") {
        argument = view.state.sliceDoc(cursor.node.from, cursor.node.to);
        cursor.nextSibling();
    }

    // Get operator
    if (cursor.name === "Operator") {
        operator = view.state.sliceDoc(cursor.node.from, cursor.node.to);
        cursor.nextSibling();
    }

    // Get value
    if (cursor.name === "Value") {
        if (cursor.firstChild()) {
            value = view.state.sliceDoc(cursor.node.from, cursor.node.to);
            cursor.parent();
        }
    }

    cursor.parent();

    const tag: TagString = {
        argument,
        operator,
        value,
    };

    if (prefix) {
        tag.prefix = prefix;
    }

    return {
        required: [tag],
        options: [],
    };
}

function parseStandaloneArgument(
    cursor: any,
    view: EditorView
): Constraint | null {
    const argument = view.state.sliceDoc(cursor.node.from, cursor.node.to);

    const tag: TagString = {
        argument: "n",
        operator: ":",
        value: argument,
    };

    return {
        required: [tag],
        options: [],
    };
}

function parseStringLiteral(cursor: any, view: EditorView): Constraint | null {
    const value = view.state.sliceDoc(cursor.node.from, cursor.node.to);

    const tag: TagString = {
        argument: "n",
        operator: ":",
        value: value,
    };

    return {
        required: [tag],
        options: [],
    };
}

function combineWithAnd(constraints: Constraint[]): Constraint {
    const required: TagString[] = [];
    const options: TagString[][] = [];

    for (const constraint of constraints) {
        required.push(...constraint.required);
        options.push(...constraint.options);
    }

    return { required, options };
}

function combineWithOr(constraints: Constraint[]): Constraint {
    const options: TagString[][] = [];

    for (const constraint of constraints) {
        if (constraint.required.length > 0 && constraint.options.length === 0) {
            // This is a simple required constraint, add it as an option
            options.push(constraint.required);
        } else if (constraint.options.length > 0) {
            // This has options, add all of them
            options.push(...constraint.options);
        }
    }

    return {
        required: [],
        options: options,
    };
}

// Helper function to detect OR operations in a sequence of siblings
function detectOrPattern(cursor: any, view: EditorView): Constraint | null {
    const parts: Constraint[] = [];
    let hasOrOperator = false;

    if (cursor.firstChild()) {
        do {
            if (cursor.name === "Or") {
                hasOrOperator = true;
                continue;
            }

            const part = parseNode(cursor, view);
            if (part) {
                parts.push(part);
            }
        } while (cursor.nextSibling());

        cursor.parent();
    }

    if (hasOrOperator && parts.length >= 2) {
        return combineWithOr(parts);
    } else if (parts.length > 0) {
        return combineWithAnd(parts);
    }

    return null;
}
