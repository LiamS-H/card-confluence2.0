import {
    getEmptyCatalog,
    IDetailedCatalogEntry,
    type ICatalog,
} from "codemirror-lang-scrycards";
import {
    type ScryfallList,
    type ScryfallCatalog,
    ScryfallError,
} from "@scryfall/api-types";
import { parse } from "node-html-parser";

export async function fetchWithHeaders(url: URL) {
    return fetch(url, {
        headers: {
            "User-Agent": "card-confluence/0.0",
            Accept: "*/*",
        },
    });
}

export const SearchOrders = [
    {
        label: "name",
        detail: undefined,
        info: "Sort cards by name, A → Z",
    },
    {
        label: "set",
        detail: "code / number",
        info: "Sort cards by their set and collector number: AAA/#1 → ZZZ/#999",
    },
    {
        label: "released",
        detail: "date",
        info: "Sort cards by their release date: Newest → Oldest",
    },
    {
        label: "rarity",
        detail: undefined,
        info: "Sort cards by their rarity: Common → Mythic",
    },
    {
        label: "color",
        detail: undefined,
        info: "Sort cards by their color and color identity: WUBRG → multicolor → colorless",
    },
    {
        label: "usd",
        detail: "$",
        info: "Sort cards by their lowest known U.S. Dollar price: 0.01 → highest, null last",
    },
    {
        label: "tix",
        detail: "mtgo",
        info: "Sort cards by their lowest known TIX price: 0.01 → highest, null last",
    },
    {
        label: "eur",
        detail: "€",
        info: "Sort cards by their lowest known Euro price: 0.01 → highest, null last",
    },
    {
        label: "cmc",
        detail: undefined,
        info: "Sort cards by their mana value: 0 → highest",
    },
    {
        label: "power",
        detail: undefined,
        info: "Sort cards by their power: null → highest",
    },
    {
        label: "toughness",
        detail: undefined,
        info: "Sort cards by their toughness: null → highest",
    },
    {
        label: "edhrec",
        detail: "playrate",
        info: "Sort cards by their EDHREC ranking: lowest → highest",
    },
    {
        label: "penny",
        detail: "playrate",
        info: "Sort cards by their Penny Dreadful ranking: lowest → highest",
    },
    {
        label: "artist",
        detail: undefined,
        info: "Sort cards by their front-side artist name: A → Z",
    },
    {
        label: "review",
        detail: undefined,
        info: "Sort cards how podcasts review sets, usually color & CMC, lowest → highest, with Booster Fun cards at the end",
    },
] as const;

export const SearchUniques = [
    {
        label: "cards",
        info: "Removes duplicate gameplay objects (cards that share a name and have the same functionality). For example, if your search matches more than one print of Pacifism, only one copy of Pacifism will be returned.",
    },
    {
        label: "art",
        info: "Returns only one copy of each unique artwork for matching cards. For example, if your search matches more than one print of Pacifism, one card with each different illustration for Pacifism will be returned, but any cards that duplicate artwork already in the results will be omitted.",
    },
    {
        label: "prints",
        info: "Returns all prints for all cards matched (disables rollup). For example, if your search matches more than one print of Pacifism, all matching prints will be returned.",
    },
] as const;

export const SearchOptions = [
    "unique",
    "order",
    "dir",
    "include_extras",
    "include_multilingual",
    "include_variations",
    "page",
    "format",
    "pretty",
] as const;

export interface ISearchSettings {
    unique?: "cards" | "art" | "prints"; //The strategy for omitting similar cards.
    order?: (typeof SearchOrders)[number]["label"]; //The method to sort returned cards.
    dir?: "auto" | "asc" | "desc"; //The direction to sort cards.
    include_extras?: boolean; //If true, extra cards (tokens, planes, etc) will be included. Equivalent to adding include:extras to the fulltext search. Defaults to false.
    include_multilingual?: boolean; //If true, cards in every language supported by Scryfall will be included. Defaults to false.
    include_variations?: boolean; //If true, rare care variants will be included, like the Hairy Runesword. Defaults to false.
    page?: number; //The page number to return, default 1.
    format?: "json" | "csv"; //The data format to return: json or csv. Defaults to json.
    pretty?: boolean; //If true, the returned JSON will be prettified. Avoid using for production code.
}

