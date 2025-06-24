import { Settings } from "codemirror-lang-scrycards";

export function settingsToText(settings: Settings): string {
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

export function isSettingsEqual(s1: Settings, s2: Settings): boolean {
    if (s1?.dir !== s2?.dir) return false;
    if (s1?.order !== s2?.order) return false;
    if (s1?.unique !== s2?.unique) return false;
    return true;
}
