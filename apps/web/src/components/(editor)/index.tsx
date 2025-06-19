"use client";

import { useState } from "react";

import "react-scrycards/dist/index.css";
import { type ICatalog } from "codemirror-lang-scrycards";
import { ScrollHidden } from "@/components/(ui)/scroll-hidden";
import { CardList } from "./card-list";

import { AIPrompter } from "./ai-prompter";
import { useQueryDoc } from "@/hooks/useQueryDoc";
import { SearchBar } from "./search-bar";
import { Editor } from "./editor";

export function ScrycardsEditor({ catalog }: { catalog: ICatalog }) {
    const [aiOpen, setAiOpen] = useState(false);

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

    return (
        <div className="flex flex-col gap-2">
            <ScrollHidden>
                <div className="flex flex-col lg:flex-row relative">
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
