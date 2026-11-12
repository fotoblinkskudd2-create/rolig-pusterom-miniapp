---
name: godkjenning-runtime
description: "Oppgave 10/50 (Fullfør kode): Innholdsbundet godkjenning i agent_runtime.py."
disable-model-invocation: true
effort: high
metadata:
  nr: 10
  kategori: "Fullfør kode"
---
# 10 · Innholdsbundet godkjenning i agent_runtime.py

**Kategori:** Fullfør kode

## Hvorfor høy verdi
Agentfabrikken sier selv at menneskelig godkjenning ikke er implementert. Det er hullet mellom demo og noe en kunde kan stole på.

## Kilder i systemet ditt
- [Agentfabrikk og gjennomføringsprogram](https://app.notion.com/p/3f97b9c98a9b810ca0a2c3bdcf4eeeda)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O10 "Innholdsbundet godkjenning i agent_runtime.py"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Les `agent_runtime.py`, `agentkatalog.json` og de 42 eksisterende testene. Kjør dem først.
2. Implementer godkjenning bundet til bruker, handling, mål og sha256 av eksakt innhold.
3. Godkjenning utløper (standard 15 min) og kan brukes én gang.
4. Endret mottaker, innhold eller handling krever ny godkjenning.
5. Samtidige forsøk gir maks én utførelse (lås + idempotensnøkkel).
6. Bruk lokal mock-adapter. Ingen ekte utsending.

## Leveranse
- Oppdatert runtime, nye tester, `GODKJENNING.md` med trusselmodell.

## Ferdigkrav
- [ ] Alle 42 gamle tester fortsatt grønne.
- [ ] Minst 15 nye tester: utløp, gjenbruk, endret innhold, avslag, manglende identitet, samtidighet.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal alle gamle og nye tester i agentfabrikken passerer og minst 15 nye godkjenningstester finnes
```
