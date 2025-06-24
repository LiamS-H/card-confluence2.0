"use client";

import { type ICatalog } from "codemirror-lang-scrycards";
import { ScrollHidden } from "@/components/(ui)/scroll-hidden";
import { CardList } from "@/components/(editor)/card-list";

import { useQueryDoc } from "@/hooks/useQueryDoc";
import { SearchBar } from "@/components/(editor)/search-bar";
import { Editor } from "@/components/(editor)/editor";
import { useCardListSearch } from "./card-list/useCardListSearch";
import { Sparkles, SquareCode } from "lucide-react";
import { AIPrompter } from "./ai-prompter";
import { editorQueriesContext } from "@/context/editor-queries";
import { useEditorSettingsContext } from "@/context/editor-settings";
import { AIOpenButton } from "./ai-open-button";

export function ScrycardsEditor({ catalog }: { catalog: ICatalog }) {
    const { doc, onCreateEditor, onUpdate, onChange, context } = useQueryDoc();
    const {
        settings: { hideAiPrompter },
    } = useEditorSettingsContext();
    const aiOpen = !hideAiPrompter;

    const { mergedSettings, computedQuery: query, ast, fastUpdate } = context;

    const searchObj = useCardListSearch({
        query,
        ast,
        settings: mergedSettings,
        fastUpdate,
    });
    const { gridLayout, totalCards } = searchObj;

    return (
        <editorQueriesContext.Provider value={context}>
            <div className="flex flex-col gap-2">
                <ScrollHidden>
                    <div className="flex flex-col lg:flex-row relative">
                        <div
                            className={`absolute bottom-[1] left-1 z-20 ${aiOpen ? "hidden lg:block" : ""}`}
                        >
                            <AIOpenButton
                                className="w-4 h-4"
                                variant="outline"
                                size="icon"
                            >
                                {aiOpen ? (
                                    <SquareCode className="h-[2px] w-[2px]" />
                                ) : (
                                    <Sparkles />
                                )}
                            </AIOpenButton>
                        </div>

                        <Editor
                            doc={doc}
                            catalog={catalog}
                            onCreateEditor={onCreateEditor}
                            onUpdate={onUpdate}
                            onChange={onChange}
                            className={`flex-grow text-sm bg-white dark:bg-[#292c34] ${aiOpen && "absolute opacity-0 pointer-events-none lg:pointer-events-auto lg:static lg:opacity-100 lg:w-1/2"}`}
                        />
                        <div
                            className={`w-full flex justify-center ${aiOpen ? "lg:w-1/2" : "hidden"}`}
                        >
                            <AIPrompter catalog={catalog} />
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
                    />
                </ScrollHidden>
                <div className="h-12"></div>
                <CardList search={searchObj} />
            </div>
        </editorQueriesContext.Provider>
    );
}
