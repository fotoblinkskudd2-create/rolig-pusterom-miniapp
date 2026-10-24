# 19 · Overleveringspakke med kontroll

Python-CLI (`overlever.py`, bare standardbibliotek) som leser en leveransemappe og en kontrakt, og lager lokal HTML-rapport, JSON-rapport og en ZIP-pakke når leveransen er godkjent.

## Bruk

```bash
python3 overlever.py eksempler/komplett --ut ut/komplett --kjor-kontroller    # GODKJENT → ut/komplett/fakturaimport_1.2.0.zip
python3 overlever.py eksempler/mangelfull --ut ut/mangelfull --kjor-kontroller  # IKKE GODKJENT, exit 2, ingen ZIP
python3 kontroll.py                                                         # 15 kontroller
```

Kontraktformatet er beskrevet i `kontraktformat.md`. Eksempel: `eksempler/komplett/leveranse.json`.

## Hva pakken inneholder

`leveranse/…` (alle filer som ikke er utelatt), `manifest.json` (sha256 og størrelse per fil, oppstartskommandoer, kontrollresultater, kjente mangler, neste vedlikeholdshandling, grenser) og `rapport.html`.

## Godkjenning blokkeres av

- manglende obligatorisk fil (glob-mønster)
- mulig hemmelighet (privat nøkkel, AWS-nøkkel, GitHub-/Slack-token, `*password*`/`*secret*`/`*token*`/`api_key` = verdi). Funnet rapporteres med fil, linje og type. **Verdien skrives aldri ut** (kontrollert i stdout, HTML og JSON)
- kontroll som feilet eller ikke er kjørt (kontrollkommandoer er prosjektkode og kjøres bare med `--kjor-kontroller`)

## Faktisk resultat

- Komplett: godkjent. Enhetstesten er kjørt og bestått, og alle sjekksummer i manifestet stemmer med filene i ZIP-en (`resultat/komplett/`).
- Endring i `src/importer.py` endrer bare den filens hash.
- Mangelfull: blokkert av manglende `tests/test_*.py` og `LISENS*`, to mulige hemmeligheter (`src/rute.py:2`, `:3`) og feilet kontroll (`resultat/mangelfull/rapport.html`).

## Grenser for kontrollen

Kontrollen sjekker bare filmønstre, sjekksummer, mønstre for hemmeligheter og eksitkoder for kommandoene i kontrakten. Den vurderer ikke kodekvalitet, sikkerhet eller om dokumentasjonen er riktig. Hemmelighetsskanningen er mønsterbasert og kan både gå glipp av hemmeligheter og gi falske treff. Sjekksummer viser endring, men er ingen signatur.
