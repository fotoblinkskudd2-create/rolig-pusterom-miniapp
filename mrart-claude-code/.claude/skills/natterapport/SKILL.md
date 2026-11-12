---
name: natterapport
description: "Oppgave 19/50 (Notion og drift): Natterapport for Porteføljeregisteret som rutine."
disable-model-invocation: true
effort: medium
metadata:
  nr: 19
  kategori: "Notion og drift"
---
# 19 · Natterapport for Porteføljeregisteret som rutine

**Kategori:** Notion og drift

## Hvorfor høy verdi
Oppgaven finnes allerede i registeret. Som Claude Code-rutine kjører den uten at maskinen din står på.

## Kilder i systemet ditt
- [Oppgave · Natterapport for porteføljeregisteret](https://app.notion.com/p/4137b9c98a9b81a5973ec611d6574361)
- [Porteføljeregister](https://app.notion.com/p/d881cb6ad22e47d6acfb7309b95efa45)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O19 "Natterapport for Porteføljeregisteret som rutine"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Skriv skill-innholdet som et selvstendig prompt: hent rader endret siste døgn, rader stille >7 dager i KONTROLL/RETTING, duplikater, og sha256-felt som ikke stemmer med fil.
2. Output: fem linjer med forslag til neste steg, pluss tabell.
3. Sett opp med `/schedule` som daglig rutine kl. 05:00 Europe/Oslo med Notion-connector. [ANTAGELSE: /schedule krever claude.ai-innlogging, ikke API-nøkkel.]
4. Rutinen skriver kun ett utkast i Notion med status AVKLART, aldri endring av andre rader.
5. Kjør én gang manuelt og vis resultatet.

## Leveranse
- Rutine registrert, første natterapport.

## Ferdigkrav
- [ ] Rapporten er fem linjer + tabell.
- [ ] Ingen andre rader endret.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal første natterapport finnes som Notion-utkast og rutinen er registrert
```
