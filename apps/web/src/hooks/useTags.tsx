import { useSearchContext } from "@/context/search";
import { ScryfallCard } from "@scryfall/api-types";
import { useEffect, useState } from "react";

export function useTags(
    card: ScryfallCard.Any | undefined | null,
    onlyCached: boolean,
) {
    const [tags, setTags] = useState<string[] | null>(null);
    const { cachedTags } = useSearchContext();

    useEffect(() => {
        setTags(null);
        if (!card) return;

        const resp = cachedTags({
            set: card.set,
            collector_number: card.collector_number,
            onlyCached,
        });
        if (resp === null) return;
        const resolve = (t: string[]) => {
            setTags(t);
        };
        if ("then" in resp) {
            resp.then(resolve);
        } else {
            resolve(resp);
        }
    }, [card, onlyCached]);

    return tags;
}
