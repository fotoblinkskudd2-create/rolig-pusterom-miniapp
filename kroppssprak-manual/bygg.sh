#!/usr/bin/env bash
# Bygger manualen: kapitler/*.md -> manual.html -> manual.pdf (A5)
set -euo pipefail
cd "$(dirname "$0")"
pandoc tittel.md kapitler/*.md -f markdown -t html5 -s --toc --toc-depth=1 \
  --metadata lang=no --metadata toc-title="Innhold" \
  --css stil.css --embed-resources -o manual.html \
  --variable pagetitle="Kroppen lyver ikke"
NODE_PATH=$(npm root -g) node pdf.js
