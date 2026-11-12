---
name: endringslogg-motor
description: "Oppgave 20/50 (Notion og drift): Gjør Arkiv 23-endringsloggen robust."
disable-model-invocation: true
effort: high
metadata:
  nr: 20
  kategori: "Notion og drift"
---
# 20 · Gjør Arkiv 23-endringsloggen robust

**Kategori:** Notion og drift

## Hvorfor høy verdi
Endringsloggen 10.–11.11 registrerte ca. 9 800 endrede filer, der masse-touch skjuler ekte endringer. Hash-basert diff skiller støy fra arbeid.

## Kilder i systemet ditt
- [Endringslogg 10.–11.11](https://app.notion.com/p/4157b9c98a9b81849f12f0948cd8baec)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O20 "Gjør Arkiv 23-endringsloggen robust"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Lag `arkiv23/endringer.py`: skanner mapper, lagrer sti, størrelse, mtime og sha256 i SQLite.
2. Rapporter kun filer der sha256 endret seg — ikke mtime alene.
3. Grupper pakktest-kopier og like filer som ett verk.
4. Ekskluder `cadenv` og andre støymapper via konfig.
5. Output: Markdown + JSON klar for notion-arkivar.
6. Test på en mappe med 1 000 filer der 900 bare er touch'et.

## Leveranse
- `arkiv23/endringer.py`, tester, eksempelrapport.

## Ferdigkrav
- [ ] Touch-only rapporteres ikke som endring.
- [ ] Idempotent: to kjøringer gir lik rapport.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal testen med 900 touch-filer og 100 ekte endringer rapporterer nøyaktig 100
```
