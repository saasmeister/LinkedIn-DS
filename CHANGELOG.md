# Changelog — LinkedIn Visual Design System (master)

Semantic versioning. **MAJOR** = a breaking change to a token name, component prop or the override contract (a branch must act). **MINOR** = new components, templates, principles or tokens (safe to pull). **PATCH** = fixes, copy, docs.

A branch records the master version it last pulled in `overrides/BRANCH.md`.

## 1.0.0 — Foundation
- Colour- & font-agnostic token system: brand defaults → canvas roles (loud/light/section) → type, spacing, headline signature.
- 24px hard safe band on all visuals; content margin = band + gutter.
- Components: Canvas, Chrome/SwipeArrow, Headline/Mark/Eyebrow/Subhead, Stat/StatBox/StatRow, Quote/Avatar/Attribution, InfoCard/Chip, Cta, BrowserMock, FeedPost.
- Templates: Single, Quote, Carousel, Infographic.
- Kits: Brief Studio (intake + live feed preview), Visual Library (browse + export PNG/HTML + approve-to-learn).
- Principles, BRIEF.md (intake + fillable starter), posture.md (senior-designer behaviour).
- **Master → branch model**: master owns fundamentals; branches own `overrides/` + `client/`.
