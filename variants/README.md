# Three products, one source

The repo root is the **single source of truth** — principles, templates,
guidelines, tokens, style packs, skills. From it we build three distinct
products. You maintain the framework in one place; each product is an assembled
view of it.

```
        repo root  (principles · templates · guidelines · tokens · style-packs · skills)
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                           ▼
   1. core                   2. claude-design            3. standalone
   (headless)                (with UI)                   (Opus 4.8 API)
```

## The products

| # | Variant key | What it is | UI? | Consumed by |
|---|-------------|------------|-----|-------------|
| 1 | `core` | The framework only — principles, skills, tokens, guidelines, style packs, and the archetype layouts (`.dc.html`). The "brain." | ❌ | The agent **inside Claude Design**. Load it as a design system; it shapes how every visual is thought about and built. |
| 2 | `claude-design` | The framework **plus** the full interface — Visual Board, board editor, icon library, app shell, components. Today's shipping product. | ✅ | Loads into Claude Design as a complete design system, interface included. |
| 3 | `standalone` | Everything in #2 **plus** `server/` — an Anthropic API layer that sends the principles to **claude-opus-4-8** as a cached system prompt. | ✅ | Runs **outside** Claude Design, on your own API key, with the interface you already built. |

All three share the same principles and templates because they are assembled
from the same files. Fix a principle once at the root; rebuild; every product
has it.

## What "no UI" means for `core`

The build strips the interface layer (see `uiLayer` in `manifest.json`):
the app shell, Visual Board, board editor, `ui_kits/`, the `_ds_bundle.js`
runtime, `styles.css`, component `.jsx` implementations and `.card.html` viewer
cards, and the per-template browser runtime (`support.js`, `ds-base.js`,
thumbnails). What remains is pure framework: the principle/guideline cards, the
tokens, the style-pack skills, the archetype `.dc.html` layouts, `SKILL.md`,
`GOVERNANCE.md`, `posture.md`, and the `overrides/` contract.

## Build

```bash
node variants/build.mjs               # build all three into variants/dist/
node variants/build.mjs core          # just one
node variants/build.mjs core standalone
```

Each variant lands in `variants/dist/<key>/` with a `VARIANT.json` stamp. The
source tree is never modified. Finder `" 2"` duplicate files are excluded from
every build.

## Publishing Core to GitHub (load into Claude Design)

To load the headless Core into Claude Design via **Create New System → Link code
from GitHub**, the repo URL you paste must serve the Core content on its default
branch. So Core gets its **own** repo (the main `LinkedIn-DS` repo serves the
full source, UI included).

```bash
# one-time: create an EMPTY repo on GitHub (e.g. saasmeister/LinkedIn-DS-core)
variants/publish-core.sh git@github.com:saasmeister/LinkedIn-DS-core.git
```

`publish-core.sh` rebuilds Core and force-pushes `dist/core` to that repo as a
mirror — re-run it whenever the source changes. Then paste the core repo's URL
into Claude Design; it copies the framework files (no UI) into the new system.

## Editing the split

`manifest.json` is the contract. `uiLayer` lists the globs that make a file
"UI"; `variants.*.exclude` decides which variant drops them (`@uiLayer` expands
to the whole UI list). To move a file between products, change a glob there and
rebuild — no code change needed.
