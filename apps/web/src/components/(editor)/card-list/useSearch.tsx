import { type ICachedSearchProps, useSearchContext } from "@/context/search";
import { isSettingsEqual } from "@/lib/scrycards";
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
    const queryRef = useRef<null | ICachedSearchProps>(null);

    const resetSearch = useCallback(() => {
        setAllData([]);
        setError(null);
        setWarning(null);
        setIsLoading(false);
        setHasNextPage(false);
        setCurrentPage(0);
        setTotalCards(0);
    }, []);

    const search = useCallback(
        async (req: ICachedSearchProps | null, resetData = true) => {
            if (!req) {
                queryRef.current = null;
                resetSearch();
                return;
            }
            const { query } = req;
            setIsLoading(true);

            const lastQuery = queryRef.current;
            queryRef.current = req;

            if (
                resetData ||
                (lastQuery &&
                    (lastQuery.ast !== req.ast ||
                        lastQuery.query !== req.query))
            ) {
                setAllData([]);
                setCurrentPage(1);
            }

            const result = await cachedSearch(req);

            // Check if query changed while we were fetching
            if (queryRef.current.ast !== req.ast) return;
            if (queryRef.current.query !== req.query) return;
            if (
                !isSettingsEqual(
                    queryRef.current.settings ?? {},
                    req.settings ?? {}
                )
            ) {
                return;
            }
            setIsLoading(false);
            setWarning(result.warnings ?? null);

            if (result.object === "error") {
                setError(result);
                return;
            } else if (result.object === "list") {
                setError(null);
                setHasNextPage(result.has_more ?? false);
                setTotalCards(result.total_cards ?? 0);

                if (resetData) {
                    setAllData(result.data);
                } else {
                    setAllData((prev) => [...prev, ...result.data]);
                }
                setCurrentPage(req.settings?.page ?? 1);
                return;
            } else {
                console.error(`unexpected object from ${query}:${result}`);
                return;
            }
        },
        [cachedSearch, resetSearch]
    );

    const loadNextPageDeps = useRef({
        hasNextPage,
        isLoading,
        currentPage,
    });
    loadNextPageDeps.current = { hasNextPage, isLoading, currentPage };

    const loadNextPage = useCallback(async () => {
        const { hasNextPage, isLoading, currentPage } =
            loadNextPageDeps.current;
        if (!hasNextPage) return;
        if (isLoading) return;

        if (!queryRef.current) return;

        const { ast, settings, query } = queryRef.current;

        await search(
            {
                query,
                ast,
                settings: { ...settings, page: currentPage + 1 },
            },
            false
        );
    }, [search]);

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
