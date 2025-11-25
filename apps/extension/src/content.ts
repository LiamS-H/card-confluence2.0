import { EditorView, keymap, placeholder, ViewUpdate } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import {
    defaultKeymap,
    history,
    historyKeymap,
    indentLess,
    indentMore,
    insertNewline,
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

    const parent = searchInput?.parentElement;
    const searchCarrot = parent?.querySelector(
        ".search-results-feedback"
    ) as HTMLElement | null;
    if (!searchInput || !parent || !searchCarrot) {
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

    searchCarrot.style.opacity = "0%";

    if (document.getElementById("scryfall-autocomplete-wrapper")) {
        if (!editorView) {
            document.getElementById("scryfall-autocomplete-wrapper")?.remove();
        } else {
            return;
        }
    }

    if (editorView) {
        editorView.destroy();
        editorView = null;
    }

    isInitializing = true;

    try {
        const catalog = await getCatalogFromBackground();
        console.log("Catalog loaded:", catalog);

        const currentSearchInput = document.getElementById(
            "deckbox-search"
        ) as HTMLInputElement | null;
        if (!currentSearchInput) return;

        if (document.getElementById("scryfall-autocomplete-wrapper")) return;

        searchInput.style.position = "absolute";
        searchInput.style.pointerEvents = "none";
        searchInput.style.opacity = "0%";

        const wrapper = document.createElement("div");
        wrapper.id = "scryfall-autocomplete-wrapper";
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.flexGrow = "1";
        wrapper.style.height = "33.1px";
        wrapper.style.textAlign = "left";
        wrapper.style.background = "#0F0F0F";
        wrapper.style.border = "0.8px black";
        wrapper.style.borderBottomLeftRadius = "5.25px";
        wrapper.style.borderTopLeftRadius = "5.25px";
        // wrapper.style.position = "absolute";
        // wrapper.style.zIndex = "1000";
        // wrapper.style.top = "0";
        // wrapper.style.left = "0";
        currentSearchInput.parentNode?.insertBefore(
            wrapper,
            currentSearchInput
        );

        const scryfallExtension = scrycardsFromCatalog(catalog, {
            autoDetail: true,
            autoInfo: true,
        });

        const url_params = new URLSearchParams(window.location.search);
        const url_search = url_params.get("q");

        editorView = new EditorView({
            parent: wrapper,
            doc: url_search ?? "",
            extensions: [
                EditorView.theme(
                    {
                        "&.cm-tooltip": { zIndex: "1000" },
                        "&.cm-editor": { width: "100%" },
                    },
                    { dark: true }
                ),
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
                keymap.of([
                    {
                        key: "Enter",
                        preventDefault: false,
                        // shift: insertNewline,
                        run: (e) => {
                            if (completionStatus(e.state)) {
                                return acceptCompletion(e);
                            }
                            const searchButton = parent?.querySelector(
                                "button"
                            ) as HTMLElement | null;
                            searchButton?.click();
                            return true;
                        },
                    },
                ]),
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
                placeholder("cconfluence search..."),
                history(),
                bracketMatching(),
                closeBrackets(),
                autocompletion(),
                EditorView.lineWrapping,
                scryfallExtension,
            ],
        });
        searchInput.addEventListener("focus", () => {
            editorView?.focus();
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

init();
