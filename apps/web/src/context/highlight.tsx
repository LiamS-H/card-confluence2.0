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
    pushSelected: (id: string) => void;
    replaceSelected: (id: string) => void;
    selected: string | undefined;
    setHovered: (id: string | null) => void;
    hovered: string | null;
    setOpen: (open: boolean) => void;
    open: boolean;
    previous: string | undefined;
    goPrevious?: () => void;
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
    const historyOrder = useRef<string[]>([]);
    const [previous, setPrevious] = useState<string | undefined>();
    const [hovered, setHovered] = useState<string | null>(null);

    const addToHistory = useCallback((id: string) => {
        const index = historyMap.current.get(id);
        if (index !== undefined) {
            historyOrder.current.splice(index, 1);
        }
        historyMap.current.set(id, historyOrder.current.length);
        historyOrder.current.push(id);
    }, []);

    useEffect(() => {
        if (selected && historyOrder.current.length === 0) {
            addToHistory(selected);
        }
    }, [selected, addToHistory]);

    useEffect(() => {
        const onPopState = () => {
            const lastId = historyOrder.current.pop();
            if (lastId) {
                historyMap.current.delete(lastId);
            }
            setPrevious(historyOrder.current.at(-1));
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
            window.history.replaceState(null, "", `?${newParams.toString()}`);
        },
        [searchParams]
    );

    const pushSelected = useCallback(
        (id: string) => {
            if (id === selected) return;
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.set("card", id);
            window.history.pushState(null, "", `?${newParams.toString()}`);
            addToHistory(id);
            setPrevious(historyOrder.current.at(-2));
        },
        [searchParams, selected, addToHistory]
    );

    const replaceSelected = useCallback(
        (id: string) => {
            if (id === selected) return;
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.set("card", id);
            window.history.replaceState(null, "", `?${newParams.toString()}`);

            const lastId = historyOrder.current.pop();
            if (lastId) {
                historyMap.current.delete(lastId);
            }

            addToHistory(id);
        },
        [searchParams, selected, addToHistory]
    );

    const goPrevious = useCallback(() => {
        const lastId = historyOrder.current.pop();
        if (lastId) {
            historyMap.current.delete(lastId);
        }
        const card = historyOrder.current.at(-1);
        setPrevious(historyOrder.current.at(-2));

        if (!card) {
            return;
        }

        const newParams = new URLSearchParams(searchParams.toString());
        const cur_card = newParams.get("card");
        newParams.set("card", card);

        if (!cur_card) {
            window.history.pushState(null, "", `?${newParams.toString()}`);
        } else {
            window.history.replaceState(null, "", `?${newParams.toString()}`);
        }
    }, [searchParams]);

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
