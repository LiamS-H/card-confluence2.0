import { useHighlightContext } from "@/context/highlight";
import { useCard } from "@/hooks/useCard";
import { Scrycard } from "react-scrycards";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/(ui)/dialog";
import { Button } from "../(ui)/button";
import { OracleText } from "./oracle-text";
import { useSearchContext } from "@/context/search";
import { useEffect, useState } from "react";

function Printing({ id, selected }: { id: string; selected?: boolean }) {
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
        <div
            className={`w-full flex justify-between rounded-sm px-2 ${selected && "bg-secondary text-secondary-foreground"}`}
        >
            <div className="flex gap-2">
                <span>{card.set_name}</span>
                <span className="font-thin">({card.set.toUpperCase()})</span>
            </div>
            {price && <span>{price}</span>}
        </div>
    );
}

export function CardModal() {
    const { open, selected, setOpen, setSelected } = useHighlightContext();
    const card = useCard(selected);
    const { cachedSearch, cacheResponse, getCard } = useSearchContext();

    const [printings, setPrintings] = useState<string[] | null>(null);
    const [printingsOpen, setPrintingsOpen] = useState(true);

    useEffect(() => {
        if (!open) return;
        if (!card) return;
        if (!("oracle_id" in card)) return;
        if (printings?.includes(card.id)) return;
        setPrintings(null);
        const search_props = {
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
    }, [card, open, cachedSearch]);

    if (!open) return null;

    if (card === undefined) {
        return null;
    }
    if (card === null) {
        return null;
    }
    const isMultiFaced = "card_faces" in card;
    const faces = isMultiFaced ? card.card_faces : [card];

    return (
        <Dialog
            defaultOpen
            onOpenChange={(open) => {
                setOpen(open);
            }}
        >
            <DialogContent className="min-w-48 sm:min-w-xl md:min-w-3xl lg:min-w-5xl max-h-11/12 p-2 sm:p-8 md:p-16 overflow-y-auto">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-8 overflow-y-auto">
                    <DialogHeader className="md:flex-grow">
                        <DialogTitle
                            className={isMultiFaced ? "hidden" : undefined}
                        >
                            {card.name}
                        </DialogTitle>
                        <DialogDescription
                            className={isMultiFaced ? "hidden" : "font-thin"}
                        >
                            {isMultiFaced
                                ? faces[0]?.type_line
                                : card.type_line}
                        </DialogDescription>

                        {isMultiFaced ? (
                            <ul className="flex flex-col gap-6">
                                {faces.map((f) => (
                                    <li
                                        className="flex flex-col gap-2"
                                        key={f.name}
                                    >
                                        <h2 className="text-lg leading-none font-semibold">
                                            {f.name}
                                        </h2>
                                        <p className="font-thin">
                                            {f.type_line}
                                        </p>

                                        <OracleText>{f.oracle_text}</OracleText>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <OracleText className="gap-2">
                                {card.oracle_text}
                            </OracleText>
                        )}
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold">Printings</h2>
                            <Printing id={card.id} selected />
                            {printingsOpen && (
                                <ul className="max-h-52 my-2 overflow-y-auto">
                                    {printings ? (
                                        printings.map((p) => (
                                            <li key={p}>
                                                <Button
                                                    className="w-full h-6"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setSelected(p);
                                                    }}
                                                >
                                                    <Printing
                                                        id={p}
                                                        selected={p === card.id}
                                                    />
                                                </Button>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="w-full h-6 text-center">
                                            loading...
                                        </li>
                                    )}
                                </ul>
                            )}
                            {printingsOpen ? (
                                <Button
                                    onClick={() => {
                                        setPrintingsOpen((o) => !o);
                                    }}
                                    variant="outline"
                                    className="w-full h-6"
                                >
                                    close
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => {
                                        setPrintingsOpen((o) => !o);
                                    }}
                                    variant="ghost"
                                    className="w-full h-6"
                                >
                                    select printing
                                </Button>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="w-full sm:min-w-96 sm:w-96">
                        <Scrycard
                            flippable
                            card={card}
                            size={"xl"}
                            width="full"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
