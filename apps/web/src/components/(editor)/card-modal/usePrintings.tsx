import { useHighlightContext } from "@/context/highlight";
import {
    ICachedSearchProps,
    SearchResponse,
    useSearchContext,
} from "@/context/search";
import { ScryfallCard } from "@scryfall/api-types";
import { useEffect, useState } from "react";

export function usePrintings(card: ScryfallCard.Any | null | undefined) {
    const { cachedSearch, cacheResponse, getCard } = useSearchContext();
    const { open } = useHighlightContext();

    const [printings, setPrintings] = useState<string[] | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }
        if (!card) return;
        if (!("oracle_id" in card)) return;
        if (printings?.includes(card.id)) return;
        setPrintings(null);
        const search_props: ICachedSearchProps = {
            query: `oracleid:${card.oracle_id}`,
            settings: { unique: "prints", order: "released" },
        };
        const resp = cachedSearch(search_props);
        const resolve = async (resp: SearchResponse) => {
            if (resp.object === "error") {
                setPrintings(null);
                return console.error("error fetching printings", resp);
            }
            setPrintings(resp.data);
            const o_promises = [];
            for (const id of resp.data) {
                o_promises.push(getCard(id));
            }
            const o_ids = (await Promise.all(o_promises))
                .map((c) => {
                    if (!c) return null;
                    if (!("oracle_id" in c)) return null;
                    return c.oracle_id;
                })
                .filter((c) => c !== null);
            cacheResponse(
                o_ids.map((id) => {
                    return {
                        query: `oracleid:${id}`,
                        settings: search_props.settings,
                    };
                }),
                resp
            );
        };
        if ("then" in resp) {
            resp.then(resolve);
        } else {
            resolve(resp);
        }
    }, [card, open, cachedSearch, cacheResponse, getCard, printings]);

    return printings;
}
