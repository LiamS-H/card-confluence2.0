import { EditorView, keymap, placeholder, ViewUpdate } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { scrycardsFromCatalog } from "codemirror-lang-scrycards";
import { getCatalog, ICatalog } from "@repo/scryfall-search";

// Cache key for catalog
const CATALOG_CACHE_KEY = "scryfall_catalog_cache";
const CATALOG_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

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

async function init() {
    const searchInput = document.getElementById(
        "deckbox-search"
    ) as HTMLInputElement;
    if (!searchInput) return;

    // Hide original input
    searchInput.style.display = "none";

    const wrapper = document.createElement("div");
    wrapper.id = "scryfall-autocomplete-wrapper";
    wrapper.style.width = "100%";
    searchInput.parentNode?.insertBefore(wrapper, searchInput);

    const catalog = await getCachedCatalog();

    // Initialize with default settings
    const scryfallExtension = scrycardsFromCatalog(catalog, {
        autoDetail: true,
        autoInfo: true,
    });

    const startState = EditorState.create({
        doc: searchInput.value,
        extensions: [
            keymap.of([...defaultKeymap, ...historyKeymap]),
            history(),
            placeholder("Search for cards..."),
            scryfallExtension,
            EditorView.updateListener.of((update: ViewUpdate) => {
                if (update.docChanged) {
                    searchInput.value = update.state.doc.toString();
                    searchInput.dispatchEvent(
                        new Event("input", { bubbles: true })
                    );
                    searchInput.dispatchEvent(
                        new Event("change", { bubbles: true })
                    );
                }
            }),
            EditorView.theme({
                "&": {
                    backgroundColor: "var(--bg-surface-low, #fff)",
                    color: "var(--fg-primary, #000)",
                    border: "1px solid var(--border-default, #ccc)",
                    borderRadius: "4px",
                    padding: "4px",
                },
                ".cm-content": {
                    caretColor: "var(--fg-primary, #000)",
                },
                "&.cm-focused": {
                    outline: "2px solid var(--focus-ring, blue)",
                },
            }),
        ],
    });

    new EditorView({
        state: startState,
        parent: wrapper,
    });
}

// Observer to handle dynamic loading (SPA)
const observer = new MutationObserver(() => {
    if (
        document.getElementById("deckbox-search") &&
        !document.getElementById("scryfall-autocomplete-wrapper")
    ) {
        init();
    }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial check
init();
