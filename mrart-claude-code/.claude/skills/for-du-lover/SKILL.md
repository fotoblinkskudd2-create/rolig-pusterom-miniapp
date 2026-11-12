---
name: for-du-lover
description: "Oppgave 12/50 (Fullfør kode): Før du lover: evalueringsverktøy for tilbudsgrunnlag."
disable-model-invocation: true
effort: high
metadata:
  nr: 12
  kategori: "Fullfør kode"
---
# 12 · Før du lover: evalueringsverktøy for tilbudsgrunnlag

**Kategori:** Fullfør kode

## Hvorfor høy verdi
VERKSTED valgte dette som hovedretning. Verktøyet avgjør om tjenesten fortjener mer bygging — med målt rettetid, ikke magefølelse.

## Kilder i systemet ditt
- [VERKSTED og hovedsystem](https://app.notion.com/p/3f97b9c98a9b81c6ab07df2910104d9f)
- [SMB, kontantspor og kundeoppgaver](https://app.notion.com/p/3f97b9c98a9b8181bb50c635396ec510)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O12 "Før du lover: evalueringsverktøy for tilbudsgrunnlag"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Bygg lokalt verktøy (Python eller TS) som tar et jobbnotat og produserer tilbudsgrunnlag: arbeidsomfang, fem avklaringer, kundeutkast.
2. Bevar originallinjer og kilde-ID. Vis original og resultat side om side.
3. Tre syntetiske saker: terrasse, dør (med instruksjonsfelle), gjerde (med motstridende mål).
4. Ukjent pris, dato, mengde og materiale forblir UKJENT — aldri fylt inn.
5. Modelladapter som kan byttes; standardkjøring bruker fixtures uten API-kall.
6. Registrer feil, rettetid og tid til eieraksept. Eksporter resultatkort til CSV.
7. Lag sammenligning mot en fempunkts sjekkliste (motprøven fra VERKSTED).

## Leveranse
- Verktøy, tre saker, CSV-resultatkort, sammenligningsrapport.

## Ferdigkrav
- [ ] Dør-fellen markeres.
- [ ] Motstrid i gjerde-saken vises.
- [ ] Ingen tidsgevinst påstås uten registrert tid.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal alle tre syntetiske saker kjører og resultatkort.csv har feil, rettetid og eieraksept for hver
```
