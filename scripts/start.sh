#!/bin/sh
# Start the canvas-report dev server (prints the URL and exits if already running)
# Usage: sh scripts/start.sh
set -e

TARGET="${CANVAS_REPORT_HOME:-$HOME/.canvas-report}"
PORT="${PORT:-5199}"

if [ ! -d "$TARGET/node_modules" ]; then
  echo "Error: not installed yet, run setup.sh first" >&2
  exit 1
fi

if curl -sf "http://localhost:$PORT/" >/dev/null 2>&1; then
  echo "[canvas-report] dev server already running: http://localhost:$PORT/"
  exit 0
fi

echo "[canvas-report] starting dev server (port $PORT)..."
(cd "$TARGET" && nohup npm run dev >/tmp/canvas-report-dev.log 2>&1 & echo $! > /tmp/canvas-report-dev.pid)

i=0
while [ $i -lt 30 ]; do
  if curl -sf "http://localhost:$PORT/" >/dev/null 2>&1; then
    echo "[canvas-report] ready: http://localhost:$PORT/"
    exit 0
  fi
  i=$((i + 1))
  sleep 1
done

echo "Error: dev server not ready within 30s, check the log: /tmp/canvas-report-dev.log" >&2
exit 1
