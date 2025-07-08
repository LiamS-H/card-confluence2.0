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

export function CardModal() {
    const { open, selected, setOpen, pushSelected, previous, goPrevious } =
        useHighlightContext();
    const card = useCard(selected);

    const [tabs, setTabs] = useState<string[]>([
        "face-1",
        "face-2",
        "printings",
    ]);

    if (!open) return null;

    if (card === undefined) {
        return null;
    }
    if (card === null) {
        return null;
    }

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
                        <Accordion
                            type="multiple"
                            className="w-full"
                            defaultValue={["printings"]}
                            value={tabs}
                            onValueChange={(e) => setTabs(e)}
                        >
                            <Oracle card={card} />
                            <Printings card={card} />
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
                        </Accordion>
                    </DialogHeader>

                    <div className="w-full sm:min-w-96 sm:w-96 overflow-clip p-2">
                        <Card card={card} />
                    </div>
                </div>
                <DialogFooter>
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
