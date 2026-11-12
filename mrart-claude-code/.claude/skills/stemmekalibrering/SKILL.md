---
name: stemmekalibrering
description: "Oppgave 15/50 (Fullfør kode): Kalibrer Mr Art-stemmen mot faktisk output."
disable-model-invocation: true
effort: high
metadata:
  nr: 15
  kategori: "Fullfør kode"
---
# 15 · Kalibrer Mr Art-stemmen mot faktisk output

**Kategori:** Fullfør kode

## Hvorfor høy verdi
Voice-pakken sier selv at stiltreff er egenkontroll, ikke dokumentert. Kalibrering gjør stemmevakten målbar.

## Kilder i systemet ditt
- [Voice, stil og native agentfiler](https://app.notion.com/p/3f97b9c98a9b81b1ad61f3fb649ad872)
- [HARD-LOV — ingen svada](https://app.notion.com/p/3da7b9c98a9b8164a172c26906c75a6c)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O15 "Kalibrer Mr Art-stemmen mot faktisk output"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Pakk ut voice-pakken i `voice/`. Kjør `python3 tools/validate_package.py` i pakken.
2. Kjør hver oppgave i `calibration/cases.json` gjennom subagenten `stemmevakt`.
3. Score hvert svar med `calibration/review-template.json`. Legg til automatiske mål: andel adjektiv, gjennomsnittlig setningslengde, forbudte fraser, umerkede påstander.
4. Lag `stemmescore.py` som gir 0–100 per tekst.
5. Juster `stemmevakt.md` basert på de tre svakeste svarene. Kjør på nytt. Rapporter før/etter.

## Leveranse
- `stemmescore.py`, kalibreringsrapport, justert stemmevakt.

## Ferdigkrav
- [ ] Alle kalibreringsoppgaver kjørt to ganger.
- [ ] Score før/etter dokumentert.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal kalibreringsrapporten viser score før og etter for alle oppgavene i cases.json
```
