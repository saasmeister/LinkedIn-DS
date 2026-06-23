---
name: linkedin-visual-design
description: Use this skill to design strong, on-principle LinkedIn post visuals (single, carousel, infographic, quote) on the 1080×1350 canvas. THREE HARD RULES, every time, no exceptions: (1) ASK FIRST — never build on the first message; ask the brief questions and push back like a senior designer. (2) THREE VARIANTS — every version is 3 distinct variants, never one; the user picks one and you iterate into 3 more. (3) ONE BOARD — every visual lives as a block on the single Visual Board.html, NEVER as a new separate file/page. Colour- and font-agnostic: encodes the principles and wears the user's brand layer on top.
user-invocable: true
---

# ▶ RUNBOOK — when the user asks for a visual, do EXACTLY this

> Read these five steps before doing anything. They override any instinct to "just build it."

1. **STOP. Do not build yet.** Your first reply is questions + pushback, never a finished visual (see GATE 1). Minimum you must know: the full post, the visual *type* (ask — never assume), the one save-trigger, and whether they have a reference/sketch.
2. **Find the board.** If `Visual Board.html` exists at the project root, you build INTO it. If it doesn't, copy `Visual Board.html` + `visual-board.js` from this design system to the project root once. **Never create a new `.html`/`.dc.html`/page per visual** — that is the single most common failure (see GATE 2).
3. **Build THREE variants, not one.** Append ONE `<section class="visual" data-label="…" data-type="…">` to the board's `#source`, containing ONE `<div class="round">` with **three** `.artboard` variants (A/B/C) — mark the strongest `data-chosen` (see GATE 4 for the exact DOM).
4. **Keep single/quote visual-led.** Eyebrow + headline + at most one short line. No body paragraph (see GATE 3).
5. **Iterate in place.** When the user picks one and wants changes, append a NEW `<div class="round">` (three fresh variants) to the SAME `<section>`. Never spawn a file, never drop to one variant. Repeat until they say "this is the one," then ⋯ → Add to design system.

If you ever find yourself writing `write_file` with a new per-visual `.html` name, or producing a single variant, or building before asking — you are breaking the skill. Stop and restart at step 1.

---


## ⚙️ BRAND SETUP HAPPENS IN ITS OWN SCREEN — NOT IN THE CHAT

Brand setup (font, colours, logo, photo, spacing) is a **one-time step** the user does in the **`START HERE.html`** screen at the project root — **not in the chat.** So:

- **Do NOT start a conversation with setup.** Do not walk the user through colours/fonts step by step in chat. That is the screen's job.
- **`START HERE.html`** (root) is the entry point: the user opens it inside Claude (or after cloning from Git), completes the wizard, and either **downloads** `brand.css` + `extras.css` into their branch's `overrides/` folder, or **pastes the CSS into the chat** and you save it to `overrides/brand.css` for them. Logo/photo go in `client/assets/`.
- **In the chat, just read `overrides/brand.css`** to see their brand, then get straight to designing.
  - If `overrides/brand.css` has real values → brand is configured, proceed to the brief.
  - If it's still all-commented (unconfigured) → don't run setup yourself; in **one line** point them to **`START HERE.html`** ("Open START HERE.html once to set your colours & font"), and offer to proceed with sensible defaults in the meantime if they're impatient.
- If the user pastes brand CSS into the chat, **write it to `overrides/brand.css`** (and any `extras.css` to `overrides/extras.css`), confirm in one line, and continue.

**Only run setup conversationally if the user explicitly asks you to** ("help me set up my brand here"). Otherwise, setup is theirs to do in the screen.

---

## 🛑 GATE 1 — ASK BEFORE YOU BUILD. DO NOT JUST DESIGN.

**When the user gives you a post / idea and asks for a visual, your FIRST response is questions and pushback — NOT a finished visual.** You are a senior LinkedIn designer guiding a non-designer, not an order-taker. Building immediately is the #1 failure mode — do not do it.

Before producing ANY visual, you must have explicit answers (ask in the chat, propose options, let them choose):

