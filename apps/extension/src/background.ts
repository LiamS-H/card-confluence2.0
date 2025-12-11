import { getCatalog, ICatalog } from "@repo/scryfall-search";
import { GetCatalogRequest, GetCatalogResponse } from "./messages.js";

const CATALOG_CACHE_KEY = "scryfall_catalog_cache";
// const CATALOG_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
// const CATALOG_CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour
const CATALOG_CACHE_EXPIRY = 20 * 1000; // 20 second

async function getCachedCatalog(): Promise<ICatalog> {
    const now = Date.now();
    const cached = await chrome.storage.local.get(CATALOG_CACHE_KEY);

    if (
        cached[CATALOG_CACHE_KEY] &&
        now - (cached[CATALOG_CACHE_KEY] as any).timestamp <
            CATALOG_CACHE_EXPIRY
    ) {
        return (cached[CATALOG_CACHE_KEY] as any).data;
    }

    const catalog = await getCatalog();
    await chrome.storage.local.set({
        [CATALOG_CACHE_KEY]: { timestamp: now, data: catalog },
    });
    return catalog;
}

chrome.runtime.onMessage.addListener(
    (
        message: GetCatalogRequest,
        _sender,
        sendResponse: (response: GetCatalogResponse) => void
    ) => {
        if (message.type === "GET_CATALOG") {
            getCachedCatalog()
                .then((data) => {
                    sendResponse({ type: "GET_CATALOG_SUCCESS", data });
                })
                .catch((error) => {
                    console.error("Failed to fetch catalog:", error);
                    sendResponse({
                        type: "GET_CATALOG_ERROR",
                        error: error.message || "Unknown error",
                    });
                });
            return true;
        }
    }
);

console.log("Card Confluence Background Service Worker Initialized");
