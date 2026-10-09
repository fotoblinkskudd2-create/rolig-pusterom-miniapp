#!/bin/sh
# Start Small Wins Lab lokalt på http://localhost:8080 (trengs for offline-caching).
# Alternativ uten server: åpne index.html direkte i nettleseren.
cd "$(dirname "$0")" && echo "Åpne http://localhost:8080 — stopp med Ctrl+C" && exec python3 -m http.server 8080 --bind 127.0.0.1
