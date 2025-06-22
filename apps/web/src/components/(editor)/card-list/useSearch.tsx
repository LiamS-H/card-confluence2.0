import { type ICachedSearchProps, useSearchContext } from "@/context/search";
import { ScryfallError } from "@scryfall/api-types";
import { useCallback, useRef, useState } from "react";

export function useSearch() {
    const [allData, setAllData] = useState<string[]>([]);
    const [error, setError] = useState<null | ScryfallError>(null);
    const [warning, setWarning] = useState<null | string[]>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCards, setTotalCards] = useState(0);

    const { cachedSearch } = useSearchContext();
    const queryRef = useRef<null | string>(null);
    const currentQueryRef = useRef<null | string>(null);

    const search = useCallback(
        async (req: ICachedSearchProps | null, resetData = true) => {
            if (!req) {
                queryRef.current = null;
                currentQueryRef.current = null;
                setAllData([]);
                return;
            }
            const { query } = req;
            setIsLoading(true);
            queryRef.current = req.query;

            // If this is a new query, reset all data
            if (resetData || currentQueryRef.current !== query) {
                setAllData([]);
                setCurrentPage(1);
                currentQueryRef.current = query;
            }

            const result = await cachedSearch(req);

            // Check if query changed while we were fetching
            if (queryRef.current !== req.query) return;

            setIsLoading(false);
            setWarning(result.warnings ?? null);

            if (result.object === "error") {
                setError(result);
                if (resetData) {
                    setAllData([]);
                    setHasNextPage(false);
                    setTotalCards(0);
                }
                return;
            } else if (result.object === "list") {
                setError(null);
                setHasNextPage(result.has_more ?? false);
                setTotalCards(result.total_cards ?? 0);

                if (resetData) {
                    setAllData(result.data);
                } else {
                    // Append new data for pagination
                    setAllData((prev) => [...prev, ...result.data]);
                }
                setCurrentPage(req.settings?.page ?? 1);
                return;
            } else {
                console.error(`unexpected object from ${query}:${result}`);
                return;
            }
        },
        [cachedSearch]
    );

    const loadNextPage = useCallback(
        async ({ query, ast, settings }: ICachedSearchProps) => {
            if (!hasNextPage || isLoading) return;

            await search(
                {
                    query,
                    ast,
                    settings: { ...settings, page: currentPage + 1 },
                },
                false // Don't reset data, append instead
            );
        },
        [search, hasNextPage, isLoading, currentPage]
    );

    return {
        search,
        loadNextPage,
        allData,
        error,
        warning,
        isLoading,
        hasNextPage,
        currentPage,
        totalCards,
    };
}
