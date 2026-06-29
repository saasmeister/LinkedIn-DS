#!/usr/bin/env bash
# Publish any built variant to its own GitHub repo, so the repo URL can be
# pasted straight into Claude Design (Create New System -> Link code from GitHub).
#
# The published repo is a MIRROR of variants/dist/<variant>; its default branch
# always reflects the latest build. Re-run any time to update.
#
#   variants/publish.sh core         git@github.com:saasmeister/LinkedInDS-Core.git
#   variants/publish.sh claude-design https://github.com/saasmeister/LinkedInDS-UI.git
#
# One-time: create the EMPTY target repo on GitHub first (no README/.gitignore).
set -euo pipefail

VARIANT="${1:-}"
REMOTE="${2:-}"
if [ -z "$VARIANT" ] || [ -z "$REMOTE" ]; then
  echo "usage: variants/publish.sh <variant> <git-remote-url>" >&2
  echo "  variants: core | claude-design | standalone" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

node "$ROOT/variants/build.mjs" "$VARIANT"

SRC="$ROOT/variants/dist/$VARIANT"
[ -d "$SRC" ] || { echo "no build at $SRC — is '$VARIANT' a real variant?" >&2; exit 1; }

STAGE="$ROOT/variants/.publish/$VARIANT"
rm -rf "$STAGE"
mkdir -p "$STAGE"
cp -R "$SRC/." "$STAGE/"

cd "$STAGE"
git init -q
git checkout -q -b main
git add -A
git commit -q -m "$(cat <<MSG
Publish DS variant: $VARIANT — mirror of variants/dist/$VARIANT

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
MSG
)"
git remote add origin "$REMOTE"
git push -f -u origin main

echo
echo "✅ Published '$VARIANT' to: $REMOTE"
echo "   Share that repo URL in Claude Design → Create New System → Link code from GitHub."
