import { useMemo } from "react";
import { Card } from "@/components/(editor)/card";
import { OBSERVER_ROWS, useCardListSearch } from "./useCardListSearch";

export function CardList({
    search: {
        allData,
        error,
        warning,
        isLoading,
        hasNextPage,
        totalCards,
        containerRef,
        sentinelRef,
        gridLayout,
    },
}: {
    search: ReturnType<typeof useCardListSearch>;
}) {
    const memoized_error = useMemo(() => {
        if (!error) return null;
        return (
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
        );
    }, [error]);

    const memoized_warning = useMemo(() => {
        if (!warning) return null;
        return (
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
        );
    }, [warning]);

    const memoized_list = useMemo(() => {
        return (
            <div
                ref={containerRef}
                className="relative w-full"
                style={{
                    minHeight: gridLayout?.totalHeight || "auto",
                }}
            >
                {allData.length === 0 && isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        {gridLayout?.visibleItems.map((item) => (
                            <div
                                key={item.id}
                                className="absolute"
                                style={{
                                    left: item.x,
                                    top: item.y,
                                    width: gridLayout.cardW,
                                    height: gridLayout.cardH,
                                }}
                            >
                                <Card id={item.id} width={gridLayout.cardW} />
                            </div>
                        ))}

                        {isLoading && allData.length > 0 && (
                            <div
                                className="absolute w-full flex justify-center py-4"
                                style={{
                                    top: gridLayout?.totalHeight || 0,
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
                                    top:
                                        (gridLayout?.totalHeight ?? 0) -
                                        (gridLayout?.cardH ?? 0) *
                                            OBSERVER_ROWS,
                                }}
                            />
                        )}

                        {allData.length > 0 && (
                            <div
                                className="absolute w-full text-center text-sm text-muted-foreground py-2"
                                style={{
                                    top:
                                        (gridLayout?.totalHeight || 0) +
                                        (isLoading ? 40 : 0),
                                }}
                            >
                                Showing {allData.length} of {totalCards} cards
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }, [
        allData,
        isLoading,
        hasNextPage,
        totalCards,
        gridLayout,
        containerRef,
        sentinelRef,
    ]);

    return (
        <>
            {memoized_error}
            {memoized_warning}
            {memoized_list}
        </>
    );
}
