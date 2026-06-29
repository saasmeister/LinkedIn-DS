# LinkedIn Visual Design System — Full UI

A **colour- and font-agnostic** system for building strong LinkedIn post visuals — single graphics, carousels, infographics and quote cards on a 1080 × 1350 (4:5) canvas. It encodes the *principles* of a good visual, never one brand's values. You bring your own colours and fonts (the "brand layer"); every canvas role, headline, template and identity bar re-derives from them automatically.

This is the **full variant**: the complete framework **plus the visual UI** — the **Visual Board** (a Canva-style "LinkedIn Designer" view: hero + scrollable reel + a live brand slider), the **board editor** (direct-manipulation editing), and the **icon editor**. The headless Core is the same framework without this UI.

> **Core idea:** the value is in the *principles*, not the brand values. A token names a **role and a function** ("section background = the secondary colour"), never a concrete value.

---

> # ⛔ INSTALLING THIS SYSTEM? READ THIS FIRST — INSTALL ALL OF IT, INCLUDING THE UI.
>
> **This repository IS the complete design system. There is no larger "upstream" to defer to, and nothing here is "reference only" or optional.** When you import it into a host (e.g. Claude Design), bring in EVERYTHING — do not distill, sample, or leave parts out "to keep it focused," and do not ask the user which parts to include:
>
> 1. **Every template archetype** in `templates/<type>-NN-<slug>/` (all ~68) — as usable templates, not a sampled handful.
> 2. **Every style pack** in `style-packs/` (`doodle`, `bento`, `paper`).
> 3. **Every principle card** (`principles/*.card.html`) AND **guideline card** (`guidelines/*.card.html`) — including the Anti-Slop Gate.
> 4. **The real components** — `components/**/*.jsx` + their `.d.ts`/`.prompt.md` contracts; the component `.card.html` viewer cards; the **icon kit + icon editor** (`components/icons/`).
> 5. **The tokens + `styles.css`**, the anti-slop tooling, and `posture.md`, `BRIEF.md`, `GOVERNANCE.md`.
> 6. **The visual UI** — `LinkedIn Visual Designer.html` (app shell), `Visual Board.html` + `visual-board.js` + `board-editor.js`, `START HERE.html` (the brand setup wizard / slider), and `ui_kits/`. Install and wire these — they are the point of this variant (see GATE — VISUAL SHELL).
> 7. **BRAND FIRST** — if `overrides/brand.css` is unconfigured, capture the brand *before* designing: open the **START HERE** wizard (the brand slider) or take a website / brand doc / the colours + font, write `overrides/brand.css`, then build. Never scaffold on the placeholder default and ask afterwards.
> 8. **APPLY THE BRAND TO EVERYTHING — no template left on the default blue.** Every template, card and component is token-driven and re-derives from `overrides/brand.css`. The template prop-defaults are intentionally empty, so templates inherit the configured brand automatically — you do NOT need to re-colour them one by one. Verify nothing still shows `#0A66C2`.

---

## 🛑 GATE — VISUAL SHELL (this variant only)

**This variant ships a working visual shell — install it and make it the user's surface, don't drop it:**

- **The Visual Board (`Visual Board.html` + `visual-board.js`) is the canvas** — the Canva-style "LinkedIn Designer" view: a hero + horizontal reel of visuals, per-visual export, and a **brand slider** that re-derives the whole system live. Every visual is a `<section class="visual">` block on this ONE board — never a document per visual.
- **The board editor (`board-editor.js`)** gives direct-manipulation editing (select / move / resize / recolour) on the focused artboard. Install it with the board.
- **The icon editor + icon kit (`components/icons/`)** is the hand-drawn icon engine + editor; install it so drawn/imported icons drop onto the canvas and recolour to the brand.
- **The app shell (`LinkedIn Visual Designer.html`)** wraps the board, icon library and settings into one surface; **START HERE.html** is the brand setup (the slider that writes `overrides/brand.css`).
- The brand slider / setup is how brand-first (point 7) happens in this variant: set the brand there and every card, template and board visual re-derives.

## ⛔ Core design rules (when designing)

1. **ASK BEFORE YOU BUILD** — first reply is questions + pushback + 2–3 directions, never a finished visual. (Intake: `BRIEF.md`. Behaviour: `posture.md`.)
2. **ALL VISUALS ON THE VISUAL BOARD — never a document per visual.** Append one `<section class="visual">` block per visual to the same board.
3. **BRAND FIRST** — no brand set? Capture it (START HERE wizard / slider) before designing; never build on the default.
4. **Three variants, analogy-led, anti-slop** — see `SKILL.md` for the full flow and all gates.

## How the system is layered

| Layer | Lives in | You touch it? |
|---|---|---|
| **Brand layer** | `tokens/brand.css` (defaults) → `overrides/brand.css` (yours, via the slider) | **Yes** — the only file you normally edit; the slider writes it. |
| **Canvas roles** | `tokens/canvas.css` | Rarely — loud / light / section, derived from the brand via `color-mix`. |
| **Type, spacing, headline** | `tokens/*.css` | Rarely. |
| **Components + icons** | `components/**` | Build with them — React primitives + the icon kit/editor. |
| **Templates** | `templates/**` | The full numbered archetype library — inherit the brand by default. |
| **Style packs** | `style-packs/**` | Doodle / Bento / Paper. |
| **Visual UI** | `Visual Board.html`, `board-editor.js`, `LinkedIn Visual Designer.html`, `START HERE.html`, `ui_kits/` | The delivery surface (GATE — VISUAL SHELL). |

Read `SKILL.md` for the full operating flow, `posture.md` for how to behave, and `BRIEF.md` for the intake.
