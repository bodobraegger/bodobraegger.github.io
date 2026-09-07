#!/usr/bin/env sh
# Prints raw and gzip sizes of the built JS and CSS chunks, largest first.
# Usage: scripts/asset-sizes.sh [dist/assets]
dir="${1:-dist/assets}"
for f in "$dir"/*.js "$dir"/*.css; do
  [ -f "$f" ] || continue
  raw=$(wc -c < "$f")
  gz=$(gzip -9c "$f" | wc -c)
  printf '%8d %8d  %s\n' "$raw" "$gz" "$(basename "$f")"
done | sort -rn | head -"${LINES_TO_SHOW:-12}"
