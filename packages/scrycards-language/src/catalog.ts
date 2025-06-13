import { Facet } from "@codemirror/state";

export interface ICatalog {
    "card-names": string[];
    "artist-names": string[];
    "word-bank": string[];
    supertypes: string[];
    "card-types": string[];
    "artifact-types": string[];
    "battle-types": string[];
    "creature-types": string[];
    "enchantment-types": string[];
    "land-types": string[];
    "planeswalker-types": string[];
    "spell-types": string[];
    powers: string[];
    toughnesses: string[];
    loyalties: string[];
    "keyword-abilities": string[];
    "keyword-actions": string[];
    "ability-words": string[];
    "flavor-words": string[];
    watermarks: string[];

    stamps: string[];
    games: string[];
    formats: string[];
    cubes: string[];
    rarities: string[];
    criteria: string[]; // used for the is: tag
    "mana-costs": string[];
    otags: string[];
    atags: string[];
    sets: { code: string; name: string; released?: string }[];
    orders: string[];
    products: string[];
}

export function getEmptyCatalog(): ICatalog {
    return {
        "card-names": [],
        "artist-names": [],
        "word-bank": [],
        supertypes: [],
        "card-types": [],
        "artifact-types": [],
        "battle-types": [],
        "creature-types": [],
        "enchantment-types": [],
        "land-types": [],
        "planeswalker-types": [],
        "spell-types": [],
        powers: [],
        toughnesses: [],
        loyalties: [],
        "keyword-abilities": [],
        "keyword-actions": [],
        "ability-words": [],
        "flavor-words": [],
        watermarks: [],

        stamps: [],
        games: [],
        formats: [],
        cubes: [],
        rarities: [],
        criteria: [],
        "mana-costs": [],
        otags: [],
        atags: [],
        sets: [],
        orders: [],
        products: [],
    };
}

export const scrycardsCatalogFacet = Facet.define<ICatalog, ICatalog>({
    combine: (values) => {
        if (values.length === 0) {
            return getEmptyCatalog();
        }
        return values[values.length - 1];
    },
});
