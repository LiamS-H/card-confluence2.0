import { Facet } from "@codemirror/state";

const defaultSettings: IEditorSettings = {
    autoDetail: true,
    autoInfo: true,
    // highlight: true,
} as const;

export type IEditorSettingsInput = Partial<IEditorSettings>;

export interface IEditorSettings {
    autoDetail: boolean;
    autoInfo: boolean;
    // highlight: boolean;
}

export const scrycardsSettingsFacet = Facet.define<
    IEditorSettingsInput,
    IEditorSettings
>({
    combine: (values) => {
        const settings = { ...defaultSettings };
        for (const value of values) {
            for (const key of Object.keys(value)) {
                //@ts-expect-error this looks unsafe but actually is safe
                if (value[key] !== undefined) settings[key] = value[key];
            }
        }
        return settings;
    },
});
