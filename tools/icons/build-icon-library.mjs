#!/usr/bin/env node
// Build an editable icon library for the IconKit from a folder of flat SVGs.
// Output: icon-library.js — a single file that, loaded AFTER icon-kit.js,
// registers every icon as an editable custom mark via IconKit.installIcon().
// The icons then appear in the Icon Library + Visual Designer, recolour to the
// brand, and open node-editable in the icon editor — no per-install converter.
//
//   node tools/icons/build-icon-library.mjs <svg-dir> [--accent #F2685C] [--ink #36373C] [--out icon-library.js]
//
// Colour mapping: any path/shape whose fill or stroke matches --accent becomes
// 'coral' (var(--brand-primary)); everything else becomes 'ink' (var(--icon-ink)).
// Geometry is converted to symmetric-handle anchors (the IconKit edit format);
// asymmetric bezier handles are averaged, so sharp cusps soften slightly.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith("--"));
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
if (!dir) { console.error("usage: build-icon-library.mjs <svg-dir> [--accent #hex] [--ink #hex] [--out file]"); process.exit(1); }
const ACCENT = (opt("--accent", "") || "").toLowerCase();
const OUT = opt("--out", join(dir, "icon-library.js"));
const VB = 160; // IconKit canvas

const norm = (c) => (c || "").trim().toLowerCase().replace(/^#?/, "#");
const colorRole = (fill, stroke) => {
  const c = norm(fill && fill !== "none" ? fill : stroke);
  return ACCENT && c === norm(ACCENT) ? "coral" : "ink";
};

// ---- minimal SVG path tokeniser -> absolute segments (L / C) ----
function parsePath(d) {
  const toks = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || [];
  let i = 0; const num = () => parseFloat(toks[i++]);
  const subs = []; let cur = null, x = 0, y = 0, sx = 0, sy = 0, px = 0, py = 0, prev = "";
  const start = () => { cur = { pts: [], segs: [], closed: false }; subs.push(cur); };
  while (i < toks.length) {
    let cmd = toks[i];
    if (/[a-z]/i.test(cmd)) i++; else cmd = prev; // implicit repeat
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    if (C === "M") { x = (rel ? x : 0) + num(); y = (rel ? y : 0) + num(); sx = x; sy = y; start(); cur.pts.push([x, y]); prev = rel ? "l" : "L"; }
    else if (C === "L") { x = (rel ? x : 0) + num(); y = (rel ? y : 0) + num(); cur.segs.push({ t: "L" }); cur.pts.push([x, y]); }
    else if (C === "H") { x = (rel ? x : 0) + num(); cur.segs.push({ t: "L" }); cur.pts.push([x, y]); }
    else if (C === "V") { y = (rel ? y : 0) + num(); cur.segs.push({ t: "L" }); cur.pts.push([x, y]); }
    else if (C === "C") { const c1x = (rel ? x : 0) + num(), c1y = (rel ? y : 0) + num(), c2x = (rel ? x : 0) + num(), c2y = (rel ? y : 0) + num(); x = (rel ? x : 0) + num(); y = (rel ? y : 0) + num(); cur.segs.push({ t: "C", c1: [c1x, c1y], c2: [c2x, c2y] }); cur.pts.push([x, y]); px = c2x; py = c2y; }
    else if (C === "S") { const c1x = 2 * x - px, c1y = 2 * y - py, c2x = (rel ? x : 0) + num(), c2y = (rel ? y : 0) + num(); const nx = (rel ? x : 0) + num(), ny = (rel ? y : 0) + num(); cur.segs.push({ t: "C", c1: [c1x, c1y], c2: [c2x, c2y] }); cur.pts.push([nx, ny]); px = c2x; py = c2y; x = nx; y = ny; }
    else if (C === "Q") { const qx = (rel ? x : 0) + num(), qy = (rel ? y : 0) + num(); const nx = (rel ? x : 0) + num(), ny = (rel ? y : 0) + num(); const c1 = [x + 2 / 3 * (qx - x), y + 2 / 3 * (qy - y)], c2 = [nx + 2 / 3 * (qx - nx), ny + 2 / 3 * (qy - ny)]; cur.segs.push({ t: "C", c1, c2 }); cur.pts.push([nx, ny]); px = qx; py = qy; x = nx; y = ny; }
    else if (C === "T") { const qx = 2 * x - px, qy = 2 * y - py; const nx = (rel ? x : 0) + num(), ny = (rel ? y : 0) + num(); const c1 = [x + 2 / 3 * (qx - x), y + 2 / 3 * (qy - y)], c2 = [nx + 2 / 3 * (qx - nx), ny + 2 / 3 * (qy - ny)]; cur.segs.push({ t: "C", c1, c2 }); cur.pts.push([nx, ny]); px = qx; py = qy; x = nx; y = ny; }
    else if (C === "A") { i += 5; x = (rel ? x : 0) + parseFloat(toks[i++]); y = (rel ? y : 0) + parseFloat(toks[i++]); cur.segs.push({ t: "L" }); cur.pts.push([x, y]); } // arc -> line (rare)
    else if (C === "Z") { if (cur) { cur.closed = true; cur.segs.push({ t: "L" }); x = sx; y = sy; } }
    if (C !== "C" && C !== "S" && C !== "Q" && C !== "T") { px = x; py = y; }
    prev = cmd;
  }
  return subs.filter((s) => s.pts.length > 1);
}

// segments -> symmetric-handle anchors. Each anchor i: out-handle from seg i->i+1
// (C: c1-Pi), in-handle from seg i-1->i (C: Pi-c2); average when both curve.
function toAnchors(sub) {
  const P = sub.pts, n = P.length, closed = sub.closed;
  // for a closed path the trailing point equals the start; drop the dup
  const pts = closed && n > 1 && P[0][0] === P[n - 1][0] && P[0][1] === P[n - 1][1] ? P.slice(0, -1) : P;
  const m = pts.length;
  const segOut = (i) => sub.segs[i] || { t: "L" };   // seg from anchor i -> i+1
  const out = [];
  for (let i = 0; i < m; i++) {
    const Pi = pts[i];
    const so = segOut(i);                          // outgoing
    const si = segOut((i - 1 + sub.segs.length) % sub.segs.length); // incoming (approx)
    let hx = 0, hy = 0, have = 0;
    if (so.t === "C") { hx += so.c1[0] - Pi[0]; hy += so.c1[1] - Pi[1]; have++; }
    if (si && si.t === "C" && si.c2) { hx += Pi[0] - si.c2[0]; hy += Pi[1] - si.c2[1]; have++; }
    if (have === 2) { hx /= 2; hy /= 2; }
    out.push(have ? [Pi[0], Pi[1], hx, hy] : [Pi[0], Pi[1]]);
  }
  return { pts: out, closed };
}

function circleAnchors(cx, cy, r) {
  const k = 0.5523 * r;
  return { pts: [[cx + r, cy, 0, k], [cx, cy + r, -k, 0], [cx - r, cy, 0, -k], [cx, cy - r, k, 0]], closed: true };
}

function scaleStroke(arr, s) { return arr.map((st) => ({ ...st, pts: st.pts.map((a) => a.map((v, k) => (k < 2 || k >= 2) ? +(v * s).toFixed(2) : v)) })); }

function convert(svg) {
  const vb = (svg.match(/viewBox\s*=\s*"([^"]+)"/) || [])[1];
  const [, , vw] = vb ? vb.split(/[\s,]+/).map(Number) : [0, 0, 24, 24];
  const s = VB / (vw || 24);
  const strokes = [];
  const attr = (tag, name) => { const m = tag.match(new RegExp(name + '\\s*=\\s*"([^"]*)"')); return m ? m[1] : ""; };
  for (const m of svg.matchAll(/<path\b[^>]*\bd\s*=\s*"([^"]+)"[^>]*>/gi)) {
    const tag = m[0], d = m[1];
    const fill = attr(tag, "fill"), stroke = attr(tag, "stroke");
    const role = colorRole(fill, stroke);
    const filled = fill && fill !== "none";
    const sw = +(parseFloat(attr(tag, "stroke-width") || "0") * s).toFixed(2) || 4.4;
    for (const sub of parsePath(d)) {
      const a = toAnchors(sub);
      strokes.push({ pts: a.pts, closed: filled ? true : a.closed, stroke: filled ? "none" : role, fill: filled ? role : "none", sw: filled ? 0 : sw });
    }
  }
  for (const m of svg.matchAll(/<circle\b[^>]*>/gi)) {
    const tag = m[0], cx = +attr(tag, "cx"), cy = +attr(tag, "cy"), r = +attr(tag, "r");
    if (!r) continue;
    const fill = attr(tag, "fill"), stroke = attr(tag, "stroke");
    const role = colorRole(fill, stroke), filled = fill && fill !== "none";
    const c = circleAnchors(cx, cy, r);
    strokes.push({ pts: c.pts, closed: true, stroke: filled ? "none" : role, fill: filled ? role : "none", sw: filled ? 0 : (+(parseFloat(attr(tag, "stroke-width") || "0") * s).toFixed(2) || 4.4) });
  }
  return scaleStroke(strokes, s);
}

const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".svg")).sort();
const out = ["// GENERATED by tools/icons/build-icon-library.mjs — load AFTER icon-kit.js.",
  "(function () {",
  "  if (!window.IconKit || !IconKit.installIcon) { console.warn('icon-library: IconKit.installIcon missing — load icon-kit.js first'); return; }"];
let ok = 0;
for (const f of files) {
  const name = basename(f, ".svg");
  try {
    const strokes = convert(readFileSync(join(dir, f), "utf8"));
    if (!strokes.length) { console.warn("  skip (no geometry):", f); continue; }
    out.push("  IconKit.installIcon(" + JSON.stringify(name) + ", " + JSON.stringify(strokes) + ");");
    ok++;
  } catch (e) { console.warn("  skip (parse error):", f, e.message); }
}
out.push("})();", "");
writeFileSync(OUT, out.join("\n"));
console.log(`Wrote ${OUT} — ${ok}/${files.length} icons installable.`);
