import { RulingsResponse, useSearchContext } from "@/context/search";
import { ScryfallCard, ScryfallRuling } from "@scryfall/api-types";
import { useEffect, useState } from "react";

export function useRulings(
    card: ScryfallCard.Any | undefined | null,
    onlyCached?: boolean,
) {
    const { cachedRulings } = useSearchContext();
    const [rulings, setRulings] = useState<ScryfallRuling[] | null>(null);

    useEffect(() => {
        setRulings(null);
        if (!card) return;
        if (!("oracle_id" in card)) return;
        const resp = cachedRulings({
            oracle_id: card.oracle_id,
            scryfall_id: card.id,
            onlyCached,
        });
        if (resp === null) return;

        async function resolve(resp: RulingsResponse) {
            if (resp.object === "error") {
                console.error("couldn't fetch rulings", resp);
                return;
            }
            setRulings(resp.data);
        }

        if ("then" in resp) {
            resp.then(resolve);
        } else {
            resolve(resp);
        }
    }, [card, cachedRulings, onlyCached]);

    return rulings;
}
