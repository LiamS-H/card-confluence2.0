"use client";
import ReactCodeEditor, {
    type ReactCodeMirrorProps,
    type ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { acceptCompletion } from "@codemirror/autocomplete";
import { useCallback, useMemo, useRef, useState } from "react";

import "react-scrycards/dist/index.css";
import {
    // astFromView,
    // astToString,
    scrycardsFromCatalog,
    type ICatalog,
} from "codemirror-lang-scrycards";
import { useLightDark } from "../(theme)/use-theme";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearch } from "@/hooks/useSearch";
import { Scrycard } from "react-scrycards";

const INITIAL = `-(game:mtga or game:mtgo)
-banned:commander
order:release
direction:desc
`;

export function ScrycardsEditor({ catalog }: { catalog: ICatalog }) {
    const [doc, setDoc] = useState(INITIAL);
    const editorRef = useRef<ReactCodeMirrorRef | null>(null);
    const { search, result, error, warning } = useSearch();

    const onSettle = useDebounce(
        useCallback(() => {
            const query = doc;
            if (!query) return;
            console.log("searching:", query);
            search({ query, settings: {} });
        }, [search, doc]),
        300
    );

    const extensions = useMemo(() => {
        return [
            keymap.of(defaultKeymap),
            keymap.of([{ key: "Tab", run: acceptCompletion }, indentWithTab]),
            scrycardsFromCatalog(catalog),
        ];
    }, [catalog]);

    const onChange = useCallback<NonNullable<ReactCodeMirrorProps["onChange"]>>(
        (value, viewUpdate) => {
            viewUpdate;
            // const ast = astFromView(viewUpdate);
            setDoc(value);
            onSettle();
        },
        [onSettle]
    );

    const theme = useLightDark();
    return (
        <div className="flex flex-col gap-2">
            <ReactCodeEditor
                ref={editorRef}
                extensions={extensions}
                value={doc}
                theme={theme === "dark" ? "dark" : "light"}
                onChange={onChange}
            />
            {error && (
                <div className="w-fit p-4">
                    <div className="p-1 rounded-sm bg-secondary">
                        <div className="flex px-2 rounded-sm gap-2 bg-destructive items-end">
                            <h2 className="text-2xl text-primary-foreground">
                                {error.status}
                            </h2>
                            <h1 className="text-primary-foreground/50">
                                {error.code}
                            </h1>
                        </div>
                        <p className="text-destructive">
                            {error.details.split(" ").map((w) => {
                                if (w.startsWith("https://scryfall.com/")) {
                                    const link = `https://scryfall.com/${w.slice(20)}`;
                                    return (
                                        <a
                                            key={w}
                                            className="text-secondary-foreground hover:text-secondary-foreground/50"
                                            target="_blank"
                                            href={link}
                                        >
                                            {link}{" "}
                                        </a>
                                    );
                                }
                                return w + " ";
                            })}
                        </p>
                    </div>
                </div>
            )}
            {warning && (
                <div>
                    <ul className="flex flex-row flex-wrap w-4xl gap-1">
                        {warning.map((w) => (
                            <li
                                key={w}
                                className="w-fit p-1 rounded-sm bg-secondary text-destructive"
                            >
                                {w}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex flex-wrap gap-1 overflow-y-auto">
                {result?.data.map((c) => <Scrycard card={c} size="lg" />)}
            </div>
        </div>
    );
}
