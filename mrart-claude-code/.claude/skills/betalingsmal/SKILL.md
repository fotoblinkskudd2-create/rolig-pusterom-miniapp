---
name: betalingsmal
description: "Oppgave 33/50 (Penger): Forhåndssalg-infrastruktur uten å røre penger."
disable-model-invocation: true
effort: medium
metadata:
  nr: 33
  kategori: "Penger"
---
# 33 · Forhåndssalg-infrastruktur uten å røre penger

**Kategori:** Penger

## Hvorfor høy verdi
Når et ja kommer, må betalingen være klar på minutter. Dette forbereder alt unntatt selve aktiveringen, som er din.

## Kilder i systemet ditt
- [Ordre 4 – Bøker til produkter](https://app.notion.com/p/4077b9c98a9b8116b0eae27029a404f0)
- [Lageranalyse – hva som er verdt tid og penger](https://app.notion.com/p/4087b9c98a9b813cbae5f50013df991c)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O33 "Forhåndssalg-infrastruktur uten å røre penger"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. kildevakt verifiserer gebyrer og vilkår for Substack, Vipps-betalingslenke og Spleis (det som var UAVKLART i Ordre 4).
2. Lag sammenligning: gebyr, utbetaling, krav til org.nr, egnethet for 249 kr forhåndssalg (pris er HYPOTESE fra Ordre 4).
3. Skriv ferdige produkttekster, kvitteringstekst og takkeliste-skjema.
4. Lag stegliste for operatøren: hva du klikker, i hvilken rekkefølge.

## Leveranse
- `betaling/sammenligning.md`, tekster, stegliste.

## Ferdigkrav
- [ ] Alle gebyrer DOKUMENTERT eller UAVKLART.
- [ ] Ingen konto opprettet.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal betaling/sammenligning.md har dokumentert gebyr eller UAVKLART for alle tre plattformer
```
