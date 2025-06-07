import { CardModal } from "@/components/(editor)/card-modal";
import { createContext, type ReactNode, useContext, useState } from "react";

export interface IHighlightContext {
    setSelected: (id?: string) => void;
    selected: string | undefined;
    setOpen: (open: boolean) => void;
    open: boolean;
}

const highlightContext = createContext<IHighlightContext | null>(null);

export function useHighlightContext() {
    const context = useContext(highlightContext);
    if (!context) {
        throw Error("useHighlightContext() muse be used in context.");
    }
    return context;
}

export function HighlightContextProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [selected, setSelected] = useState<string | undefined>(undefined);
    const [open, setOpen] = useState<boolean>(false);

    return (
        <highlightContext.Provider
            value={{ selected, setSelected, open, setOpen }}
        >
            {selected && <CardModal />}
            {children}
        </highlightContext.Provider>
    );
}
