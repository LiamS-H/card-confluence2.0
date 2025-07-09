import { RulingsResponse, useSearchContext } from "@/context/search";
import { ScryfallCard, ScryfallRuling } from "@scryfall/api-types";
import { useEffect, useState } from "react";

export function useRulings(card: ScryfallCard.Any | undefined | null) {
    const { cachedRulings } = useSearchContext();
    const [rulings, setRulings] = useState<ScryfallRuling[] | null>(null);

    useEffect(() => {
        if (!card) return;
        if (!("oracle_id" in card)) return;
        setRulings(null);
        const resp = cachedRulings({
            oracle_id: card.oracle_id,
            scryfall_id: card.id,
        });
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
    }, [card, cachedRulings]);

    return rulings;
}
