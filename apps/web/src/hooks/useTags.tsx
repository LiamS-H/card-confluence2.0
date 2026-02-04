import { useSearchContext } from "@/context/search";
import { ScryfallCard } from "@scryfall/api-types";
import { use, useEffect, useMemo, useState } from "react";

export function useTags(
    card: ScryfallCard.Any | undefined | null,
    onlyCached: boolean,
) {
    const { cachedTags } = useSearchContext();

    const resp = useMemo(() => {
        if (!card) return null;
        return cachedTags({
            set: card.set,
            collector_number: card.collector_number,
            onlyCached,
        });
    }, [card, onlyCached, cachedTags]);

    if (resp && typeof resp === "object" && "then" in resp) {
        return use(resp);
    }

    return resp;
}
