import { EditorView, keymap, placeholder, ViewUpdate } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import {
    defaultKeymap,
    history,
    historyKeymap,
    indentLess,
    indentMore,
} from "@codemirror/commands";
import { basicSetup } from "codemirror";
import { scrycardsFromCatalog } from "codemirror-lang-scrycards";
import { ICatalog } from "@repo/scryfall-search";
import { GetCatalogRequest, GetCatalogResponse } from "./messages.js";
import {
    acceptCompletion,
    autocompletion,
    closeBrackets,
    completionStatus,
} from "@codemirror/autocomplete";
import {
    bracketMatching,
    defaultHighlightStyle,
    syntaxHighlighting,
} from "@codemirror/language";

async function getCatalogFromBackground(): Promise<ICatalog> {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { type: "GET_CATALOG" } as GetCatalogRequest,
            (response: GetCatalogResponse) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else if (response.type === "GET_CATALOG_SUCCESS") {
                    resolve(response.data);
                } else {
                    reject(new Error(response.error));
                }
            }
        );
    });
}

let editorView: EditorView | null = null;
let isInitializing = false;

async function init() {
    if (isInitializing) return;

    const searchInput = document.getElementById(
        "deckbox-search"
    ) as HTMLInputElement | null;

    // If search input doesn't exist, we can't do anything
    if (!searchInput) {
        // If we have an editor view but no search input, it means we navigated away
        // and need to cleanup
        if (editorView) {
            editorView.destroy();
            editorView = null;
            const wrapper = document.getElementById(
                "scryfall-autocomplete-wrapper"
            );
            if (wrapper) wrapper.remove();
        }
        return;
    }

    // Check if we're already injected
    if (document.getElementById("scryfall-autocomplete-wrapper")) {
        // If we have the wrapper but no editor view (weird state), cleanup
        if (!editorView) {
            document.getElementById("scryfall-autocomplete-wrapper")?.remove();
        } else {
            // Already initialized and healthy
            return;
        }
    }

    // If we have an editor view but the wrapper is gone (SPA navigation replaced DOM),
    // we need to re-initialize. Destroy old instance first.
    if (editorView) {
        editorView.destroy();
        editorView = null;
    }

    isInitializing = true;

    try {
        const catalog = await getCatalogFromBackground();
        console.log("Catalog loaded:", catalog);

        // Re-check existence after async await
        const currentSearchInput = document.getElementById(
            "deckbox-search"
        ) as HTMLInputElement | null;
        if (!currentSearchInput) return;

        if (document.getElementById("scryfall-autocomplete-wrapper")) return;

        const wrapper = document.createElement("div");
        wrapper.id = "scryfall-autocomplete-wrapper";
        wrapper.style.width = "100%";
        wrapper.style.position = "absolute";
        wrapper.style.zIndex = "1000";
        wrapper.style.top = "0";
        wrapper.style.left = "0";
        currentSearchInput.parentNode?.insertBefore(
            wrapper,
            currentSearchInput
        );

        // Initialize with default settings
        const scryfallExtension = scrycardsFromCatalog(catalog, {
            autoDetail: true,
            autoInfo: true,
        });

        editorView = new EditorView({
            parent: wrapper,
            extensions: [
                EditorView.theme({}, { dark: true }),
                keymap.of([
                    {
                        key: "Tab",
                        preventDefault: true,
                        shift: indentLess,
                        run: (e) => {
                            if (!completionStatus(e.state))
                                return indentMore(e);
                            return acceptCompletion(e);
                        },
                    },
                ]),
                // placeholder(searchInput.placeholder),
                placeholder("enter"),
                history(),
                bracketMatching(),
                closeBrackets(),
                autocompletion(),
                scryfallExtension,
            ],
        });
    } catch (error) {
        console.error("Failed to initialize Scryfall autocomplete:", error);
        const wrapper = document.getElementById(
            "scryfall-autocomplete-wrapper"
        );
        if (wrapper) wrapper.remove();
    } finally {
        isInitializing = false;
    }
}

const observer = new MutationObserver(() => {
    init();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial check
init();
