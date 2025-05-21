import { EditorView } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

interface Tag {
    argument: string;
    arg_start: number;
    operator: string;
    op_start: number;
    value: string;
    val_start: number;
}

export function tagFromTree(view: EditorView, pos: number): Tag | null {
    const cursor = syntaxTree(view.state).cursorAt(pos, -1);

    while (cursor.name !== "Tag" && cursor.parent()) {}

    if (cursor.name === "Tag") {
        cursor.firstChild();
        const argument = view.state.sliceDoc(cursor.node.from, cursor.node.to);
        const arg_start = cursor.from;
        cursor.nextSibling();
        const operator = view.state.sliceDoc(cursor.node.from, cursor.node.to);
        const op_start = cursor.from;
        cursor.nextSibling();
        const value = view.state.sliceDoc(cursor.node.from, cursor.node.to);
        const val_start = cursor.from;
        return { argument, arg_start, operator, op_start, value, val_start };
    }

    return null;
}
