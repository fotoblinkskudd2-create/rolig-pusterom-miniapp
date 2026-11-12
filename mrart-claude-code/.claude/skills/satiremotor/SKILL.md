---
name: satiremotor
description: "Oppgave 36/50 (Kunst): Ansvar på rundgang: satiregenerator med kildekrav."
disable-model-invocation: true
effort: high
metadata:
  nr: 36
  kategori: "Kunst"
---
# 36 · Ansvar på rundgang: satiregenerator med kildekrav

**Kategori:** Kunst

## Hvorfor høy verdi
Din satire handler om hvordan makt flytter kostnad og ansvar. En motor som kartlegger slike kjeder fra offentlige dokumenter gir råmateriale med bevis — skarpere og tryggere.

## Kilder i systemet ditt
- [VERKSTED og hovedsystem](https://app.notion.com/p/3f97b9c98a9b81c6ab07df2910104d9f)
- [Tre satireunivers og KVITTERINGEN](https://app.notion.com/p/3f97b9c98a9b8140929ac26c72295432)
- [Voice, stil og native agentfiler](https://app.notion.com/p/3f97b9c98a9b81b1ad61f3fb649ad872)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O36 "Ansvar på rundgang: satiregenerator med kildekrav"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Input: et offentlig dokument (vedtak, høringssvar, pressemelding) som fil eller URL.
2. Trekk ut aktører og hvem som bærer kostnad, risiko og ansvar før og etter.
3. Lag ansvarskart (Mermaid-diagram) med sitat og kilde per pil.
4. Generer tre satireutkast i stemmen: ett kort, ett essay-åpning, ett bildekonsept. Hvert utkast lenker til kartet.
5. Juridisk sjekk: ingen påstand om lovbrudd som fakta; navngitte personer kun via egne offentlige utsagn.

## Leveranse
- `satire/` med motor, ett eksempel på et ekte offentlig dokument.

## Ferdigkrav
- [ ] Hver pil i kartet har kilde.
- [ ] Merkevakt 0 funn.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal eksempelet har ansvarskart der hver pil har sitat og kilde og tre satireutkast
```
