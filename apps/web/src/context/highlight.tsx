import { CardModal } from "@/components/(editor)/card-modal";
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";

export interface IHighlightContext {
    pushSelected: (id: string) => void;
    popSelected?: () => void;
    selected: string | undefined;
    setHovered: (id: string) => void;
    hovered: string | undefined;
    setOpen: (open: boolean) => void;
    open: boolean;
    previous: string | undefined;
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
    const [hovered, setHovered] = useState<string | undefined>(undefined);
    const [selected, setSelected] = useState<string | undefined>(undefined);
    const [previous, setPrevious] = useState<string | undefined>(undefined);
    const [length, setLength] = useState(0);
    const selectionsRef = useRef<string[]>([]);
    const [open, setOpen] = useState<boolean>(false);

    const pushSelected = useCallback((id: string) => {
        setSelected(id);
        const prev = selectionsRef.current.at(-1);
        if (prev !== id) {
            setPrevious(prev);
            selectionsRef.current.push(id);
            setLength(selectionsRef.current.length);
        }
    }, []);

    const popSelected = useCallback(() => {
        setPrevious(selectionsRef.current.pop());
        setSelected(selectionsRef.current.at(-1));
        setLength(selectionsRef.current.length);
    }, []);

    return (
        <highlightContext.Provider
            value={{
                selected,
                pushSelected,
                popSelected: length > 1 ? popSelected : undefined,
                open,
                setOpen,
                hovered,
                setHovered,
                previous,
            }}
        >
            {selected && <CardModal />}
            {children}
        </highlightContext.Provider>
    );
}
