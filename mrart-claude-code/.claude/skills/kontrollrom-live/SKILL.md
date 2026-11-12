---
name: kontrollrom-live
description: "Oppgave 24/50 (Notion og drift): Kontrollrom som levende artefakt."
disable-model-invocation: true
effort: medium
metadata:
  nr: 24
  kategori: "Notion og drift"
---
# 24 · Kontrollrom som levende artefakt

**Kategori:** Notion og drift

## Hvorfor høy verdi
Kontrollrom – King er manuelt oppdatert. Publiserte artefakter i Claude Code kan nå kalle MCP-connectorer ved hver visning — du får et dashboard som alltid er ferskt.

## Kilder i systemet ditt
- [Kontrollrom – King](https://app.notion.com/p/3ff7b9c98a9b81a092bdc7cc224f703c)
- [Porteføljeregister](https://app.notion.com/p/d881cb6ad22e47d6acfb7309b95efa45)
- [Claude Code — What's new](https://code.claude.com/docs/en/whats-new)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O24 "Kontrollrom som levende artefakt"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Bygg ett artefakt (HTML) som ved visning henter fra Notion: antall per status, KLAR-køen, BLOKKERT-poster, siste fem LEVERT, kosttak.
2. Mobil-først, én skjerm, mørk modus.
3. Ingen skriving fra artefaktet. Kun lesing.
4. Publiser som privat artefakt. Ikke offentlig lenke.

## Leveranse
- Privat artefakt-URL + kildekode i `artefakter/kontrollrom/`.

## Ferdigkrav
- [ ] Tall i artefaktet stemmer med manuell spørring.
- [ ] Ikke offentlig delt.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal kontrollrom-artefaktet viser tall som stemmer med en manuell Notion-spørring
```
