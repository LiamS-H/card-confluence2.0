import { useHighlightContext } from "@/context/highlight";
import { useCard } from "@/hooks/useCard";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/(ui)/dialog";
import { Button } from "../../(ui)/button";
import { OracleText } from "../oracle-text";
import { ICachedSearchProps, useSearchContext } from "@/context/search";
import { useEffect, useState } from "react";
import { Printing } from "./printing";
import { Related } from "./related";
import { UndoButton } from "./undo-button";
import Card from "./card";

export function CardModal() {
    const {
        open,
        selected,
        previous,
        setOpen,
        pushSelected,
        goPrevious: popSelected,
        replaceSelected,
    } = useHighlightContext();
    const card = useCard(selected);
    const { cachedSearch, cacheResponse, getCard } = useSearchContext();

    const [printings, setPrintings] = useState<string[] | null>(null);
    const [printingsOpen, setPrintingsOpen] = useState(true);

    const [relatedOpen, setRelatedOpen] = useState(true);

    useEffect(() => {
        if (open) return;
        setRelatedOpen(false);
    }, [card, open]);

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
            <DialogContent className="min-w-48 sm:min-w-xl md:min-w-3xl lg:min-w-5xl h-11/12 px-2 sm:py-8 md:px-4 md:py-16">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 overflow-y-auto h-full">
                    <DialogHeader className="md:flex-grow h-full px-4 md:overflow-y-auto">
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
                            <Printing id={card.id} isSelected />
                            {printings && printings.length !== 1 && (
                                <>
                                    {printingsOpen && (
                                        <ul className="max-h-52 mt-2 overflow-y-auto">
                                            {printings ? (
                                                printings.map((p) => (
                                                    <li key={p}>
                                                        <Printing
                                                            id={p}
                                                            isSelected={
                                                                p === card.id
                                                            }
                                                            select={() =>
                                                                replaceSelected(
                                                                    p
                                                                )
                                                            }
                                                        />
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="w-full h-6 text-center">
                                                    loading...
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                    <Button
                                        onClick={() => {
                                            setPrintingsOpen((o) => !o);
                                        }}
                                        variant="outline"
                                        className="w-full h-6 mt-2"
                                    >
                                        {printingsOpen
                                            ? "close"
                                            : "select printing"}
                                    </Button>
                                </>
                            )}
                        </div>
                        {card.all_parts && (
                            <div className="flex flex-col">
                                <h2 className="text-lg font-semibold">
                                    Related Cards
                                </h2>
                                {relatedOpen && (
                                    <ul className="max-h-52 my-2 overflow-y-auto">
                                        {card.all_parts.map((c) => (
                                            <li key={c.id}>
                                                <Related
                                                    card={c}
                                                    isSelected={
                                                        c.id === card.id
                                                    }
                                                    select={() =>
                                                        pushSelected(c.id)
                                                    }
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <Button
                                    onClick={() => {
                                        setRelatedOpen((o) => !o);
                                    }}
                                    variant="outline"
                                    className="w-full h-6"
                                >
                                    {relatedOpen ? "close" : "show related"}
                                </Button>
                            </div>
                        )}
                    </DialogHeader>

                    <div className="w-full sm:min-w-96 sm:w-96 overflow-clip p-2">
                        <Card card={card} />
                    </div>
                </div>
                <DialogFooter>
                    {popSelected && previous && (
                        <UndoButton undo={popSelected} prevId={previous} />
                    )}
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
