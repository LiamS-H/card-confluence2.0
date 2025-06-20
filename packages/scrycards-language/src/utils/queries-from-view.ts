import { EditorView } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { detailFromArg, isArgument, nodeFromArg } from "./completion";
import { TreeCursor } from "../types";

interface Settings {
    order?: string;
    dir?: string;
    unique?: string;
}

export interface Query {
    name: {
        text: string;
        from: number;
        to: number;
    };
    body: {
        text: string;
        mergedTextNoSetting: string;
        from: number;
        to: number;
        settings: Settings;
    };
}

export type Domain = {
    text: string;
    noSettingText: string;
    from: number;
    to: number;
    settings: Settings;
};

function extractSettingsFromCursor(
    view: EditorView,
    cursor: TreeCursor
): { settings: Settings; noSettingText: string } {
    const settings: Settings = {};
    cursor.firstChild();
    let noSettingText = "";
    let from = cursor.from;
    do {
        if ((cursor.name as string) !== "Tag") continue;
        cursor.firstChild();
        if ((cursor.name as string) === "Prefix") cursor.nextSibling();
        const arg = view.state.sliceDoc(cursor.from, cursor.to);
        if (!isArgument(arg)) {
            cursor.parent();
            continue;
        }
        const { setting } = nodeFromArg(arg);
        if (!setting) {
            cursor.parent();
            continue;
        }
        cursor.nextSibling();
        cursor.nextSibling();
        const val = view.state.sliceDoc(cursor.from, cursor.to);
        if (val !== "") {
            settings[setting] = val;
        }
        cursor.parent();
        noSettingText += view.state.sliceDoc(from, cursor.from);
        from = cursor.to;
    } while (cursor.nextSibling() && (cursor.name as string) !== "Query");
    if (cursor.name === "Query") {
        cursor.prevSibling();
        if (cursor.to !== from) {
            noSettingText += view.state.sliceDoc(from, cursor.to);
        }
        cursor.nextSibling();
    } else {
        if (cursor.to !== from) {
            noSettingText += view.state.sliceDoc(from, cursor.to);
        }
    }

    return { settings, noSettingText };
}

export function queriesFromView(view: EditorView): {
    domain: Domain | null;
    queries: Query[];
} {
    let domain: Domain | null = null;
    const cursor = syntaxTree(view.state).cursor();
    cursor.firstChild();
    if (cursor.name === "Domain") {
        const from = cursor.from;
        const { settings, noSettingText } = extractSettingsFromCursor(
            view,
            cursor
        );

        if ((cursor.name as string) === "Query") {
            cursor.prevSibling();
            domain = {
                from,
                to: cursor.to,
                text: view.state.sliceDoc(from, cursor.to),
                noSettingText,
                settings,
            };
            cursor.nextSibling();
        } else {
            return {
                queries: [],
                domain: {
                    from,
                    to: cursor.to,
                    text: view.state.sliceDoc(from, cursor.to),
                    noSettingText,
                    settings,
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
        const { settings, noSettingText } = extractSettingsFromCursor(
            view,
            cursor
        );

        if (cursor.name === "Query") {
            cursor.prevSibling();
        }
        const combined_noSettingText =
            (domain?.noSettingText ? domain.noSettingText.trim() + " " : "") +
            noSettingText.trim();

        const body = {
            text: view.state.sliceDoc(from, cursor.to),
            mergedTextNoSetting: combined_noSettingText,
            from,
            to: cursor.to,
            settings,
        };
        queries.push({ name, body });

        if (!cursor.nextSibling()) break;
    }

    return {
        domain,
        queries,
    };
}