export async function fetchSearch(
    query: string,
    settings?: ISearchSettings,
    fetch_func?: typeof fetchWithHeaders
): Promise<ScryfallList.Cards | ScryfallError> {
    const url = new URL("https://api.scryfall.com/cards/search");
    const params = settings ? { q: query } : { q: query };
    const search = new URLSearchParams(params);
    if (settings) {
        for (const key in settings) {
            const val = (settings as Record<string, string | boolean | number>)[
                key
            ]?.toString();
            if (!val) continue;
            search.set(key, val.toString());
        }
    }

    url.search = search.toString();
    const response = await (fetch_func ? fetch_func(url) : fetch(url));
    const card_list: ScryfallList.Cards = await response.json();
    return card_list;
}

export async function fetchRulings(
    id: string
): Promise<ScryfallList.Rulings | ScryfallError> {
    const url = new URL(`https://api.scryfall.com/cards/${id}/rulings`);
    const response = await fetch(url);
    const rulings = await response.json();
    return rulings;
}

export async function fetchCatalog(endpoint: string): Promise<string[]> {
    const url = new URL(`https://api.scryfall.com/catalog/${endpoint}`);
    const response = await fetchWithHeaders(url);
    const catalog: ScryfallCatalog = await response.json();
    return catalog.data;
}

export async function fetchSets(): Promise<ScryfallList.Sets | ScryfallError> {
    const url = new URL("https://api.scryfall.com/sets");
    const response = await fetchWithHeaders(url);
    const sets: ScryfallList.Sets = await response.json();
    return sets;
}

export async function fetchTags(): Promise<{
    atags: string[];
    otags: string[];
}> {
    const otags: string[] = [];
    const atags: string[] = [];

    const resp = await fetch("https://scryfall.com/docs/tagger-tags");
    const text = await resp.text();
    const root = parse(text);

    const headers = root.querySelectorAll(".prose > h2");

    headers.forEach((header) => {
        if (!header.textContent) return;
        const tags: string[] = [];
        const nextParagraph = header.nextElementSibling;

        if (nextParagraph) {
            const links = nextParagraph.querySelectorAll("a");
            links.forEach((link) => {
                if (!link.textContent) return;
                const tag = link.textContent.trim();
                tags.push(tag);
            });

            if (header.textContent.endsWith("(functional)")) {
                otags.push(...tags);
            } else {
                atags.push(...tags);
            }
        }
    });
    return { otags, atags };
}

