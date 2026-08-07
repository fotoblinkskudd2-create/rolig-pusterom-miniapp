#!/usr/bin/env bash
# REGNViking OS - single-command launch. Requires Docker + Docker Compose.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  cp .env.example .env
fi

docker compose up --build -d
echo ""
echo "REGNViking OS is starting."
echo "  Dashboard: http://localhost:3000"
echo "  API:       http://localhost:8000/api/health"
echo ""
echo "Optional local LLM sidecar: docker compose --profile ollama up -d ollama"
echo "Stop everything:            docker compose down"
