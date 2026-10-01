# Datamodell

Migrasjoner ligger i `server/core/db.ts` (felles: users, sessions, op_log, schema_migrations) og `server/app/migrations.ts`.

## tasks (Task)

| Kolonne | Type | Regel |
|---|---|---|
| id | TEXT (UUID) | PK. Kan genereres av klienten (offline). |
| owner_id | TEXT | FK users, ON DELETE CASCADE |
| text | TEXT | 1–200 tegn |
| position | INTEGER | Rekkefølge i innboksen |
| estimate_minutes | INTEGER | 1–120 |
| state | TEXT | inbox, ready, active, paused, done |
| archived_at, created_at, updated_at | TEXT | ISO 8601 UTC |
| revision | INTEGER | Øker med 1 per endring |

Indeks: (owner_id, state, position).

## focus_sessions (FocusSession)

| Kolonne | Type | Regel |
|---|---|---|
| id, owner_id | TEXT | |
| task_id | TEXT | FK tasks, ON DELETE CASCADE |
| duration_s | INTEGER | 60–7200 |
| started_at | TEXT | Tidspunkt for start |
| paused_at | TEXT/null | Satt mens økten står på pause |
| paused_ms | INTEGER | Sum av fullførte pauser |
| finished_at | TEXT/null | |
| revision, created_at, updated_at, archived_at | | |

Gjenstående tid = duration_s·1000 − (slutt − started_at − paused_ms), der slutt er finished_at, paused_at eller nå.

## Tilstander

inbox → ready → active → done. active ↔ paused. ready → inbox (legg tilbake). done → inbox (gjenåpne). Bare én oppgave kan være ready, active eller paused om gangen. Serveren avviser alle andre overganger med 409.

## Sletting

Bare arkiverte oppgaver kan slettes, og klienten må sende `confirm: true`. Fokusøktene som hører til, slettes også. Sletting av en konto sletter alle kontoens data (CASCADE).
