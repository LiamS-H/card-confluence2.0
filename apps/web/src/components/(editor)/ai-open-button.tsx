import { useEditorSettingsContext } from "@/context/editor-settings";
import { SimpleToolTip } from "@/components/(ui)/tooltip";
import { Button } from "@/components/(ui)/button";
import { useCallback } from "react";

export function AIOpenButton({
    children,
    ...props
}: Parameters<typeof Button>[0]) {
    const {
        settings: { hideAiPrompter },
        setSettings,
    } = useEditorSettingsContext();

    const aiOpen = !hideAiPrompter;

    const toggleAIOpen = useCallback(() => {
        setSettings((s) => ({ ...s, hideAiPrompter: !s.hideAiPrompter }));
    }, [setSettings]);

    return (
        <SimpleToolTip text={aiOpen ? "Editor Only" : "Open GenAI"}>
            <Button {...props} onClick={toggleAIOpen}>
                {children}
            </Button>
        </SimpleToolTip>
    );
}
