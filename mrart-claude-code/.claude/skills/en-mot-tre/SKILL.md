---
name: en-mot-tre
description: "Oppgave 48/50 (iOS og AI-system): 1 mot 3 agenter: mål om svermen lønner seg."
disable-model-invocation: true
effort: high
metadata:
  nr: 48
  kategori: "iOS og AI-system"
---
# 48 · 1 mot 3 agenter: mål om svermen lønner seg

**Kategori:** iOS og AI-system

## Hvorfor høy verdi
Agentfabrikken sier: ikke tving frem fleragentarbeid hvis én agent løser det med færre feil. Promptsystemet har «1 vs 3 agenter» som egen test. Du får tall i stedet for tro.

## Kilder i systemet ditt
- [Agentfabrikk og gjennomføringsprogram](https://app.notion.com/p/3f97b9c98a9b810ca0a2c3bdcf4eeeda)
- [Promptsystem v1.0 — 15 områder](https://app.notion.com/p/4157b9c98a9b81d5b4afe491688d6c1a)
- [Claude Code — Subagents](https://code.claude.com/docs/en/subagents)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O48 "1 mot 3 agenter: mål om svermen lønner seg"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Velg tre faste oppgaver av ulik type: kode (oppgave 26), research (oppgave 30), tekst (oppgave 31).
2. Kjør hver med én agent og med koordinator + tre spesialister (subagenter, eventuelt cross-session messaging).
3. Mål: tid, turer, feil funnet av motprove, rettetid. Tokenbruk fra /usage.
4. Rapport med anbefaling per oppgavetype.

## Leveranse
- `en-mot-tre.md` med målinger og anbefaling.

## Ferdigkrav
- [ ] Seks kjøringer gjennomført.
- [ ] Tall merket DOKUMENTERT eller BEREGNET.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal en-mot-tre.md har målinger fra seks kjøringer og en anbefaling per oppgavetype
```
