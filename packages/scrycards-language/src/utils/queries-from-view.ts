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

export type Domain = Query["body"];

export function queriesFromView(view: EditorView): {
    domain: Domain | null;
    queries: Query[];
} {
    let domain: Domain | null = null;
    const cursor = syntaxTree(view.state).cursor();
    cursor.firstChild();
    if (cursor.name === "Domain") {
        const from = cursor.from;
        cursor.lastChild();

        if ((cursor.name as string) === "Query") {
            cursor.prevSibling();
            domain = {
                text: view.state.sliceDoc(from, cursor.to),
                from,
                to: cursor.to,
            };
            cursor.nextSibling();
        } else {
            return {
                queries: [],
                domain: {
                    from,
                    to: cursor.to,
                    text: view.state.sliceDoc(from, cursor.to),
                },
            };
        }
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

    return {
        domain,
        queries,
    };
}
