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

Ingenting går på nett. Isolation Mirror viser bilde kun i denne fanen. Filen lastes ikke opp.

## Export

Historikk → «Ta historikken med deg» → `pusterom-historikk.txt`.

## Isolation Mirror → Grok-bot

Skriv note → Generer → Kopier prompt → lim i Labben eller Grok-bot med `/lab`.

## Asymmetri-verktøy

Åpne `asymmetri.html`. Tre faner:

- **Regel vs. fri** – Monte Carlo: A er bundet av ventetid, forbudte trekk og kontroll; B er fri. Slideren «gevinst» viser hva reglene må gi tilbake for at A skal vinne.
- **Hull-sjekk** – lim inn offisiell forklaring → skann (forbeholdsord, tall, datoer, lenker) → 10 kontrollspørsmål → hull-score + rapport + LLM-prompt. «Lagre som versjon» gir diff når forklaringen endres.
- **Evidens-logg** – påstand + kilde + sikkerhet + utløpsdato. Flagger påstander uten kilde, med svak kilde eller som ikke er sjekket på lenge. Eksport til JSON.

| Nøkkel | Innhold |
|--------|---------|
| `asymCases` | saker med versjoner av forklaringen, hull-score |
| `asymClaims` | påstander, kilde, sikkerhet, revisjonshistorikk |
