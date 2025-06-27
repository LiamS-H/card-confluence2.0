import { EditorSettingsModal } from "@/components/(editor)/settings";
import { createContext, useContext, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

export interface IEditorSettings {
    cardColumns?: number;
    window: "editor" | "genai" | "split";
    disableTooltips?: boolean;
    disableAutocomplete?: boolean;
    disableAutocompleteInfo?: boolean;
    showSillyCards?: boolean;
}

export interface IEditorSettingsContext {
    settings: IEditorSettings;
    setSettings: Dispatch<SetStateAction<IEditorSettings>>;
    open: boolean;
    setOpen: (o: boolean) => void;
}

const editorSettingsContext = createContext<IEditorSettingsContext | null>(
    null
);

export function useEditorSettingsContext() {
    const context = useContext(editorSettingsContext);
    if (!context)
        throw Error("useEditorSettingsContext must be used within provider.");
    return context;
}

export function EditorContextProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<IEditorSettings>({
        window: "split",
    });
    const [open, setOpen] = useState<boolean>(false);

    return (
        <editorSettingsContext.Provider
            value={{ settings, setSettings, open, setOpen }}
        >
            {children}
            <EditorSettingsModal />
        </editorSettingsContext.Provider>
    );
}
