#!/usr/bin/env sh
# Fails when the built entry chunk or any built image exceeds its budget.
# Run after `pnpm build`. Usage: scripts/check-asset-sizes.sh [dist/assets]
set -u
dir="${1:-dist/assets}"
entry_gzip_budget=40000
image_budget=300000
failed=0

for f in "$dir"/app-*.js; do
  [ -f "$f" ] || continue
  gz=$(gzip -9c "$f" | wc -c)
  if [ "$gz" -gt "$entry_gzip_budget" ]; then
    echo "FAIL entry chunk $(basename "$f") is $gz bytes gzip, budget $entry_gzip_budget"
    failed=1
  else
    echo "ok   entry chunk $(basename "$f") is $gz bytes gzip"
  fi
done

for f in "$dir"/*.avif "$dir"/*.webp "$dir"/*.png "$dir"/*.jpg "$dir"/*.jpeg; do
  [ -f "$f" ] || continue
  raw=$(wc -c < "$f")
  if [ "$raw" -gt "$image_budget" ]; then
    echo "FAIL image $(basename "$f") is $raw bytes, budget $image_budget"
    failed=1
  fi
done

[ "$failed" -eq 0 ] && echo "ok   all images under $image_budget bytes"
exit "$failed"
