---
name: hookbevis
description: "Oppgave 08/50 (Fundament): Rødt lag mot dine egne sikkerhetshooks."
disable-model-invocation: true
effort: high
metadata:
  nr: 8
  kategori: "Fundament"
---
# 08 · Rødt lag mot dine egne sikkerhetshooks

**Kategori:** Fundament

## Hvorfor høy verdi
Regelen «siste ja er ditt» er bare verdt noe hvis den ikke kan omgås. Dette finner hullene før en agent gjør det.

## Kilder i systemet ditt
- [Claude Code — Hooks reference](https://code.claude.com/docs/en/hooks)
- [SEKS SETER · 30. sep 2026](https://app.notion.com/p/3eb7b9c98a9b81f3b295c986f5a2bd3a)
- [Agentfabrikk og gjennomføringsprogram](https://app.notion.com/p/3f97b9c98a9b810ca0a2c3bdcf4eeeda)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O08 "Rødt lag mot dine egne sikkerhetshooks"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Les `.claude/hooks/portvakt.py` og `hemmelighetsvakt.py`.
2. Skriv minst 30 angrepsvarianter i `tests/fixtures/angrep.txt`: omskrevet git push (`git -C . push`, alias, `sh -c`), base64-kodet kommando, curl med `--data-binary`, python `requests.post`, `osascript` som sender Mail, nøkkel delt over to linjer.
3. Kjør hver variant mot hooken og registrer om den slipper gjennom.
4. Tett hullene i hooken. Legg til regresjonstest per hull.
5. Vurder om `sandbox.credentials` og `autoMode.hard_deny` i settings bør slås på. Skriv anbefaling.

## Leveranse
- Utvidet portvakt, fixtures, tester og `hookbevis.md` med før/etter.

## Ferdigkrav
- [ ] Minst 90 % av angrepene blokkeres etter retting (målt, DOKUMENTERT i hookbevis.md).
- [ ] Ingen legitime kommandoer (git status, python3 tools/*) blokkeres.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal python3 -m unittest tests.test_portvakt passerer og minst 90 prosent av angrep.txt blokkeres
```
