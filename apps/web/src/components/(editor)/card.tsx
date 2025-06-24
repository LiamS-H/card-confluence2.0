import { useHighlightContext } from "@/context/highlight";
import { useCard } from "@/hooks/useCard";
import { useState } from "react";
import { isFlippable, Scrycard } from "react-scrycards";
import { Button } from "../(ui)/button";
import { FlipHorizontal } from "lucide-react";

export function Card({ id, width = 200 }: { id: string; width?: number }) {
    const card = useCard(id);
    const { pushSelected, setHovered, setOpen } = useHighlightContext();
    const [flipped, setFlipped] = useState(false);

    return (
        <div
            className="overflow-clip relative"
            role="button"
            onMouseEnter={() => {
                setHovered(id);
            }}
            onClick={() => {
                pushSelected(id);
                setOpen(true);
            }}
        >
            <Scrycard
                flipped={flipped}
                animated
                card={card}
                size="md"
                width={`${width}px`}
            />
            {isFlippable(card) && (
                <Button
                    className="absolute bottom-0 left-0 h-7 w-7"
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        setFlipped((f) => !f);
                    }}
                >
                    <FlipHorizontal />
                </Button>
            )}
        </div>
    );
}
