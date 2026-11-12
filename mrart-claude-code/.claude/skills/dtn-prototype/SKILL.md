---
name: dtn-prototype
description: "Oppgave 49/50 (iOS og AI-system): DTN: klikkbar iOS-stil React-prototype."
disable-model-invocation: true
effort: high
argument-hint: "[sti til DTN-masterprompt]"
metadata:
  nr: 49
  kategori: "iOS og AI-system"
---
# 49 · DTN: klikkbar iOS-stil React-prototype

**Kategori:** iOS og AI-system

## Hvorfor høy verdi
Du har masterprompten for en konkurrerende datingapp. /design-artboards og iOS-simulatoren gjør den til en prototype du kan vise investorer eller testere.

## Kilder i systemet ditt
- [vibe-codes-25](https://app.notion.com/p/3f47b9c98a9b81d6a51edbccf3cbdc57)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O49 "DTN: klikkbar iOS-stil React-prototype"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Les DTN-masterprompten ($ARGUMENTS). Mangler den: stopp og be om fila.
2. Kjør `/design` med briefen. Velg sammen med operatøren én retning.
3. Bygg React + TypeScript, iOS-stil (safe areas, bunnfaner, sveip), mock-data.
4. Hovedflyt: onboarding → profil → matching → samtale → AI-samtalehjelp.
5. Test i iOS Simulator. Skjermbilder av hver skjerm.
6. Personvernnotat: hvilke data en ekte versjon ville samle og hvorfor.

## Leveranse
- Prototype, skjermbilder, personvernnotat.

## Ferdigkrav
- [ ] Hele hovedflyten klikkbar.
- [ ] Kun syntetiske profiler.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal DTN-hovedflyten er klikkbar i simulator med skjermbilde av hver skjerm
```
