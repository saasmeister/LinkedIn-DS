# tools/ — enforcement & update wiring

Two things make the master ↔ branch model real: a **gate** that blocks bad pushes, and a **daily check** for updates.

## 1. Enforce ownership (blocks a bad push)

`check-branch.mjs` reads `governance/ownership.json` + `governance/master.lock` and exits non-zero on a violation — so it stops the push.

```bash
node tools/check-branch.mjs           # validate
node tools/check-branch.mjs --write-lock   # master owner: regenerate the lock after legit changes
```

It fails when:
- a **branch edits / adds / deletes a master-owned file** (anything outside `overrides/` + `client/`), or
- a **client name** (listed in `ownership.json → denyClientNames`) leaks into a master file.

### Wire it as a git pre-push hook
```bash
# .git/hooks/pre-push  (chmod +x)
#!/bin/sh
node tools/check-branch.mjs || exit 1
```

### Or as a CI gate (runs on every PR)
```yaml
# .github/workflows/ownership.yml
name: ownership
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: node tools/check-branch.mjs
```

**Master owner flow:** make your change → `node tools/check-branch.mjs --write-lock` → commit the new `master.lock` → publish. The new lock becomes the baseline every branch validates against.

## 2. Daily update check

Two ways, depending on where the branch runs:

- **In-platform:** open the **Update Center** (`ui_kits/update-center/`). It auto-checks on load if it hasn't in 24h, shows any pending master version with its changelog + included templates, and applies only after you confirm.
- **In CI / a repo:** schedule a daily job that compares the branch version to the published master `update-manifest.json` and opens a PR (or notifies) when master is ahead:

```yaml
# .github/workflows/daily-update-check.yml
on:
  schedule: [{ cron: "0 7 * * *" }]   # every day 07:00 UTC
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: node tools/check-update.mjs   # compares VERSION vs master manifest, notifies if behind
```

> The actual *scheduling* and *network sync* are owned by the host/CI — a static design-system file can't run a daemon by itself. These hooks are how you attach it to one. The Update Center provides the on-open + 24h check and the confirm-before-apply UX.
