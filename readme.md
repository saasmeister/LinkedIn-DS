# LinkedIn Visual Design System

> # ⛔ READ THIS FIRST — five non-negotiable rules
> **1. ASK BEFORE YOU BUILD.** When someone gives a post/idea, your first reply is questions + pushback + 2–3 directions — NEVER a finished visual. You are a senior LinkedIn designer guiding a non-designer, not an order-taker. (Full intake: `BRIEF.md`. Behaviour: `posture.md`.)
> **2. ALL VISUALS ON ONE BOARD — never a file per visual.** Every visual is one `<section class="visual">` block on a single **Visual Board** (`Visual Board.html` at the project root, with `visual-board.js` beside it): a Canva-style hero + scrollable reel with per-visual PNG/HTML export. In a consuming project, copy `Visual Board.html` + `visual-board.js` in once, then append a block per visual to the SAME file. Do NOT copy a type-template into its own file per post.
> **3. The four type-templates (Single/Carousel/Quote/Infographic) are REFERENCE LAYOUTS,** not deliverables. Read them to build an artboard, then paste that artboard as a block on the board.
> **4. SINGLE & QUOTE VISUALS ARE VISUAL-LED — never a wall of text.** On a single or quote visual the *visual* tells the story and must dominate the canvas; text is a trigger, not the content. Allowed: eyebrow + headline + **at most one** short supporting line (≤ ~12 words). A body paragraph belongs in a carousel or infographic — if the message needs paragraphs, it's the wrong type. Make the visual as large as possible; resist adding more copy.
> **5. ALWAYS SHOW THREE VARIANTS.** Every version is **three** variants — never one. In the DOM: one `<section class="visual">` per visual, holding a `<div class="round">` with three `.artboard` variants (mark the strongest `data-chosen`). The user picks one; to iterate you append a NEW `<div class="round">` of three to the same section (the timeline keeps v1, v2, …). Never one variant, never delete past rounds. "Make me a visual" → three variants, every round, until the user says "this is the one."

A **colour- and font-agnostic** system for building strong LinkedIn post visuals. It encodes the *principles* of a good visual — never one brand's values. You bring your own colours and fonts (the "brand layer"); every canvas role, headline and identity bar re-derives from them automatically.

> **Core idea:** the value is in the *principles*, not the brand values. A token names a **role and a function** ("section background = the secondary colour"), never a concrete value ("section = navy").

This is not a product-UI system. The "screens" here are **1080 × 1350 social graphics**: single visuals, carousels, infographics and quote cards.

> ## 👋 New here? Open `START HERE.html` first.
> The entry point is **`START HERE.html`** in the project root. Open it inside Claude (or after cloning this repo) and run the short setup — font, colours, logo, photo, spacing — with a live preview. It produces `overrides/brand.css` + `overrides/extras.css`: **download** them into your `overrides/` folder, or **paste the CSS into the chat** and the design system saves them for you. After that, just open a chat and say what you want to make — setup never happens in the chat itself.

---

## Sources

- `uploads/LinkedIn Design System Templates.html` — the original style-neutral wireframe set (four visual types laid out as grayscale layout-role frames on the 1080×1350 canvas). Everything here is derived from that document plus the written ruleset that accompanied it.

No Figma file or codebase was provided — the system is built from the wireframe + ruleset.

---

## How the system is layered

| Layer | Lives in | You touch it? |
|---|---|---|
| **Brand layer** | `tokens/brand.css` | **Yes** — primary / secondary / accent / tint / font / signature. The only file you normally override. |
| **Canvas roles** | `tokens/canvas.css` | Rarely — loud / light / section, all derived from the brand layer via `color-mix`. |
| **Type, spacing, headline** | `tokens/*.css` | Rarely — role-based scales tuned for the 1080×1350 artboard. |
| **Components** | `components/**` | Build with them — React primitives that read the role vars. |
| **Templates** | `templates/**` | Start from them — the four visual types as editable, tweakable artboards. |

Override the brand layer and the whole system restyles. Example:

```css
:root {
  --brand-primary:   #C2410C;   /* your colour            */
  --brand-secondary: #1C1917;   /* your section colour    */
  --brand-accent:    #0D9488;   /* your highlight         */
  --brand-font:      'Sora';    /* your font (load it too) */
}
```

In any template you can also do this live from the **Tweaks** panel (primary / secondary / accent / tint / font).

---

## A. General principles (always on, every type)

**North star — why a visual lands**, in order:
1. **Simple** — translate something complex, simply. Basic shapes, simple diagrams, one thing pulled out of the post. "Good and tidy" beats "impressive."
2. **Recognisable** — consistency *is* the brand signal. Same header, footer, fonts and colour roles across a whole series. The difference between strong and weak creators is *not varying*.
3. **Save-trigger** — every visual should earn a save by carrying a *learning*. The visual carries the save, not the caption.

