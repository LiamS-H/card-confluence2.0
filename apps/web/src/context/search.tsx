"use client";
import { fetchRulings, fetchSearch } from "@/lib/scryfall";
import { type ISearchSettings } from "@/lib/search";
import { fetchCardTags } from "../lib/scryfall";
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
    onlyCached?: boolean;
}

export type ScryfallCached = Omit<ScryfallList.Cards, "data"> & {
    data: string[];
};

export type SearchResponse = ScryfallCached | ScryfallError;

export interface IRulingProps {
    scryfall_id: string;
    oracle_id: string;
    onlyCached?: boolean;
}
export type RulingsResponse = ScryfallList.Rulings | ScryfallError;

export interface ITagProps {
    set: string;
    collector_number: string;
    onlyCached?: boolean;
}

interface ISearchContext {
    cachedRulings: (
        props: IRulingProps,
    ) => Promise<RulingsResponse> | RulingsResponse | null;
    cachedSearch: (
        prop: ICachedSearchProps,
    ) => Promise<SearchResponse> | SearchResponse | null;
    cachedTags: (prop: ITagProps) => Promise<string[]> | string[] | null;
    cacheResponse: (props: ICachedSearchProps[], resp: SearchResponse) => void;
    getCard: (
        id?: string,
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
    const astMappings = useRef(new Map<string, SearchResponse>());
    const strMappings = useRef(new Map<string, SearchResponse>());
    const responsePromises = useRef(new Map<string, Promise<SearchResponse>>());
    const cardMappings = useRef(
        new Map<string, ScryfallCard.Any | undefined>(),
    );
    const rulingsMappings = useRef(new Map<string, RulingsResponse>());
    const rulingsPromises = useRef(new Map<string, Promise<RulingsResponse>>());
    const tagPromises = useRef(new Map<string, Promise<string[]>>());
    const tagMappings = useRef(new Map<string, string[]>());
    const { requestCard } = useScrycardsContext();

    const cachedSearch = useCallback(function ({
        query,
        ast,
        settings,
        onlyCached,
    }: ICachedSearchProps) {
        const settings_key = JSON.stringify(settings);
        const key = query + settings_key;

        // todo, could check is ast is empty to see if should even query
        const ast_key = ast + settings_key;
        let resp: SearchResponse | undefined = ast
            ? astMappings.current.get(ast_key)
            : undefined;
        if (resp) return resp;
        // todo, check first for match then calculate ast (for now with ast placeholder ast are always generated).
        // when scryfall local client gets made we can generate an actual semantic tree from query (which will be more accurate but expensive).
        resp = strMappings.current.get(key);
        if (resp) return resp;

        const p = responsePromises.current.get(key);
        if (p) return p;

        if (onlyCached) return null;

        const result = new Promise<SearchResponse>(async (resolve) => {
            const new_resp = await fetchSearch(query, settings);
            let new_data: SearchResponse;

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

    const cachedRulings = useCallback(function ({
        oracle_id,
        scryfall_id,
        onlyCached,
    }: IRulingProps) {
        const cached_ruling = rulingsMappings.current.get(oracle_id);
        if (cached_ruling) return cached_ruling;
        const cached_request = rulingsPromises.current.get(oracle_id);
        if (cached_request) return cached_request;
        if (onlyCached) return null;
        const ruling = fetchRulings(scryfall_id);
        ruling.then((resp) => {
            rulingsMappings.current.set(oracle_id, resp);
            rulingsPromises.current.delete(oracle_id);
        });
        rulingsPromises.current.set(oracle_id, ruling);

        return ruling;
    }, []);

    const cachedTags = useCallback(function ({
        collector_number,
        set,
        onlyCached,
    }: ITagProps) {
        const hash = `${collector_number}:${set}`;
        const cached_ruling = tagMappings.current.get(hash);
        if (cached_ruling) return cached_ruling;
        const cached_request = tagMappings.current.get(hash);
        if (cached_request) return cached_request;
        if (onlyCached) return null;
        const tags = fetchCardTags(set, collector_number);
        tags.then((resp) => {
            tagMappings.current.set(hash, resp);
            tagPromises.current.delete(hash);
        });
        tagPromises.current.set(hash, tags);

        return tags;
    }, []);

    const getCard = useCallback(
        function (id?: string) {
            if (!id) return;
            return cardMappings.current.get(id) || requestCard(id);
        },
        [requestCard],
    );

    const cacheResponse = useCallback(
        (props: ICachedSearchProps[], resp: SearchResponse) => {
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
        [],
    );

    return (
        <searchContext.Provider
            value={{
                cachedSearch,
                cachedRulings,
                cachedTags,
                getCard,
                cacheResponse,
            }}
        >
            {children}
        </searchContext.Provider>
    );
}
