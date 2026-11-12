---
name: ssb-statsbudsjett
description: "Oppgave 45/50 (Psykologi og samfunn): SSB-pipeline: helse og budsjett i grafer."
disable-model-invocation: true
effort: medium
metadata:
  nr: 45
  kategori: "Psykologi og samfunn"
---
# 45 · SSB-pipeline: helse og budsjett i grafer

**Kategori:** Psykologi og samfunn

## Hvorfor høy verdi
Du lager grafiske oversikter over samfunn og helse. En pipeline mot SSBs API gjør grafene reproduserbare og ferske — ikke engangsbilder.

## Kilder i systemet ditt
- [Kontrollrom – King](https://app.notion.com/p/3ff7b9c98a9b81a092bdc7cc224f703c)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O45 "SSB-pipeline: helse og budsjett i grafer"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Bruk SSB PxWebApi v2. Velg tre tabeller: helseutgifter, ventetider/behandling, kommuneøkonomi Vestland.
2. Hent, rens, lagre som CSV med kilde og hentedato.
3. Lag fem grafer (SVG/PNG) med tittel, akser, kilde i bunn.
4. Én kommando oppdaterer alt.

## Leveranse
- `ssb/` pipeline, CSV-er, fem grafer.

## Ferdigkrav
- [ ] Hver graf har kilde og tabell-ID.
- [ ] Oppdatering idempotent.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal ssb-pipelinen henter tre tabeller og genererer fem grafer med kilde og tabell-ID
```
