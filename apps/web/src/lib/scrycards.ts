import { IEditorSettings } from "@/context/editor-settings";
import { ICatalog, SearchSettings } from "codemirror-lang-scrycards";

export function settingsToText(settings: SearchSettings): string {
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

export function isSettingsEqual(
    s1: SearchSettings,
    s2: SearchSettings
): boolean {
    if (s1?.dir !== s2?.dir) return false;
    if (s1?.order !== s2?.order) return false;
    if (s1?.unique !== s2?.unique) return false;
    return true;
}

const sillyCardTypes = new Set([
    "conspiracy",
    "hero",
    "phenomenon",
    "plane",
    "scheme",
    "vanguard",
]);

const sillyCreatureTypes = new Set(["brainiac"]);

const sillyKeywords = new Set(["augment", "host", "wordy"]);

export function getCatalogWithSettings(
    catalog: ICatalog,
    settings: IEditorSettings
) {
    catalog = { ...catalog };
    if (!settings.showSillyCards) {
        catalog["card-types"] = catalog["card-types"].filter(
            (t) => !sillyCardTypes.has(t.toLowerCase())
        );
        catalog["creature-types"] = catalog["creature-types"].filter(
            (t) => !sillyCreatureTypes.has(t.toLowerCase())
        );
        catalog["keyword-abilities"] = catalog["keyword-abilities"].filter(
            (t) => !sillyKeywords.has(t.toLowerCase())
        );
    }
    return catalog;
}
