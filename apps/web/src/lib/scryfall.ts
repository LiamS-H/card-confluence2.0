"use server";

import {
    fetchWithHeaders as _fetchWithHeaders,
    fetchSearch as _fetchSearch,
    fetchRandom as _fetchRandom,
    fetchRulings as _fetchRulings,
    fetchCatalog as _fetchCatalog,
    fetchSets as _fetchSets,
    fetchTags as _fetchTags,
    fetchCardTags as _fetchCardTags,
    getCatalog as _getCatalog,
} from "@repo/scryfall-search";

export async function fetchWithHeaders(url: URL) {
    return _fetchWithHeaders(url);
}

export async function fetchSearch(...args: Parameters<typeof _fetchSearch>) {
    return _fetchSearch(...args);
}

export async function fetchRandom(...args: Parameters<typeof _fetchRandom>) {
    return _fetchRandom(...args);
}

export async function fetchRulings(...args: Parameters<typeof _fetchRulings>) {
    return _fetchRulings(...args);
}

export async function fetchCatalog(...args: Parameters<typeof _fetchCatalog>) {
    return _fetchCatalog(...args);
}

export async function fetchSets(...args: Parameters<typeof _fetchSets>) {
    return _fetchSets(...args);
}

export async function fetchTags(...args: Parameters<typeof _fetchTags>) {
    return _fetchTags(...args);
}

export async function fetchCardTags(
    ...args: Parameters<typeof _fetchCardTags>
) {
    return _fetchCardTags(...args);
}

export async function getCatalog(...args: Parameters<typeof _getCatalog>) {
    return _getCatalog(...args);
}
