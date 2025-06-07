import { useHighlightContext } from "@/context/highlight";
import { useCard } from "@/hooks/useCard";
import { Scrycard } from "react-scrycards";

export function Card({ id }: { id: string }) {
    const card = useCard(id);
    const { setSelected, setOpen } = useHighlightContext();

    return (
        <button
            onMouseEnter={() => {
                setSelected(id);
            }}
            onClick={() => {
                setOpen(true);
            }}
        >
            <Scrycard animated card={card} size="lg" />
        </button>
    );
}
