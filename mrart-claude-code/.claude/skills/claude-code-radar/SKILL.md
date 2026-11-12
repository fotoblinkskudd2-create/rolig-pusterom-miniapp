---
name: claude-code-radar
description: "Oppgave 50/50 (iOS og AI-system): Ukentlig Claude Code-radar for ditt oppsett."
disable-model-invocation: true
effort: medium
metadata:
  nr: 50
  kategori: "iOS og AI-system"
---
# 50 · Ukentlig Claude Code-radar for ditt oppsett

**Kategori:** iOS og AI-system

## Hvorfor høy verdi
Claude Code endrer seg hver uke. En radar som oversetter nyhetene til «hva betyr dette for MR ART» holder pakken oppdatert uten at du må lese changelogs.

## Kilder i systemet ditt
- [Claude Code — What's new](https://code.claude.com/docs/en/whats-new)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O50 "Ukentlig Claude Code-radar for ditt oppsett"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Les What's new-siden og changelog for siste uke.
2. For hver nyhet: relevans for denne pakken (HØY/MIDDELS/LAV), og konkret endring i skills, hooks, agenter eller settings.
3. Lag diff-forslag for HØY-relevante endringer.
4. Sett opp som ukentlig rutine (mandag 06:00) via `/schedule`.

## Leveranse
- Ukerapport + diff-forslag.

## Ferdigkrav
- [ ] Hver nyhet har kilde-URL.
- [ ] Ingen endring brukt uten ja.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal ukerapporten dekker alle nyheter fra siste uke med relevans og kilde
```
