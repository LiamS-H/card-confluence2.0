import { useHighlightContext } from "@/context/highlight";
import { useCard } from "@/hooks/useCard";
import {
    Dialog,
    DialogClose,
    DialogContent,
    // DialogDescription,
    DialogFooter,
    DialogHeader,
    // DialogTitle,
} from "@/components/(ui)/dialog";
import { Button } from "../../(ui)/button";
import { useState } from "react";
import { Printings } from "./printing";
import { Related } from "./related";
import { UndoButton } from "./undo-button";
import Card from "./card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/(ui)/accordion";
import { Legalities } from "./legalities";
import { Oracle } from "./oracle";
import { usePrintings } from "../../../hooks/usePrintings";
import { useRulings } from "@/hooks/useRulings";
import { Rulings } from "./rulings";
import { ExternalLink, Tag } from "lucide-react";

export function CardModal() {
    const { open, selected, setOpen, pushSelected, previous, goPrevious } =
        useHighlightContext();
    const card = useCard(selected);

    const [tabs, setTabs] = useState<string[]>([
        "face-1",
        "face-2",
        "printings",
    ]);

    const printings = usePrintings(card);
    const rulingsOpen = tabs.includes("rulings");
    const rulings = useRulings(card);

    if (!open) return null;

    if (card === undefined) {
        return null;
    }
    if (card === null) {
        return null;
    }

    let disp_tabs = tabs.filter((t) => {
        if (!printings && t === "printings") return false;
        if (!rulings && t === "rulings") return false;
        return true;
    });

    return (
        <Dialog
            defaultOpen
            onOpenChange={(open) => {
                setOpen(open);
                setTabs((old) => [...old.filter((t) => t !== "rulings")]);
            }}
        >
            <DialogContent className="h-11/12 max-h-11/12 w-full min-w-48 sm:min-w-xl md:min-w-3xl lg:min-w-5xl px-2 sm:pt-8 md:px-4 md:pt-16 ">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 overflow-y-auto md:overflow-hidden">
                    <DialogHeader className="w-full h-fit px-5 md:h-full md:overflow-y-auto">
                        <Accordion
                            type="multiple"
                            className="w-full"
                            defaultValue={["printings"]}
                            value={disp_tabs}
                            onValueChange={(e) => setTabs(e)}
                        >
                            <Oracle card={card} />
                            <Printings id={card.id} printings={printings} />
                            {card.all_parts && card.all_parts.length > 1 && (
                                <AccordionItem value="related">
                                    <AccordionTrigger>
                                        Related Cards
                                    </AccordionTrigger>
                                    <AccordionContent>
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
                                    </AccordionContent>
                                </AccordionItem>
                            )}
                            <AccordionItem value="legalities">
                                <AccordionTrigger>Legalities</AccordionTrigger>
                                <AccordionContent>
                                    <Legalities card={card} />
                                </AccordionContent>
                            </AccordionItem>
                            <Rulings rulings={rulings} isOpen={rulingsOpen} />
                        </Accordion>
                    </DialogHeader>

                    <div className="w-full sm:min-w-96 sm:w-96 overflow-visible p-2">
                        <Card card={card} />
                        <div className="flex flex-wrap w-full mt-2">
                            <a href={card.scryfall_uri}>
                                <Button variant="link">
                                    View Scryfall
                                    <ExternalLink />
                                </Button>
                            </a>

                            <a
                                href={`https://tagger.scryfall.com/card/${card.set}/${card.collector_number}`}
                            >
                                <Button variant="link">
                                    View Tagger <ExternalLink />
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
                <DialogFooter className="self-end flex flex-col sm:flex-row">
                    {goPrevious && previous && (
                        <UndoButton undo={goPrevious} prevId={previous} />
                    )}
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
