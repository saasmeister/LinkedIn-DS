# Changelog — LinkedIn Visual Design System (master)

Semantic versioning. **MAJOR** = a breaking change to a token name, component prop or the override contract (a branch must act). **MINOR** = new components, templates, principles or tokens (safe to pull). **PATCH** = fixes, copy, docs.

A branch records the master version it last pulled in `overrides/BRANCH.md`.

## 1.2.0 — Archetype templates, editor & carousels-on-board
- **9 new reference templates, each 3 variant compositions (A/B/C):**
  - Singles: `pictograph-visual`, `trajectory-visual`, `testimonial-visual`, `layered-visual` (funnel/pyramid/stack), `data-visual` (chart-led).
  - Infographics: `infographic-tree`, `infographic-flow`, `infographic-annotated`, `infographic-matrix`, `infographic-roadmap`.
  - Carousels: `carousel-listicle`, `carousel-story`, `carousel-framework` (full multi-slide arcs).
- **Carousels live on the Visual Board** — a `.artboard[data-carousel]` with `.cslide` slides. The board shows a carousel as a scrollable **filmstrip** (all slides side-by-side), pages one slide at a time in edit mode, marks it in the reel as a **stack + "Carousel · N slides"**, and exports the current slide. Carousel reference templates are now labelled SLIDE-CONTENT ONLY so the agent never ships a standalone file.
- **Board editor (`board-editor.js`)** — Canva-style direct manipulation on the focused artboard: select the smallest element, drag to move, side handles (width-only / height-only) + corner (uniform scale), double-click to edit text, a left **library rail** (drag-in brand elements + reusable image/icon uploads), delete/duplicate/recolour, zoom controls, per-variant edit persistence.
- **Choose a winning variant** directly via the hero **★ Chosen / ☆ Choose** pill (works for singles and carousels). Iteration history pinned to a bottom dock; "+ New visual" / "Iterate" route back to the chat brief.
- **GATE 5 (analogy-led) + GATE 6 (rotate archetypes)** added to SKILL.md, wired to the real templates; language-match + ask-first rules tightened. Removed the old Brief Studio and First-run setup kits (superseded by chat + START HERE).
- **START HERE is a guided 5-step wizard** — brand source (Figma link / GitHub repo / .fig file / manual) → colours → type & signature → hand-off, with a one-click "Copy for the assistant" message and live preview. Headlines now use `text-wrap: balance`.

## 1.1.0 — Visual Board & two hard behaviour gates
- **Visual Board** (`Visual Board.html` + `visual-board.js` at the project root): one Canva-style board per project — hero + horizontal scrollable reel, per-visual ⋯ menu (Download PNG · Download HTML · Add to design system). Plain HTML + vanilla JS; add a visual by appending one `<section class="visual">` block. Copy both files into a consuming project once.
- **The four type-templates are now "Reference ·"** layouts, not per-post deliverables — read them to build an artboard, then paste it as a block on the board.
- **GATE 1 — ask before you build:** the assistant must open with questions, pushback and 2–3 directions before producing any visual (no more straight-to-design).
- **GATE 2 — all visuals on one board:** never a separate file per visual; every visual is a block on the Visual Board.
- README opens with three non-negotiable rules; BRIEF.md §6 + SKILL.md route delivery through the board. Setup confirmed out-of-chat via `START HERE.html`.
- Setup screen fixes: starts at step 1, live preview reflects font/colour changes, input focus retained while typing.

## 1.0.0 — Foundation
- Colour- & font-agnostic token system: brand defaults → canvas roles (loud/light/section) → type, spacing, headline signature.
- 24px hard safe band on all visuals; content margin = band + gutter.
- Components: Canvas, Chrome/SwipeArrow, Headline/Mark/Eyebrow/Subhead, Stat/StatBox/StatRow, Quote/Avatar/Attribution, InfoCard/Chip, Cta, BrowserMock, FeedPost.
- Templates: Single, Quote, Carousel, Infographic.
- Kits: Visual Library (browse + export PNG/HTML + approve-to-learn). Brand setup lives in START HERE.html.
- Principles, BRIEF.md (intake + fillable starter), posture.md (senior-designer behaviour).
- **Master → branch model**: master owns fundamentals; branches own `overrides/` + `client/`.
