#!/bin/sh
# Kjører alle tester i repoet. Krever node + playwright, python3 + numpy trimesh manifold3d shapely mapbox_earcut matplotlib.
set -e
cd "$(dirname "$0")/.."
node test/pusterom.test.mjs
node products/01-kjolerom/test/kjolerom.test.mjs
node products/02-pustestein/test/pustestein.test.mjs
node products/03-granatbelte/test/granatbelte.test.mjs
