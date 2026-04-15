# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ai-conversation-control** is a browser extension written in TypeScript that adds navigation, checkpointing, and control features on top of AI chat interfaces (initially ChatGPT). The entire codebase is a freshly scaffolded skeleton — all source files are empty stubs awaiting implementation. `package.json`, `tsconfig.json`, and `extension/manifest.json` are also empty and must be populated before any build tooling will work.

## Build & Development

> These commands will apply once `package.json` is filled in. The `.gitignore` already excludes `node_modules/`, `dist/`, and `build/`.

```bash
npm install          # install dependencies
npm run build        # compile TypeScript → dist/ or build/
npm run dev          # watch mode for development
npm run lint         # linter
npm test             # run tests
```

To load the unpacked extension in Chrome/Edge: open `chrome://extensions`, enable Developer Mode, click **Load unpacked**, and select the build output directory.

## Architecture

The project uses a standard Manifest V3 browser extension layout with a shared module layer.

### Layers

```
shared/          ← platform-agnostic types and interfaces
extension/       ← all browser extension code
  content/       ← content scripts injected into the AI chat page
  background/    ← service worker (Manifest V3 background)
  popup/         ← browser action popup UI
  onboarding/    ← first-run onboarding page
  pipeline/      ← data processing pipeline
  observer/      ← DOM mutation observation
  navigation/    ← in-page jump/navigation controller
  sources/       ← per-platform message extractors
  storage/       ← storage abstraction
  tooltip/       ← tooltip UI component
  utils/         ← shared utilities
```

### Data Flow

1. **`content/boot.ts`** bootstraps the content script, wiring together the observer, sources, and pipeline.
2. **`content/content.ts`** is the main content script entry point registered in the manifest.
3. **`observer/mutationObserver.ts`** watches the DOM for new AI messages appearing on the page.
4. **`sources/chatgptSourcs.ts`** (ChatGPT source — see Naming Quirks below) implements the `MessageSource` interface from `shared/interfaces/messageSource.ts` to extract structured message data from ChatGPT's DOM.
5. The **pipeline** (`pipeline/normalizer.ts` → `pipeline/indexer.ts` → `pipeline/checkpointPipeline.ts`) normalizes raw DOM data, indexes it, and creates checkpoints (defined in `shared/types/checkpoint.ts`).
6. **`navigation/jumpController.ts`** consumes the checkpoint index to let users jump between conversation turns.
7. **`storage/storageAdaptar.ts`** (see Naming Quirks) abstracts `chrome.storage` behind an adapter interface.
8. **`background/background.ts`** runs as the Manifest V3 service worker, handling cross-tab or persistent state.
9. **`popup/popup.ts`** drives the browser action popup UI; **`onboarding/onboarding.ts`** drives the first-run page.

### Shared Module

`shared/` is intended to be importable by both `extension/` code and any future test utilities without pulling in browser globals.

- `shared/types/checkpoint.ts` — `Checkpoint` type/interface
- `shared/interfaces/messageSource.ts` — `MessageSource` interface that each platform source must implement

## Naming Quirks

Two filenames contain intentional-looking typos from the initial commit. **Preserve these exact filenames** to avoid breaking imports:

| File | Quirk |
|------|-------|
| `extension/sources/chatgptSourcs.ts` | "Sourcs" not "Sources" |
| `extension/storage/storageAdaptar.ts` | "Adaptar" not "Adapter" |

## Adding a New AI Platform Source

1. Create `extension/sources/<platform>Source.ts` implementing `MessageSource` from `shared/interfaces/messageSource.ts`.
2. Register it in `content/boot.ts`.
3. Add the target URL pattern to the `content_scripts` entry in `extension/manifest.json`.
