---
name: medieflyt-snitt
description: "Oppgave 13/50 (Fullfør kode): Medieflyt: minste kjørbare snitt med gjenopptakelse."
disable-model-invocation: true
effort: high
metadata:
  nr: 13
  kategori: "Fullfør kode"
---
# 13 · Medieflyt: minste kjørbare snitt med gjenopptakelse

**Kategori:** Fullfør kode

## Hvorfor høy verdi
Medieflyt er din mest gjennomarbeidede spesifikasjon (16 kapitler), men runtime finnes ikke. Ett snitt gjør den til et verktøy.

## Kilder i systemet ditt
- [Medieflyt fra input til leveranse](https://app.notion.com/p/3f97b9c98a9b8111a8f3d5cb19114114)
- [Endringslogg 10.–11.11](https://app.notion.com/p/4157b9c98a9b81849f12f0948cd8baec)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O13 "Medieflyt: minste kjørbare snitt med gjenopptakelse"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Les Medieflyt-siden kapittel 3, 5, 7, 10 og 13 (kontrollplan, inputmotor, kontrakt, handoff, releasepakke).
2. Implementer: tekstinput → inputkort → oppgavekontrakt → importert tekstmaster → kontrollkort → releasepakke.
3. Hver overgang lagres som JSON med ID og fire statusfelt. Avbrudd midt i skal kunne gjenopptas med `medieflyt fortsett <id>`.
4. Ingen scheduler. Ingen andre mediebaner enn tekst.
5. Test: drep prosessen i hvert steg og gjenoppta. Resultat skal være byte-likt med uavbrutt kjøring.

## Leveranse
- `medieflyt/` med CLI, tester og eksempel-releasepakke.

## Ferdigkrav
- [ ] Gjenopptakelse testet i alle fem overganger.
- [ ] Releasepakke har manifest med sha256.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal gjenopptakelsestesten passerer for alle fem overganger og releasepakken har sha256-manifest
```
