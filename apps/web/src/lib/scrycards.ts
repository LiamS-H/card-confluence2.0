import { ISearchSettings, SearchOptions } from "./scryfall";

export function mergeSettings(
    base: ISearchSettings,
    settings?: ISearchSettings
): ISearchSettings {
    if (!settings) return base;
    //@ts-expect-error Object.keys does not preserve string union types
    const allKeys: Set<(typeof SearchOptions)[number]> = new Set([
        ...Object.keys(base),
        ...Object.keys(settings),
    ]);
    const merged: ISearchSettings = {};
    Array.from(allKeys).reduce((acc, key) => {
        const v1 = base[key];
        const v2 = settings[key];

        if (v1 !== undefined) {
            //@ts-expect-error since key was in base key is valid
            acc[key] = v1;
        } else if (v2 !== undefined) {
            //@ts-expect-error since key was in settings key is valid
            acc[key] = v2;
        }

        return acc;
    }, merged);
    return merged;
}

export function settingsToText(settings: ISearchSettings): string {
    let out = "";
    if (settings.order) {
        out += `order:${settings.order} `;
    }
    if (settings.dir) {
        out += `dir:${settings.dir} `;
    }
    if (settings.unique) {
        out += `unique:${settings.unique} `;
    }
    return out;
}
