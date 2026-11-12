---
name: kaggle-prismodell
description: "Oppgave 26/50 (Notion og drift): Regresjonstest for den ødelagte prismodellen."
disable-model-invocation: true
effort: high
metadata:
  nr: 26
  kategori: "Notion og drift"
---
# 26 · Regresjonstest for den ødelagte prismodellen

**Kategori:** Notion og drift

## Hvorfor høy verdi
Runde 29 brukte 421,5 CPU-timer (DOKUMENTERT i Kontrollrom) og ble ubrukelig fordi prismodellen ga null kunder i alle 20 jobber. En test på fem sekunder hadde stoppet det.

## Kilder i systemet ditt
- [Kontrollrom – King](https://app.notion.com/p/3ff7b9c98a9b81a092bdc7cc224f703c)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O26 "Regresjonstest for den ødelagte prismodellen"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Finn prismodellen i Kaggle-stafetten. Reproduser null-kunde-utfallet med runde 29-parametre.
2. Finn rotårsaken (f.eks. pris over betalingsvilje-fordeling, enhetsfeil, fortegnsfeil).
3. Lag sanity-test: modellen skal gi mer enn null kunder ved minst én pris (testkrav, ikke markedstall — HYPOTESE om rotårsak inntil bevist), og identisk tap i alle jobber skal utløse feil.
4. Legg testen inn som obligatorisk før-sjekk før enhver ny runde starter.
5. Kjør testen på runde 28- og 31-konfig.

## Leveranse
- Rotårsak i `prismodell-feil.md`, fiks, sanity-test, før-sjekk.

## Ferdigkrav
- [ ] Testen feiler på runde 29-konfig og passerer på rettet modell.
- [ ] Ingen ny Kaggle-runde startet.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal sanity-testen feiler på runde 29-konfigurasjonen og passerer etter rettingen
```
