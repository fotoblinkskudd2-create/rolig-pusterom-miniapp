---
name: kontraktmotor
description: "Oppgave 05/50 (Fundament): Fivecode F1: oppgavekontrakt med contract_hash i alle prosjekter."
disable-model-invocation: true
effort: high
metadata:
  nr: 5
  kategori: "Fundament"
---
# 05 · Fivecode F1: oppgavekontrakt med contract_hash i alle prosjekter

**Kategori:** Fundament

## Hvorfor høy verdi
Promptsystem v1.0 krever at SPEC, CORE, UI, AGENT og TWIN peker på samme contract_hash. Uten en felles kontraktmotor er det bare en regel på papiret.

## Kilder i systemet ditt
- [Promptsystem v1.0 — 15 områder](https://app.notion.com/p/4157b9c98a9b81d5b4afe491688d6c1a)
- [Agentfabrikk og gjennomføringsprogram](https://app.notion.com/p/3f97b9c98a9b810ca0a2c3bdcf4eeeda)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O05 "Fivecode F1: oppgavekontrakt med contract_hash i alle prosjekter"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Ta utgangspunkt i `tools/kontrakt.py` (12 felt, statusoverganger, hash).
2. Lag JSON Schema `schemas/kontrakt.schema.json` som speiler feltene.
3. Lag `tools/fivecode_sjekk.py`: leter etter `contract_hash` i SPEC-, CORE-, UI-, AGENT- og TWIN-mapper i et prosjekt og rapporterer avvik.
4. Legg inn en PostToolUse-hook som kjører `kontrakt.py valider` når en fil i `.mrart/kontrakter/` endres, med `continueOnBlock` slik at Claude retter feilen selv.
5. Skriv kontrakter for de tre P0-sporene: Ukesagenten, Cowboy-økonomi og ja/nei-køen.

## Leveranse
- Schema, fivecode_sjekk.py, hook og tre ferdige kontrakter.

## Ferdigkrav
- [ ] Endret SPEC etter låsing gir avvik.
- [ ] Tre kontrakter validerer.
- [ ] Tester for overganger og hash bestått.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal tre kontrakter i .mrart/kontrakter validerer og fivecode_sjekk oppdager en bevisst endret SPEC
```
