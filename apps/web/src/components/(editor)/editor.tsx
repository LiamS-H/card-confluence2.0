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

const INITIAL = `-(game:mtga or game:mtgo)
-banned:commander
order:release
direction:desc
`;

export function ScrycardsEditor({ catalog }: { catalog: ICatalog }) {
    const [doc, setDoc] = useState(INITIAL);
    const [ast, setAst] = useState<string | undefined>(undefined);
    const [scryfallSettings, setScryfallSettings] = useState<SearchSettings>(
        {}
    );
    const editorRef = useRef<ReactCodeMirrorRef | null>(null);

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
            console.log(
                "from completion:",
                viewUpdate.transactions[0]?.annotation(
                    Transaction.userEvent
                ) === "input.complete"
            );

            setAst(value.replace(/\s/g, ""));
            // const ast = astFromView(viewUpdate);
            setDoc(value);
        },
        []
    );

    const theme = useLightDark();
    return (
        <div className="flex flex-col gap-2">
            <ScrollHidden>
                <ReactCodeEditor
                    ref={editorRef}
                    extensions={extensions}
                    value={doc}
                    theme={theme === "dark" ? "dark" : "light"}
                    onChange={onChange}
                />
                <div className="absolute top-full p-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm">
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
            <CardList query={doc} ast={ast} settings={scryfallSettings} />
        </div>
    );
}
