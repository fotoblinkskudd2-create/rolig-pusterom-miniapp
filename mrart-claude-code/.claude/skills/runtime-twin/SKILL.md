---
name: runtime-twin
description: "Oppgave 11/50 (Fullfør kode): Fivecode F5: agent_runtime som TypeScript-tvilling."
disable-model-invocation: true
effort: high
metadata:
  nr: 11
  kategori: "Fullfør kode"
---
# 11 · Fivecode F5: agent_runtime som TypeScript-tvilling

**Kategori:** Fullfør kode

## Hvorfor høy verdi
Promptsystem v1.0 rangerer «Port agent_runtime» som topp-to i Fivecode. En TS-versjon kan kjøre i nettleser og iOS-PWA, der du faktisk er.

## Kilder i systemet ditt
- [Promptsystem v1.0 — 15 områder](https://app.notion.com/p/4157b9c98a9b81d5b4afe491688d6c1a)
- [Agentfabrikk og gjennomføringsprogram](https://app.notion.com/p/3f97b9c98a9b810ca0a2c3bdcf4eeeda)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O11 "Fivecode F5: agent_runtime som TypeScript-tvilling"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Les Python-runtime og kontrakt. Lås contract_hash før portering.
2. Port til TypeScript (strict), uten UI, i `twin/ts/`.
3. Generer felles testvektorer (JSON) fra Python-testene. Kjør dem mot begge implementasjoner.
4. Lag differensialtest: 1 000 tilfeldige policy-forespørsler, begge implementasjoner skal gi identisk svar.

## Leveranse
- `twin/ts/`, testvektorer, differensialtest-rapport.

## Ferdigkrav
- [ ] 0 avvik i differensialtesten.
- [ ] Samme contract_hash i begge.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal differensialtesten mellom Python og TypeScript gir 0 avvik på 1000 tilfeller
```
