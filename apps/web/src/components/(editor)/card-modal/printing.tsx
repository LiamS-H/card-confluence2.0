import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/(ui)/accordion";
import { Button } from "@/components/(ui)/button";
import { useHighlightContext } from "@/context/highlight";
import { useCard } from "@/hooks/useCard";
import { LoaderCircle } from "lucide-react";

export function Printings({
    id,
    printings,
}: {
    id: string;
    printings: string[] | null;
}) {
    const { replaceSelected } = useHighlightContext();

    if (printings?.length === 1) {
        return (
            <div className="py-4 border-b text-sm font-medium">
                <div className="flex gap-2 items-center w-full">
                    <span>Printings</span>
                    <Printing id={id} isSelected />
                </div>
            </div>
        );
    }

    return (
        <AccordionItem value={"printings"}>
            {printings ? (
                <AccordionTrigger className="group hover:no-underline">
                    <div className="flex gap-2 items-center w-full">
                        <span className="group-hover:underline">Printings</span>
                        <Printing id={id} isSelected />
                    </div>
                </AccordionTrigger>
            ) : (
                <AccordionTrigger disabled noChevron>
                    <div className="flex gap-2 items-center w-full">
                        <span>Printings</span>
                        <Printing id={id} isSelected />
                    </div>
                    <LoaderCircle className="animate-spin" />
                </AccordionTrigger>
            )}
            <AccordionContent>
                {printings && printings.length > 1 && (
                    <ul className="max-h-52 overflow-y-auto">
                        {printings
                            .filter((p) => p !== id)
                            .map((p) => (
                                <li key={p}>
                                    <Printing
                                        id={p}
                                        select={() => replaceSelected(p)}
                                    />
                                </li>
                            ))}
                    </ul>
                )}
            </AccordionContent>
        </AccordionItem>
    );
}

export function Printing({
    id,
    isSelected,
    select,
}:
    | {
          id: string;
          isSelected?: false;
          select: () => void;
      }
    | {
          id: string;
          isSelected: true;
          select?: never;
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

    const content = (
        <div className={`w-full flex flex-wrap justify-between`}>
            <div className="flex gap-2">
                <span
                    className={`lg:max-w-96 md:max-w-32 sm:max-w-44 "max-w-44"  ${select ? "group-hover:underline truncate" : ""}`}
                >
                    {card.set_name}
                </span>
                <span className="font-thin">({card.set.toUpperCase()})</span>
            </div>
            {price && <span className="truncate">{price}</span>}
        </div>
    );

    if (isSelected) {
        return (
            <div className="w-full px-2 py-1 rounded-md group bg-secondary group-hover:bg-secondary/80">
                {content}
            </div>
        );
    }

    return (
        <Button
            className={`w-full h-6 px-2 group`}
            variant={isSelected ? "secondary" : "ghost"}
            onClick={select}
        >
            {content}
        </Button>
    );
}
