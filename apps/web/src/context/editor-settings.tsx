"use client";
import { EditorSettingsModal } from "@/components/(editor)/settings";
import { createContext, useContext, useEffect, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
const LOCAL_STORAGE_KEY = "editorSettings";

export interface IEditorSettings {
    cardColumns?: number;
    window: "editor" | "genai" | "split";
    disableTooltips?: boolean;
    disableAutocomplete?: boolean;
    disableAutocompleteDetail?: boolean;
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
    useEffect(() => {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            try {
                setSettings((prev) => ({
                    ...prev,
                    ...JSON.parse(stored),
                }));
            } catch (e) {
                console.error("[editor] settings failed to load", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    return (
        <editorSettingsContext.Provider
            value={{ settings, setSettings, open, setOpen }}
        >
            {children}
            <EditorSettingsModal />
        </editorSettingsContext.Provider>
    );
}
