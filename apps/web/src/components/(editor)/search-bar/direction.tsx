import { Button } from "@/components/(ui)/button";
import { SimpleToolTip } from "../tooltip";
import { useEditorQueriesContext } from "@/context/editor-queries";
import { SearchOrders } from "@/lib/scryfall";
import {
    ArrowDown01,
    ArrowDown10,
    ArrowDownAZ,
    ArrowDownNarrowWide,
    ArrowDownWideNarrow,
    ArrowDownZA,
    BadgeAlert,
    CalendarArrowDown,
    CalendarArrowUp,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

const autoOrders: Record<
    (typeof SearchOrders)[number]["label"],
    "asc" | "desc"
> = {
    name: "asc",
    set: "asc",
    released: "desc",
    rarity: "desc",
    color: "asc",
    usd: "desc",
    tix: "desc",
    eur: "desc",
    cmc: "asc",
    power: "asc",
    toughness: "asc",
    edhrec: "desc",
    penny: "desc",
    artist: "asc",
    review: "asc",
} as const;

export function Direction() {
    const { mergedSettings, setScryfallSettings } = useEditorQueriesContext();

    const order = mergedSettings.order ?? "name";
    const auto = autoOrders[order];

    const lastOrder = useRef<typeof order | null>(null);

    useEffect(() => {
        const last_order = lastOrder.current;
        lastOrder.current = order;
        if (order === last_order) return;
        setScryfallSettings((s) => {
            if (s.dir === undefined) return s;
            return {
                ...s,
                dir: undefined,
            };
        });
    }, [order, setScryfallSettings]);

    const asc = (mergedSettings.dir ?? auto) === "asc";

    let Icon;
    switch (order) {
        case "name":
        case "set":
        case "artist":
            Icon = asc ? ArrowDownAZ : ArrowDownZA;
            break;
        case "released":
            Icon = asc ? CalendarArrowUp : CalendarArrowDown;
            break;
        case "usd":
        case "tix":
        case "eur":
        case "cmc":
        case "power":
        case "toughness":
            Icon = asc ? ArrowDown01 : ArrowDown10;
            break;
        case "edhrec":
        case "penny":
        case "rarity":
            Icon = asc ? ArrowDownWideNarrow : ArrowDownNarrowWide;
            break;
        case "color":
        case "review":
            Icon = asc ? ArrowDownNarrowWide : ArrowDownWideNarrow;
            break;
        default:
            Icon = BadgeAlert;
    }

    return useMemo(
        () => (
            <SimpleToolTip text="Toggle direction">
                <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                        setScryfallSettings((s) => ({
                            ...s,
                            dir: s.dir ? undefined : asc ? "desc" : "asc",
                        }))
                    }
                >
                    <Icon />
                </Button>
            </SimpleToolTip>
        ),
        [asc, Icon, setScryfallSettings]
    );
}
