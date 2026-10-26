# RUN

## Åpne

1. Last ned `index.html` og `isolation-mirror.html` i samme mappe.
2. Åpne `index.html` i Safari eller Chrome.
3. På iPhone: Del → Legg til på Hjem-skjerm (valgfritt).

Ingen server. Ingen konto. Over https fungerer appen også offline etter første besøk.

## Hva som lagres lokalt

| Nøkkel | Innhold |
|--------|---------|
| `checkins` | tid, humør 1–5, valgfri note |
| `doneActions` | hvilke «små grep» merket i dag |

Appen sender ingenting på nett. Isolation Mirror viser bildet kun i denne fanen, og filen lastes ikke opp.

**Unntak:** Labben-prompten tar med de første 180 tegnene av noten din. Limer du den i Grok eller Labben, forlater teksten enheten. Skriv ikke noe der du ikke vil dele.

## Hosting – les før du legger appen på nett

localStorage deles av alle sider på samme domene (origin). Legger du appen på `brukernavn.github.io/rolig-pusterom-miniapp`, kan alle andre sider under `brukernavn.github.io` lese innsjekkene og notatene dine.

Trygt:
- Åpne `index.html` lokalt fra fil, eller
- host på et eget domene/subdomene som ikke deler origin med andre prosjekter.

Kryptering i nettleseren løser ikke dette, fordi nøkkelen må ligge på samme origin.

## Export

Historikk → «Ta historikken med deg» → `pusterom-historikk.txt`.

## Isolation Mirror → Grok-bot

Skriv note → Generer → Kopier prompt → lim i Labben eller Grok-bot med `/lab`.
