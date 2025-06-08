import { getEmptyCatalog, type ICatalog } from "codemirror-lang-scrycards";
import {
    type ScryfallList,
    type ScryfallCatalog,
    ScryfallError,
} from "@scryfall/api-types";
import { parse } from "node-html-parser";

async function fetchWithHeaders(url: URL) {
    return fetch(url, {
        headers: {
            "User-Agent": "card-confluence/0.0",
            Accept: "*/*",
        },
    });
}

export interface SearchSettings {
    unique?: "cards" | "arts" | "prints"; //The strategy for omitting similar cards.
    order?: //The method to sort returned cards.
    | "name"
        | "set"
        | "released"
        | "rarity"
        | "color"
        | "usd"
        | "tix"
        | "eur"
        | "cmc"
        | "power"
        | "toughness"
        | "edhrec"
        | "penny"
        | "artist"
        | "review";
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
    settings?: SearchSettings
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
    const response = await fetch(url); // we don't use headers since we are inside browser
    const card_list: ScryfallList.Cards = await response.json();
    return card_list;
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
    const catalog: ScryfallList.Sets = await response.json();
    return catalog;
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

export async function getCatalog(): Promise<ICatalog> {
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
        "Augment",
        "Back",
        "Bear",
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
        "Digital",
        "Double Sided",
        "Duel Commander",
        "E T B",
        "English Art",
        "Etched",
        "Extended Art",
        "Extra",
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
        "Starter Deck",
        "Story Spotlight",
        "TCGplayer ID",
        "Textless",
        "Token",
        "Tombstone",
    ];

    catalog.formats = [
        "historic",
        "timeless",
        "gladiator",
        "pioneer",
        "explorer",
        "modern",
        "legacy",
        "pauper",
        "vintage",
        "penny", // Penny Dreadful
        "commander",
        "oathbreaker",
        "standardbrawl",
        "brawl",
        "alchemy",
        "paupercommander",
        "duel", // Duel Commander
        "oldschool", // Old School 93/94
        "premodern",
        "predh",
    ];

    catalog.rarities = ["common", "uncommon", "rare", "mythic"];

    catalog.cubes = [
        "arena",
        "grixis",
        "legacy",
        "chuck",
        "twisted",
        "protour",
        "uncommon",
        "april",
        "modern",
        "amaz",
        "tinkerer",
        "livethedream",
        "chromatic",
        "vintage",
    ];
    catalog.games = ["paper", "mtgo", "mtga"];

    return catalog;
}
