---
name: oppskriftskort
description: "Oppgave 31/50 (Penger): Oppskriften på livet: PDF-kort-generator."
disable-model-invocation: true
effort: high
metadata:
  nr: 31
  kategori: "Penger"
---
# 31 · Oppskriften på livet: PDF-kort-generator

**Kategori:** Penger

## Hvorfor høy verdi
Ordre 4 foreslår ett illustrert satirekort i måneden til 39 kr (HYPOTESE-pris). En generator gjør hvert kort til minutter, ikke en kveld.

## Kilder i systemet ditt
- [Ordre 4 – Bøker til produkter](https://app.notion.com/p/4077b9c98a9b8116b0eae27029a404f0)
- [Tre satireunivers og KVITTERINGEN](https://app.notion.com/p/3f97b9c98a9b8140929ac26c72295432)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O31 "Oppskriften på livet: PDF-kort-generator"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Lag mal (HTML/CSS → PDF, A5): tittel, «ingredienser», «fremgangsmåte», illustrasjonsfelt, kolofon.
2. Input: Markdown per oppskrift.
3. Skriv tre av de tolv oppskriftene som utkast med stemmevakt, satire etter regelen: angrip strukturer, ikke personer.
4. Generer PDF og PNG-forhåndsvisning for sosiale medier.

## Leveranse
- Generator, tre PDF-kort, forhåndsvisninger.

## Ferdigkrav
- [ ] PDF-ene åpner på iPhone.
- [ ] Ingen ubekreftede påstander om navngitte personer.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal tre PDF-kort og forhåndsvisninger er generert fra Markdown
```
