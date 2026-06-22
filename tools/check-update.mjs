/**
 * check-update.mjs — is this branch behind master?
 * Run with Node 18+:  node tools/check-update.mjs [manifestUrl]
 *
 * Exits 10 (and prints what's pending) when the branch is behind master,
 * 0 when current — so a daily CI job can branch on the exit code.
 *
 * NOTE: no top-level import/export or shebang on purpose — keeps this file
 * out of the browser design-bundle. Dependencies load via dynamic import.
 */
async function main() {
  const { readFile } = await import("node:fs/promises");

  const semver = (v) => String(v).split(".").map(Number);
  const behind = (a, b) => { const x = semver(a), y = semver(b); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0); } return false; };

  const branch = (await readFile("VERSION", "utf8")).trim();
  const local = JSON.parse(await readFile("update-manifest.json", "utf8"));
  const url = process.argv[2] || local.manifestUrl;

  let master = local; // fallback: local manifest (demo / offline)
  if (url && /^https?:/.test(url)) {
    try { master = await (await fetch(url)).json(); }
    catch (e) { console.error("\u2022 could not fetch master manifest (" + e.message + ") — using local."); }
  }

  if (behind(branch, master.version)) {
    const pending = (master.releases || []).filter((r) => behind(branch, r.version));
    console.log(`\u2b06 update available: ${branch} -> ${master.version}`);
    for (const r of pending) {
      console.log(`\n  ${r.version} (${r.level}) — ${r.summary}`);
      if (r.templates && r.templates.length) console.log("    templates: " + r.templates.join(", "));
      if (r.components && r.components.length) console.log("    components: " + r.components.join(", "));
    }
    console.log("\nReview the changelog, then apply (Update Center -> Apply, or pull master in your repo).");
    process.exit(10);
  }
  console.log(`\u2713 up to date (branch ${branch}, master ${master.version}).`);
}
if (typeof process !== "undefined" && process.versions && process.versions.node) {
  main().catch((e) => { console.error(e); process.exit(2); });
}
