"use client";
import { fetchSearch, type ISearchSettings } from "@/lib/scryfall";
import type {
    ScryfallCard,
    ScryfallError,
    ScryfallList,
} from "@scryfall/api-types";
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useRef,
} from "react";
import { useScrycardsContext } from "react-scrycards";

export interface ICachedSearchProps {
    query: string;
    ast?: string;
    settings?: ISearchSettings;
}

export type ScryfallCached = Omit<ScryfallList.Cards, "data"> & {
    data: string[];
};

export type Response = ScryfallCached | ScryfallError;

interface ISearchContext {
    cachedSearch: (prop: ICachedSearchProps) => Promise<Response> | Response;
    cacheResponse: (props: ICachedSearchProps[], resp: Response) => void;
    getCard: (
        id: string
    ) => Promise<ScryfallCard.Any | undefined> | ScryfallCard.Any | undefined;
}

export const searchContext = createContext<ISearchContext | null>(null);

export function useSearchContext() {
    const context = useContext(searchContext);
    if (!context) {
        throw Error("useSearchContext() must be used inside context.");
    }
    return context;
}

export function SearchContextProvider({ children }: { children: ReactNode }) {
    const astMappings = useRef(new Map<string, Response>());
    const strMappings = useRef(new Map<string, Response>());
    const responsePromises = useRef(new Map<string, Promise<Response>>());
    const cardMappings = useRef(
        new Map<string, ScryfallCard.Any | undefined>()
    );
    const { requestCard } = useScrycardsContext();

    const cachedSearch = useCallback(function ({
        query,
        ast,
        settings,
    }: ICachedSearchProps): Promise<Response> | Response {
        const settings_key = JSON.stringify(settings);
        const key = query + settings_key;

        // todo, could check is ast is empty to see if should even query
        const ast_key = ast + settings_key;
        let resp: Response | undefined = ast
            ? astMappings.current.get(ast_key)
            : undefined;
        if (resp) return resp;
        // todo, check first for match then calculate ast (for now with ast placeholder ast are always generated).
        // when scryfall local client gets made we can generate an actual semantic tree from query (which will be more accurate but expensive).
        resp = strMappings.current.get(key);
        if (resp) return resp;

        const p = responsePromises.current.get(key);
        if (p) return p;

        const result = new Promise<Response>(async (resolve) => {
            const new_resp = await fetchSearch(query, settings);
            let new_data: Response;

            if (new_resp.object === "list") {
                const data: string[] = [];
                for (const card of new_resp.data) {
                    data.push(card.id);
                    cardMappings.current.set(card.id, card);
                }

                new_resp.data = [];
                new_data = {
                    ...new_resp,
                    data,
                };
            } else {
                new_data = new_resp;
            }

            if (ast) {
                astMappings.current.set(ast_key, new_data);
            }
            strMappings.current.set(key, new_data);

            resolve(new_data);
            responsePromises.current.delete(key);
        });
        responsePromises.current.set(key, result);

        return result;
    }, []);

    const getCard = useCallback(
        function (id: string) {
            if (cardMappings.current.has(id)) {
                return cardMappings.current.get(id);
            } else {
                return requestCard(id);
            }
        },
        [requestCard]
    );

    const cacheResponse = useCallback(
        (props: ICachedSearchProps[], resp: Response) => {
            for (const { query, ast, settings } of props) {
                const settings_key = JSON.stringify(settings);
                const key = query + settings_key;
                if (strMappings.current.has(key)) continue;
                const ast_key = ast + settings_key;
                if (astMappings.current.has(key)) continue;
                if (ast) {
                    astMappings.current.set(ast_key, resp);
                }
                strMappings.current.set(key, resp);
            }
        },
        []
    );

    return (
        <searchContext.Provider
            value={{ cachedSearch, getCard, cacheResponse }}
        >
            {children}
        </searchContext.Provider>
    );
}
