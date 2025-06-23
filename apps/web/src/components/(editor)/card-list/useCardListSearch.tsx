import {
    useEditorSettingsContext,
    IEditorSettings,
} from "@/context/editor-settings";
import { ISearchSettings } from "@/lib/scryfall";
import { useRef, useEffect, useState, useCallback } from "react";
import { useSearch } from "./useSearch";
export const GAP = 4;
export const OVERSCAN_ROWS = 2;

function calcGrid(
    allData: string[],
    rect: DOMRect,
    editorSettings: IEditorSettings
): {
    cardH: number;
    cardW: number;
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
} | null {
    if (allData.length === 0) return null;
    const containerWidth = rect.width;
    const scrollTop = window.scrollY;
    if (containerWidth === 0) return null;
    const containerTop = rect.top + scrollTop;

    const columns =
        editorSettings.cardColumns ||
        Math.floor((containerWidth - GAP) / (200 + GAP));

    const CARD_WIDTH = Math.floor(
        (containerWidth - GAP - columns * GAP) / columns
    );
    const CARD_HEIGHT = (CARD_WIDTH * 278.55) / 200;

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
                    x: GAP + col * (CARD_WIDTH + GAP),
                    y: GAP + row * (CARD_HEIGHT + GAP),
                });
            }
        }
    }

    return {
        cardH: CARD_HEIGHT,
        cardW: CARD_WIDTH,
        columns,
        rows,
        totalHeight,
        visibleItems,
        startRow,
        curRow: lastVisibleRow,
        endRow,
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

    const [gridLayout, setGridLayout] = useState<ReturnType<
        typeof calcGrid
    > | null>(null);

    const animationFrameRef = useRef<number | null>(null);
    const dataRef = useRef(allData);
    dataRef.current = allData;

    const { settings: editorSettings } = useEditorSettingsContext();
    const editorSettingsRef = useRef(editorSettings);
    editorSettingsRef.current = editorSettings;

    const lastRect = useRef<DOMRect | null>(null);
    const lastDif = useRef<number | null>(null);

    const debouncedCalcGrid = useCallback((force?: boolean) => {
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(() => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const dif = rect.top - window.scrollY;
            if (lastRect.current && lastDif.current && !force) {
                if (
                    lastDif.current === dif &&
                    rect.width === lastRect.current.width
                )
                    return;
            }
            lastDif.current = dif;
            lastRect.current = rect;
            animationFrameRef.current = null;
            setGridLayout(
                calcGrid(dataRef.current, rect, editorSettingsRef.current)
            );
        });
    }, []);

    useEffect(() => {
        debouncedCalcGrid(true);
    }, [allData, editorSettings, debouncedCalcGrid]);

    useEffect(() => {
        const controller = new AbortController();

        window.addEventListener("scroll", () => debouncedCalcGrid(), {
            signal: controller.signal,
        });
        window.addEventListener("resize", () => debouncedCalcGrid(), {
            signal: controller.signal,
        });
        return () => {
            controller.abort();
        };
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
