---
name: instinct-release
description: "Oppgave 35/50 (Kunst): Én Instinct-pakke ut gjennom Medieflyt."
disable-model-invocation: true
effort: high
metadata:
  nr: 35
  kategori: "Kunst"
---
# 35 · Én Instinct-pakke ut gjennom Medieflyt

**Kategori:** Kunst

## Hvorfor høy verdi
Instinct-pakkene (svartmetall, konseptkunst, satire) ligger i KONTROLL. Lageranalysen sier: én pakke ut, resten hviler.

## Kilder i systemet ditt
- [Lageranalyse – hva som er verdt tid og penger](https://app.notion.com/p/4087b9c98a9b813cbae5f50013df991c)
- [Medieflyt fra input til leveranse](https://app.notion.com/p/3f97b9c98a9b8111a8f3d5cb19114114)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O35 "Én Instinct-pakke ut gjennom Medieflyt"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. List Instinct-pakkene og deres kontrollstatus.
2. Anbefal én pakke ut fra ferdiggrad og publikum. Operatøren velger.
3. Kjør valgt pakke gjennom releasepakke-formatet fra Medieflyt kapittel 13: manifest, filer, tekster, rettigheter, sha256.
4. Lag publiseringstekst for to kanaler (usendt).

## Leveranse
- Ferdig releasepakke (ZIP) + publiseringstekster.

## Ferdigkrav
- [ ] Manifest stemmer med filer.
- [ ] Rettighetsfelt utfylt for hver fil.
- [ ] Ikke publisert.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal releasepakken for valgt Instinct-pakke har manifest der alle sha256 stemmer
```
