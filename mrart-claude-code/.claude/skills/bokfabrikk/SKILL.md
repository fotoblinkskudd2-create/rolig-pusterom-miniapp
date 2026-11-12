---
name: bokfabrikk
description: "Oppgave 38/50 (Kunst): Bokfabrikk: Markdown til EPUB og trykk-PDF."
disable-model-invocation: true
effort: high
metadata:
  nr: 38
  kategori: "Kunst"
---
# 38 · Bokfabrikk: Markdown til EPUB og trykk-PDF

**Kategori:** Kunst

## Hvorfor høy verdi
Superkunstner-boka, Cowboy-økonomi og Oppskriften på livet trenger samme produksjonslinje. Én fabrikk, tre bøker.

## Kilder i systemet ditt
- [Ordre 4 – Bøker til produkter](https://app.notion.com/p/4077b9c98a9b8116b0eae27029a404f0)
- [Medieflyt fra input til leveranse](https://app.notion.com/p/3f97b9c98a9b8111a8f3d5cb19114114)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O38 "Bokfabrikk: Markdown til EPUB og trykk-PDF"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Mappestruktur: `bok/<tittel>/kapitler/*.md`, `metadata.yaml`, `omslag.png`.
2. Pandoc-pipeline: EPUB3 med gyldig navigasjon, PDF A5 for trykk (LaTeX eller Typst), DOCX for redaktør.
3. epubcheck i pipeline. Feil stopper bygget.
4. Lag skjelett for alle tre bøker med kapittelstruktur.
5. Én kommando: `make bok TITTEL=cowboy`.

## Leveranse
- Pipeline, tre skjelett, eksempelbygg.

## Ferdigkrav
- [ ] epubcheck 0 feil.
- [ ] PDF åpner på iPad.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal make bok bygger EPUB og PDF for alle tre skjelettene og epubcheck gir 0 feil
```
