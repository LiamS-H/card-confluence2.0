import { useHighlightContext } from "@/context/highlight";
import { useCard } from "@/hooks/useCard";
import { useMemo, useState } from "react";
import { isFlippable, Scrycard } from "react-scrycards";
import { Button } from "../../(ui)/button";
import { FlipHorizontal } from "lucide-react";
import { useEditorQueriesContext } from "@/context/editor-queries";
import { useEditorSettingsContext } from "@/context/editor-settings";

export function Card({
    id,
    width = 200,
    index,
}: {
    id: string;
    width?: number;
    index?: number;
}) {
    const card = useCard(id);
    const { pushSelected, setHovered, setOpen } = useHighlightContext();
    const [flipped, setFlipped] = useState(false);
    const { mergedSettings } = useEditorQueriesContext();
    const {
        settings: { disableOrderInfo },
    } = useEditorSettingsContext();
    let info = null;
    if (!disableOrderInfo && card) {
        switch (mergedSettings.order) {
            case "edhrec":
                info = `#${card.edhrec_rank}`;
                break;
            case "eur":
                info = `€${card.prices.eur}`;
                break;
            case "usd":
                info = `$${card.prices.usd}`;
                break;
            case "tix":
                info = `${card.prices.tix} tix`;
                break;
        }
    }

    const cardComp = useMemo(
        () => (
            <>
                <div
                    className="overflow-clip relative"
                    role="button"
                    onMouseEnter={() => {
                        setHovered(id);
                    }}
                    onClick={() => {
                        pushSelected(id, index);
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
            </>
        ),
        [id, card, flipped, width, setHovered],
    );

    const infoComp = useMemo(() => {
        if (!info) return null;
        return (
            <div className="absolute top-20 w-full flex justify-center z-10">
                <span className="p-2 rounded-sm bg-accent text-accent-foreground">
                    {info}
                </span>
            </div>
        );
    }, [info]);
    return (
        <>
            {cardComp}
            {infoComp}
        </>
    );
}
