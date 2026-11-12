---
name: reposkann
description: "Oppgave 06/50 (Fundament): VERDI-LOV-test av alle GitHub-repoene."
disable-model-invocation: true
effort: high
metadata:
  nr: 6
  kategori: "Fundament"
---
# 06 · VERDI-LOV-test av alle GitHub-repoene

**Kategori:** Fundament

## Hvorfor høy verdi
Kode er den største kategorien i lageret (291 rader), men andelen LEVERT er lav. Du trenger å vite hvilke repoer som faktisk starter.

## Kilder i systemet ditt
- [GitHub nattposen](https://app.notion.com/p/3f57b9c98a9b811ba446e9b71d102973)
- [HARD-LOV — ingen svada](https://app.notion.com/p/3da7b9c98a9b8164a172c26906c75a6c)
- [SEKS SETER · 30. sep 2026](https://app.notion.com/p/3eb7b9c98a9b81f3b295c986f5a2bd3a)
- [VERDI-LOV (11. sep)](https://app.notion.com/p/3d87b9c98a9b815881c6f6e4f1b44a36)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O06 "VERDI-LOV-test av alle GitHub-repoene"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. List alle repoer for fotoblinkskudd2-create via GitHub MCP. Kjente: nattposen, gull-system-11-sep, agentiske-kunstimperium-2.0, alex-gull.
2. For hvert repo: start subagenten `repo-inspektor` (worktree-isolert). Maks tre parallelt (kosttak).
3. Samle alle `STATUS.md` i `reposkann-<dato>.md`: repo | språk | siste commit | startkommando | starter på 60 s? | tester bestått/feilet | anbefaling FULLFØR / PARKER / DREP.
4. For alex-gull: list åpne PR-er (siste kjente #102, 27.10) og hva hver mangler for merge.

## Leveranse
- `reposkann-<dato>.md`
- Lokale branches `claude/status-<dato>` med STATUS.md per repo (ikke pushet).

## Ferdigkrav
- [ ] Hvert repo har ja/nei på VERDI-LOV med kommando og tid.
- [ ] Ingen push, ingen PR opprettet.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal reposkann-rapporten har én rad per repo med VERDI-LOV ja/nei og testtall
```
