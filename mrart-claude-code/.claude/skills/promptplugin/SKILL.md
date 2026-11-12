---
name: promptplugin
description: "Oppgave 47/50 (iOS og AI-system): Pakk Promptsystem v1.0 og Token-bibelen som Claude Code-plugin."
disable-model-invocation: true
effort: medium
metadata:
  nr: 47
  kategori: "iOS og AI-system"
---
# 47 · Pakk Promptsystem v1.0 og Token-bibelen som Claude Code-plugin

**Kategori:** iOS og AI-system

## Hvorfor høy verdi
Promptene dine ligger spredt i Notion og filer. Som plugin kan de installeres på hvilken som helst maskin med én kommando og deles som ZIP.

## Kilder i systemet ditt
- [Promptsystem v1.0 — 15 områder](https://app.notion.com/p/4157b9c98a9b81d5b4afe491688d6c1a)
- [Claude Code — Skills](https://code.claude.com/docs/en/skills)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O47 "Pakk Promptsystem v1.0 og Token-bibelen som Claude Code-plugin"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Scaffold: `claude plugin init mrart-prompter`.
2. Gjør oppstartsblokken fra Promptsystem v1.0 og topp-tre per område om til skills (én per område).
3. Legg Token-bibelen inn som referansefil i en skill (hvis tilgjengelig i `innboks/`).
4. Pakk som ZIP. Kjør `claude plugin details mrart-prompter` for tokenkostnad.
5. Test installasjon med `--plugin-dir` i en ren mappe.

## Leveranse
- Plugin-mappe, ZIP, kostnadsrapport.

## Ferdigkrav
- [ ] Plugin laster uten feil.
- [ ] Tokenkostnad per økt dokumentert.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal pluginen laster med --plugin-dir i en ren mappe og plugin details viser tokenkostnad
```
