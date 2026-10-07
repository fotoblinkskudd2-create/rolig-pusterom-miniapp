# RUN

## Åpne

1. Last ned `index.html` og `isolation-mirror.html` i samme mappe.
2. Åpne `index.html` i Safari eller Chrome.
3. På iPhone: Del → Legg til på Hjem-skjerm (valgfritt).

Ingen server. Ingen konto.

## Hva som lagres lokalt

| Nøkkel | Innhold |
|--------|---------|
| `checkins` | tid, humør 1–5, valgfri note |
| `doneActions` | hvilke «små grep» merket i dag |
| `plan` | faste tider: klokkeslett, type, navn, på/av |
| `planFired` | hvilke faste tider som har varslet i dag |

Ingenting går på nett. Isolation Mirror viser bilde kun i denne fanen. Filen lastes ikke opp.

## Faste tider

Plan-fanen → sett klokkeslett for sjekk-inn, pust eller små grep. Standard: 08:00, 12:30, 15:00, 21:30.

- **Mens appen er åpen:** banner på klokkeslettet (+ systemvarsel hvis du slår på varsler). «Om 10 min» utsetter.
- **Når appen er lukket:** «Legg i kalenderen (.ics)» → åpne fila → kalenderen varsler hver dag. Lag fila på nytt når du endrer tider.
- Åpner du appen mer enn 30 min etter et klokkeslett, hoppes det over. Ingen haug med gamle varsler.

## Export

Historikk → «Ta historikken med deg» → `pusterom-historikk.txt`.

## Isolation Mirror → Grok-bot

Skriv note → Generer → Kopier prompt → lim i Labben eller Grok-bot med `/lab`.
