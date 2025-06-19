import { SearchSettings } from "./scryfall";
const reg = /[^a-zA-Z]?order:([a-zA-Z]*)/;

export function computeSettings(domain: string): SearchSettings {
    const computed_settings: SearchSettings = {};
    // TODO: make generic for all settings, loop over settings to extract application of settings
    const setting_in_domain = (domain.match(reg) ?? []).at(1);
    computed_settings.order = setting_in_domain ?? undefined;
    return computed_settings;
}

export function computeSettingsAndQuery(
    domain: string,
    query: string,
    settings: SearchSettings
): { computed_settings: SearchSettings; full_query: string } {
    let full_query: string = `${domain} ${query}`;
    const computed_settings: SearchSettings = {};
    // TODO: make generic for all settings, loop over settings to extract application of settings
    const setting_in_domain = (domain.match(reg) ?? []).at(1);
    const setting_in_query = (query.match(reg) ?? []).at(1);
    computed_settings.order =
        setting_in_query ?? setting_in_domain ?? undefined;
    if (setting_in_domain && setting_in_query && !settings.order) {
        full_query = `${domain.replace(reg, "")} ${query}`;
    }

    if (settings.order && (setting_in_domain || setting_in_query)) {
        full_query = full_query.replace(/[^a-zA-Z]?order:[a-zA-Z]+/g, "");
    }
    return { computed_settings, full_query };
}
