import {
    IEditorSettings,
    useEditorSettingsContext,
} from "@/context/editor-settings";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/(ui)/dialog";
import { Switch } from "@/components/(ui)/switch";
import { Slider } from "@/components/(ui)/slider";
import { ThemeToggle } from "@/components/(theme)/theme-toggle";
import { Label } from "@/components/(ui)/label";
import { useTheme } from "next-themes";

function ToggleButton({
    label,
    setting,
    feedback,
    disabled,
    inverted,
}: {
    label: string;
    setting: keyof IEditorSettings;
    feedback: [string, string];
    disabled?: boolean;
    inverted?: boolean;
}) {
    const { setSettings, settings } = useEditorSettingsContext();
    const val = settings[setting] ?? inverted;
    return (
        <div className="flex items-center space-x-2">
            <Switch
                disabled={disabled}
                id={setting}
                checked={!val}
                onCheckedChange={(checked) =>
                    setSettings((s) => {
                        const s2 = { ...s };
                        //@ts-expect-error ts is angry about this for some reason
                        s2[setting] = !checked;
                        return s2;
                    })
                }
            />
            <Label htmlFor={setting}>
                {label}: {val ? feedback[0] : feedback[1]}
            </Label>
        </div>
    );
}

export function EditorSettingsModal() {
    const { open, setOpen, settings, setSettings } = useEditorSettingsContext();
    const { theme } = useTheme();
    const { cardColumns } = settings;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Change editor behavior.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex item-center space-x-2">
                        <Label htmlFor="themeToggle">Theme: {theme}</Label>

                        <ThemeToggle id="themeToggle" />
                    </div>
                    {/* Card Columns Slider */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="w-40" htmlFor="cardColumns">
                            Columns: {cardColumns || "auto"}
                        </Label>
                        <Slider
                            id="cardColumns"
                            min={0}
                            max={15}
                            step={1}
                            value={[cardColumns ?? 0]}
                            onValueChange={([value]) =>
                                setSettings({
                                    ...settings,
                                    cardColumns: value,
                                })
                            }
                        />
                    </div>
                    <div className="flex justify-between w-80">
                        <ToggleButton
                            setting="disableAutocomplete"
                            label="Autocomplete"
                            feedback={["Disabled", "Enabled"]}
                        />
                        <ToggleButton
                            disabled={settings.disableAutocomplete}
                            setting="disableAutocompleteInfo"
                            label="Info"
                            feedback={["Hidden", "Shown"]}
                        />
                    </div>
                    <ToggleButton
                        setting="disableTooltips"
                        label="Tooltips"
                        feedback={["Hidden", "Shown"]}
                    />
                    <ToggleButton
                        setting="showSillyCards"
                        label="Silly Cards"
                        feedback={["Hidden", "Shown"]}
                        inverted
                    />
                </div>
                <DialogFooter />
            </DialogContent>
        </Dialog>
    );
}
