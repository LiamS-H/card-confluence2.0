import { ScryfallCard, ScryfallLegalityLike } from "@scryfall/api-types";
import { Ban, Check, Link, X } from "lucide-react";

function Legality({
    format,
    legality,
}: {
    format: string;
    legality: ScryfallLegalityLike;
}) {
    if (format === "paupercommander") {
        format = "PDH";
    }
    switch (legality) {
        case "banned":
            return (
                <li className="w-32 flex justify-start gap-2 text-destructive">
                    <Ban />
                    <span>{format}</span>
                </li>
            );
        case "not_legal":
            return (
                <li className="w-32 flex justify-start gap-2 text-muted-foreground">
                    <X />
                    <span>{format}</span>
                </li>
            );
        case "restricted":
            return (
                <li className="w-32 flex justify-start gap-2">
                    <Link />
                    <span>{format}</span>
                </li>
            );
        case "legal":
            return (
                <li className="w-32 flex justify-start gap-2 text-highlight-foreground">
                    <Check />
                    <span>{format}</span>
                </li>
            );
        default:
            return (
                <li className="w-32 flex justify-start gap-2">
                    <X />
                    <span>{format}</span>
                </li>
            );
    }
}

export function Legalities({ card }: { card: ScryfallCard.Any }) {
    // TODO: add sorting and hiding formats saved in settings
    return (
        <ul className="w-fit flex flex-row lg:flex-col flex-wrap lg:max-h-36">
            {Object.entries(card.legalities)
                .map(([format, legality]) => ({
                    format,
                    legality,
                }))
                .sort((a, b) => {
                    const an = a.legality === "not_legal";
                    const bn = b.legality === "not_legal";
                    if (an && !bn) return 1;
                    if (bn && !an) return -1;
                    return a.format.localeCompare(b.format);
                })
                .map(({ format, legality }) => (
                    <Legality
                        key={format}
                        format={format}
                        legality={legality}
                    />
                ))}
        </ul>
    );
}