**Format** — 1080 × 1350 (4:5 portrait). A hard 24px safe band at the edge (all types), content inside a roomy margin. One idea per slide.

**Delivery — always on a canvas** — every visual sits on a stage (the artboard centred on a board), never handed over as a bare element. They're browsed in the **Visual Library** (`ui_kits/visual-library/`) like a Canva reel: hero + scrollable rail, a ⋯ menu per visual to download as **PNG** or standalone **HTML**, and an **Add to design system** action. The canvas is **never larger than 1080 × 1350** — it may scale down to preview, but its true export size is locked.

**The learn loop** — when a client approves a visual, *Add to design system* queues it as an approved variant. Recurring approved patterns get promoted into real components and templates (the **BrowserMock** primitive came from the approved "catalog of homepages" variant). The system grows from what actually ships.

**Canvas roles** (colour-agnostic):
- **Loud** — cover, back cover, loud interstitials. Primary at full strength.
- **Light** — the steps of a carousel, and the default for singles, quotes, infographics. A very light tint of primary.
- **Section** — chapter markers inside a carousel (a result, quote, question, problem, conclusion). The secondary colour. Never a fully dark series; the base is always light, loud and section are punctuation.

**Text hierarchy** — every visual has a headline and usually a subheading. The headline deliberately differs from the post hook (don't repeat it; test hook vs re-hook; add context). The headline is the hero and gets **one fixed, recognisable signature treatment** across the series.

**Chrome (identity bar)** — name left, claimed category/function right. Top *or* bottom. **Swipe arrow (→) only on carousels.**

**Post-first** — the visual follows from the post or idea, never the reverse. Ask for the type explicitly (single / carousel / infographic / quote is often a borderline call).

## B. Per type
- **Single** — one core message, one heading + subheading, **one** supporting visual (chart / comparison / illustration). No swipe arrow.
- **Carousel** — one story over many slides, one idea each. Fixed arc: cover → context → problem → step(s) → result → back cover (CTA). Rhythm via canvas roles. Swipe arrow in the footer.
- **Infographic** — one dense cheat-sheet on a single canvas; depth is the value. Card grid / matrix / numbered flow. Each cell: label + mini-heading + body + **one** element. Case-study variant adds a results row in the section colour. No swipe arrow.
- **Quote** — one pulled sentence, left-aligned and vertically centred, with air around it. Profile photo + name + role beneath. No swipe arrow.

---

## CONTENT FUNDAMENTALS — how copy is written

- **Voice:** first-person practitioner ("how I…", "what I did for a client"). Direct, confident, plain. Mixed Dutch/English in this repo's notes; the *visuals* ship in the user's own language.
- **Headlines:** short, declarative, one idea. Often a re-framed hook, not the post's first line. An emphasis word or two carries the signature treatment.
- **Eyebrows / kickers:** all-caps, tracked, functional — `STEP 01`, `THE PROBLEM`, `THE RESULT`, `QUOTE`. They label the slide's role in the arc.
- **Subheads:** one supporting sentence that adds context the hook left out. Never a paragraph.
- **Numbers:** one hero figure per slide (`3.4×`, `68%`, `10k`). Big, bold, tight tracking. Don't crowd a visual with stats — one earns the slide.
- **CTAs:** a single concrete next step — `DM me 'WORD' →`, `Follow / connect →`, `Save this for later`.
- **No emoji** in the visual itself (the principle is restraint and recognisability). Emoji belong to the post caption, not the graphic.
- **Casing:** Sentence case for headlines and body; UPPERCASE only for tracked eyebrows/labels.

## VISUAL FOUNDATIONS

- **Colour vibe:** restrained and tidy. One primary does most of the work; the light canvas is a *very* pale tint of it (6–10%); the section colour is a deep/dark anchor; the accent is used sparingly to mark or highlight. No multi-colour gradients, no rainbow categorisation.
- **Backgrounds:** flat colour fields only — no photos behind text, no noise, no glow. The canvas role *is* the background. (A brand layer may add a subtle texture, but the default is clean flat fields.)
- **Type:** one family does display + body (default Inter, fully swappable). Big confident headlines (56–96px on the artboard), tight letter-spacing (−0.02em), `line-height` ~1.06. Huge stat numbers (150–230px) at −0.04em. Body and subheads stay quiet in the muted role colour.
- **Headline signature:** one recognisable treatment, chosen once via `--signature` — `underline` (thick rule), `block` (solid highlight), `bubble` (outlined badge) or `plain`. Applied consistently across a whole series.
- **Spacing:** every visual carries a hard **24px safe band** at the frame edge (the absolute minimum, all four sides, all types — nothing crosses it). The content margin sits inside that: 72px default (24 band + 48 gutter), 48px for dense infographics. Generous breathing room; content vertically centred or anchored to a clear band.
- **Cards (infographics):** white fill, 16px radius, a hairline (`1.5px`) border in the light-line colour, soft shadow only in the gallery view. The **one** emphasised card per sheet gets a `2.5px` muted border — emphasis by weight, not colour.
- **Corners & borders:** 16px cards, 18px CTAs, pill (999px) chips/avatars. Hairline borders; no heavy outlines.
- **Elevation:** the artboard itself is flat. Shadow appears only when previewing artboards as objects on a gray stage (`0 8px 40px rgba(0,0,0,.12)`), never inside a visual.
- **Diagrams:** simple and real — conic-gradient donuts, plain bar columns in primary tints, mini funnels. Only when they genuinely explain something. No decorative chart slop.
- **Animation:** none. These are static export graphics.
- **Imagery:** profile photos (round, pill radius) and screenshots (framed in a light card). Otherwise flat shapes.

## ICONOGRAPHY

- The system is deliberately **near-iconless**. Identity, hierarchy and rhythm come from type, colour roles and layout — not icon sets.
- The few glyphs used are **functional, drawn inline as minimal stroke SVG** at the point of use: the **swipe arrow (→)** (carousel cue), a generic **person silhouette** for avatar placeholders, and a small **image glyph** for screenshot placeholders. Stroke weight ~4 on an 80×80 viewBox, `currentColor` so they invert per canvas role.
- **No icon font, no sprite, no emoji** in visuals. If a brand layer wants icons, match this restraint: single-weight line icons, used sparingly, in the role's foreground colour.
- Unicode is used for typographic marks only: `→` `“ ”` `‘ ’`.

---

## Index / manifest

**Root**
- `styles.css` — the global entry point (import this). `@import`s every token + font file.
- `tokens/` — `brand.css` (override layer), `canvas.css` (roles), `typography.css`, `spacing.css`, `headline.css` (signature classes), `fonts.css` (default Inter).
- `readme.md` — this guide. `SKILL.md` — portable Agent-Skill wrapper. **`posture.md` — the senior-designer operating posture. `BRIEF.md` — the intake + fillable starter brief. `GOVERNANCE.md` — the master → branch model (what's pushed vs. what a client owns), `VERSION` + `CHANGELOG.md`.**
- `overrides/` — **branch-owned** brand + extras (never overwritten by updates). `client/` — **branch-owned** learned components / templates.
- `tools/` — `check-branch.mjs` (push gate that blocks a branch from editing master files), `check-update.mjs` (daily "are we behind master?" check), `tools/README.md` (hook + CI wiring). `governance/` — `ownership.json` + `master.lock` (the enforced contract). `update-manifest.json` — what master publishes for branches to poll.

**Components** (`window.LinkedInVisualDesignSystemTesting_727cb3.*`)
- `components/layout/` — **Canvas** (role-aware artboard), **Chrome** + **SwipeArrow** (identity bar).
- `components/text/` — **Headline**, **Mark** (signature), **Eyebrow**, **Subhead**.
- `components/content/` — **Stat**, **StatBox**, **StatRow**, **Quote**, **Avatar**, **Attribution**, **InfoCard**, **Chip**, **Cta**.
- `components/illustration/` — **BrowserMock** (homepage / screen window illustration — the "catalog of homepages" pattern, learned from an approved variant).
- `components/preview/` — **FeedPost** (wraps a visual in the real LinkedIn feed chrome — single image or carousel document, to preview how it lands in the timeline).

**Templates** (`templates/<slug>/` — copy & edit; recolour via Tweaks)
- `single-visual/` · `quote-visual/` · `carousel/` · `infographic/`

**UI kits**
- `ui_kits/setup/` — the **first-run setup**: a guided, stepped onboarding (identity → colours → spacing & shape → ready) with a **live single-visual preview**. Generates the branch's `overrides/brand.css` + `overrides/extras.css`, then sends the user to make visuals. Where a new client starts.
- `ui_kits/brief-studio/` — the **Brief Studio**: a type-first intake screen (post, titles, reference upload, a sketch pad, dynamic carousel pages, brand layer) with a senior-designer **advice/pushback** panel and a **live LinkedIn feed preview** built from the brief. Generates the filled brief text.
- `ui_kits/visual-library/` — the **Visual Library**: a Canva-style gallery (hero + scrollable reel) to browse generated visuals, export each as **PNG** or standalone **HTML** via a ⋯ menu, and **approve** visuals into the system. Approved variants are the queue the design system learns from.

**Foundation cards** (`guidelines/*.card.html`) populate the Design System tab under Colors / Type / Spacing / Brand. **Principles cards** (`principles/*.card.html`) carry the philosophy.

---

## Caveats
- **Inter** is the neutral *default* font, loaded from Google Fonts. It is not a brand value — point `--brand-font` at your own family.
- With **one** brand colour, set `--brand-secondary` to a deep tint of your primary so the Section role stays distinct (or accept the system's suggestion). The default secondary (`#16232B`) is a neutral placeholder.
