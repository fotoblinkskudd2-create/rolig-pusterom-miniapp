# rolig-pusterom-miniapp

Rolig mini-app. 4 sider: Innsjekk, Pusterom, Små grep, Historikk. Pure HTML. Lokal lagring.

**1.1 (29.08.2026):** nav-fix, lokal-first-linje, export av historikk, Isolation Mirror bundet til Labben/Grok-bot.

**1.2 (08.11.2026):** `motgift.html` – verktøy mot manipulasjon og konspirasjonsteorier (Tren · Sjekk · Pause · Samtale). Bygget i Demorunde 01 av agentteamet i `.claude/`.

Åpne `index.html`. Les `RUN.md`.

## Agentteamet (`.claude/`)
| Agent | Rolle | Subagent |
|---|---|---|
| `koordinator` | 40-min tidslinje, dreper svake ideer, velger ett bygg | – |
| `teknologi` | Verktøy, friksjon, AI-dialog, lokal-first | `kildesjekk` |
| `psykologi` | Behov bak troen, prebunking, samtale | `forskning` |
| `mediekunnskap` | SIFT, lateral lesing, FLICC | `innhold` |

Skills: `demorunde` (kjører det hele), `prebunk`, `sift`, `samtale`.
Kjør en ny runde i Claude Code: `/demorunde <problem>`. Resultat: `demorunde/DEMORUNDE-01.md`.
