---
name: kosttak
description: "Oppgave 07/50 (Fundament): Kostnadsvakt og modellruting."
disable-model-invocation: true
effort: medium
metadata:
  nr: 7
  kategori: "Fundament"
---
# 07 · Kostnadsvakt og modellruting

**Kategori:** Fundament

## Hvorfor høy verdi
Kaggle-rundene brukte hundrevis av CPU-timer på en ødelagt prismodell. Samme risiko finnes for tokens. Et kosttak gjør at sverm-jobber ikke spiser budsjettet.

## Kilder i systemet ditt
- [Kontrollrom – King](https://app.notion.com/p/3ff7b9c98a9b81a092bdc7cc224f703c)
- [Drive · Ni GitHub-verktøy som reduserer tokenforbruket](https://app.notion.com/p/4117b9c98a9b81669461f1c5b97cf986)
- [Claude Code — Subagents](https://code.claude.com/docs/en/subagents)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O07 "Kostnadsvakt og modellruting"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Kjør `/usage` og `/doctor`. Noter hvilke skills, MCP-servere og plugins som koster kontekst uten å brukes.
2. Sett modell per subagent: haiku for logg/telling, sonnet for kode og kontroll, opus for motprøve og stemme. Skriv begrunnelsen i `.mrart/modellruting.md`.
3. Lag `tools/kostlogg.py` som leser `.mrart/agentlop.jsonl` og teller turer per dag og per agent.
4. Lag skill-wrapper: før enhver jobb med over tre subagenter, kjør kostnadsvakt og krev operatørens ja.
5. Mål én fast oppgave (f.eks. oppgave 3) med og uten modellruting. Rapporter forskjellen merket BEREGNET.

## Leveranse
- `.mrart/modellruting.md`, `tools/kostlogg.py`, målerapport.

## Ferdigkrav
- [ ] Måling gjort på samme oppgave to ganger.
- [ ] Kosttaket stopper en sverm-jobb i test.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal målerapporten viser forbruk med og uten modellruting på samme oppgave
```
