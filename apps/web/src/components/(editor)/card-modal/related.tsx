import { Button } from "@/components/(ui)/button";
import { ScryfallRelatedCard } from "@scryfall/api-types";

export function Related({
    card,
    isSelected,
    select,
}: {
    card: ScryfallRelatedCard;
    isSelected?: boolean;
    select?: () => void;
}) {
    return (
        <Button
            className="w-full h-6"
            variant={isSelected ? "secondary" : "ghost"}
            onClick={select}
        >
            <div className="w-full flex justify-between">
                <div className="flex gap-2 lg:max-w-96 md:max-w-32 sm:max-w-44 max-w-44 ">
                    <span className="truncate">{card.name}</span>
                    <span className="truncate font-thin">
                        ({card.type_line})
                    </span>
                </div>
                <span>{card.component}</span>
            </div>
        </Button>
    );
}
