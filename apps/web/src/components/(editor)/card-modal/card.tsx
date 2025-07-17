import { Button } from "@/components/(ui)/button";
import { useHighlightContext } from "@/context/highlight";
import { useCard } from "@/hooks/useCard";
import { FlipHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { isFlippable, Scrycard } from "react-scrycards";

export default function Card() {
    const { selected, hovered } = useHighlightContext();
    const card = useCard(hovered || selected);
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        setFlipped(false);
    }, [card]);

    return (
        <div className="overflow-visible relative">
            <Scrycard
                flipped={flipped}
                animated
                card={card}
                size="xl"
                width="full"
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
