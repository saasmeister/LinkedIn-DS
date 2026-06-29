#!/usr/bin/env bash
# Publish the headless DS Core to its own GitHub repo, so the repo URL can be
# pasted straight into Claude Design (Create New System -> Link code from GitHub).
#
# The published repo is a MIRROR of variants/dist/core — its default branch
# always reflects the latest build. Re-run any time to update.
#
#   variants/publish-core.sh git@github.com:saasmeister/LinkedIn-DS-core.git
#   # or via env:
#   CORE_REPO=https://github.com/saasmeister/LinkedIn-DS-core.git variants/publish-core.sh
#
# One-time: create the EMPTY target repo on GitHub first (no README/.gitignore).
set -euo pipefail

REMOTE="${1:-${CORE_REPO:-}}"
if [ -z "$REMOTE" ]; then
  echo "usage: variants/publish-core.sh <git-remote-url>   (or set CORE_REPO)" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# 1. Build a fresh headless Core.
node "$ROOT/variants/build.mjs" core

# 2. Stage it as its own throwaway git tree (force-pushed; history doesn't matter).
STAGE="$ROOT/variants/.publish/core"
rm -rf "$STAGE"
mkdir -p "$STAGE"
cp -R "$ROOT/variants/dist/core/." "$STAGE/"

cd "$STAGE"
git init -q
git checkout -q -b main
git add -A
git commit -q -m "$(cat <<'MSG'
Publish DS Core (headless) — mirror of variants/dist/core

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
MSG
)"
git remote add origin "$REMOTE"
git push -f -u origin main

echo
echo "✅ Published headless Core to: $REMOTE"
echo "   Share that repo URL in Claude Design → Create New System → Link code from GitHub."
