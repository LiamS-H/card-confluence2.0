import { Button } from "@/components/(ui)/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/(ui)/dropdown-menu";
import { SearchUniques } from "@/lib/scryfall";
import { SimpleToolTip } from "@/components/(ui)/tooltip";
import { useEditorQueriesContext } from "@/context/editor-queries";

export function Unique() {
    const { scryfallSettings, computedSettings, setScryfallSettings } =
        useEditorQueriesContext();
    const computed_unique = computedSettings.unique ?? "cards";
    const unique = scryfallSettings.unique;

    return (
        <DropdownMenu>
            <SimpleToolTip text="Change unique">
                <DropdownMenuTrigger asChild>
                    {unique ? (
                        <Button className="relative">Unique: {unique}</Button>
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
                            unique: undefined,
                        }))
                    }
                >
                    <span className="text-highlight-foreground">
                        computed <i>{computed_unique}</i>
                    </span>
                </DropdownMenuItem>
                {SearchUniques.map((u) => (
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
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
