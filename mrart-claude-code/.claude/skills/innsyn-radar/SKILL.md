---
name: innsyn-radar
description: "Oppgave 44/50 (Psykologi og samfunn): Folkebasen: innsynsradar for offentlig journal."
disable-model-invocation: true
effort: medium
metadata:
  nr: 44
  kategori: "Psykologi og samfunn"
---
# 44 · Folkebasen: innsynsradar for offentlig journal

**Kategori:** Psykologi og samfunn

## Hvorfor høy verdi
Folkebasen fikk 20 poeng i Økt 1; innsyn.no har betalende mediebrukere. En radar som overvåker offentlige journaler på dine temaer gir råstoff til politisk research og satire.

## Kilder i systemet ditt
- [Økt 1 – Rangering av 12 prosjekter](https://app.notion.com/p/4077b9c98a9b81d3aaa6c29328da7da7)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O44 "Folkebasen: innsynsradar for offentlig journal"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. kildevakt finner gjeldende API/eksport for eInnsyn og vilkår for bruk.
2. Lag spørring på stikkord (helse, varsling, Bergen kommune, Helse Vest) og lagre treff i SQLite.
3. Daglig diff: nye journalposter siden sist.
4. Generer ferdig innsynsbegjæring-tekst per interessant post (usendt).
5. Respekter rate-limits og vilkår.

## Leveranse
- Radar-skript, første treffrapport, mal for innsynsbegjæring.

## Ferdigkrav
- [ ] Vilkår lest og dokumentert.
- [ ] Ingen begjæring sendt.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal radaren henter treff for minst tre stikkord og lagrer dem i SQLite med daglig diff
```
