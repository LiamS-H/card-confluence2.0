import { useEffect, useState } from "react";
import type { ScryfallCard } from "@scryfall/api-types";
import { useSearchContext } from "@/context/search";

export function useCard(cardName?: string) {
    const { getCard } = useSearchContext();
    const [card, setCard] = useState<ScryfallCard.Any | null | undefined>(null);
    useEffect(() => {
        if (!cardName) {
            setCard(undefined);
            return;
        }
        const request = getCard(cardName);
        if (request instanceof Promise) {
            request.then((c) => setCard(c));
        } else {
            setCard(request);
        }
    }, [cardName, getCard]);

    return card;
}
