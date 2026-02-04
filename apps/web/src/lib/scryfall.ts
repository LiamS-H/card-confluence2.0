"use server";

import {
    fetchCatalog as _fetchCatalog,
    fetchTags as _fetchTags,
    fetchCardTags as _fetchCardTags,
    getCatalog as _getCatalog,
} from "@repo/scryfall-search";

export async function fetchCatalog(...args: Parameters<typeof _fetchCatalog>) {
    return _fetchCatalog(...args);
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
