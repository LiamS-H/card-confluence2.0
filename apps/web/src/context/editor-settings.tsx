import { type ReactNode, createContext, useContext, useState } from "react";

export interface IEditorSettings {
    cardColumns?: number;
}

export interface IEditorSettingsContext {
    settings: IEditorSettings;
    setSettings: (settings: IEditorSettings) => void;
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
    const [settings, setSettings] = useState<IEditorSettings>({});

    return (
        <editorSettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </editorSettingsContext.Provider>
    );
}
