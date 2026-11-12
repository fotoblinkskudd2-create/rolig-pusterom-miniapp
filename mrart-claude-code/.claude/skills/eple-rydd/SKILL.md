---
name: eple-rydd
description: "Oppgave 22/50 (Notion og drift): Avklar EPLE-postene."
disable-model-invocation: true
effort: medium
metadata:
  nr: 22
  kategori: "Notion og drift"
---
# 22 · Avklar EPLE-postene

**Kategori:** Notion og drift

## Hvorfor høy verdi
Seks poster har stått som EPLE (uklart opphav) i dager: byrå-spesifikasjonen 7.10, CHRONOS, PENGE-MAGNET, Medieflyt, 100-listen og UgleKam-STEP. De blokkerer avgjørelser.

## Kilder i systemet ditt
- [Endringslogg 10.–11.11](https://app.notion.com/p/4157b9c98a9b81849f12f0948cd8baec)
- [Porteføljeregister](https://app.notion.com/p/d881cb6ad22e47d6acfb7309b95efa45)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O22 "Avklar EPLE-postene"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. For hver EPLE-post: søk Notion, GitHub og lokale mapper etter kilde.
2. Klassifiser: FUNNET (sti + sha256), DUPLIKAT AV (lenke), TAPT (ingen spor), eller DELVIS.
3. For FUNNET: foreslå ny status med begrunnelse.
4. For TAPT: foreslå DREP eller gjenoppbygging med estimert tid (BEREGNET).

## Leveranse
- `eple-avklaring.md` med én seksjon per post.

## Ferdigkrav
- [ ] Alle seks klassifisert med bevis.
- [ ] Ingen statusendring uten ja.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal alle seks EPLE-poster er klassifisert med bevis i eple-avklaring.md
```
