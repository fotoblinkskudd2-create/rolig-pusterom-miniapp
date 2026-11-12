---
name: fototerapi-pris
description: "Oppgave 32/50 (Penger): Fototerapi: priskalkulator og salgstekst."
disable-model-invocation: true
effort: medium
metadata:
  nr: 32
  kategori: "Penger"
---
# 32 · Fototerapi: priskalkulator og salgstekst

**Kategori:** Penger

## Hvorfor høy verdi
Fototerapi har salgstekst og prisbånd 1 310–4 810 kr (DOKUMENTERT internt, oppdrag 19). En kalkulator gjør tilbudet konsistent og raskt å sende.

## Kilder i systemet ditt
- [Økt 1 – Rangering av 12 prosjekter](https://app.notion.com/p/4077b9c98a9b81d3aaa6c29328da7da7)
- [Ordre 4 – Bøker til produkter](https://app.notion.com/p/4077b9c98a9b8116b0eae27029a404f0)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O32 "Fototerapi: priskalkulator og salgstekst"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Lag enkel nettside-kalkulator: pakke, varighet, reise, etterarbeid → pris innenfor båndet.
2. Vis hva som er inkludert og ikke.
3. Rens salgsteksten med stemmevakt. Ingen terapeutiske løfter (ikke helsepersonell-påstander).
4. Generer tilbud som PDF (usendt).

## Leveranse
- Kalkulator-HTML, salgstekst, eksempeltilbud.

## Ferdigkrav
- [ ] Ingen behandlingspåstander.
- [ ] Pris alltid innenfor båndet.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal kalkulatoren gir pris innenfor 1310 til 4810 kroner for alle kombinasjoner i testen
```
