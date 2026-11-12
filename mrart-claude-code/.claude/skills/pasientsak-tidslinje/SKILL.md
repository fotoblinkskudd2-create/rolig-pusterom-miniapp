---
name: pasientsak-tidslinje
description: "Oppgave 43/50 (Psykologi og samfunn): Pasientsak: tidslinje og klagegrunnlag fra egne dokumenter."
disable-model-invocation: true
effort: high
argument-hint: "[mappe med egne dokumenter]"
metadata:
  nr: 43
  kategori: "Psykologi og samfunn"
---
# 43 · Pasientsak: tidslinje og klagegrunnlag fra egne dokumenter

**Kategori:** Psykologi og samfunn

## Hvorfor høy verdi
Du har kjempet mot avslag i helsevesenet og jobbet med pasient- og varslerrettigheter. Et lokalt verktøy som gjør journalnotater og brev til en ryddig tidslinje gjør klager og møter mye sterkere.

## Kilder i systemet ditt
- Operatørens fil (se argument). Ingen Notion-side funnet for denne.

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O43 "Pasientsak: tidslinje og klagegrunnlag fra egne dokumenter"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Input: mappe med egne dokumenter (PDF, bilder, notater) — kun lokalt. Ingen opplasting.
2. OCR og ekstraksjon: dato, avsender, vedtak, begrunnelse, frister.
3. Tidslinje (HTML + PDF) med lenke til kildedokument per hendelse.
4. kildevakt henter relevante rettigheter fra lovdata.no (pasient- og brukerrettighetsloven, klage til Statsforvalteren, retten til fornyet vurdering) med paragraf og lest-dato.
5. Lag klageutkast-skjelett som kobler hver hendelse til en rettighet. Merket UTKAST — ikke juridisk råd.
6. Test først på et syntetisk sett med 15 dokumenter.

## Leveranse
- `pasientsak/` verktøy, syntetisk eksempel, klageskjelett.

## Ferdigkrav
- [ ] Ingen nettverkskall med dokumentinnhold.
- [ ] Hver hendelse har kilde.
- [ ] Frister uthevet.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Ingen medisinske vurderinger. Ingen sending.
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal den syntetiske testen gir tidslinje der hver hendelse lenker til kildedokument og frister er uthevet
```
