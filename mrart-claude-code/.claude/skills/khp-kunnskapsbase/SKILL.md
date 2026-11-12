---
name: khp-kunnskapsbase
description: "Oppgave 42/50 (Psykologi og samfunn): Kollektiv Helhetlig Psykologi: rammeverk mot evidens."
disable-model-invocation: true
effort: xhigh
argument-hint: "[sti til rammeverket]"
metadata:
  nr: 42
  kategori: "Psykologi og samfunn"
---
# 42 · Kollektiv Helhetlig Psykologi: rammeverk mot evidens

**Kategori:** Psykologi og samfunn

## Hvorfor høy verdi
Rammeverket ditt for mental helse får tyngde når hver byggestein er koblet til forskning — eller ærlig merket som hypotese.

## Kilder i systemet ditt
- Operatørens fil (se argument). Ingen Notion-side funnet for denne.

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O42 "Kollektiv Helhetlig Psykologi: rammeverk mot evidens"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Les rammeverket ($ARGUMENTS). Bryt det ned i påstander og byggesteiner.
2. For hver: finn støttende og motstridende forskning.
3. Lag kunnskapsbase (Markdown + JSON): påstand, status (STØTTET / DELVIS / HYPOTESE / MOTSAGT), kilder.
4. Lag visuelt kart over rammeverket med evidensstatus som farge.
5. Skriv «sterkeste versjon» av rammeverket: kun det som tåler kildene, pluss tydelig avgrensede hypoteser.

## Leveranse
- Kunnskapsbase, kart, revidert rammeverk.

## Ferdigkrav
- [ ] Hver påstand har status og kilde.
- [ ] MOTSAGT-påstander ikke skjult.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal hver påstand i rammeverket har evidensstatus og kilde i kunnskapsbasen
```
