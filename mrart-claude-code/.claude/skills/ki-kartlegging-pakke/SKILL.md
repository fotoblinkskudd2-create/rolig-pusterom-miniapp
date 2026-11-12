---
name: ki-kartlegging-pakke
description: "Oppgave 28/50 (Penger): KI-kartlegging for SMB: produktpakke (4 900 kr, HYPOTESE)."
disable-model-invocation: true
effort: high
metadata:
  nr: 28
  kategori: "Penger"
---
# 28 · KI-kartlegging for SMB: produktpakke (4 900 kr, HYPOTESE)

**Kategori:** Penger

## Hvorfor høy verdi
Kontantspor A i SMB-siden. En ferdig leveransemal betyr at første kunde tar timer, ikke dager.

## Kilder i systemet ditt
- [SMB, kontantspor og kundeoppgaver](https://app.notion.com/p/3f97b9c98a9b8181bb50c635396ec510)
- [Økt 1 – Rangering av 12 prosjekter](https://app.notion.com/p/4077b9c98a9b81d3aaa6c29328da7da7)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O28 "KI-kartlegging for SMB: produktpakke (4 900 kr, HYPOTESE)"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Lag spørreskjema (20 spørsmål) for en liten norsk bedrift: oppgaver, verktøy, tidstyver, data, risiko.
2. Lag generator: utfylt skjema → rapport med fem konkrete KI-tiltak, hver med tid, kostnad (BEREGNET/HYPOTESE), risiko og første test.
3. Lag rapportmal som PDF med din stemme.
4. Test på to syntetiske bedrifter: transport og bygg (sporene Ordre 5 nevner).
5. Lag tilbudstekst (usendt).

## Leveranse
- Skjema, generator, to eksempelrapporter, tilbudstekst.

## Ferdigkrav
- [ ] Hvert tiltak har merket kostnad.
- [ ] Ingen personopplysninger i testdata.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal to eksempelrapporter er generert og merkevakt gir 0 funn på begge
```
