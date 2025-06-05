"use client";
import ReactCodeEditor, {
    type ReactCodeMirrorProps,
    type ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { acceptCompletion } from "@codemirror/autocomplete";
import { useCallback, useMemo, useRef, useState } from "react";
import {
    astFromView,
    astToString,
    scrycardsFromCatalog,
    type ICatalog,
} from "codemirror-lang-scrycards";
import { useLightDark } from "../(theme)/use-theme";
import { useDebounce } from "@/hooks/useDebounce";

const INITIAL = `game:arena is:permanent (o:draw or o:reveal)
-o:enters (order:cmc (direction:arena (o:"test o" or o:/[\\/]+/)))
`;

function search() {
    console.log("searching...");
}

export function ScrycardsEditor({ catalog }: { catalog: ICatalog }) {
    const [doc, setDoc] = useState(INITIAL);
    const ref = useRef<ReactCodeMirrorRef | null>(null);
    const onSettle = useDebounce(search, 1000);

    const extensions = useMemo(() => {
        return [
            keymap.of(defaultKeymap),
            keymap.of([{ key: "Tab", run: acceptCompletion }, indentWithTab]),
            scrycardsFromCatalog(catalog),
        ];
    }, [catalog]);

    const onChange = useCallback<NonNullable<ReactCodeMirrorProps["onChange"]>>(
        (value, viewUpdate) => {
            const ast = astFromView(viewUpdate);
            console.log(ast);
            console.log(astToString(ast));
            onSettle();
            setDoc(value);
        },
        []
    );

    const theme = useLightDark();
    return (
        <ReactCodeEditor
            ref={ref}
            extensions={extensions}
            value={doc}
            theme={theme === "dark" ? "dark" : "light"}
            onChange={onChange}
        />
    );
}
