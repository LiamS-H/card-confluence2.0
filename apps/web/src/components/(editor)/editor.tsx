"use client";
import ReactCodeEditor, {
    // Transaction,
    // type ReactCodeMirrorProps,
    type ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { keymap } from "@codemirror/view";
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

export function ScrycardsEditor({ catalog }: { catalog: ICatalog }) {
    const [aiOpen, setAiOpen] = useState(false);
    const editorRef = useRef<ReactCodeMirrorRef | null>(null);

    const {
        doc,
        scryfallSettings,
        setScryfallSettings,
        activateQuery,
        onChange,
        onCreateEditor,
        query,
        computedSettings,
        ast,
        queryNodes,
        fastUpdate,
    } = useQueryDoc();

    const extensions = useMemo(() => {
        return [
            keymap.of(defaultKeymap),
            keymap.of([{ key: "Tab", run: acceptCompletion }]),
            // keymap.of([{ key: "Tab", run: acceptCompletion }, indentWithTab]),
            scrycardsFromCatalog(catalog),
        ];
    }, [catalog]);

    const theme = useLightDark();

    return (
        <div className="flex flex-col gap-2">
            <ScrollHidden>
                <div className="flex flex-col lg:flex-row relative">
                    <ReactCodeEditor
                        className={`flex-grow text-sm font-[monospace] ${aiOpen && "hidden lg:block"}`}
                        ref={editorRef}
                        extensions={extensions}
                        value={doc}
                        theme={theme === "dark" ? "dark" : "light"}
                        onChange={onChange}
                        onCreateEditor={onCreateEditor}
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
                                        <Button
                                            variant={
                                                active ? "default" : "outline"
                                            }
                                            className="w-0.5 h-0.5"
                                            onClick={
                                                active
                                                    ? () => {
                                                          activateQuery(null);
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
                                    </div>
                                );
                            }
                        )}
                    </ReactCodeEditor>
                    <div className={aiOpen ? "flex-grow" : "hidden"}>
                        <AIPrompter doc={doc} setDoc={() => {}} />
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
