#!/usr/bin/env bash
# MR ART Claude Code-pakke. Bruk:
#   ./installer.sh prosjekt <sti-til-prosjekt>   # skills, agenter, hooks, settings, tools i ett prosjekt
#   ./installer.sh personlig                      # skills + agenter i ~/.claude (alle prosjekter)
# Overskriver aldri eksisterende CLAUDE.md eller settings.json — legger nye ved siden av.
set -euo pipefail
KILDE="$(cd "$(dirname "$0")" && pwd)"
kopier() { # $1 kilde-dir  $2 mål-dir
  mkdir -p "$2"; for x in "$1"/*; do n=$(basename "$x"); if [ -e "$2/$n" ]; then echo "  finnes, hopper over: $2/$n"; else cp -R "$x" "$2/"; fi; done; }
case "${1:-}" in
  prosjekt)
    MAL="${2:?oppgi prosjektsti}"; mkdir -p "$MAL/.claude"
    kopier "$KILDE/.claude/skills" "$MAL/.claude/skills"
    kopier "$KILDE/.claude/agents" "$MAL/.claude/agents"
    kopier "$KILDE/.claude/hooks"  "$MAL/.claude/hooks"
    kopier "$KILDE/tools" "$MAL/tools"
    mkdir -p "$MAL/.mrart"; cp -n "$KILDE/.mrart/"* "$MAL/.mrart/" 2>/dev/null || true
    for f in CLAUDE.md .mcp.json; do
      if [ -e "$MAL/$f" ]; then cp "$KILDE/$f" "$MAL/$f.mrart"; echo "  $f finnes — ny versjon lagt som $f.mrart. Be Claude slå sammen (oppgave 01)."; else cp "$KILDE/$f" "$MAL/$f"; fi
    done
    if [ -e "$MAL/.claude/settings.json" ]; then cp "$KILDE/.claude/settings.json" "$MAL/.claude/settings.mrart.json"; echo "  settings.json finnes — se settings.mrart.json"; else cp "$KILDE/.claude/settings.json" "$MAL/.claude/settings.json"; fi
    grep -qxF ".mrart/ja.txt" "$MAL/.gitignore" 2>/dev/null || echo ".mrart/ja.txt" >> "$MAL/.gitignore"
    echo "Ferdig. Åpne prosjektet med 'claude' og kjør /oppstart." ;;
  personlig)
    kopier "$KILDE/.claude/skills" "$HOME/.claude/skills"
    kopier "$KILDE/.claude/agents" "$HOME/.claude/agents"
    echo "Skills og agenter installert i ~/.claude. Hooks og regler krever prosjektinstallasjon (de bruker \$CLAUDE_PROJECT_DIR)." ;;
  *) sed -n '2,5p' "$0"; exit 1 ;;
esac
