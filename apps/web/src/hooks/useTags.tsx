import { ScryfallCard } from "@scryfall/api-types";
import { useEffect, useState } from "react";
import { fetchCardTags } from "../lib/scryfall";

export function useTags(card: ScryfallCard.Any | undefined | null) {
    const [tags, setTags] = useState<string[] | null>(null);

    useEffect(() => {
        if (!card) return;
        fetchCardTags(card.set, card.collector_number).then((t) => {
            setTags(t);
        });
    }, [card]);

    return tags;
}
