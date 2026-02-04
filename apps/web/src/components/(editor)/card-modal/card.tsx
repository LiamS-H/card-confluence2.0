import { Button } from "@/components/(ui)/button";
import { useHighlightContext } from "@/context/highlight";
import { useCard } from "@/hooks/useCard";
import { FlipHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { isFlippable, Scrycard, type ScrycardSizes } from "react-scrycards";

export default function Card() {
    const { selected, hovered } = useHighlightContext();
    const card = useCard(hovered || selected);
    const [flipped, setFlipped] = useState(false);
    const [size, setSize] = useState<ScrycardSizes>("xs");

    useEffect(() => {
        setFlipped(false);
        setSize("xs");
    }, [card?.id]);

    const cardComp = useMemo(() => {
        // hack to make image update immediately from cache, by first rendering as MD then as XL
        // TODO: Replace with blur transition
        if (size !== "xl") {
            setTimeout(() => setSize("xl"), 0);
        }

        return (
            <Scrycard
                flipped={flipped}
                animated={size === "xl" || undefined}
                card={card}
                size={size}
                width="full"
            />
        );
    }, [card?.id, size, flipped]);

    return (
        <div className="overflow-visible relative w-full">
            {cardComp}
            {isFlippable(card) && (
                <Button
                    className="absolute bottom-0 left-0 h-7 w-7"
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log("test");
                        setFlipped((f) => !f);
                    }}
                >
                    <FlipHorizontal />
                </Button>
            )}
        </div>
    );
}
