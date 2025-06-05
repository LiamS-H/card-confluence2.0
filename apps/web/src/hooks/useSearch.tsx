import { fetchSearch, type SearchSettings } from "@/lib/scryfall";
import { ScryfallError, ScryfallList } from "@scryfall/api-types";
import { useCallback, useState } from "react";

type queryResponse = Awaited<ReturnType<typeof fetchSearch>>;

interface SearchCache {
    strMappings: Map<string, queryResponse>;
    astMappings: Map<string, queryResponse>;
}

const cache: SearchCache = {
    astMappings: new Map(),
    strMappings: new Map(),
};

async function cachedSearch({
    query,
    ast,
    settings,
}: {
    query: string;
    ast?: string;
    settings?: SearchSettings;
}): Promise<queryResponse> {
    const key = query + JSON.stringify(settings);
    let resp: queryResponse | undefined = cache.strMappings.get(key);
    // todo, could check is ast is empty to see if should even query
    if (resp) return resp;
    resp = ast ? cache.astMappings.get(ast) : undefined;
    if (resp) return resp;

    const new_resp = await fetchSearch(query, settings);

    if (ast) {
        cache.astMappings.set(ast, new_resp);
    }
    cache.strMappings.set(key, new_resp);

    return new_resp;
}

export function useSearch() {
    const [result, setResult] = useState<null | ScryfallList.Cards>(null);
    const [error, setError] = useState<null | ScryfallError>(null);
    const [warning, setWarning] = useState<null | string[]>(null);

    const search = useCallback(
        async (req: Parameters<typeof cachedSearch>[0]) => {
            const { query } = req;
            const result = await cachedSearch(req);
            setWarning(result.warnings ?? null);
            if (result.object === "error") {
                setError(result);
                setResult(null);
                return;
            } else if (result.object === "list") {
                setError(null);
                setResult(result);
                return;
            } else {
                console.error(`unexpect object from ${query}:${result}`);
                return;
            }
        },
        []
    );

    return { search, result, error, warning };
}
