---
name: doseark-karantene
description: "Oppgave 25/50 (Notion og drift): DOSEARK: reproduser, avgjør og sett i karantene."
disable-model-invocation: true
effort: xhigh
metadata:
  nr: 25
  kategori: "Notion og drift"
---
# 25 · DOSEARK: reproduser, avgjør og sett i karantene

**Kategori:** Notion og drift

## Hvorfor høy verdi
DOSEARK har stått som TESTET-FAIL HØY i over elleve døgn, merket «medisinsk risiko – ikke bruk». En slik feil skal ikke ligge åpen. Den skal enten rettes med bevis eller låses ned.

## Kilder i systemet ditt
- [idefirma · DOSEARK fortsatt urettet 02.11](https://app.notion.com/p/40c7b9c98a9b8132a336d5ef842c7391)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O25 "DOSEARK: reproduser, avgjør og sett i karantene"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Gå til `/workspace/idefirma/bygg/doseark/`. Les DOM-filen (D-20261102-17) og testen som feiler.
2. Reproduser feilen. Bekreft sha (4ddbc70f).
3. Steg 1 uansett: legg inn karantene — modulen nekter å starte uten flagget `--jeg-forstår-at-dette-ikke-er-medisinsk-råd`, og README får advarsel øverst.
4. Beskriv feilen i klartekst: hva beregnes feil, og hvor stor er feilen.
5. Lever tre valg til operatøren: DREP (arkiver), RETT (konkret patch + test, ingen dosering vist som anbefaling), PARKER (karantene beholdes).
6. Ingen nye doseringsfunksjoner. Ingen tall presentert som medisinske råd.

## Leveranse
- Karantenecommit lokalt, `doseark-dom.md` med tre valg.

## Ferdigkrav
- [ ] Modulen starter ikke uten flagg.
- [ ] Feilen er reprodusert eller merket UAVKLART med grunn.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Hvis koden brukes av noen andre enn operatøren: stopp og varsle.
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal doseark nekter å starte uten karanteneflagg og doseark-dom.md har tre valg
```
