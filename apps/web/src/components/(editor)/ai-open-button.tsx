import { useEditorSettingsContext } from "@/context/editor-settings";
import { Button } from "@/components/(ui)/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/(ui)/dropdown-menu";
import { SimpleToolTip } from "./tooltip";

export function AIOpenButton({
    children,
    onClick,
    ...props
}: Omit<Parameters<typeof Button>[0], "onClick"> & { onClick?: () => void }) {
    const {
        settings: { window },
        setSettings,
    } = useEditorSettingsContext();

    return (
        <DropdownMenu
            onOpenChange={() => {
                onClick?.();
            }}
        >
            <SimpleToolTip text="Change View">
                <DropdownMenuTrigger asChild>
                    <Button {...props} variant="outline" size="icon">
                        {children}
                    </Button>
                </DropdownMenuTrigger>
            </SimpleToolTip>
            <DropdownMenuContent>
                {(["genai", "split", "editor"] as const).map((mode) => (
                    <DropdownMenuItem
                        className={mode === "split" ? "hidden lg:block" : ""}
                        onClick={() =>
                            setSettings((s) => ({
                                ...s,
                                window: mode,
                            }))
                        }
                        key={mode}
                        disabled={window === mode}
                    >
                        <span>{mode}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
