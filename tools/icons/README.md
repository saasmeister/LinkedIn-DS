# Installing an icon set (fast, editable)

The IconKit ships empty and **already has everything needed to install a user's
icon set without re-engineering a converter** — do NOT build a bespoke
SVG→anchor pipeline per install. Use this:

```bash
node tools/icons/build-icon-library.mjs <svg-folder> \
  --accent "#<brand accent hex>" \
  --ink    "#<icon ink hex>" \
  --out    components/icons/icon-library.js
```

That reads every `.svg` in the folder and writes `components/icons/icon-library.js`
— a file of `IconKit.installIcon(name, strokes)` calls. It loads automatically
after `icon-kit.js` (the board's Icon Library loader and the icon editor both
chain-load it), so the icons:

- **appear in the Icon Library** and open **node-editable** in the icon editor;
- **appear in the Visual Designer** under "From the Icon Library", droppable onto
  the canvas;
- **recolour to the brand** — anything matching `--accent` renders as
  `var(--brand-primary)` (coral), everything else as `var(--icon-ink)`.

## How it works
- `IconKit.installIcon(name, strokes)` (in `icon-kit.js`) registers an icon as an
  editable **custom mark**: `strokes` are `_extra` anchor strokes
  (`{pts, closed, stroke:'ink'|'coral', fill, sw}`) — the kit's native edit format.
- The bundler converts each SVG path to **symmetric-handle anchors** (the IconKit
  edit format). Asymmetric bezier handles are averaged, so very sharp cusps soften
  slightly — fine for the vast majority of flat icons. (If a specific icon needs
  pixel-perfect cusps, edit it in the icon editor after import.)

## Notes
- The icon `name` is the SVG filename (without `.svg`).
- Re-run any time the icon set changes; it overwrites `icon-library.js`.
- Ships empty/agnostic — no client icons are committed to the system.
