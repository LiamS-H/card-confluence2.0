import { Button } from "@/components/(ui)/button";
import { useCard } from "@/hooks/useCard";

export function Printing({
    id,
    isSelected,
    select,
}: {
    id: string;
    isSelected?: boolean;
    select?: () => void;
}) {
    const card = useCard(id);
    if (!card) return <div>loading...</div>;
    let price: string | undefined;
    if (card.prices.usd) {
        price = `$${card.prices.usd}`;
        if (card.prices.usd_foil) {
            price += ` / $${card.prices.usd_foil} F`;
        }
        // if (card.prices.usd_etched) {
        //     price += ` / $${card.prices.usd_etched} E`;
        // }
    } else if (card.prices.tix) {
        price = `${card.prices.tix} tix`;
    }

    return (
        <Button
            className="w-full h-6 px-2"
            variant={isSelected ? "secondary" : "ghost"}
            onClick={select}
        >
            <div className="w-full flex justify-between">
                <div className="flex gap-2">
                    <span className="lg:max-w-96 md:max-w-32 sm:max-w-44 max-w-44 truncate">
                        {card.set_name}
                    </span>
                    <span className="font-thin">
                        ({card.set.toUpperCase()})
                    </span>
                </div>
                {price && <span>{price}</span>}
            </div>
        </Button>
    );
}
