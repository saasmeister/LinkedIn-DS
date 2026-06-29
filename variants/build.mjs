#!/usr/bin/env node
// Build the three product variants from this one source tree.
//   node variants/build.mjs            -> builds every variant
//   node variants/build.mjs core       -> builds only `core`
//   node variants/build.mjs core standalone
//
// Each variant lands in variants/dist/<name>/. The source tree is never mutated.

import { readFileSync, rmSync, mkdirSync, cpSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(HERE, "manifest.json"), "utf8"));
const ROOT = join(HERE, manifest.source);          // repo root
const OUT = join(HERE, manifest.out);               // variants/dist

// --- tiny glob matcher: supports **, *, ? against a posix relative path ---
function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") { re += "(?:.*)"; i++; if (glob[i + 1] === "/") i++; }
      else re += "[^/]*";
    } else if (c === "?") re += "[^/]";
    else if ("\\^$+.()|{}[]".includes(c)) re += "\\" + c;
    else re += c;
  }
  return new RegExp("^" + re + "$");
}

// A path segment like "carousel-01-cover 2" or "brand 2.css" is a Finder duplicate.
const isDuplicate = (relPath) =>
  relPath.split("/").some((seg) => /^.+ 2(\.[^.]+)*$/.test(seg));

function resolveGlobs(list) {
  // expand "@uiLayer" reference into the manifest's uiLayer array
  return list.flatMap((g) => (g === "@uiLayer" ? manifest.uiLayer : [g]));
}

function walk(dir, base = dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const rel = relative(base, abs).split(sep).join("/");
    if (statSync(abs).isDirectory()) out.push(...walk(abs, base));
    else out.push(rel);
  }
  return out;
}

const always = manifest.alwaysExclude.map(globToRegExp);
const allFiles = walk(ROOT);

function buildVariant(name, spec) {
  const excludes = resolveGlobs(spec.exclude || []).map(globToRegExp);
  const dest = join(OUT, name);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });

  let copied = 0;
  for (const rel of allFiles) {
    if (isDuplicate(rel)) continue;
    if (always.some((re) => re.test(rel))) continue;
    if (excludes.some((re) => re.test(rel))) continue;
    const to = join(dest, rel);
    mkdirSync(dirname(to), { recursive: true });
    cpSync(join(ROOT, rel), to);
    copied++;
  }

  // pull in any variant-only source folders (e.g. the standalone server)
  for (const extra of spec.extraSources || []) {
    const from = join(HERE, extra);
    cpSync(from, join(dest, "server"), { recursive: true });
  }

  // apply overlay files LAST — they overwrite the copied source (e.g. a
  // variant-specific SKILL.md). Overlay paths mirror the dest layout.
  let overlaid = 0;
  if (spec.overlay) {
    const ovRoot = join(HERE, spec.overlay);
    for (const rel of walk(ovRoot)) {
      const to = join(dest, rel);
      mkdirSync(dirname(to), { recursive: true });
      cpSync(join(ovRoot, rel), to);
      overlaid++;
    }
  }

  writeFileSync(
    join(dest, "VARIANT.json"),
    JSON.stringify({ name, title: spec.title, audience: spec.audience, files: copied, overlaid }, null, 2) + "\n",
  );
  const note = overlaid ? `  (+${overlaid} overlay)` : "";
  console.log(`  ${name.padEnd(14)} ${String(copied).padStart(4)} files  -> ${relative(ROOT, dest)}${note}`);
}

const wanted = process.argv.slice(2);
const names = wanted.length ? wanted : Object.keys(manifest.variants);
console.log(`Building from ${allFiles.length} source files:`);
for (const name of names) {
  const spec = manifest.variants[name];
  if (!spec) { console.error(`  ! unknown variant: ${name}`); continue; }
  buildVariant(name, spec);
}
