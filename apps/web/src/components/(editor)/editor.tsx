"use client";
import ReactCodeEditor, {
    Transaction,
    type ReactCodeMirrorProps,
    type ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { keymap } from "@codemirror/view";
import {
    defaultKeymap,
    // indentWithTab
} from "@codemirror/commands";
import { acceptCompletion } from "@codemirror/autocomplete";
import { useCallback, useMemo, useRef, useState } from "react";

import "react-scrycards/dist/index.css";
import { scrycardsFromCatalog, type ICatalog } from "codemirror-lang-scrycards";
import { useLightDark } from "@/components/(theme)/use-theme";
import { ScrollHidden } from "@/components/(ui)/scroll-hidden";
import { CardList } from "./card-list";
import { Button } from "@/components/(ui)/button";
import { SearchOrders, SearchSettings } from "@/lib/scryfall";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "../(ui)/dropdown-menu";
import { AIPrompter } from "./ai-prompter";
import { Copy, Search, Sparkles, SquareCode, TextSearch } from "lucide-react";
import { SimpleToolTip } from "../(ui)/tooltip";
import { useQueryDoc } from "@/hooks/useQueryDoc";

const INITIAL = `
@query latest_commander_cards
-(game:mtga or game:mtgo)
-banned:commander
order:release
direction:desc
@query elves
t:elf
`;

export function ScrycardsEditor({ catalog }: { catalog: ICatalog }) {
    const [doc, setDoc] = useState(INITIAL);
    const [aiOpen, setAiOpen] = useState(false);
    const editorRef = useRef<ReactCodeMirrorRef | null>(null);
    const [scryfallSettings, setScryfallSettings] = useState<SearchSettings>(
        {}
    );
    const { activateQuery, onChange, activeQuery, ast, queryNodes } =
        useQueryDoc();

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
                    >
                        {queryNodes.map(
                            ({ node, offset, active, query }, i) => {
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
                                                    query.body.text
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
                        <AIPrompter doc={doc} setDoc={setDoc} />
                    </div>
                </div>
                <div className="absolute top-full p-2 flex items-center gap-2">
                    <SimpleToolTip text={aiOpen ? "Editor Only" : "Open GenAI"}>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setAiOpen((o) => !o)}
                        >
                            {aiOpen ? <SquareCode /> : <Sparkles />}
                        </Button>
                    </SimpleToolTip>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="default">
                                Order: {scryfallSettings.order ?? "select"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {SearchOrders.map((o) => (
                                <DropdownMenuItem
                                    key={o}
                                    disabled={scryfallSettings.order === o}
                                    onClick={() =>
                                        setScryfallSettings((s) => ({
                                            ...s,
                                            order: o,
                                        }))
                                    }
                                >
                                    {o}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </ScrollHidden>
            <div className="h-9"></div>
            {activeQuery && (
                <CardList
                    query={activeQuery.body.text}
                    ast={ast}
                    settings={scryfallSettings}
                />
            )}
        </div>
    );
}
