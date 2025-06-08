import { useDebounce } from "@/hooks/useDebounce";
import { useSearch } from "@/hooks/useSearch";
import { Card } from "./card";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CARD_WIDTH = 200;
const CARD_HEIGHT = 278.55;
const GAP = 4;

export function CardList({
    query,
    ast,
}: {
    query: string;
    ast: string | undefined;
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
    const [containerWidth, setContainerWidth] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    useDebounce(
        useCallback(() => {
            if (!query) return;
            search({ query, ast, settings: { page: 1 } });
        }, [search, query, ast]),
        750
    );

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        const updateViewportHeight = () => {
            setViewportHeight(window.innerHeight);
        };

        updateViewportHeight();
        window.addEventListener("resize", updateViewportHeight);
        return () => window.removeEventListener("resize", updateViewportHeight);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrollTop(window.scrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!sentinelRef.current || !hasNextPage || isLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    loadNextPage(query, ast);
                }
            },
            {
                rootMargin: "100px",
            }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isLoading, loadNextPage, query, ast]);

    const gridLayout = useMemo(() => {
        if (containerWidth === 0) return { columns: 0, visibleItems: [] };

        const columns = Math.floor((containerWidth - GAP) / (CARD_WIDTH + GAP));
        if (columns === 0) return { columns: 0, visibleItems: [] };

        const rows = Math.ceil(allData.length / columns);
        const totalHeight = rows * (CARD_HEIGHT + GAP) - GAP;

        const containerRect = containerRef.current?.getBoundingClientRect();
        const containerTop = containerRect ? containerRect.top + scrollTop : 0;

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

        const bufferRows = 2;
        const startRow = Math.max(0, firstVisibleRow - bufferRows);
        const endRow = Math.min(rows - 1, lastVisibleRow + bufferRows);

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
            endRow,
        };
    }, [containerWidth, allData.length, allData, scrollTop, viewportHeight]);

    const memoized_list = useMemo(
        () => (
            <>
                {error && (
                    <div className="w-fit p-4">
                        <div className="p-1 rounded-sm bg-secondary">
                            <div className="flex px-2 rounded-sm gap-2 bg-destructive items-end">
                                <h2 className="text-2xl text-primary-foreground">
                                    {error.status}
                                </h2>
                                <h1 className="text-primary-foreground/50">
                                    {error.code}
                                </h1>
                            </div>
                            <p className="text-destructive">
                                {error.details.split(" ").map((w) => {
                                    if (w.startsWith("https://scryfall.com/")) {
                                        const link = `https://scryfall.com/${w.slice(20)}`;
                                        return (
                                            <a
                                                key={w}
                                                className="text-secondary-foreground hover:text-secondary-foreground/50"
                                                target="_blank"
                                                href={link}
                                            >
                                                {link}{" "}
                                            </a>
                                        );
                                    }
                                    return w + " ";
                                })}
                            </p>
                        </div>
                    </div>
                )}
                {warning && (
                    <div>
                        <ul className="flex flex-row flex-wrap w-4xl gap-1">
                            {warning.map((w) => (
                                <li
                                    key={w}
                                    className="w-fit p-1 rounded-sm bg-secondary text-destructive"
                                >
                                    {w}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div
                    ref={containerRef}
                    className="mr-4 relative"
                    style={{
                        minHeight: gridLayout.totalHeight || "auto",
                    }}
                >
                    {allData.length === 0 && isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <>
                            {gridLayout.visibleItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="absolute"
                                    style={{
                                        left: item.x,
                                        top: item.y,
                                        width: CARD_WIDTH,
                                        height: CARD_HEIGHT,
                                    }}
                                >
                                    <Card id={item.id} />
                                </div>
                            ))}

                            {isLoading && allData.length > 0 && (
                                <div
                                    className="absolute w-full flex justify-center py-4"
                                    style={{
                                        top: gridLayout.totalHeight || 0,
                                    }}
                                >
                                    <p>Loading more cards...</p>
                                </div>
                            )}

                            {hasNextPage && (
                                <div
                                    ref={sentinelRef}
                                    className="absolute w-full h-4"
                                    style={{
                                        top: Math.max(
                                            0,
                                            (gridLayout.totalHeight || 0) - 200
                                        ),
                                    }}
                                />
                            )}

                            {allData.length > 0 && (
                                <div
                                    className="absolute w-full text-center text-sm text-muted-foreground py-2"
                                    style={{
                                        top:
                                            (gridLayout.totalHeight || 0) +
                                            (isLoading ? 40 : 0),
                                    }}
                                >
                                    Showing {allData.length} of {totalCards}{" "}
                                    cards
                                    {!hasNextPage &&
                                        allData.length < totalCards &&
                                        " (some results may be filtered)"}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </>
        ),
        [
            allData,
            error,
            warning,
            isLoading,
            hasNextPage,
            totalCards,
            gridLayout,
        ]
    );

    return memoized_list;
}