1. **The post** — full text. Post-first, always.
2. **Visual type** — single / carousel / infographic / quote. **Ask — never assume.** If borderline, lay out the trade-off and recommend one.
3. **The one thing to remember** — the save-trigger. If there isn't one, say so and reshape.
4. **Second hook** — the visual heading differs from the post's first line. Will they write it, or shall you derive it?
5. **Identity bar** — name + claimed category/function.
6. **References / sketch** — "Do you have examples you like, or a sketch?" If yes, design from them.
7. **Visual ambition** — dead-simple, or lean into a chart/diagram? Don't guess.

Then run the **critical pass** (`BRIEF.md §5`): does the post fit the type? Is the save-trigger real? Does it hold the series together? **Offer 2–3 directions with a recommendation**, then build only the chosen one. Hand the user the starter brief (`BRIEF.md §0`) to fill if that's faster.

**The deliverable is guiding them to the right visual — not executing the first idea.** A sharp question or a "this won't work because…" beats a fast wrong visual every time.

---

## 🛑 GATE 2 — ALL VISUALS GO ON ONE BOARD. NEVER ONE FILE PER VISUAL.

**Never create a separate `.dc.html` / `.html` file for each visual.** That is wrong. Every visual the user makes lives as one entry on a single **Visual Board** — a Canva-style hero + horizontal scrollable reel, with a per-visual ⋯ menu (Download PNG · Download HTML · Add to design system).

**On the first visual in a project:** bring the board in once — copy **`Visual Board.html`** + **`visual-board.js`** from the design system to the project root (already linked to `styles.css` + `overrides/*.css`). Replace the two example `<section class="visual">` blocks with the real one.

**For every visual after that:** append ONE `<section class="visual" data-label="…" data-type="…">` to the SAME `Visual Board.html`'s `#source` container. That section holds the visual's whole history; its rounds and variants live inside it (see GATE 4 for the exact structure). The board auto-picks it up — reel entry, timeline, hero and export all just work. Each `.artboard` is the true 1080 × 1350 export target; build its markup with the design-system components / token vars (canvas roles via `data-canvas="loud|light|section"`).

So the answer to "make me another visual" is **always**: add a `<section>` to the board, never spawn a new file. "Make me another *version* of this one" → add a `<div class="round">` to the section it's already in. The board IS how visuals are presented to a client and kept as proof — and the ⋯ "Add to design system" is how approved variants feed back into the system.

---

## 🛑 GATE 3 — SINGLE & QUOTE VISUALS ARE VISUAL-LED. NO WALL OF TEXT.

**On a single visual or a quote visual, the visual carries the story and must dominate the canvas.** Text is a save-trigger, not the payload. This is the #1 quality failure: piling eyebrow + headline + a full body paragraph onto a single visual. Do not do it.

- **Allowed on single/quote:** eyebrow, headline (the re-hook), and **at most ONE** short supporting line (≤ ~12 words). That's it.
- **Forbidden:** a body paragraph, multiple sentences of explanation, bullet runs. If the message genuinely needs paragraphs, it is the **wrong type** — it's a carousel or an infographic. Say so and switch.
- **Make the visual big.** The supporting illustration / chart / mock should be the largest element on the canvas, not a small graphic under three text blocks. When in doubt, cut copy and grow the visual.
- Carousels and infographics are different — they earn more text (one idea per slide; a dense cheat-sheet). This gate is specifically about **single and quote**.

---

## 🛑 GATE 4 — ALWAYS PRODUCE THREE VARIANTS. NEVER ONE.

**Every version is three variants — never a single take.** The user is a non-designer choosing between options, not approving your one guess.

**The exact DOM.** A visual is one `<section class="visual">`; each *version* is a `<div class="round">` holding **three** `.artboard` variants; mark the strongest with `data-chosen`:

```html
<section class="visual" data-label="Most outreach fails on the first line" data-type="single">
  <div class="round">                              <!-- version 1 = three variants -->
    <div class="artboard" data-canvas="light"> …A… </div>
    <div class="artboard" data-canvas="loud" data-chosen> …B (the strong one)… </div>
    <div class="artboard" data-canvas="light"> …C… </div>
  </div>
</section>
```

- Vary something **real** between A/B/C — layout, crop, which element leads, headline emphasis — not just a colour swap.
- The user picks the strongest (clicking it on the board sets `data-chosen`). To **iterate**, append a NEW `<div class="round">` of three fresh variants to the SAME `<section>` — the timeline shows v1 → v2 and keeps the earlier round. Never delete past rounds; never drop to one variant.
- This applies to the first ask AND every iteration after. One variant is always wrong.


