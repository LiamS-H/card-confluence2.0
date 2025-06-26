import { Button } from "@/components/(ui)/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/(ui)/dropdown-menu";
import { SearchUniques } from "@/lib/scryfall";
import { SimpleToolTip } from "@/components/(ui)/tooltip";
import { useMemo } from "react";
import { useEditorQueriesContext } from "@/context/editor-queries";

export function Unique() {
    const { scryfallSettings, computedSettings, setScryfallSettings } =
        useEditorQueriesContext();
    const computed_unique = computedSettings.unique ?? "cards";
    const unique = scryfallSettings.unique;

    const options = useMemo(
        () =>
            SearchUniques.map((u) => (
                <DropdownMenuItem
                    key={u.label}
                    disabled={unique === u.label}
                    onClick={() =>
                        setScryfallSettings((s) => ({
                            ...s,
                            unique: u.label,
                        }))
                    }
                >
                    {u.label}
                </DropdownMenuItem>
            )),
        [unique, setScryfallSettings]
    );

    return useMemo(
        () => (
            <DropdownMenu>
                <SimpleToolTip text="Change unique">
                    <DropdownMenuTrigger asChild>
                        {unique ? (
                            <Button className="relative">
                                Unique: {unique}
                            </Button>
                        ) : (
                            <Button variant={"highlight"}>
                                Unique: {computed_unique}
                            </Button>
                        )}
                    </DropdownMenuTrigger>
                </SimpleToolTip>
                <DropdownMenuContent>
                    <DropdownMenuItem
                        disabled={unique === undefined}
                        onClick={() =>
                            setScryfallSettings((s) => ({
                                ...s,
                                unique: undefined,
                            }))
                        }
                    >
                        <span className="text-highlight-foreground">
                            computed <i>{computed_unique}</i>
                        </span>
                    </DropdownMenuItem>
                    {options}
                </DropdownMenuContent>
            </DropdownMenu>
        ),
        [options, unique, computed_unique, setScryfallSettings]
    );
}
