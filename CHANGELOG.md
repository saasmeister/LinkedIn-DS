# Changelog — LinkedIn Visual Design System (master)

Semantic versioning. **MAJOR** = a breaking change to a token name, component prop or the override contract (a branch must act). **MINOR** = new components, templates, principles or tokens (safe to pull). **PATCH** = fixes, copy, docs.

A branch records the master version it last pulled in `overrides/BRANCH.md`.

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
- Kits: Brief Studio (intake + live feed preview), Visual Library (browse + export PNG/HTML + approve-to-learn).
- Principles, BRIEF.md (intake + fillable starter), posture.md (senior-designer behaviour).
- **Master → branch model**: master owns fundamentals; branches own `overrides/` + `client/`.
