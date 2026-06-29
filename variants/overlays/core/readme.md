# LinkedIn Visual Design System

A **colour- and font-agnostic** system for building strong LinkedIn post visuals — single graphics, carousels, infographics and quote cards on a 1080 × 1350 (4:5) canvas. It encodes the *principles* of a good visual, never one brand's values. You bring your own colours and fonts (the "brand layer"); every canvas role, headline and identity bar re-derives from them automatically.

> **Core idea:** the value is in the *principles*, not the brand values. A token names a **role and a function** ("section background = the secondary colour"), never a concrete value ("section = navy").

This is **not** a product-UI system. The "screens" here are 1080 × 1350 social graphics, browsed and delivered like a Canva reel on **one shared canvas**.

---

> # ⛔ INSTALLING THIS SYSTEM? READ THIS FIRST — INSTALL ALL OF IT.
>
> **This repository IS the complete design system. There is no larger "upstream" to defer to, and nothing here is "reference only" or optional.** When you import it into a host (e.g. Claude Design), bring in EVERYTHING that ships here — do not distill, sample, or leave parts out "to keep it focused," and do not ask the user which parts to include. Install all of it:
>
> 1. **Every template archetype** in `templates/<type>-NN-<slug>/` (all ~68: single, quote, carousel, infographic) — as usable templates, not a sampled handful.
> 2. **Every style pack** in `style-packs/` — `doodle`, `bento`, `paper` (each a SKILL.md + a card).
> 3. **Every principle card** (`principles/*.card.html`) AND **every guideline card** (`guidelines/*.card.html`) — surface them all in the Design System, including the **Anti-Slop Gate** card.
> 4. **The real components** — `components/**/*.jsx` implementations plus their `.d.ts`/`.prompt.md` contracts (import the implementations; do not re-author from specs).
> 5. **The tokens + `styles.css`** entry point, the **anti-slop tooling** (`references/anti-slop.md` + `tools/anti-slop/`), and `posture.md`, `BRIEF.md`, `GOVERNANCE.md`.
> 6. **ONE SHARED CANVAS** — deliver every visual as a block on a single Canvas, never a new document/file per visual (see SKILL.md GATE 2).
> 7. **BRAND FIRST** — if `overrides/brand.css` is unconfigured, run the brand check-in *before* building anything (SKILL.md GATE 0): ask for a website, a brand/style doc, or the colours + font. Never scaffold on the placeholder default and ask afterwards.
> 8. **APPLY THE BRAND TO EVERYTHING — no template left on the default blue.** Every template, card and component is token-driven (`var(--brand-primary)`, `var(--canvas-light-bg)`, …) and re-derives from `overrides/brand.css` via the token chain in `styles.css`. Once the brand is set, ALL of them must render in it. If anything still shows the default LinkedIn blue (`#0A66C2`), the brand override is not reaching that render context — wire `overrides/brand.css` (the configured one) into wherever templates and cards render, and verify none are left on the default. Note: `templates/**/ds-base.js` loads `styles.css` + `_ds_bundle.js` via a hardcoded `../..` relative path for *standalone* rendering; in the host, render templates against the host-compiled bundle + the configured `styles.css`, not that path.
>
> The only things deliberately NOT in this repo are the host-app chrome (the standalone Visual Board shell, app wrapper, compiled bundle) — because in Claude Design the host's own Canvas is the board. Everything else is here; install it.

---

## ⛔ Three non-negotiable rules (when designing)

1. **ASK BEFORE YOU BUILD.** When someone gives a post/idea, your first reply is questions + pushback + 2–3 directions — never a finished visual. (Intake: `BRIEF.md`. Behaviour: `posture.md`.)
2. **ALL VISUALS ON ONE CANVAS — never a document per visual.** Every visual is one `<section class="visual">` block on a single shared Canvas; append a block per visual to the SAME canvas. (See SKILL.md GATE 2.)
3. **BRAND FIRST.** No brand set in `overrides/brand.css`? Capture it before designing (SKILL.md GATE 0) — never build on the placeholder default.

## How the system is layered

| Layer | Lives in | You touch it? |
|---|---|---|
| **Brand layer** | `tokens/brand.css` (defaults) → `overrides/brand.css` (yours) | **Yes** — primary / secondary / accent / tint / font / signature. The only file you normally edit. |
| **Canvas roles** | `tokens/canvas.css` | Rarely — loud / light / section, derived from the brand layer via `color-mix`. |
| **Type, spacing, headline** | `tokens/*.css` | Rarely — role-based scales tuned for the 1080×1350 artboard. |
| **Components** | `components/**` | Build with them — React primitives that read the role vars. |
| **Templates** | `templates/**` | The full numbered archetype library — start from the closest match. |
| **Style packs** | `style-packs/**` | Optional aesthetic layers (Doodle/Bento/Paper) you reach for to design better. |
| **Principles** | `principles/**`, `references/method.md` | The philosophy + the archetype/mechanism catalog + the anti-slop gate. |

Override the brand layer and the whole system restyles. Example:

```css
/* overrides/brand.css */
:root {
  --brand-primary:   #C2410C;   /* your colour            */
  --brand-secondary: #1C1917;   /* your section colour    */
  --brand-accent:    #0D9488;   /* your highlight         */
  --brand-font:      'Sora';    /* your font (load it too) */
}
```

## North star — why a visual lands
1. **Simple** — translate something complex, simply. One thing pulled out of the post. "Good and tidy" beats "impressive."
2. **Recognisable** — consistency *is* the brand signal: same header, footer, fonts and colour roles across a series.
3. **Save-trigger** — every visual earns a save by carrying a *learning*. The visual carries the save, not the caption.

Read `SKILL.md` for the full operating flow (the brand check-in, the ask-first gate, analogy-led design, three variants, the one-canvas rule, and the anti-slop gate), `posture.md` for how to behave, and `BRIEF.md` for the intake.
