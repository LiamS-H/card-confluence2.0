import { ISearchSettings, SearchOptions } from "./scryfall";
const find_reg = /[^a-zA-Z]?order:([a-zA-Z]*)/;
const del_reg = /[^a-zA-Z]?order:[a-zA-Z]+/g;

export function computeSettings(domain: string): ISearchSettings {
    const computed_settings: ISearchSettings = {};

    const setting_in_domain = (domain.match(find_reg) ?? []).at(1);
    (computed_settings.order as string | undefined) =
        setting_in_domain ?? undefined;

    return computed_settings;
}

export function computeSettingsAndQuery(
    domain: string,
    query?: string
): {
    computed_settings: ISearchSettings;
    full_query: string;
    crop_query: string;
} {
    let full_query: string = `${domain} ${query}`;
    const computed_settings: ISearchSettings = {};
    const setting_in_domain = (domain.match(find_reg) ?? []).at(1);
    const setting_in_query = (query?.match(find_reg) ?? []).at(1);
    (computed_settings.order as string | undefined) =
        setting_in_query ?? setting_in_domain ?? undefined;
    if (setting_in_domain && setting_in_query) {
        full_query = `${domain.replace(find_reg, "")} ${query}`;
    }
    let crop_query = full_query;
    if (setting_in_domain || setting_in_query) {
        crop_query = full_query.replace(del_reg, "");
    }
    return { computed_settings, full_query, crop_query };
}

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

    return Array.from(allKeys).reduce((acc, key) => {
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
}
