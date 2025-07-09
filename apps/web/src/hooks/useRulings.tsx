import { RulingsResponse, useSearchContext } from "@/context/search";
import { ScryfallRuling } from "@scryfall/api-types";
import { useEffect, useState } from "react";

export function useRulings(id?: string) {
    const { cachedRulings } = useSearchContext();
    const [rulings, setRulings] = useState<ScryfallRuling[] | null>(null);

    useEffect(() => {
        if (!id) return;
        setRulings(null);
        const resp = cachedRulings({ id });
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
    }, [id]);

    return rulings;
}
