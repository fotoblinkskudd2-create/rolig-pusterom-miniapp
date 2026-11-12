---
name: familieminne-mvp
description: "Oppgave 16/50 (Fullfør kode): Family Memory AI: lokal MVP med syntetiske data."
disable-model-invocation: true
effort: high
metadata:
  nr: 16
  kategori: "Fullfør kode"
---
# 16 · Family Memory AI: lokal MVP med syntetiske data

**Kategori:** Fullfør kode

## Hvorfor høy verdi
Blueprintet er komplett (arkitektur, personvern, roadmap). En lokal MVP gjør det til noe du kan vise — uten å røre ekte familiedata.

## Kilder i systemet ditt
- [Familieminne, 25 appbriefs og iOS-prototype](https://app.notion.com/p/3f97b9c98a9b818daf84c7cad7a919e4)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O16 "Family Memory AI: lokal MVP med syntetiske data"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Les seksjon 1–7 i blueprintet. Bygg kun MVP-fase 1 fra seksjon 7.
2. Lokal-først: SQLite + tekstsøk. Ingen sky. Kryptering i hvile med nøkkel fra passfrase.
3. Inntak: tekst og bilder med EXIF-dato. Enhetlig semantisk format fra seksjon 2.
4. Narrativkontrakt fra seksjon 4: hver historie må peke på kildeelementer; ingen oppdiktede minner.
5. Mobilvennlig nettgrensesnitt (seksjon 5).
6. Syntetisk familie med 40 elementer som testdata.

## Leveranse
- `familieminne/` kjørbar lokalt, testdata, personvernnotat.

## Ferdigkrav
- [ ] Hver generert historie har kildelenker.
- [ ] Database ulesbar uten passfrase.
- [ ] Ingen nettverkskall i kjøring (verifiser).
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal familieminne kjører lokalt, alle historier har kildelenker og databasen er kryptert
```
