---
name: triallab-ios
description: "Oppgave 17/50 (Fullfør kode): TrialLab iOS-prototype i simulator."
disable-model-invocation: true
effort: high
metadata:
  nr: 17
  kategori: "Fullfør kode"
---
# 17 · TrialLab iOS-prototype i simulator

**Kategori:** Fullfør kode

## Hvorfor høy verdi
Prototypen ligger som README og kode, men er ikke kjørt. Simulatorruten i Claude Code Desktop lar Claude trykke gjennom appen mens du ser på.

## Kilder i systemet ditt
- [Familieminne, 25 appbriefs og iOS-prototype](https://app.notion.com/p/3f97b9c98a9b818daf84c7cad7a919e4)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O17 "TrialLab iOS-prototype i simulator"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Finn TrialLab-koden og les README.
2. Bygg og start i iOS Simulator (Claude Code Desktop, simulatorrute).
3. Gå gjennom hver skjerm. Logg krasj, tomme tilstander og ødelagte knapper.
4. Fiks det som hindrer hovedflyten. Ikke legg til funksjoner.
5. Lag 60-sekunders skjermopptak-manus av hovedflyten.

## Leveranse
- Kjørbar prototype, feilliste, skjermbilder.

## Ferdigkrav
- [ ] Hovedflyten fullføres uten krasj.
- [ ] Ingen App Store-handling.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal TrialLab bygger og hovedflyten fullføres i simulator uten krasj
```
