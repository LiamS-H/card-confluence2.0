import { Button } from "@/components/(ui)/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/(ui)/dropdown-menu";
import { SearchUniques, ISearchSettings } from "@/lib/scryfall";
import { SimpleToolTip } from "@/components/(ui)/tooltip";

export function Unique({
    scryfallSettings,
    computedSettings,
    setScryfallSettings,
}: {
    scryfallSettings: ISearchSettings;
    computedSettings?: ISearchSettings;
    setScryfallSettings: (s: (s: ISearchSettings) => ISearchSettings) => void;
}) {
    const computed_unique = computedSettings?.unique ?? "cards";
    const unique = scryfallSettings.unique;

    return (
        <DropdownMenu>
            <SimpleToolTip text="Change unique">
                <DropdownMenuTrigger asChild>
                    {unique ? (
                        <Button className="relative">
                            Unique: {unique ?? "select"}
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
                        computed <i>{computed_unique}</i>
                    </span>
                </DropdownMenuItem>
                {SearchUniques.map((o) => (
                    <DropdownMenuItem
                        key={o.label}
                        disabled={unique === o.label}
                        onClick={() =>
                            setScryfallSettings((s) => ({
                                ...s,
                                unique: o.label,
                            }))
                        }
                    >
                        {o.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
