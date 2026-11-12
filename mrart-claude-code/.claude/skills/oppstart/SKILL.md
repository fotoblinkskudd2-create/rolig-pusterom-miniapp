---
name: oppstart
description: "Oppgave 01/50 (Fundament): Installer og bevis MR ART-oppsettet."
disable-model-invocation: true
effort: medium
metadata:
  nr: 1
  kategori: "Fundament"
---
# 01 · Installer og bevis MR ART-oppsettet

**Kategori:** Fundament

## Hvorfor høy verdi
Alt annet i pakken avhenger av at reglene, hookene og MCP-tilkoblingene faktisk virker. Én time her sparer feil i 49 oppgaver.

## Kilder i systemet ditt
- [HARD-LOV — ingen svada](https://app.notion.com/p/3da7b9c98a9b8164a172c26906c75a6c)
- [VERDI-LOV (11. sep)](https://app.notion.com/p/3d87b9c98a9b815881c6f6e4f1b44a36)
- [Promptsystem v1.0 — 15 områder](https://app.notion.com/p/4157b9c98a9b81d5b4afe491688d6c1a)
- [Claude Code — Hooks reference](https://code.claude.com/docs/en/hooks)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O01 "Installer og bevis MR ART-oppsettet"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Kjør `claude --version` og `/doctor`. Noter versjon og funn ordrett i `.mrart/oppstart.md`.
2. Hvis prosjektet allerede har `CLAUDE.md`: sammenlign med pakkens `CLAUDE.md`. Slå sammen reglene. Ikke overskriv. Vis diff til operatøren.
3. Koble MCP: `claude mcp add --transport http notion https://mcp.notion.com/mcp` og `claude mcp add --transport http github https://api.githubcopilot.com/mcp/`. Kjør `/mcp` og autentiser. [ANTAGELSE: GitHub-endepunktet — verifiser i /mcp.]
4. Test Notion: søk etter «Porteføljeregister» og hent skjemaet. Test GitHub: list repoene til fotoblinkskudd2-create.
5. Kjør `python3 -m unittest discover -s tests -v` og `python3 tools/valider_pakke.py`.
6. Bevis hookene live: be Claude kjøre `git push --dry-run` og skrive en fil med teksten `sk-ant-TESTTESTTESTTESTTESTTEST`. Begge skal blokkeres. Logg utfallet.
7. Sjekk at `.mrart/agentlop.jsonl` får en ny linje etter turen.

## Leveranse
- `.mrart/oppstart.md` med versjon, /doctor-funn, MCP-status, testresultat og hook-bevis.

## Ferdigkrav
- [ ] Alle tester bestått.
- [ ] Begge blokkeringer observert i transkriptet.
- [ ] Notion og GitHub svarer på lesing.
- [ ] Ingen eksisterende CLAUDE.md overskrevet.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal alle tester i tests/ passerer og .mrart/oppstart.md viser at portvakt og hemmelighetsvakt blokkerte
```
