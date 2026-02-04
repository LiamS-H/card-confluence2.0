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
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Printings } from "./printings";
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
import { ExternalLink } from "lucide-react";
import { useTags } from "../../../hooks/useTags";
import { Tags } from "./tags";

export function CardModal() {
    const {
        open,
        selected,
        setOpen,
        pushSelected,
        previous,
        goPrevious,
        goNext,
        goPrev,
        hasNext,
        hasPrev,
    } = useHighlightContext();
    const card = useCard(selected);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollDistanceFromTopRef = useRef(0);
    const [contentLoaded, setContentLoaded] = useState(false);

    const [tabs, setTabs] = useState<string[]>(["face-0", "face-1"]);

    const rulingsOpen = tabs.includes("rulings");
    const rulings = useRulings(card, !rulingsOpen);
    const printingsOpen = tabs.includes("printings");
    const printings = usePrintings(card, !printingsOpen);
    const tagsOpen = tabs.includes("tags");
    const tags = useTags(card, !tagsOpen);

    useEffect(() => {
        if (card) {
            setContentLoaded(true);
        }
    }, [card]);

    useLayoutEffect(() => {
        if (!contentLoaded) return;
        if (!scrollRef.current) return;
        if (!open) return;

        function resumeScroll() {
            const scrollableElement = scrollRef.current;
            if (!scrollableElement) return;
            const { scrollHeight } = scrollableElement;

            let targetScrollTop = 0;

            const maxScrollTop = scrollHeight;
            if (scrollDistanceFromTopRef.current === -1) {
                targetScrollTop = maxScrollTop;
            } else {
                targetScrollTop = scrollDistanceFromTopRef.current;
            }

            const finalScrollTop = Math.max(
                0,
                Math.min(targetScrollTop, maxScrollTop),
            );

            scrollableElement.scrollTop = finalScrollTop;
            if (scrollableElement.scrollTop === 0 && finalScrollTop !== 0) {
                setTimeout(resumeScroll, 100);
            }
        }
        setTimeout(resumeScroll, 0);
    }, [contentLoaded, open]);

    useEffect(() => {
        if (!open) {
            setContentLoaded(false);
        }
    }, [open]);

    if (!open) return null;

    if (card === undefined) {
        return null;
    }
    if (card === null) {
        return null;
    }

    const disp_tabs = tabs.filter((t) => {
        if (!printings && t === "printings") return false;
        if ((!rulings || rulings.length == 0) && t === "rulings") return false;
        if (!tags && t === "tags") return false;
        return true;
    });

    const tagger_link = `https://tagger.scryfall.com/card/${card.set}/${card.collector_number}`;

    return (
        <Dialog
            defaultOpen
            onOpenChange={(open) => {
                setOpen(open);
                setTabs((old) => [
                    ...old.filter((t) => t !== "rulings" && t !== "tags"),
                ]);
            }}
        >
            <DialogContent className="h-11/12 max-h-11/12 w-full min-w-48 sm:min-w-xl md:min-w-3xl lg:min-w-5xl px-2 sm:pt-8 md:px-4 md:pt-16 ">
                <div
                    ref={scrollRef}
                    className="flex flex-col md:flex-row items-center md:items-start gap-2 h-full overflow-y-auto [scrollbar-gutter:stable]"
                    onScroll={() => {
                        const scrollableElement = scrollRef.current;
                        if (!scrollableElement) return;
                        const { scrollTop, clientHeight, scrollHeight } =
                            scrollableElement;

                        if (scrollTop + clientHeight >= scrollHeight - 1) {
                            scrollDistanceFromTopRef.current = -1;
                            return;
                        }

                        scrollDistanceFromTopRef.current = scrollTop;
                    }}
                >
                    <DialogHeader className="w-full h-fit px-5">
                        <Accordion
                            type="multiple"
                            className="w-full"
                            defaultValue={["printings"]}
                            value={disp_tabs}
                            onValueChange={(e) => setTabs(e)}
                        >
                            <Oracle card={card} />
                            <Printings
                                id={card.id}
                                printings={printings}
                                isOpen={printingsOpen}
                            />
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
                            <Tags
                                tags={tags}
                                tagger={tagger_link}
                                isOpen={tagsOpen}
                            />
                        </Accordion>
                    </DialogHeader>

                    <div className="w-full sm:min-w-96 sm:w-96 overflow-visible relative">
                        <div className="md:fixed md:pr-8">
                            <Card />
                            <div className="flex flex-wrap w-full mt-2">
                                <a href={card.scryfall_uri}>
                                    <Button variant="link">
                                        View Scryfall
                                        <ExternalLink />
                                    </Button>
                                </a>

                                <a href={tagger_link}>
                                    <Button variant="link">
                                        View Tagger <ExternalLink />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="self-end flex flex-col sm:flex-row gap-2">
                    {goPrevious && previous && (
                        <UndoButton undo={goPrevious} prevId={previous} />
                    )}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={goPrev}
                            disabled={!hasPrev}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={goNext}
                            disabled={!hasNext}
                        >
                            Next
                        </Button>
                    </div>

                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
