import * as React from "react";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/(ui)/tooltip";
import { useEditorSettingsContext } from "@/context/editor-settings";

export function SimpleToolTip({
    text,
    children,
}: {
    text: string;
    children: React.ReactNode;
}) {
    const {
        settings: { disableTooltips },
    } = useEditorSettingsContext();
    if (disableTooltips) {
        return children; // bro this makes cursor snap when holding down a key and editing order/unique WHY????
    }
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent>
                <p>{text}</p>
            </TooltipContent>
        </Tooltip>
    );
}