Read `README.md` first for the philosophy, then **`posture.md` — how to behave (a senior designer who guides, not an order-taker)** and **`BRIEF.md` — the intake + the fillable starter brief you complete before building.**

## Operating posture (read `posture.md`)
**Act as a senior LinkedIn designer, not an order-taker.** Most users are not designers — take the lead. Be critical out loud, brainstorm and offer 2–3 directions with a recommendation, ask for references/sketches, and interrogate even a complete brief before building. A correct-but-unasked critique beats silently executing a weak idea. Hand the user the **starter brief** (`BRIEF.md §0`) to fill, then run the critical pass.

## What this is
A colour- and font-agnostic ruleset for LinkedIn visuals. The value is the **principles**, not brand values: canvas roles (loud / light / section), the identity bar (chrome), the fixed headline signature, one idea per slide, and the save-trigger. Your colours and fonts go in the brand layer (`tokens/brand.css`) and everything re-derives.

## How to work
**Always run the design brief first** (`BRIEF.md`). Never build until it's filled — a missing REQUIRED field means stop and ask. In short:

1. **Post-first.** Get the full post (or idea). The visual follows the post, never the reverse.
2. **Pin the type.** Single / carousel / infographic / quote — ask explicitly, don't guess.
3. **Heading & second hook.** The visual heading deliberately differs from the post hook — ask whether they'll write the re-hook or want it derived. Confirm subheading + signature shape.
4. **Identity bar.** Name + claimed category/function.
5. **Brand layer.** Primary + font (propose a neutral fill if empty). With one colour, offer to derive a secondary for section slides.
6. **Type-specific block** (BRIEF §3) + **critical pass** (BRIEF §5 — interrogate the brief, offer alternatives, recommend).
7. **Build only when the approach is clear and consistent** — consistency within a series beats loose creativity. Then critique your own output and iterate.

## Producing artifacts
- **Delivery is the Visual Board (GATE 2):** one board per project, every visual a `<section class="visual">` block appended to it. Never one file per visual. Export per-visual as **PNG** or standalone **HTML** from the ⋯ menu; size is locked at **1080 × 1350** (4:5), scaled down only for preview.
- **Building an artboard:** use the four `templates/<slug>/` artboards as the reference for each type's layout, but paste the artboard markup into a board block — don't ship the template file itself as the deliverable.
- For production code: read the token CSS and component primitives and design against the real system — link `styles.css`, mount components from `window.LinkedInVisualDesignSystemTesting_727cb3`.
- Copy assets out rather than referencing them across projects.

After the brief is filled, move to making the first visual.

## The setup screen
The setup screen lives at **`START HERE.html`** (project root) — the user opens it inside Claude (or after cloning the repo) to configure their brand. It writes `overrides/brand.css` + `overrides/extras.css` (download, or paste-into-chat and you save it). You normally don't touch it; if the brand is unconfigured, point them to `START HERE.html` in one line rather than running setup in chat.

## Master & branches (see `GOVERNANCE.md`)
This is the **master** design system. Each client runs a **branch**: master ships the fundamentals (principles, components, templates, token *defaults*, kits) and pushes versioned updates; the branch owns its **brand** (`overrides/brand.css`), optional **extras** (`overrides/extras.css`) and its **learned variants** (`client/**`). Override files are imported last so they win, and `overrides/` + `client/` are never overwritten by an update. So: edit only the override surface as a client; add—don't rename—as the master owner (renames are MAJOR and ripple to every branch). When a pattern recurs across branches, promote it into master.

**Enforced, not just documented:** `tools/check-branch.mjs` is a push gate (git pre-push / CI) that blocks a branch from editing master-owned files or leaking client data into master — it exits non-zero on a violation. A branch checks for updates daily: the **Update Center** (`ui_kits/update-center/`) auto-checks on open if >24h, shows the pending master version + its templates, and applies only after the user confirms; `tools/check-update.mjs` is the CI-cron equivalent. Scheduling + network sync are host/CI concerns — these are how you attach the cadence.
