#!/usr/bin/env bash
#
# Captures each scene at a phone viewport, for reviewing the design.
#
# Chrome's headless window includes chrome insets, so --window-size must be
# wider than the intended viewport or the right edge is silently cropped.
# 440 gives ~390px of usable content.
#
#   ./scripts/shots.sh [output-dir] [base-url]
#
set -euo pipefail

OUT="${1:-./shots}"
BASE="${2:-http://localhost:3000}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

mkdir -p "$OUT"

shoot() {
  local name="$1" url="$2" height="${3:-900}"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --force-prefers-reduced-motion \
    --window-size=440,"$height" \
    --virtual-time-budget=8000 \
    --screenshot="$OUT/$name.png" \
    "$url" >/dev/null 2>&1
  echo "  ✓ $name.png"
}

echo "Capturing scenes to $OUT …"

# The envelope cover, as a first-time guest sees it.
shoot "00-envelope" "$BASE/"

# Scenes beneath the cover. skipEnvelope bypasses it; the hash scrolls.
shoot "01-invitation" "$BASE/?skipEnvelope"       1000
shoot "02-blessing"   "$BASE/?skipEnvelope#blessing"
shoot "03-gallery"    "$BASE/?skipEnvelope#gallery"
shoot "04-details"    "$BASE/?skipEnvelope#details" 1100

echo "Done."
