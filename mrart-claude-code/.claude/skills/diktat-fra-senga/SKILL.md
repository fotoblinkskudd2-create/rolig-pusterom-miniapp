---
name: diktat-fra-senga
description: "Oppgave 46/50 (iOS og AI-system): Diktat fra senga: iPhone → inputkort → Claude Code."
disable-model-invocation: true
effort: medium
metadata:
  nr: 46
  kategori: "iOS og AI-system"
---
# 46 · Diktat fra senga: iPhone → inputkort → Claude Code

**Kategori:** iOS og AI-system

## Hvorfor høy verdi
Lageranalysen gjentar «kan kjøres fra senga». Remote Control og iOS-snarveier gjør stemmen din til inputkort som Claude Code kan jobbe videre med — uten PC.

## Kilder i systemet ditt
- [Lageranalyse – hva som er verdt tid og penger](https://app.notion.com/p/4087b9c98a9b813cbae5f50013df991c)
- [Medieflyt fra input til leveranse](https://app.notion.com/p/3f97b9c98a9b8111a8f3d5cb19114114)
- [Claude Code — What's new](https://code.claude.com/docs/en/whats-new)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O46 "Diktat fra senga: iPhone → inputkort → Claude Code"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Lag iOS-snarvei-oppskrift (trinn for trinn i Snarveier-appen): Dikter tekst → legg til dato og kort tag → lagre i iCloud Drive-mappe `MRART/innboks/` som .md.
2. Lag `tools/innboks.py` som gjør hver .md til inputkort etter Medieflyt kapittel 5 (fangst, normalisering, kort).
3. Beskriv oppsett av `claude remote-control` på maskinen, slik at du kan starte en økt fra Claude-appen på telefonen.
4. Lag skill `/innboks` som behandler nye kort og foreslår neste handling for hvert.
5. Test med tre syntetiske diktater.

## Leveranse
- Snarvei-oppskrift, `tools/innboks.py`, `/innboks`-skill, oppsettguide.

## Ferdigkrav
- [ ] Tre diktater blir tre gyldige inputkort.
- [ ] Oppskriften er testbar uten ekstra apper.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal tre syntetiske diktater blir tre gyldige inputkort via tools/innboks.py
```
