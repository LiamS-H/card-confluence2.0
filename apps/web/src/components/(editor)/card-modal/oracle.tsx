import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/(ui)/accordion";
import { DialogDescription, DialogTitle } from "@/components/(ui)/dialog";
import { ScryfallCard } from "@scryfall/api-types";
import { OracleText } from "@/components/(editor)/oracle-text";

export function Oracle({ card }: { card: ScryfallCard.Any }) {
    const isMultiFaced = "card_faces" in card;
    const faces = isMultiFaced ? card.card_faces : [card];

    return faces.map((f, i) => {
        if (i == 0) {
            return (
                <AccordionItem key={i} value={`face-${i}`}>
                    <AccordionTrigger>
                        <div>
                            <DialogTitle>{card.name}</DialogTitle>
                            <DialogDescription className="font-thin">
                                {f.type_line}
                            </DialogDescription>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <OracleText className="gap-2 max-w-96 text-left">
                            {f.oracle_text}
                        </OracleText>
                    </AccordionContent>
                </AccordionItem>
            );
        }

        return (
            <AccordionItem key={i} value={`face-${i}`}>
                <AccordionTrigger>
                    <div>
                        <h2 className="text-lg leading-none font-semibold">
                            {f.name}
                        </h2>
                        <p className="font-thin text-muted-foreground">
                            {f.type_line}
                        </p>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <OracleText className="gap-2 max-w-96 text-left">
                        {f.oracle_text}
                    </OracleText>
                </AccordionContent>
            </AccordionItem>
        );
    });
}
