# Brief Studio — the intake & preview screen

The front door of the system. A non-designer fills a type-first brief; the system advises, pushes back, and shows a **live LinkedIn feed preview** so they see exactly how the visual lands before anything is built.

## Layout
- **Left — the brief** (fillable, persisted to `localStorage`):
  1. **Type first** — single / carousel / infographic / quote. The hint nudges: *not sure? paste the post and the advice panel tells you which fits.*
  2. **The post** + the one thing to remember/save.
  3. **Heading & hook** — derive-the-hook vs. write-your-own, optional subheading, headline signature.
  4. **Identity bar** — name + claimed category.
  5. **Type-specific** — *carousel*: dynamic pages (add / reorder / delete, edit label + note, click the colour dot to cycle the canvas role loud→light→section); *quote*: the exact sentence + attribution.
  6. **References & sketch** — drag-drop reference screenshots, and a sketch pad to draw "this is how I picture it" (pen colours + eraser + clear).
  7. **Brand layer** — primary colour swatches + font.
  - **Copy filled brief** generates the brief text (matches `BRIEF.md §0`) for starting a build.
- **Right — live preview in the LinkedIn feed:**
  - A **senior-designer advice panel** with tips, *Good:* notes and **Pushback:** warnings (e.g. *"This reads short for a carousel — a single will hit harder, want me to switch?"*). Lightweight heuristics on post length, lists and numbers stand in for the real critical read.
  - A **FeedPost** mock built live from the brief — single image or swipeable carousel — using the actual design-system components and brand layer.

## Files
- `index.html` — loader + mount (styles, `_ds_bundle.js`, React, Babel, then `BriefStudio.jsx`).
- `BriefStudio.jsx` — the whole screen: form state, advice heuristics, the form→visual builders, and the live preview.

## Notes
- The preview composes real DS components (`Canvas`, `Chrome`, `Headline`, `Stat`, `Quote`, …) wrapped in `FeedPost`, so it reflects the system's true output, recoloured by the brand layer.
- Reference images and the sketch live in session state (not persisted) — they're inputs for the conversation, not saved artifacts.
- The advice heuristics are intentionally simple; the real critical pass is the assistant following `posture.md` + `BRIEF.md §5`. The panel makes that posture visible in the UI.
