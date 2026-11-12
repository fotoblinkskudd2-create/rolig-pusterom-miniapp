---
name: kunstfilkontroll
description: "Oppgave 34/50 (Kunst): Kontroll av kunst- og designfiler."
disable-model-invocation: true
effort: medium
metadata:
  nr: 34
  kategori: "Kunst"
---
# 34 · Kontroll av kunst- og designfiler

**Kategori:** Kunst

## Hvorfor høy verdi
Rockbot-feilen viste at bilder havner under feil merkevare. Et skript som sjekker filer, lenker og merkevare stopper slike lekkasjer før publisering.

## Kilder i systemet ditt
- [Oppgave · Kontroll av kunst- og designfiler](https://app.notion.com/p/4137b9c98a9b815b8693c43aa3a7107b)
- [Porteføljeregister](https://app.notion.com/p/d881cb6ad22e47d6acfb7309b95efa45)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O34 "Kontroll av kunst- og designfiler"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Hent kunst- og design-rader (Ghost Perch, Fallstein, hero-bildene m.fl.).
2. Skript: sjekk at hver fil finnes, beregn sha256, les metadata, sjekk at lenker svarer.
3. Merkevarekontroll: filnavn, mappe og metadata må matche radens merkevare; avvik flagges.
4. Rapport med miniatyrbilder.

## Leveranse
- `kunstkontroll.py`, rapport-HTML.

## Ferdigkrav
- [ ] Hver rad har finnes/mangler og merkevare-OK/avvik.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal kunstkontroll-rapporten har status for hver kunst- og design-rad
```
