---
name: kaata-art-direction
description: "Oppgave 39/50 (Kunst): Kåta: art direction-system og produktskudd."
disable-model-invocation: true
effort: medium
metadata:
  nr: 39
  kategori: "Kunst"
---
# 39 · Kåta: art direction-system og produktskudd

**Kategori:** Kunst

## Hvorfor høy verdi
Bilde-topp-tre i Promptsystemet: Kåta art direction, produktskudd, KLAR ja/nei. Et fast stilsystem gjør hvert bilde konsistent.

## Kilder i systemet ditt
- [Kåta High-Value Studio](https://app.notion.com/p/4107b9c98a9b81f9ab9ce56fa54f6bfe)
- [Promptsystem v1.0 — 15 områder](https://app.notion.com/p/4157b9c98a9b81d5b4afe491688d6c1a)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O39 "Kåta: art direction-system og produktskudd"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Les Kåta High-Value Studio-siden.
2. Lag `stil.json`: palett, typografi, komposisjonsregler, lys, forbud.
3. Lag promptmal for bildegenerering som leser stil.json.
4. Lag kontaktark-generator: alle bilder i en mappe → ett HTML-ark med stilavvik markert (fargeavstand fra palett).
5. Lag KLAR ja/nei-ark for operatøren.

## Leveranse
- stil.json, promptmal, kontaktark-generator.

## Ferdigkrav
- [ ] Kontaktark viser avvik per bilde.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal kontaktarket genereres og viser fargeavvik fra paletten per bilde
```
