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
import {
    queriesFromView,
    type Query,
    // astFromView,
    // astToString,
    scrycardsFromCatalog,
    type ICatalog,
} from "codemirror-lang-scrycards";
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
import { Search, Sparkles, SquareCode, TextSearch } from "lucide-react";
import { SimpleToolTip } from "../(ui)/tooltip";

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
    const [ast, setAst] = useState<string | undefined>(undefined);
    const [activeQuery, setActiveQuery] = useState<Query | null>(null);
    const [queries, setQueries] = useState<
        { node: Node; offset: number; query: Query }[]
    >([]);
    const [scryfallSettings, setScryfallSettings] = useState<SearchSettings>(
        {}
    );
    const queryNamesRef = useRef<string[]>([]);
    const activeQueryNameRef = useRef<{ n: string; i: number }>({
        n: "",
        i: 0,
    });
    const [aiOpen, setAiOpen] = useState(false);

    const editorRef = useRef<ReactCodeMirrorRef | null>(null);

    const activateQuery = useCallback(
        (index: number | null) => {
            if (index === null) {
                setActiveQuery(null);
                return;
            }
            const query = queries[index];
            if (!query) {
                throw Error("Invalid Query Index");
            }
            const name = query.query.name.text;
            let count = 0;
            for (let i = 0; i < index; i++) {
                if (queries[i]?.query.name.text === name) {
                    count++;
                }
            }
            setActiveQuery(query.query);
            activeQueryNameRef.current = { n: name, i: count };
        },
        [queries]
    );

    const extensions = useMemo(() => {
        return [
            keymap.of(defaultKeymap),
            keymap.of([{ key: "Tab", run: acceptCompletion }]),
            // keymap.of([{ key: "Tab", run: acceptCompletion }, indentWithTab]),
            scrycardsFromCatalog(catalog),
        ];
    }, [catalog]);

    const onChange = useCallback<NonNullable<ReactCodeMirrorProps["onChange"]>>(
        (value, viewUpdate) => {
            // console.log(
            //     "from completion:",
            //     viewUpdate.transactions[0]?.annotation(
            //         Transaction.userEvent
            //     ) === "input.complete"
            // );
            // setDoc(value);

            const query_name = activeQueryNameRef.current.n;

            const queries = queriesFromView(viewUpdate.view);

            if (!Array.isArray(queries)) {
                setAst(value.replace(/\s/g, ""));
                setActiveQuery({
                    name: {
                        text: "[unnamed]",
                        to: 0,
                        from: 0,
                    },
                    body: queries.body,
                });
                activeQueryNameRef.current = {
                    n: "[unnamed]",
                    i: 0,
                };
                return;
            }

            setQueries(
                queries.map((q) => {
                    const { node, offset } = viewUpdate.view.domAtPos(
                        q.name.to
                    );
                    return { node, offset, query: q };
                })
            );

            const new_query_names = queries.map(
                (q) => q.name.text || "[unnamed]"
            );

            queryNamesRef.current = new_query_names;

            const new_query_names_set = new Set(new_query_names);
            const repeat_index = activeQueryNameRef.current.i;

            if (!new_query_names_set.has(query_name)) {
                setActiveQuery(null);
                setAst(undefined);
                return;
            }

            const candidates = queries.filter(
                (q) => q.name.text === query_name
            );
            if (repeat_index >= candidates.length) {
                setActiveQuery(null);
                setAst(undefined);
                return;
            }

            setAst(value.replace(/\s/g, ""));
            setActiveQuery(candidates[repeat_index] ?? null);
        },
        []
    );

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
                        {queries.map(({ node, offset, query }, i) => {
                            if (!(node instanceof Text)) return null;
                            const range = document.createRange();
                            range.setStart(node, offset);
                            range.setEnd(node, node.length);
                            const rect = range.getBoundingClientRect();
                            range.collapse();
                            const active = query === activeQuery;
                            return (
                                <div
                                    key={i}
                                    className="absolute z-30"
                                    style={{
                                        top: rect.top,
                                        left: rect.x + rect.width,
                                    }}
                                >
                                    <Button
                                        variant={active ? "default" : "outline"}
                                        className="w-0.5 h-0.5"
                                        onClick={
                                            active
                                                ? () => {
                                                      activateQuery(null);
                                                  }
                                                : () => activateQuery(i)
                                        }
                                    >
                                        {active ? <TextSearch /> : <Search />}
                                    </Button>
                                </div>
                            );
                        })}
                    </ReactCodeEditor>
                    <div className={aiOpen ? "w-1/2" : "hidden"}>
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
