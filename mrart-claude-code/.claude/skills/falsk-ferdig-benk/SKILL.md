---
name: falsk-ferdig-benk
description: "Oppgave 04/50 (Fundament): Bygg Motordre: kjørbar falsk-ferdig-detektor."
disable-model-invocation: true
effort: high
metadata:
  nr: 4
  kategori: "Fundament"
---
# 04 · Bygg Motordre: kjørbar falsk-ferdig-detektor

**Kategori:** Fundament

## Hvorfor høy verdi
Samme kontroll kan brukes på leveranser fra Claude Code, Codex, Devin, GrokBot og egne agenter. Den stopper at ting kalles ferdig uten bevis — det gjennomgående hullet i arkivet ditt.

## Kilder i systemet ditt
- [VERKSTED og hovedsystem](https://app.notion.com/p/3f97b9c98a9b81c6ab07df2910104d9f)
- [SMB, kontantspor og kundeoppgaver](https://app.notion.com/p/3f97b9c98a9b8181bb50c635396ec510)
- [Agentfabrikk og gjennomføringsprogram](https://app.notion.com/p/3f97b9c98a9b810ca0a2c3bdcf4eeeda)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O04 "Bygg Motordre: kjørbar falsk-ferdig-detektor"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Lag `motordre/` med Python 3.11, kun standardbibliotek.
2. Datamodell: leveransepost med feltene krav, artefaktstatus, teststatus, integrasjonsstatus, distribusjon, markedssignal, kilde-id.
3. Regler: obligatorisk test med FAIL hindrer samlet godkjenning. Manglende bevis gir UAVKLART. «Interessant»/«positiv respons» blir aldri BETALT. Deaktivert scheduler blir aldri aktiv. En kilde-ID beviser ikke fritekstens sannhet.
4. Lag minst 12 fixtures i `motordre/fixtures/`: 8 som skal avvises, 4 som er godkjente innenfor avgrensning.
5. Lag CLI: `python3 -m motordre sjekk <fil.json>` som skriver maskinlesbar JSON og en kort norsk kontrollrapport.
6. Kjør detektoren på tre ekte rader fra Porteføljeregisteret med status LEVERT (les, ikke skriv).

## Leveranse
- `motordre/` med kode, fixtures og tester.
- Rapport for tre ekte LEVERT-rader.

## Ferdigkrav
- [ ] Alle 12 fixtures gir forventet utfall.
- [ ] Minst 20 enhetstester bestått.
- [ ] motprove gir BESTÅTT.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal python3 -m unittest discover -s motordre passerer med minst 20 tester og alle 12 fixtures gir forventet dom
```
