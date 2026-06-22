/**
 * check-branch.mjs — enforces the master <-> branch ownership contract.
 * Run with Node 18+:  node tools/check-branch.mjs   (validate)
 *                     node tools/check-branch.mjs --write-lock   (master owner: regenerate lock)
 *
 * Exits NON-ZERO on a violation, so it blocks a git pre-push hook / CI gate.
 * Enforces: (1) a branch must not edit/add/delete master-owned files (vs
 * governance/master.lock); (2) no client name leaks into a master file.
 *
 * NOTE: no top-level import/export or shebang on purpose — that keeps this
 * file out of the browser design-bundle. Dependencies load via dynamic import.
 */
async function main() {
  const { readFile, readdir, stat, writeFile } = await import("node:fs/promises");
  const { createHash } = await import("node:crypto");
  const { join, relative, sep } = await import("node:path");

  const ROOT = process.cwd();
  const OWNERSHIP = "governance/ownership.json";
  const LOCK = "governance/master.lock";
  const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
  const toGlob = (p) => new RegExp("^" + p.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "\u00a7\u00a7").replace(/\*/g, "[^/]*").replace(/\u00a7\u00a7/g, ".*") + "$");
  const match = (path, globs) => globs.some((g) => toGlob(g).test(path));

  async function walk(dir, acc = []) {
    for (const name of await readdir(dir)) {
      if (name === ".git" || name === "node_modules") continue;
      const full = join(dir, name);
      const s = await stat(full);
      if (s.isDirectory()) await walk(full, acc);
      else acc.push(relative(ROOT, full).split(sep).join("/"));
    }
    return acc;
  }

  const own = JSON.parse(await readFile(join(ROOT, OWNERSHIP), "utf8"));
  const files = (await walk(ROOT)).filter((f) => f !== LOCK);
  const isIgnored = (f) => match(f, own.ignored);
  const isBranch = (f) => match(f, own.branchOwned);
  const isMaster = (f) => !isIgnored(f) && !isBranch(f);

  if (process.argv.includes("--write-lock")) {
    const lock = {};
    for (const f of files) if (isMaster(f)) lock[f] = sha(await readFile(join(ROOT, f), "utf8"));
    await writeFile(join(ROOT, LOCK), JSON.stringify(lock, null, 0));
    console.log(`\u2713 wrote ${LOCK} (${Object.keys(lock).length} master files)`);
    return;
  }

  let lock = null;
  try { lock = JSON.parse(await readFile(join(ROOT, LOCK), "utf8")); } catch {}
  const violations = [];

  if (lock) {
    for (const f of files) {
      if (!isMaster(f)) continue;
      const cur = sha(await readFile(join(ROOT, f), "utf8"));
      if (!(f in lock)) violations.push(`NEW master-area file in branch: ${f}\n   -> move it to client/ or overrides/, or push it from master.`);
      else if (lock[f] !== cur) violations.push(`MASTER file edited in branch: ${f}\n   -> revert it; put your change in overrides/ or client/.`);
    }
    for (const f of Object.keys(lock)) {
      if (!files.includes(f)) violations.push(`MASTER file deleted in branch: ${f}\n   -> restore it; a branch cannot remove master files.`);
    }
  } else {
    console.log("\u2022 No lock found — running master-side checks only. Generate one with --write-lock.");
  }

  const deny = (own.forbiddenInMaster && own.forbiddenInMaster.denyClientNames) || [];
  if (deny.length) {
    for (const f of files) {
      if (!isMaster(f)) continue;
      const body = await readFile(join(ROOT, f), "utf8");
      for (const name of deny) if (body.includes(name)) violations.push(`Client name "${name}" found in master file: ${f}\n   -> client-specific values belong in overrides/ or client/.`);
    }
  }

  if (violations.length) {
    console.error(`\n\u2717 push blocked — ${violations.length} ownership violation(s):\n`);
    violations.forEach((v) => console.error("  \u2022 " + v));
    console.error("\nSee GOVERNANCE.md. master ships fundamentals; the branch owns overrides/ + client/.\n");
    process.exit(1);
  }
  console.log("\u2713 ownership OK — master files untouched, no client data leaked. Safe to push.");
}

if (typeof process !== "undefined" && process.versions && process.versions.node) {
  main().catch((e) => { console.error(e); process.exit(2); });
}
