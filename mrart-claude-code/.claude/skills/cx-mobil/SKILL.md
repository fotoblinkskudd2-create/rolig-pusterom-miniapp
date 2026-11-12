---
name: cx-mobil
description: "Oppgave 14/50 (Fullfør kode): Cx prosjektverksted: test og gjør klar for iPhone."
disable-model-invocation: true
effort: high
metadata:
  nr: 14
  kategori: "Fullfør kode"
---
# 14 · Cx prosjektverksted: test og gjør klar for iPhone

**Kategori:** Fullfør kode

## Hvorfor høy verdi
Cx står i TIL_KONTROLL fordi Safari og iPhone aldri ble testet. Du jobber fra telefon og iPad — appen må virke der.

## Kilder i systemet ditt
- [Promptsystem v1.0 — 15 områder](https://app.notion.com/p/4157b9c98a9b81d5b4afe491688d6c1a)
- [VERDI-LOV (11. sep)](https://app.notion.com/p/3d87b9c98a9b815881c6f6e4f1b44a36)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O14 "Cx prosjektverksted: test og gjør klar for iPhone"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Legg Cx-HTML og ZIP i `cx/` (fra tidligere leveranse). Kjør de 48 eksisterende testene.
2. Gjør den til PWA: manifest, service worker, offline-lagring, ikon.
3. Test i Claude Code Desktop sin iOS Simulator-rute (Safari, iPhone-størrelse): opprett prosjekt, legg til kilde, kontrakt, test, eksporter JSON.
4. Fiks alt som bryter på liten skjerm og ved tastatur oppe.
5. Legg til import fra Porteføljeregister-eksport (CSV).

## Leveranse
- PWA-versjon av Cx, skjermbilder fra simulator, testlogg.

## Ferdigkrav
- [ ] 48 gamle tester grønne.
- [ ] Hele flyten gjennomført i simulator.
- [ ] Fungerer offline etter første lasting.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal Cx-flyten er gjennomført i iOS-simulator med skjermbilder og alle 48 tester passerer
```
