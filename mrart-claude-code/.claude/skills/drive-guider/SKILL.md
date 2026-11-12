---
name: drive-guider
description: "Oppgave 23/50 (Notion og drift): Les de uleste Drive-guidene og destiller."
disable-model-invocation: true
effort: medium
metadata:
  nr: 23
  kategori: "Notion og drift"
---
# 23 · Les de uleste Drive-guidene og destiller

**Kategori:** Notion og drift

## Hvorfor høy verdi
Guider som «Claude som ditt AI-operativsystem» og «Ni GitHub-verktøy» står som «Innhold ikke lest». Verdien ligger i det som går igjen og det som motsier.

## Kilder i systemet ditt
- [Drive · Claude som ditt AI-operativsystem](https://app.notion.com/p/4117b9c98a9b817b9696d1d1a3146ac0)
- [Drive · Ni GitHub-verktøy som reduserer tokenforbruket](https://app.notion.com/p/4117b9c98a9b81669461f1c5b97cf986)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O23 "Les de uleste Drive-guidene og destiller"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Finn alle Porteføljeregister-rader med «Innhold ikke lest» i Siste endring.
2. Les dokumentene via Google Drive-connector hvis koblet; ellers be operatøren eksportere dem til `innboks/drive/` som PDF/MD. Stopp til de finnes.
3. Lag én side: hva går igjen, hva motsier hverandre, hva er utdatert mot Claude Code-dokumentasjonen i dag, og de tre tiltakene som gir mest.
4. For hvert tiltak som gjelder Claude Code: skriv det som skill eller hook i denne pakken.

## Leveranse
- Destilleringsside + eventuelle nye skills.

## Ferdigkrav
- [ ] Hver påstand om Claude Code sjekket mot code.claude.com.
- [ ] Merkevakt 0 funn.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal destilleringssiden dekker alle uleste guider og merkevakt gir 0 funn
```
