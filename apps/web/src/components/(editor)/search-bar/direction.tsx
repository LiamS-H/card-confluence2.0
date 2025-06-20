import { Button } from "@/components/(ui)/button";
import { SimpleToolTip } from "@/components/(ui)/tooltip";
import { SearchOrders, ISearchSettings } from "@/lib/scryfall";
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
import { useEffect, useRef } from "react";

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

export function Direction({
    scryfallSettings,
    computedSettings,
    setScryfallSettings,
}: {
    scryfallSettings: ISearchSettings;
    computedSettings?: ISearchSettings;
    setScryfallSettings: (s: (s: ISearchSettings) => ISearchSettings) => void;
}) {
    const order = scryfallSettings.order ?? computedSettings?.order ?? "name";

    const lastOrder = useRef<typeof order | null>(null);

    const computed_dir =
        scryfallSettings.dir ?? computedSettings?.dir ?? "auto";

    const dir: "asc" | "desc" =
        computed_dir === "auto" ? autoOrders[order] : computed_dir;

    useEffect(() => {
        const last_order = lastOrder.current;
        lastOrder.current = order;
        if (order === last_order) return;
        setScryfallSettings((s) => ({
            ...s,
            dir: undefined,
        }));
    }, [order, computedSettings, setScryfallSettings]);

    const asc = dir === "asc";

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

    return (
        <SimpleToolTip text="Toggle direction">
            <Button
                size="icon"
                variant="outline"
                onClick={() =>
                    setScryfallSettings((s) => ({
                        ...s,
                        dir: dir === "asc" ? "desc" : "asc",
                    }))
                }
            >
                <Icon />
            </Button>
        </SimpleToolTip>
    );
}
