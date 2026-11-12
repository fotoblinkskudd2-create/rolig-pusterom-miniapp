---
name: innboks-destiller
description: "Oppgave 21/50 (Notion og drift): Daglig innboks-destillering."
disable-model-invocation: true
effort: medium
metadata:
  nr: 21
  kategori: "Notion og drift"
---
# 21 · Daglig innboks-destillering

**Kategori:** Notion og drift

## Hvorfor høy verdi
Du produserer mer input enn noen kan lese. Tre lister — beslutninger, oppgaver, slett — gjør innboksen til handling.

## Kilder i systemet ditt
- [Oppgave · Daglig innboks-destillering](https://app.notion.com/p/4137b9c98a9b81f58053e89f0164fb49)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O21 "Daglig innboks-destillering"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Hent nye Notion-sider/innboksnotater siste døgn.
2. Destiller hvert notat: Kjerne (maks fem linjer), Signal (tre viktigste), Støy (hva kan fjernes og hvorfor).
3. Samle i tre lister: Beslutninger du må ta, Oppgaver som kan gis til en agent (med ferdig kontrakt), Kan slettes.
4. Ingenting slettes. Slettelisten er forslag.
5. Lagre som én side per dag.

## Leveranse
- Skill + første dagsside.

## Ferdigkrav
- [ ] Hver oppgave har kontrakt-utkast.
- [ ] Ingen sletting utført.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal dagens destilleringsside har tre lister og hver oppgave har kontrakt-utkast
```
