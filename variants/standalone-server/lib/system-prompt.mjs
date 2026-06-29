// Assembles the Claude system prompt from the design-system files that ship
// alongside this server in the standalone bundle (dist/standalone/).
//
// The split is deliberate and tuned for prompt caching:
//   - Block 1 (STABLE): posture, the orchestrator SKILL, governance, principles,
//     guidelines, tokens, anti-slop. Identical on every request -> cached, paid
//     ~once, then ~0.1x per call.
//   - Block 2 (SELECTION): the chosen style pack + archetype layout. Stable for a
//     run of requests with the same selection -> its own cache entry.
// The per-request brief and brand go in the user message (volatile), never here,
// so they can't invalidate the cached prefix.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DS_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const read = (rel) => {
  const p = join(DS_ROOT, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
};

function readDir(rel, exts) {
  const dir = join(DS_ROOT, rel);
  if (!existsSync(dir)) return "";
  return readdirSync(dir)
    .filter((f) => exts.some((e) => f.endsWith(e)) && !/ 2(\.[^.]+)*$/.test(f))
    .sort()
    .map((f) => `\n<!-- ${rel}/${f} -->\n${readFileSync(join(dir, f), "utf8")}`)
    .join("\n");
}

// Built once at module load — the stable corpus never changes between requests.
const STABLE = [
  "# Senior-designer posture\n" + read("posture.md"),
  "# Orchestrator / flow\n" + read("SKILL.md"),
  "# Governance\n" + read("GOVERNANCE.md"),
  "# Anti-slop QA gate\n" + read("references/anti-slop.md"),
  "# Design tokens\n" + readDir("tokens", [".css"]),
  "# Principles\n" + readDir("principles", [".card.html"]),
  "# Guidelines\n" + readDir("guidelines", [".card.html"]),
].join("\n\n---\n\n");

function findArchetype(slug) {
  const dir = join(DS_ROOT, "templates", slug);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return "";
  const dc = readdirSync(dir).find((f) => f.endsWith(".dc.html"));
  return dc ? readFileSync(join(dir, dc), "utf8") : "";
}

/**
 * @param {{ stylePack?: string, archetype?: string }} opts
 * @returns {Array<{type:'text',text:string,cache_control?:object}>} system blocks
 */
export function buildSystemBlocks({ stylePack, archetype } = {}) {
  const blocks = [
    { type: "text", text: STABLE, cache_control: { type: "ephemeral" } },
  ];

  const selectionParts = [];
  if (stylePack) {
    const packSkill = read(`style-packs/${stylePack}/SKILL.md`);
    if (packSkill) selectionParts.push(`# Active style pack: ${stylePack}\n${packSkill}`);
  }
  if (archetype) {
    const layout = findArchetype(archetype);
    if (layout) selectionParts.push(`# Reference archetype: ${archetype}\n${layout}`);
  }
  if (selectionParts.length) {
    blocks.push({
      type: "text",
      text: selectionParts.join("\n\n---\n\n"),
      cache_control: { type: "ephemeral" },
    });
  }

  blocks.push({
    type: "text",
    text:
      "OUTPUT CONTRACT: Return exactly one self-contained `.artboard` HTML block " +
      "for the 1080x1350 canvas, following every principle, the safe margins, and " +
      "the anti-slop gate above. No preamble, no explanation — HTML only.",
  });

  return blocks;
}
