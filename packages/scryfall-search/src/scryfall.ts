import {
    getEmptyCatalog,
    IDetailedCatalogEntry,
    type ICatalog,
} from "codemirror-lang-scrycards";
import {
    type ScryfallList,
    type ScryfallCatalog,
    ScryfallError,
    ScryfallCard,
} from "@scryfall/api-types";
import { ISearchSettings, SearchOrders, SearchUniques } from "./search";

export async function fetchWithHeaders(url: URL) {
    return fetch(url, {
        headers: {
            "User-Agent": "card-confluence/0.0",
            Accept: "*/*",
        },
    });
}

export async function fetchSearch(
    query: string,
    settings?: ISearchSettings,
    fetch_func?: typeof fetchWithHeaders
): Promise<ScryfallList.Cards | ScryfallError> {
    const url = new URL("https://api.scryfall.com/cards/search");
    const params = { q: query };
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

export async function fetchRandom(
    query: string
): Promise<ScryfallCard.Any | ScryfallError> {
    const url = new URL("https://api.scryfall.com/cards/random");
    const params = { q: query };
    const search = new URLSearchParams(params);
    url.search = search.toString();
    const response = await fetch(url);
    const card: ScryfallCard.Any = await response.json();
    return card;
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

    const sectionRegex = /<h2[^>]*>(.*?)<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>/g;
    let match;
    while ((match = sectionRegex.exec(text)) !== null) {
        const header = match[1];
        const pContent = match[2];
        if (!header || !pContent) continue;

        const tags: string[] = [];
        const linkRegex = /<a[^>]*>(.*?)<\/a>/g;
        let linkMatch;
        while ((linkMatch = linkRegex.exec(pContent)) !== null) {
            const tag = linkMatch[1];
            if (tag) {
                tags.push(tag.trim());
            }
        }

        if (header.endsWith("(functional)")) {
            otags.push(...tags);
        } else {
            atags.push(...tags);
        }
    }

    return { otags, atags };
}

export async function fetchCardTags(
    set: string,
    collector_number: string
): Promise<string[]> {
    try {
        const cn = collector_number.match(/^\d+/)?.[0] ?? collector_number;
        const url = `https://tagger.scryfall.com/card/${set}/${cn}`;
        const resp = await fetch(url);
        const text = await resp.text();

        const metaTagMatch = text.match(
            /<meta\s+property="og:description"\s+content="([^"]*)"/
        );
        if (!metaTagMatch || !metaTagMatch[1]) return [];
        const content = metaTagMatch[1];

        const cardTagsMatch = content.match(
            /Card Tags:\s*([\s\S]*?)(?=\n\n|$)/
        );
        if (!cardTagsMatch || !cardTagsMatch[1]) return [];

        const cardTagsSection = cardTagsMatch[1];

        const cardTags = cardTagsSection
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line) => line.replace(/^[★•]\s*/, ""));

        return cardTags;
    } catch {
        return [];
    }
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
