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
        <>
            <div className="block lg:hidden">
                <Button
                    onClick={() => {
                        onClick?.();
                        setSettings((s) => ({
                            ...s,
                            window: s.window === "split" ? "genai" : "split",
                        }));
                    }}
                    {...props}
                    variant="outline"
                    size="icon"
                >
                    {children}
                </Button>
            </div>
            <div className="hidden  lg:block">
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
            </div>
        </>
    );
}
