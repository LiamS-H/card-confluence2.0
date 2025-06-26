import { Button } from "@/components/(ui)/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/(ui)/dropdown-menu";
import { SearchOrders } from "@/lib/scryfall";
import { SimpleToolTip } from "@/components/(ui)/tooltip";
import { useMemo } from "react";
import { useEditorQueriesContext } from "@/context/editor-queries";

export function Order() {
    const { scryfallSettings, computedSettings, setScryfallSettings } =
        useEditorQueriesContext();
    const computed_order = computedSettings?.order ?? "name";
    const order = scryfallSettings.order;

    const options = useMemo(
        () =>
            SearchOrders.map((o) => (
                <DropdownMenuItem
                    key={o.label}
                    disabled={order === o.label}
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
            )),
        [order, setScryfallSettings]
    );

    return useMemo(
        () => (
            <DropdownMenu>
                <SimpleToolTip text="Change order">
                    <DropdownMenuTrigger asChild>
                        {order ? (
                            <Button className="relative">Order: {order}</Button>
                        ) : (
                            <Button variant={"highlight"}>
                                Order: {computed_order}
                            </Button>
                        )}
                    </DropdownMenuTrigger>
                </SimpleToolTip>
                <DropdownMenuContent>
                    <DropdownMenuItem
                        disabled={order === undefined}
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
                    {options}
                </DropdownMenuContent>
            </DropdownMenu>
        ),
        [options, order, computed_order, setScryfallSettings]
    );
}
