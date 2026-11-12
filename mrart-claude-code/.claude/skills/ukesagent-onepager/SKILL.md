---
name: ukesagent-onepager
description: "Oppgave 29/50 (Penger): Ukesagenten: one-pager og 90-sekunders demo."
disable-model-invocation: true
effort: high
metadata:
  nr: 29
  kategori: "Penger"
---
# 29 · Ukesagenten: one-pager og 90-sekunders demo

**Kategori:** Penger

## Hvorfor høy verdi
Promptsystemet rangerer one-pager og 90 s storyboard øverst i produkt og video. Møte er suksesskriteriet — dette er det du viser i møtet.

## Kilder i systemet ditt
- [Promptsystem v1.0 — 15 områder](https://app.notion.com/p/4157b9c98a9b81d5b4afe491688d6c1a)
- [Økt 1 – Rangering av 12 prosjekter](https://app.notion.com/p/4077b9c98a9b81d3aaa6c29328da7da7)
- [Lageranalyse – hva som er verdt tid og penger](https://app.notion.com/p/4087b9c98a9b813cbae5f50013df991c)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O29 "Ukesagenten: one-pager og 90-sekunders demo"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Les demoen fra oppgave 9 (krever at den er kjørbar).
2. Skriv one-pager: kjøperproblem, hva agenten gjør i én gjentakende jobb, hva den ikke gjør, pris (HYPOTESE), bevis (kun det som er testet), neste test.
3. Lag storyboard 90 s: 6 scener med skjermbilde fra demoen og én setning voiceover.
4. Lag møteutkast-e-post (usendt) til én bedrift operatøren navngir.

## Leveranse
- `ukesagent/onepager.pdf`, `storyboard.md`, usendt e-post.

## Ferdigkrav
- [ ] Alle skjermbilder fra faktisk kjørt demo.
- [ ] Ingenting sendt.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal onepager.pdf og storyboard med seks skjermbilder fra den kjørte demoen finnes
```
