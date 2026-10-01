# FocusDump API

Alle svar er JSON. Feil har formen `{ "error": { "code", "message", "details" } }`, og `details.fields` viser feil per felt. Muterende kall krever `Content-Type: application/json`. Et muterende kall kan sende `Idempotency-Key: <operasjons-id>`: samme id gir samme svar, så ingen post opprettes to ganger. Revisjonsfeil gir `409 konflikt`, og `details.current` er gjeldende versjon.

## Konto (felles)

| Metode | Sti | Body | Svar |
|---|---|---|---|
| POST | /api/auth/register | email, password (≥ 8) | 201 user, token + cookie |
| POST | /api/auth/login | email, password | user, token + cookie (429 etter 10 feil) |
| POST | /api/auth/logout | – | ok |
| GET | /api/auth/me | – | user |
| GET | /api/health | – | ok, versjon |

## Oppgaver

| Metode | Sti | Body | Merknad |
|---|---|---|---|
| GET | /api/tasks[?archived=1] | – | Liste sortert på posisjon. Inkluderer åpen økt med `remaining_ms`. |
| POST | /api/tasks/capture | tasks (tekst, én per linje, maks 50 × 200 tegn), minutes (1–120 heltall), ids? (klient-UUID per linje) | 201. Alt eller ingenting. |
| GET | /api/tasks/:id | – | |
| PATCH | /api/tasks/:id | revision, text?, estimate_minutes? | Øktlengde kan ikke endres under økt. |
| POST | /api/tasks/:id/state | revision, state = inbox \| ready | Legg tilbake / gjenåpne. |
| POST | /api/now | minutes?, task_id? | «Lag nå-kort». 409 hvis nå-kort finnes eller innboksen er tom. |
| POST | /api/tasks/:id/start | revision, at? | Oppretter fokusøkt (ready → active). |
| POST | /api/tasks/:id/pause | revision, at? | active → paused |
| POST | /api/tasks/:id/resume | revision, at? | paused → active |
| POST | /api/tasks/:id/finish | revision, at? | active/paused → done |
| POST | /api/tasks/:id/move | revision, direction = up \| down | Bytter plass med nabo i innboksen. |
| POST | /api/tasks/:id/archive | revision | Ikke mulig under økt. Et nå-kort legges tilbake i innboksen. |
| POST | /api/tasks/:id/unarchive | revision | |
| DELETE | /api/tasks/:id | confirm: true | Bare arkiverte oppgaver. Sletter tilhørende økter. |

`at` er tidspunktet brukeren trykket (ISO 8601). Det brukes av køede offline-handlinger, og godtas bare innen siste døgn og ikke frem i tid.

## Oversikt og eksport

| Metode | Sti | Merknad |
|---|---|---|
| GET | /api/today?tz=<getTimezoneOffset>&date=YYYY-MM-DD | Ferdige, økter, fokusminutter og skrevet ned, uten vurdering. |
| GET | /api/export | `{ format: "focusdump-eksport", format_version: 1, app_version, exported_at, fields, data: { tasks, sessions } }` |
| GET | /api/export?download=1 | Samme som fil. |
| GET | /api/export?format=csv | Oppgaver som CSV (semikolon) med kommentarlinje for versjon og tidspunkt. |

Feltene i eksporten er dokumentert i selve filen (`fields`).
