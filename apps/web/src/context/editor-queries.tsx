import {
    createContext,
    useContext,
    type Dispatch,
    type SetStateAction,
} from "react";
import { ISearchSettings } from "@/lib/scryfall";
import { Query, Settings } from "codemirror-lang-scrycards";

export interface IEditorQueriesContext {
    activateQuery: (index: number | null, fast?: boolean) => void;
    fastUpdate: boolean;
    queryNodes: {
        node: Node;
        offset: number;
        query: Query;
        computed_query: string;
        noSettings: string;
        active: boolean;
        ast: string;
        computed_settings: Settings;
    }[];
    changeDocDomain: (new_domain: string) => void;
    addDocQuery: ({ name, body }: { name: string; body: string }) => void;
    setDocQuery: ({ name, body }: { name: string; body: string }) => void;
    computedQuery: string | undefined;
    ast: string | undefined;
    computedSettings: Settings;
    scryfallSettings: ISearchSettings;
    mergedSettings: ISearchSettings;
    setScryfallSettings: Dispatch<SetStateAction<ISearchSettings>>;
}

export const editorQueriesContext = createContext<IEditorQueriesContext | null>(
    null
);

export function useEditorQueriesContext() {
    const ctx = useContext(editorQueriesContext);
    if (!ctx)
        throw new Error(
            "useEditorQueriesContext must be used within an EditorQueriesProvider"
        );
    return ctx;
}
