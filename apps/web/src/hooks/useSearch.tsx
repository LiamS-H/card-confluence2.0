import {
    ScryfallCached,
    type ICachedSearchProps,
    useSearchContext,
} from "@/context/search";
import { ScryfallError } from "@scryfall/api-types";
import { useCallback, useRef, useState } from "react";

export function useSearch() {
    const [result, setResult] = useState<null | ScryfallCached>(null);
    const [error, setError] = useState<null | ScryfallError>(null);
    const [warning, setWarning] = useState<null | string[]>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { cachedSearch } = useSearchContext();

    const queryRef = useRef<null | string>(null);

    const search = useCallback(
        async (req: ICachedSearchProps) => {
            const { query } = req;
            setIsLoading(true);
            queryRef.current = req.query;
            const result = await cachedSearch(req);
            if (queryRef.current !== req.query) return;
            setIsLoading(false);
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
        [cachedSearch]
    );

    return { search, result, error, warning, isLoading };
}
