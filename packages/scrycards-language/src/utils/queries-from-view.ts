import { EditorView } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

export interface Query {
    name: {
        text: string;
        from: number;
        to: number;
    };
    body: {
        text: string;
        from: number;
        to: number;
    };
}

export function queriesFromView(
    view: EditorView
): Query[] | { name: null; body: Query["body"] } {
    const cursor = syntaxTree(view.state).cursor();
    cursor.firstChild();
    if (cursor.name !== "Query") {
        cursor.parent();
        const from = cursor.from;
        const to = cursor.to;
        return {
            name: null,
            body: {
                text: view.state.sliceDoc(from, to),
                from,
                to,
            },
        };
    }

    const queries: Query[] = [];

    while (cursor.name === "Query") {
        cursor.firstChild();
        const name: Query["name"] = {
            text: view.state.sliceDoc(cursor.from, cursor.to),
            from: cursor.from,
            to: cursor.to,
        };

        cursor.nextSibling();
        const from = cursor.from;
        cursor.lastChild();

        if (cursor.name === "Query") {
            cursor.prevSibling();
        }

        const body = {
            text: view.state.sliceDoc(from, cursor.to),
            from,
            to: cursor.to,
        };
        queries.push({ name, body });

        if (!cursor.nextSibling()) break;
    }

    return queries;
}
