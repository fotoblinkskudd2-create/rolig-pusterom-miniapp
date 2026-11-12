---
name: hverdagspsykologi-research
description: "Oppgave 41/50 (Psykologi og samfunn): Hverdagens psykologi: researchmotor med evidensgrad."
disable-model-invocation: true
effort: xhigh
argument-hint: "[tema]"
metadata:
  nr: 41
  kategori: "Psykologi og samfunn"
---
# 41 · Hverdagens psykologi: researchmotor med evidensgrad

**Kategori:** Psykologi og samfunn

## Hvorfor høy verdi
Master-researchprompten din blir en gjenbrukbar skill: ett tema inn, en kildegradert artikkel ut, klar for bok eller innlegg.

## Kilder i systemet ditt
- Operatørens fil (se argument). Ingen Notion-side funnet for denne.

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O41 "Hverdagens psykologi: researchmotor med evidensgrad"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Input: et tema ($ARGUMENTS), f.eks. «hvorfor vi utsetter ting».
2. Søk primærlitteratur (metaanalyser først, så RCT, så observasjonsstudier).
3. Klassifiser hvert funn: sterk / moderat / svak / replikasjonsproblem.
4. Skriv artikkel på 1 200 ord i stemmen: mekanisme, hva forskningen faktisk viser, hva den ikke viser, én praktisk test leseren kan gjøre.
5. Kildeliste med DOI.

## Leveranse
- Artikkel + kildetabell per tema.

## Ferdigkrav
- [ ] Hver påstand har evidensgrad og DOI.
- [ ] Replikasjonskrise-funn nevnt der relevant.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal artikkelen har evidensgrad og DOI for hver påstand
```