export async function getCatalog(): Promise<Readonly<ICatalog>> {
    const catalogEndpoints = [
        "card-names",
        "artist-names",
        "word-bank",
        "supertypes",
        "card-types",
        "artifact-types",
        "battle-types",
        "creature-types",
        "enchantment-types",
        "land-types",
        "planeswalker-types",
        "spell-types",
        "powers",
        "toughnesses",
        "loyalties",
        "keyword-abilities",
        "keyword-actions",
        "ability-words",
        "flavor-words",
        "watermarks",
    ] as const;

    const catalog = getEmptyCatalog();

    const promises: Promise<unknown>[] = [];

    promises.push(
        fetchTags()
            .then((resp) => {
                catalog.atags = resp.atags;
                catalog.otags = resp.otags;
            })
            .catch((e) => {
                console.error(e);
            })
    );

    for (const endpoint of catalogEndpoints) {
        const promise = fetchCatalog(endpoint)
            .then((list) => {
                catalog[endpoint] = list;
            })
            .catch((e) => {
                console.error(e);
            });
        promises.push(promise);
    }
    promises.push(
        fetchSets()
            .then((list) => {
                if (list.object === "error") {
                    console.error(list);
                    return [];
                }
                catalog.sets = list.data.map(({ code, name, released_at }) => ({
                    code,
                    name,
                    released: released_at,
                }));
            })
            .catch((e) => {
                console.error(e);
            })
    );

    await Promise.allSettled(promises);

    catalog.criteria = [
        "Adventure",
        "Arena ID",
        "Art Series",
        "Artist",
        "Artist Misprint",
        "Attraction Lights",
        "Atypical",
        "Augment",
        "Back",
        "Bear",
        "Beginner Box",
        "Booster",
        "Borderless",
        "Brawl Commander",
        "Buy-a-Box",
        "Cardmarket ID",
        "Class Layout",
        "Color Indicator",
        "Colorshifted",
        "Commander",
        "Companion",
        "Content Warning",
        "Covered",
        "Creature Land",
        "Datestamped",
        "Default",
        "Digital",
        "Double Sided",
        "Duel Commander",
        "E T B",
        "English Art",
        "Etched",
        "Extended Art",
        "Extra",
        "Final Fantasy",
        "First Printing",
        "Flavor Name",
        "Flavor Text",
        "Flip",
        "Foil",
        "Foreign Black Border",
        "Foreign White Border",
        "French Vanilla",
        "Full Art",
        "Funny",
        "Future",
        "Game Changer",
        "Game Day",
        "Highres",
        "Historic",
        "Hybrid Mana",
        "Illustration",
        "Intro Pack",
        "Invitational Card",
        "Leveler",
        "Localized Name",
        "MTGO ID",
        "Masterpiece",
        "Meld",
        "Modal",
        "Modal Double Faced",
        "Modern",
        "Multiverse ID",
        "New",
        "Nonfoil",
        "Oathbreaker",
        "Old",
        "Outlaw",
        "Oversized",
        "Paired Commander",
        "Paper Art",
        "Party",
        "Permanent",
        "Phyrexian Mana",
        "Planar",
        "Planeswalker Deck",
        "Prerelease Promo",
        "Printed Text",
        "Promo",
        "Related",
        "Release Promo",
        "Reprint",
        "Reserved List",
        "Reversible",
        "Security Stamp",
        "Showcase",
        "Spell",
        "Spellbook",
        "Spikey",
        "Split Card",
        "Stamped",
        "Starter Collection",
        "Starter Deck",
        "Story Spotlight",
        "TCGplayer ID",
        "Textless",
        "Token",
        "Tombstone",
        "Transform",
        "Unique",
        "Universes Beyond",
        "Vanilla",
        "Variation",
        "Watermark",
    ];

    catalog.formats = [
        { label: "standard", detail: undefined },
        { label: "future", detail: "Future Standard" },
        { label: "historic", detail: undefined },
        { label: "timeless", detail: undefined },
        { label: "gladiator", detail: undefined },
        { label: "pioneer", detail: undefined },
        { label: "explorer", detail: undefined },
        { label: "modern", detail: undefined },
        { label: "legacy", detail: undefined },
        { label: "pauper", detail: undefined },
        { label: "vintage", detail: undefined },
        { label: "penny", detail: "Penny Dreadful" },
        { label: "commander", detail: undefined },
        { label: "oathbreaker", detail: undefined },
        { label: "standardbrawl", detail: "Standard Brawl" },
        { label: "brawl", detail: undefined },
        { label: "alchemy", detail: undefined },
        { label: "paupercommander", detail: "Pauper Commander" },
        { label: "duel", detail: "Duel Commander" },
        { label: "oldschool", detail: "Old School 93/94" },
        { label: "premodern", detail: undefined },
        { label: "predh", detail: undefined },
    ];

    catalog.rarities = ["common", "uncommon", "rare", "mythic"];

    catalog.cubes = [
        "Arena",
        "Grixis",
        "Legacy",
        "Chuck",
        "Twisted",
        "Protour",
        "Uncommon",
        "April",
        "Modern",
        "Amaz",
        "Tinkerer",
        "Livethedream",
        "Chromatic",
        "Vintage",
    ];
    catalog.games = ["paper", "mtgo", "mtga"];
    (catalog.orders as readonly IDetailedCatalogEntry[]) = SearchOrders;
    (catalog.uniques as readonly IDetailedCatalogEntry[]) = SearchUniques;
    catalog.products = [
        // Core types
        "core",
        "expansion",
        "draftinnovation",
        // Series of products
        "masters",
        "funny",
        "commander",
        "duel_deck",
        "from_the_vault",
        "spellbook",
        "premium_deck",
        // More specialized types
        "alchemy",
        "archenemy",
        "masterpiece",
        "memorabilia",
        "planechase",
        "promo",
        "starter",
        "token",
        "treasure_chest",
        "vanguard",
    ];

    return catalog;
}
