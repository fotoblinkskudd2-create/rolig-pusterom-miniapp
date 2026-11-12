---
name: ja-nei-ko
description: "Oppgave 02/50 (Fundament): Tøm KLAR FOR GODKJENNING-køen til under fem."
disable-model-invocation: true
effort: medium
metadata:
  nr: 2
  kategori: "Fundament"
---
# 02 · Tøm KLAR FOR GODKJENNING-køen til under fem

**Kategori:** Fundament

## Hvorfor høy verdi
Lageranalysen setter dette som sperre: ingen nye ting før køen er under fem. Køen er flaskehalsen, ikke mangel på ideer.

## Kilder i systemet ditt
- [Lageranalyse – hva som er verdt tid og penger](https://app.notion.com/p/4087b9c98a9b813cbae5f50013df991c)
- [Porteføljeregister](https://app.notion.com/p/d881cb6ad22e47d6acfb7309b95efa45)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O02 "Tøm KLAR FOR GODKJENNING-køen til under fem"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Hent alle rader i Porteføljeregisteret med Status = KLAR FOR GODKJENNING via Notion MCP.
2. For hver rad: les siden og eventuelle lenkede filer. Finn hva operatøren konkret sier ja eller nei til.
3. Skriv ett beslutningskort per rad: hva det er (én linje), hva ja utløser, hva nei koster, bevisstatus (fire felt), anbefaling JA / DREP / PARKER med én setnings grunn.
4. Sorter: først det som gir penger eller møte (P0 i Lageranalysen), så resten.
5. Lag `ja-nei-ko.md` som én skjerm per kort, tilpasset mobil (operatøren svarer fra senga).
6. Når operatøren svarer (f.eks. «1 ja, 2 drep, 3 parker»): oppdater Status-feltet via notion-arkivar, én rad om gangen, med operatørens ord i Merknad.

## Leveranse
- `ja-nei-ko.md` med beslutningskort.
- Oppdaterte Notion-rader etter operatørens svar.

## Ferdigkrav
- [ ] Hvert kort har anbefaling og grunn.
- [ ] Ingen rad endres uten operatørens eksplisitte svar.
- [ ] Køen er under fem etter svarrunden.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal ja-nei-ko.md har ett beslutningskort for hver KLAR FOR GODKJENNING-rad
```
