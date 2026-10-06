# Mediebruk-workflow

Ett system for alt som lages: tekst, vibecode, kode, bilde, video, lyd. Fra idé til ferdig produkt og ut i verden.

Bygget på det som allerede finnes i dette repoet (se `INPUTMINNER.md`). Ikke en teori. En rutine.

## Sju steg

| # | Steg | Spørsmål | Ut av steget | Mal |
|---|------|----------|--------------|-----|
| 0 | **FANG** | Hva kom inn? | Rå note i innboks (tale, tekst, bilde) | `maler/ide.md` |
| 1 | **LAB** | Hvilken idé overlever? | Seed 7, drep minst 3, én vinner | `maler/lab-prompt.md` |
| 2 | **BRIEF** | Hva er ferdig? | Én side: format, ramme, «ferdig når» | `maler/brief.md` |
| 3 | **LAG** | Hvordan lages det? | Utkast etter formatets løype | `formater/*.md` |
| 4 | **HULL** | Hva stopper en fremmed på 60 sekunder? | Liste over hull, fikset eller parkert | `maler/hull.md` |
| 5 | **LEVER** | Kan noen bruke det uten meg? | Versjonert leveranse + RUN/README | `maler/leveranse.md` |
| 6 | **SPRE** | Hvor skal det, til hvem? | Publisert, eller bevisst lagt i skuffen | `maler/leveranse.md` |
| 7 | **LOGG** | Hva lærte vi? | Linje i `LOGG.md`, prosjektkort oppdatert | `maler/logg.md` |

Steg kan gå bakover. HULL sender ofte tilbake til LAG. Det er meningen.

## Harde regler (hentet fra tidligere arbeid)

1. **Lokal-først.** Ingen sky, ingen konto, ingen marketplace med mindre briefen sier noe annet. Si det høyt i produktet: «Alt blir på denne enheten.»
2. **48 timer.** Én runde LAG → HULL skal passe i 48t. Større enn det: del opp.
3. **Drep minst 3.** Ingen idé går til BRIEF uten at minst tre alternativer er drept med én setning hver.
4. **60 sekunder for en fremmed.** HULL-testen er porten til LEVER. Ingen unntak.
5. **Ingen slop.** Generiske AI-prompter, stockfølelse og tomme adjektiv strykes. Konkret motiv, konkret handling.
6. **Ikke nytt OS.** Løs problemet. Ikke bygg et rammeverk for å løse problemet.
7. **Alt dokumenteres.** Hver økt gir én linje i `LOGG.md`. Hvert prosjekt har ett kort i `prosjekter/`.

## Mappestruktur

```
workflow/
  README.md          ← denne
  INPUTMINNER.md     ← hva systemet er bygget på
  LOGG.md            ← løpende logg, nyeste øverst
  formater/          ← én løype per format
  maler/             ← kopier, fyll ut
  prosjekter/        ← ett kort per prosjekt
  verksted.html      ← lokal tavle: kort, steg, sjekklister, lab-prompt, eksport
```

## Daglig bruk

1. Åpne `verksted.html` (eller `prosjekter/`). Se hva som står i hvilket steg.
2. Tøm innboks: talenotater (Xff), skjermbilder, løse tanker → FANG.
3. Velg **ett** kort. Flytt det ett steg.
4. Skriv én linje i `LOGG.md`. Eksporter tavla hvis du har brukt den.

## Verktøy som er koblet til

| Verktøy | Brukes i | Til |
|---------|----------|-----|
| Xff (talenotater) | FANG | Innboks fra iPhone-tale |
| Labben / Grok-bot `/lab` | LAB | Seed 7, drep 3, IRP |
| Claude Code + GitHub | LAG, LEVER, LOGG | Kode, vibecode, dokumentasjon, versjon |
| Figma | LAG (bilde, UI) | Skisser, skjermer, eksport |
| Descript | LAG (video, lyd) | Klipp via transkript, teksting, publisering |
