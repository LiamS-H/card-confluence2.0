"use client";

import { useMemo, useState } from "react";

import { type ICatalog } from "codemirror-lang-scrycards";
import { ScrollHidden } from "@/components/(ui)/scroll-hidden";
import { CardList } from "@/components/(editor)/card-list";

import { AIPrompter } from "@/components/(editor)/ai-prompter";
import { useQueryDoc } from "@/hooks/useQueryDoc";
import { SearchBar } from "@/components/(editor)/search-bar";
import { Editor } from "@/components/(editor)/editor";
import { useCardListSearch } from "./card-list/useCardListSearch";
import { mergeObjects } from "@/lib/utils";
import { ISearchSettings } from "@/lib/scryfall";
import { SimpleToolTip } from "@/components/(ui)/tooltip";
import { Button } from "@/components/(ui)/button";
import { Sparkles, SquareCode } from "lucide-react";

export function ScrycardsEditor({ catalog }: { catalog: ICatalog }) {
    const [aiOpen, setAiOpen] = useState(false);

    const {
        doc,
        scryfallSettings: settings,
        setScryfallSettings,
        activateQuery,
        onCreateEditor,
        onUpdate,
        onChange,
        computedQuery: query,
        computedSettings,
        ast,
        queryNodes,
        fastUpdate,
        addDocQuery,
        // changeDocDomain,
    } = useQueryDoc();

    const merged_settings = useMemo(() => {
        return mergeObjects(settings, computedSettings);
    }, [settings, computedSettings]);

    const searchObj = useCardListSearch({
        query,
        ast,
        settings: merged_settings,
        // settings,
        fastUpdate,
    });
    const { gridLayout, totalCards } = searchObj;

    return (
        <div className="flex flex-col gap-2">
            <ScrollHidden>
                <div className="flex flex-col lg:flex-row relative">
                    <div className="absolute bottom-[1] left-1 z-10">
                        <SimpleToolTip
                            text={aiOpen ? "Editor Only" : "Open GenAI"}
                        >
                            <Button
                                className="w-4 h-4"
                                variant="outline"
                                size="icon"
                                onClick={() => setAiOpen((o) => !o)}
                            >
                                {aiOpen ? (
                                    <SquareCode className="h-[2px] w-[2px]" />
                                ) : (
                                    <Sparkles />
                                )}
                            </Button>
                        </SimpleToolTip>
                    </div>

                    <Editor
                        doc={doc}
                        catalog={catalog}
                        onCreateEditor={onCreateEditor}
                        onUpdate={onUpdate}
                        onChange={onChange}
                        queryNodes={queryNodes}
                        activateQuery={activateQuery}
                        className={`flex-grow text-sm ${aiOpen && "absolute opacity-0 pointer-events-none lg:pointer-events-auto lg:static lg:opacity-100 lg:w-1/2"}`}
                    />
                    <div
                        className={`w-full flex justify-center p-2 ${aiOpen ? "lg:w-1/2" : "hidden"}`}
                    >
                        <AIPrompter
                            catalog={catalog}
                            doc={doc}
                            setDoc={() => {}}
                            addQuery={addDocQuery}
                        />
                    </div>
                </div>
                <SearchBar
                    progress={
                        gridLayout
                            ? gridLayout.rows > 3
                                ? (gridLayout.curRow * gridLayout.columns) /
                                  totalCards
                                : null
                            : null
                    }
                    scryfallSettings={settings}
                    setScryfallSettings={setScryfallSettings}
                    computedSettings={computedSettings as ISearchSettings}
                />
            </ScrollHidden>
            <div className="h-12"></div>
            <CardList search={searchObj} />
        </div>
    );
}
