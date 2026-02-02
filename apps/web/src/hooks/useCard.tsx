import { useEffect, useState } from "react";
import type { ScryfallCard } from "@scryfall/api-types";
import { useSearchContext } from "@/context/search";

export function useCard(id?: string) {
    const { getCard } = useSearchContext();
    const [card, setCard] = useState<ScryfallCard.Any | null | undefined>(null);
    useEffect(() => {
        if (!id) {
            setCard(undefined);
            return;
        }
        if (id == card?.id) {
            return;
        }
        const c = getCard(id);
        if (c instanceof Promise) {
            c.then((c) => {
                setCard((old) => (c?.id == old?.id ? old : c));
            });
        } else {
            setCard((old) => (c?.id == old?.id ? old : c));
        }
    }, [id, getCard]);

    return card;
}
