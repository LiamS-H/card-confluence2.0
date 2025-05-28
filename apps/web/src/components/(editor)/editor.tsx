"use client";
import ReactCodeEditor from "@uiw/react-codemirror";
import { keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { acceptCompletion } from "@codemirror/autocomplete";
import { useMemo, useState } from "react";
import { scrycardsFromCatalog, type ICatalog } from "codemirror-lang-scrycards";
import { useLightDark } from "../(theme)/use-theme";

const INITIAL = `game:arena is:permanent (o:draw or o:reveal)
-o:enters (order:cmc (direction:arena (o:"test o" or o:/[\\/]+/)))
`;

export function ScrycardsEditor({ catalog }: { catalog: ICatalog }) {
    const [doc, setDoc] = useState(INITIAL);
    const extensions = useMemo(() => {
        return [
            keymap.of(defaultKeymap),
            keymap.of([{ key: "Tab", run: acceptCompletion }, indentWithTab]),
            scrycardsFromCatalog(catalog),
        ];
    }, [catalog]);
    const theme = useLightDark();
    return (
        <ReactCodeEditor
            extensions={extensions}
            value={doc}
            theme={theme === "dark" ? "dark" : "light"}
            onChange={(value) => {
                setDoc(value);
            }}
        />
    );
}
