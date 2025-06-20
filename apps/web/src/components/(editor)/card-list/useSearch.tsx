import { type ICachedSearchProps, useSearchContext } from "@/context/search";
import { ISearchSettings } from "@/lib/scryfall";
import { ScryfallError } from "@scryfall/api-types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const CARD_WIDTH = 200;
export const CARD_HEIGHT = 278.55;
export const GAP = 4;
const OVERSCAN_ROWS = 2;

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

export function useCardListSearch({
    query,
    ast,
    settings,
    fastUpdate,
}: {
    query?: string;
    ast?: string;
    settings?: ISearchSettings;
    fastUpdate: boolean;
}) {
    const {
        search,
        loadNextPage,
        allData,
        error,
        warning,
        isLoading,
        hasNextPage,
        totalCards,
    } = useSearch();

    const containerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const dataRef = useRef(allData);
    dataRef.current = allData;

    useEffect(() => {
        if (!query || fastUpdate) return;
        const timeout = setTimeout(() => {
            search({
                query,
                ast,
                settings: { ...settings, page: 1 },
            });
        }, 1000);
        return () => clearTimeout(timeout);
    }, [search, query, ast, settings, fastUpdate]);

    useEffect(() => {
        if (!query) {
            search(null);
            return;
        }
        if (!fastUpdate) return;
        search({
            query,
            ast,
            settings: { ...settings, page: 1 },
        });
    }, [search, query, ast, settings, fastUpdate]);

    // useEffect(() => {
    //     const handleScroll = () => {
    //         setScrollTop(window.scrollY);
    //     };
    //     window.addEventListener("scroll", handleScroll, { passive: true });
    //     return () => {
    //         window.removeEventListener("scroll", handleScroll);
    //     };
    // }, []);

    useEffect(() => {
        if (!sentinelRef.current || !hasNextPage || isLoading) return;
        if (!query) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    loadNextPage({ query, ast, settings });
                }
            },
            { rootMargin: "100px" }
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isLoading, loadNextPage, query, ast, settings]);

    const [gridLayout, setGridLayout] = useState<{
        columns: number;
        rows: number;
        totalHeight: number;
        visibleItems: {
            index: number;
            id: string;
            x: number;
            y: number;
        }[];
        startRow: number;
        curRow: number;
        endRow: number;
    } | null>(null);

    const calcGrid = useCallback(
        (allData: string[]) => {
            if (!containerRef.current) return null;
            if (allData.length === 0) return null;
            const containerRect = containerRef.current?.getBoundingClientRect();
            const containerWidth = containerRect.width;
            const scrollTop = window.scrollY;
            if (containerWidth === 0) return null;
            const containerTop = containerRect
                ? containerRect.top + scrollTop
                : 0;

            const columns = Math.floor(
                (containerWidth - GAP) / (CARD_WIDTH + GAP)
            );
            if (columns === 0) return null;

            const rows = Math.ceil(allData.length / columns);
            const totalHeight = rows * (CARD_HEIGHT + GAP) - GAP;

            const viewportHeight = window.innerHeight;
            const viewportTop = scrollTop;
            const viewportBottom = scrollTop + viewportHeight;
            const containerRelativeViewportTop = Math.max(
                0,
                viewportTop - containerTop
            );
            const containerRelativeViewportBottom = Math.max(
                0,
                viewportBottom - containerTop
            );

            const firstVisibleRow = Math.floor(
                containerRelativeViewportTop / (CARD_HEIGHT + GAP)
            );
            const lastVisibleRow = Math.ceil(
                containerRelativeViewportBottom / (CARD_HEIGHT + GAP)
            );

            const startRow = Math.max(0, firstVisibleRow - OVERSCAN_ROWS);
            const endRow = Math.min(rows - 1, lastVisibleRow + OVERSCAN_ROWS);

            const visibleItems = [];
            for (let row = startRow; row <= endRow; row++) {
                for (let col = 0; col < columns; col++) {
                    const index = row * columns + col;
                    const id = allData[index];
                    if (!id) continue;
                    if (index < allData.length) {
                        visibleItems.push({
                            index,
                            id,
                            x: col * (CARD_WIDTH + GAP),
                            y: row * (CARD_HEIGHT + GAP),
                        });
                    }
                }
            }

            return {
                columns,
                rows,
                totalHeight,
                visibleItems,
                startRow,
                curRow: lastVisibleRow,
                endRow,
            };
        },
        [containerRef]
    );

    const animationFrameRef = useRef<number | null>(null);

    const debouncedCalcGrid = useCallback(() => {
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(() => {
            animationFrameRef.current = null;
            setGridLayout(calcGrid(dataRef.current));
        });
    }, []);

    useEffect(() => {
        debouncedCalcGrid();
        // setGridLayout(calcGrid(dataRef.current));
    }, [allData, debouncedCalcGrid]);

    useEffect(() => {
        const handleScroll = () => {
            debouncedCalcGrid();
            // setGridLayout(calcGrid(dataRef.current));
        };
        window.addEventListener("scroll", handleScroll);
        return () => {};
    }, [debouncedCalcGrid]);

    return {
        search,
        loadNextPage,
        allData,
        error,
        warning,
        isLoading,
        hasNextPage,
        totalCards,
        containerRef,
        sentinelRef,
        gridLayout,
    };
}
