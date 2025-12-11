# Walkthrough - Chrome Extension & Shared Module

## Changes

### Shared Package (`packages/scryfall-search`)

- Created a new workspace package `@repo/scryfall-search`.
- Moved `scryfall.ts` and `search.ts` from `apps/web/src/lib` to this package.
- Removed `"use server"` from the shared `scryfall.ts` to allow client-side usage in the extension.
- Exported `ICatalog` and other types.
- **Fix**: Replaced special characters (arrows `→`, euro `€`) in `search.ts` with ASCII alternatives (`->`, `EUR`) to prevent UTF-8 encoding issues.

### Web App (`apps/web`)

- Updated `package.json` to depend on `@repo/scryfall-search`.
- Refactored `src/lib/scryfall.ts` to re-export functions from the shared package.
- **Fix**: Wrapped re-exported functions in `src/lib/scryfall.ts` with explicit `async` functions to ensure Next.js correctly recognizes them as Server Actions.
- Refactored `src/lib/search.ts` to re-export types and constants.

### Chrome Extension (`apps/extension`)

- **Framework**: Migrated to **WXT** (Web Extension Framework) for better build tooling and developer experience.
- **Structure**:
    - `entrypoints/content.ts`: Content script that injects CodeMirror.
    - `entrypoints/background.ts`: Background script.
    - `utils/`: Helper functions (`catalog-manager.ts`, `catalog-utils.ts`).
    - `wxt.config.ts`: Configuration file replacing `vite.config.ts` and `manifest.json`.
- **Functionality**:
    - Observes DOM for `<input id="deckbox-search" />` on Moxfield.
    - Replaces it with a CodeMirror instance with Scryfall autocomplete.
    - Syncs changes back to the original input.
    - Caches Scryfall catalog in `browser.storage.local` (daily expiry).
- **Build**: Successfully built using `pnpm wxt build`. Output is in `.output/chrome-mv3`.

## VerificationResults

### Automated Tests

- Ran `pnpm wxt build` in `apps/extension` -> **Success**.
- Verified `apps/web` dependencies -> **Success**.

### Manual Verification

- The extension build output is in `apps/extension/.output/chrome-mv3`.
- To test, load this folder as an unpacked extension in Chrome and visit a Moxfield deck page.
