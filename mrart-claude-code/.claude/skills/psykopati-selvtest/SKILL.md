---
name: psykopati-selvtest
description: "Oppgave 40/50 (Psykologi og samfunn): Psykopati-testmanualen som ansvarlig interaktiv test."
disable-model-invocation: true
effort: high
argument-hint: "[sti til psykopati-testmanual.md]"
metadata:
  nr: 40
  kategori: "Psykologi og samfunn"
---
# 40 · Psykopati-testmanualen som ansvarlig interaktiv test

**Kategori:** Psykologi og samfunn

## Hvorfor høy verdi
Du har to manualer om psykopatitester. En interaktiv versjon med tydelige grenser gjør dem brukbare som formidling og innhold — uten å late som de er diagnose.

## Kilder i systemet ditt
- Operatørens fil (se argument). Ingen Notion-side funnet for denne.

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O40 "Psykopati-testmanualen som ansvarlig interaktiv test"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Les manualen ($ARGUMENTS). Mangler fila: stopp og be operatøren legge den i `innboks/`.
2. Bygg PWA med spørsmål, skåring og resultat som forklarer trekk på kontinuum — aldri «du er psykopat».
3. Øverst og i resultat: dette er ikke diagnostisk; PCL-R krever klinisk intervju av fagperson.
4. kildevakt verifiserer hver faglig påstand i manualen mot forskningslitteratur; avvik rapporteres.
5. Skåringslogikk testes med kantverdier.
6. Ingen lagring av svar utenfor enheten.

## Leveranse
- PWA, kildetabell, testlogg.

## Ferdigkrav
- [ ] Ingen diagnostiske formuleringer.
- [ ] Alle faglige påstander merket.
- [ ] Skåringstester bestått.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal psykopati-PWA har skåringstester som passerer og kildetabell der alle påstander er merket
```
