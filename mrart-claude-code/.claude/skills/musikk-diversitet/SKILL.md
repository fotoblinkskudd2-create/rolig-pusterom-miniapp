---
name: musikk-diversitet
description: "Oppgave 37/50 (Kunst): Suno/musikk: diversitetstest før volum."
disable-model-invocation: true
effort: medium
metadata:
  nr: 37
  kategori: "Kunst"
---
# 37 · Suno/musikk: diversitetstest før volum

**Kategori:** Kunst

## Hvorfor høy verdi
Promptsystemet rangerer diversitetstest først i musikk: vit om variantene faktisk er forskjellige før du lager mer.

## Kilder i systemet ditt
- [Promptsystem v1.0 — 15 områder](https://app.notion.com/p/4157b9c98a9b81d5b4afe491688d6c1a)
- [Lageranalyse – hva som er verdt tid og penger](https://app.notion.com/p/4087b9c98a9b813cbae5f50013df991c)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O37 "Suno/musikk: diversitetstest før volum"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Lag prompt-matrise A/B/C: sjanger, tempo, stemme, tekstvinkel. Lagre som JSON.
2. Når operatøren har generert lydfiler: analyser med librosa (tempo, toneart, spektralsentroid, MFCC-avstand).
3. Beregn diversitetsscore mellom variantene. Flagg nesten-like.
4. Rapport: hvilke parametre gir faktisk forskjell.

## Leveranse
- Matrise, analyseskript, rapport.

## Ferdigkrav
- [ ] Avstandsmatrise for alle par.
- [ ] Ingen generering via betalt API uten ja.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal analyseskriptet produserer avstandsmatrise for alle lydfilpar
```
