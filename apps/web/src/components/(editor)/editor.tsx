"use client";
import ReactCodeEditor, {
    // Transaction,
    // type ReactCodeMirrorProps,
    type ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { EditorView, keymap } from "@codemirror/view";
import {
    defaultKeymap,
    // indentWithTab
} from "@codemirror/commands";
import { acceptCompletion } from "@codemirror/autocomplete";
import { useMemo, useRef, useState } from "react";

import "react-scrycards/dist/index.css";
import { scrycardsFromCatalog, type ICatalog } from "codemirror-lang-scrycards";
import { useLightDark } from "@/components/(theme)/use-theme";
import { ScrollHidden } from "@/components/(ui)/scroll-hidden";
import { CardList } from "./card-list";
import { Button } from "@/components/(ui)/button";

import { AIPrompter } from "./ai-prompter";
import { Copy, Search, TextSearch } from "lucide-react";
import { useQueryDoc } from "@/hooks/useQueryDoc";
import { SearchBar } from "./search-bar";
import { SimpleToolTip } from "../(ui)/tooltip";

export function ScrycardsEditor({ catalog }: { catalog: ICatalog }) {
    const [aiOpen, setAiOpen] = useState(false);
    const editorRef = useRef<ReactCodeMirrorRef | null>(null);

    const {
        doc,
        scryfallSettings,
        setScryfallSettings,
        activateQuery,
        onCreateEditor,
        onUpdate,
        onChange,
        query,
        computedSettings,
        ast,
        queryNodes,
        fastUpdate,
        addDocQuery,
        // changeDocDomain,
    } = useQueryDoc();

    const extensions = useMemo(() => {
        return [
            keymap.of(defaultKeymap),
            keymap.of([{ key: "Tab", run: acceptCompletion }]),
            // keymap.of([{ key: "Tab", run: acceptCompletion }, indentWithTab]),
            scrycardsFromCatalog(catalog),
            EditorView.lineWrapping,
        ];
    }, [catalog]);

    const theme = useLightDark();

    return (
        <div className="flex flex-col gap-2">
            <ScrollHidden>
                <div className="flex flex-col lg:flex-row relative">
                    <ReactCodeEditor
                        className={`flex-grow text-sm font-[monospace] ${aiOpen && "absolute opacity-0 pointer-events-none lg:pointer-events-auto lg:static lg:opacity-100 lg:w-1/2"}`}
                        ref={editorRef}
                        extensions={extensions}
                        value={doc}
                        theme={theme === "dark" ? "dark" : "light"}
                        onCreateEditor={onCreateEditor}
                        onUpdate={onUpdate}
                        onChange={onChange}
                    >
                        {queryNodes.map(
                            ({ node, offset, active, full_query }, i) => {
                                if (!(node instanceof Text)) return null;
                                const range = document.createRange();
                                range.setStart(node, offset);
                                range.setEnd(node, node.length);
                                const rect = range.getBoundingClientRect();
                                range.collapse();
                                return (
                                    <div
                                        key={i}
                                        className="absolute z-30 flex gap-1"
                                        style={{
                                            top: rect.top,
                                            left: rect.x + rect.width,
                                        }}
                                    >
                                        <SimpleToolTip text="Activate query">
                                            <Button
                                                variant={
                                                    active
                                                        ? "default"
                                                        : "outline"
                                                }
                                                className="w-0.5 h-0.5"
                                                onClick={
                                                    active
                                                        ? () => {
                                                              activateQuery(
                                                                  null
                                                              );
                                                          }
                                                        : () => activateQuery(i)
                                                }
                                            >
                                                {active ? (
                                                    <TextSearch />
                                                ) : (
                                                    <Search />
                                                )}
                                            </Button>
                                        </SimpleToolTip>
                                        <SimpleToolTip text="Copy">
                                            <Button
                                                className="w-0.5 h-0.5"
                                                variant="outline"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(
                                                        full_query
                                                    );
                                                }}
                                            >
                                                <Copy />
                                            </Button>
                                        </SimpleToolTip>
                                    </div>
                                );
                            }
                        )}
                    </ReactCodeEditor>
                    <div className={aiOpen ? "lg:w-1/2" : "hidden"}>
                        <AIPrompter
                            catalog={catalog}
                            doc={doc}
                            setDoc={() => {}}
                            addQuery={addDocQuery}
                        />
                    </div>
                </div>
                <SearchBar
                    aiOpen={aiOpen}
                    setAiOpen={setAiOpen}
                    scryfallSettings={scryfallSettings}
                    setScryfallSettings={setScryfallSettings}
                    computedSettings={computedSettings}
                />
            </ScrollHidden>
            <div className="h-9"></div>
            {query && (
                <CardList
                    query={query}
                    ast={ast}
                    settings={scryfallSettings}
                    fastUpdate={fastUpdate}
                />
            )}
        </div>
    );
}
