import { Button } from "@/components/(ui)/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "../../(ui)/dropdown-menu";
import { SearchOrders, ISearchSettings } from "@/lib/scryfall";
import { useEffect, useState } from "react";
import { SimpleToolTip } from "@/components/(ui)/tooltip";

export function Order({
    scryfallSettings,
    computedSettings,
    setScryfallSettings,
}: {
    scryfallSettings: ISearchSettings;
    computedSettings?: ISearchSettings;
    setScryfallSettings: (s: (s: ISearchSettings) => ISearchSettings) => void;
}) {
    const [open, setOpen] = useState(false);
    const [localOrder, setLocalOrder] = useState(scryfallSettings.order);
    const computed_order = computedSettings?.order ?? "none";

    useEffect(() => {
        if (open) setLocalOrder(scryfallSettings.order);
    }, [open, scryfallSettings]);
    return (
        <DropdownMenu onOpenChange={setOpen}>
            <SimpleToolTip text="Change order">
                <DropdownMenuTrigger asChild>
                    {localOrder ? (
                        <Button className="relative">
                            Order: {localOrder ?? "select"}
                        </Button>
                    ) : (
                        <Button variant={"highlight"}>
                            Order: {computed_order}
                        </Button>
                    )}
                </DropdownMenuTrigger>
            </SimpleToolTip>
            <DropdownMenuContent>
                <DropdownMenuItem
                    disabled={localOrder === undefined}
                    // className={
                    //     scryfallSettings.order === undefined
                    //         ? undefined
                    //         : " hover:bg-highlight/50"
                    // }
                    onClick={() =>
                        setScryfallSettings((s) => ({
                            ...s,
                            order: undefined,
                        }))
                    }
                >
                    <span className="text-highlight-foreground">
                        computed <i>{computed_order}</i>
                    </span>
                </DropdownMenuItem>
                {SearchOrders.map((o) => (
                    <DropdownMenuItem
                        key={o.label}
                        disabled={localOrder === o.label}
                        onClick={() =>
                            setScryfallSettings((s) => ({
                                ...s,
                                order: o.label,
                            }))
                        }
                    >
                        {o.label}
                        {o.detail && (
                            <i className="text-muted-foreground">{o.detail}</i>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
