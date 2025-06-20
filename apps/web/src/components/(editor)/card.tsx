import { useHighlightContext } from "@/context/highlight";
import { useCard } from "@/hooks/useCard";
import { Scrycard } from "react-scrycards";

export function Card({ id }: { id: string }) {
    const card = useCard(id);
    const { pushSelected, setHovered, setOpen } = useHighlightContext();

    return (
        <button
            onMouseEnter={() => {
                setHovered(id);
            }}
            onClick={() => {
                pushSelected(id);
                setOpen(true);
            }}
            className="overflow-clip"
        >
            <Scrycard animated card={card} size="md" width="200px" />
        </button>
    );
}
