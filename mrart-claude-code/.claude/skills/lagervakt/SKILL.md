---
name: lagervakt
description: "Oppgave 03/50 (Fundament): Oppdater Lageranalysen med ferske tall."
disable-model-invocation: true
effort: medium
metadata:
  nr: 3
  kategori: "Fundament"
---
# 03 · Oppdater Lageranalysen med ferske tall

**Kategori:** Fundament

## Hvorfor høy verdi
Lageranalysen fra 29.10 bygger på ca. 650 rader. Arkiv 23 har registrert mye siden. Prioriteringene dine bør hvile på dagens tall, ikke forrige måneds.

## Kilder i systemet ditt
- [Lageranalyse – hva som er verdt tid og penger](https://app.notion.com/p/4087b9c98a9b813cbae5f50013df991c)
- [Porteføljeregister](https://app.notion.com/p/d881cb6ad22e47d6acfb7309b95efa45)
- [Endringslogg 10.–11.11](https://app.notion.com/p/4157b9c98a9b81849f12f0948cd8baec)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O03 "Oppdater Lageranalysen med ferske tall"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Spør Porteføljeregisteret: antall per Type og per Status. Sammenlign med tabellen i Lageranalysen (kode 291, tekst 128, research 113, oppfinnelse 61, design 45, kunst 15).
2. Finn rader i KONTROLL/RETTING som ikke er endret på over 7 dager.
3. Finn duplikater: like Navn, eller Duplikater-felt som peker på hverandre.
4. Finn EPLE-rader og list dem (byrå-spesifikasjonen 7.10, CHRONOS, PENGE-MAGNET, Medieflyt, 100-listen, UgleKam-STEP var EPLE 11.11).
5. Skriv `lagervakt-<dato>.md`: tall (DOKUMENTERT), endring siden 29.10 (BEREGNET), topp ti stillestående, og tre forslag til DREP.

## Leveranse
- `lagervakt-<dato>.md`
- Forslag til Notion-utkast (ikke publisert) med samme innhold.

## Ferdigkrav
- [ ] Hvert tall har spørringen som produserte det.
- [ ] Ingen rader endret.
- [ ] Merkevakt viser 0 funn.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal lagervakt-rapporten finnes og merkevakt gir 0 funn på den
```
