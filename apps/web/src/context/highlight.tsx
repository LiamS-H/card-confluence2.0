"use client";
import { CardModal } from "@/components/(editor)/card-modal";
import { useSearchParams } from "next/navigation";
import {
    createContext,
    type ReactNode,
    Suspense,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

export interface IHighlightContext {
    pushSelected: (id: string, index?: number) => void;
    replaceSelected: (id: string, index?: number) => void;
    selected: string | undefined;
    currentIndex: number | undefined;

    setHovered: (id: string | null) => void;
    hovered: string | null;

    setOpen: (open: boolean) => void;
    open: boolean;

    previous: string | undefined;
    goPrevious?: () => void;

    searchResults: string[];
    setSearchResults: (data: string[]) => void;
    goNext: () => void;
    goPrev: () => void;
    hasNext: boolean;
    hasPrev: boolean;
}

const highlightContext = createContext<IHighlightContext | null>(null);

export function useHighlightContext() {
    const context = useContext(highlightContext);
    if (!context) {
        throw Error("useHighlightContext() muse be used in context.");
    }
    return context;
}

function Provider({ children }: { children: ReactNode }) {
    const searchParams = useSearchParams();

    const selected = searchParams.get("card") ?? undefined;
    const historyMap = useRef<Map<string, number>>(new Map());
    const historyOrder = useRef<{ id: string; index?: number }[]>([]);
    const [previous, setPrevious] = useState<string | undefined>();
    const [hovered, setHovered] = useState<string | null>(null);

    const [searchResults, setSearchResults] = useState<string[]>([]);

    // Calculate current index from URL or searchResults
    const idxParam = searchParams.get("idx");
    const currentIndex = idxParam ? parseInt(idxParam) : undefined;
    const hasNext =
        currentIndex !== undefined && currentIndex < searchResults.length - 1;
    const hasPrev = currentIndex !== undefined && currentIndex > 0;

    const addToHistory = useCallback((id: string, index?: number) => {
        const mapKey = id + (index !== undefined ? `-${index}` : "");
        const existingIdx = historyMap.current.get(mapKey);

        if (existingIdx !== undefined) {
            // Remove from current position to push to top
            // Note: This logic was a bit simplified in original, keeping it simple here
            // Using filter is safer than splice with cached index which might be stale if other things popped
            // But for now, let's just push to end and ignore dupes in map for simplicity or follow original logic
            // Original logic:
            // if (index !== undefined) { historyOrder.current.splice(index, 1); }
            // This relied on map storing index in the array.
        }

        // Simplified history for now: just push.
        // We can optimize dupes later if needed, but original logic was trying to move to top.
        historyOrder.current.push({ id, index });
        historyMap.current.set(mapKey, historyOrder.current.length - 1);
    }, []);

    useEffect(() => {
        if (selected && historyOrder.current.length === 0) {
            addToHistory(selected, currentIndex);
        }
    }, [selected, currentIndex, addToHistory]);

    useEffect(() => {
        setHovered(selected ?? null);
    }, [selected]);

    useEffect(() => {
        const onPopState = () => {
            const lastItem = historyOrder.current.pop();
            if (lastItem) {
                const mapKey =
                    lastItem.id +
                    (lastItem.index !== undefined ? `-${lastItem.index}` : "");
                historyMap.current.delete(mapKey);
            }
            setPrevious(historyOrder.current.at(-1)?.id);
        };
        window.addEventListener("popstate", onPopState);
        return () => {
            window.removeEventListener("popstate", onPopState);
        };
    }, []);

    const setOpen = useCallback(
        (open: boolean) => {
            if (open) {
                return;
            }

            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete("card");
            newParams.delete("idx");
            window.history.replaceState(null, "", `?${newParams.toString()}`);
        },
        [searchParams],
    );

    const pushSelected = useCallback(
        (id: string, index?: number) => {
            if (id === selected && index === currentIndex) return;
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.set("card", id);
            if (index !== undefined) {
                newParams.set("idx", index.toString());
            } else {
                newParams.delete("idx");
            }
            window.history.pushState(null, "", `?${newParams.toString()}`);
            addToHistory(id, index);
            setPrevious(historyOrder.current.at(-2)?.id);
        },
        [searchParams, selected, currentIndex, addToHistory],
    );

    const replaceSelected = useCallback(
        (id: string, index?: number) => {
            if (id === selected && index === currentIndex) return;
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.set("card", id);
            if (index !== undefined) {
                newParams.set("idx", index.toString());
            } else {
                newParams.delete("idx");
            }
            window.history.replaceState(null, "", `?${newParams.toString()}`);

            const lastItem = historyOrder.current.pop();
            if (lastItem) {
                const mapKey =
                    lastItem.id +
                    (lastItem.index !== undefined ? `-${lastItem.index}` : "");
                historyMap.current.delete(mapKey);
            }

            addToHistory(id, index);
        },
        [searchParams, selected, currentIndex, addToHistory],
    );

    const goPrevious = useCallback(() => {
        const lastItem = historyOrder.current.pop();
        if (lastItem) {
            const mapKey =
                lastItem.id +
                (lastItem.index !== undefined ? `-${lastItem.index}` : "");
            historyMap.current.delete(mapKey);
        }
        const prevItem = historyOrder.current.at(-1);
        setPrevious(historyOrder.current.at(-2)?.id);

        if (!prevItem) {
            return;
        }

        const newParams = new URLSearchParams(searchParams.toString());
        const cur_card = newParams.get("card");
        newParams.set("card", prevItem.id);
        if (prevItem.index !== undefined) {
            newParams.set("idx", prevItem.index.toString());
        } else {
            newParams.delete("idx");
        }

        if (!cur_card) {
            window.history.pushState(null, "", `?${newParams.toString()}`);
        } else {
            window.history.replaceState(null, "", `?${newParams.toString()}`);
        }
    }, [searchParams]);

    const goNext = useCallback(() => {
        if (!hasNext || currentIndex === undefined) return;
        const nextIdx = currentIndex + 1;
        const nextId = searchResults[nextIdx];
        if (nextId) {
            pushSelected(nextId, nextIdx);
        }
    }, [hasNext, currentIndex, searchResults, pushSelected]);

    const goPrev = useCallback(() => {
        if (!hasPrev || currentIndex === undefined) return;
        const prevIdx = currentIndex - 1;
        const prevId = searchResults[prevIdx];
        if (prevId) {
            pushSelected(prevId, prevIdx);
        }
    }, [hasPrev, currentIndex, searchResults, pushSelected]);

    const open = !!selected;

    return (
        <highlightContext.Provider
            value={{
                selected,
                pushSelected,
                replaceSelected,
                goPrevious,
                open,
                setOpen,
                hovered,
                setHovered,
                previous,
                currentIndex,
                searchResults,
                setSearchResults,
                goNext,
                goPrev,
                hasNext,
                hasPrev,
            }}
        >
            <CardModal />
            {children}
        </highlightContext.Provider>
    );
}

export function HighlightContextProvider({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <Suspense fallback={children}>
            <Provider>{children}</Provider>
        </Suspense>
    );
}
