import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/(ui)/accordion";
import { Button } from "@/components/(ui)/button";
import { useHighlightContext } from "@/context/highlight";
import { ICachedSearchProps, useSearchContext } from "@/context/search";
import { useCard } from "@/hooks/useCard";
import { ScryfallCard } from "@scryfall/api-types";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function Printings({ card }: { card: ScryfallCard.Any }) {
    const { cachedSearch, cacheResponse, getCard } = useSearchContext();
    const { replaceSelected, open } = useHighlightContext();

    const [printings, setPrintings] = useState<string[] | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }
        if (!card) return;
        if (!("oracle_id" in card)) return;
        if (printings?.includes(card.id)) return;
        setPrintings(null);
        const search_props: ICachedSearchProps = {
            query: `oracleid:${card.oracle_id}`,
            settings: { unique: "prints", order: "released" },
        };
        cachedSearch(search_props).then(async (resp) => {
            if (resp.object === "error") {
                setPrintings(null);
                return console.error("error fetching printings", resp);
            }
            const o_promises = [];
            for (const id of resp.data) {
                o_promises.push(getCard(id));
            }
            const o_ids = (await Promise.all(o_promises))
                .map((c) => {
                    if (!c) return null;
                    if (!("oracle_id" in c)) return null;
                    return c.oracle_id;
                })
                .filter((c) => c !== null);
            cacheResponse(
                o_ids.map((id) => {
                    return {
                        query: `oracleid:${id}`,
                        settings: search_props.settings,
                    };
                }),
                resp
            );
            setPrintings(resp.data);
        });
    }, [card, open, cachedSearch, cacheResponse, getCard, printings]);

    if (printings?.length === 1) {
        return (
            <div className="py-4 border-b text-sm font-medium">
                <div className="flex gap-2 items-center w-full">
                    <span>Printings</span>
                    <Printing id={card.id} isSelected />
                </div>
            </div>
        );
    }

    return (
        <AccordionItem value={"printings"}>
            {printings ? (
                <>
                    <AccordionTrigger className="group hover:no-underline">
                        <div className="flex gap-2 items-center w-full">
                            <span className="group-hover:underline">
                                Printings
                            </span>
                            <Printing id={card.id} isSelected />
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        {printings.length > 1 && (
                            <ul className="max-h-52 overflow-y-auto">
                                {printings
                                    .filter((p) => p !== card.id)
                                    .map((p) => (
                                        <li key={p}>
                                            <Printing
                                                id={p}
                                                select={() =>
                                                    replaceSelected(p)
                                                }
                                            />
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </AccordionContent>
                </>
            ) : (
                <AccordionTrigger disabled noChevron>
                    <div className="flex gap-2 items-center w-full">
                        <span>Printings</span>
                        <Printing id={card.id} isSelected />
                    </div>
                    <LoaderCircle className="animate-spin" />
                </AccordionTrigger>
            )}
        </AccordionItem>
    );
}

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

    const content = (
        <div className="w-full flex justify-between">
            <div className="flex gap-2">
                <span
                    className={`lg:max-w-96 md:max-w-32 sm:max-w-44 max-w-44 truncate ${select ? "group-hover:underline" : ""}`}
                >
                    {card.set_name}
                </span>
                <span className="font-thin">({card.set.toUpperCase()})</span>
            </div>
            {price && <span>{price}</span>}
        </div>
    );

    if (!select) {
        return (
            <div className="w-full h-6 px-2 py-1 rounded-md group bg-secondary group-hover:bg-secondary/80">
                {content}
            </div>
        );
    }

    return (
        <Button
            className="w-full h-6 px-2 group"
            variant={isSelected ? "secondary" : "ghost"}
            onClick={select}
        >
            {content}
        </Button>
    );
}
