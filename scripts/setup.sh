#!/bin/sh
# canvas-report global install (macOS / Linux / WSL / Git Bash)
# Installs the runtime project into ~/.canvas-report, keeping the workspace clean.
# Usage: sh scripts/setup.sh
set -e

SKILL_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TARGET="${CANVAS_REPORT_HOME:-$HOME/.canvas-report}"

command -v node >/dev/null 2>&1 || { echo "Error: Node.js >= 18 is required, install it first: https://nodejs.org" >&2; exit 1; }
command -v tar  >/dev/null 2>&1 || { echo "Error: the tar command is required" >&2; exit 1; }

mkdir -p "$TARGET/src/reports"
tar -xzf "$SKILL_DIR/scripts/canvas-report-assets.tar.gz" -C "$TARGET"

NEED_INSTALL=0
if [ ! -d "$TARGET/node_modules" ]; then
  NEED_INSTALL=1
elif [ "$TARGET/.canvas-version" -nt "$TARGET/node_modules" ]; then
  NEED_INSTALL=1  # version marker is newer than node_modules → skill was updated, dependencies may have changed
fi

if [ "$NEED_INSTALL" = "1" ]; then
  echo "[canvas-report] installing dependencies (npm ci)..."
  (cd "$TARGET" && npm ci --no-audit --no-fund)
else
  echo "[canvas-report] dependencies up to date, skipping install"
fi

echo "[canvas-report] ready: $TARGET"
echo "[canvas-report] start: sh \"$SKILL_DIR/scripts/start.sh\""
