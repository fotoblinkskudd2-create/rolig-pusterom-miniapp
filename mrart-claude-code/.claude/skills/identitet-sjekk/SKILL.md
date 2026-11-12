---
name: identitet-sjekk
description: "Oppgave 30/50 (Penger): ENK eller AS: beslutningsgrunnlag før støttepenger."
disable-model-invocation: true
effort: medium
metadata:
  nr: 30
  kategori: "Penger"
---
# 30 · ENK eller AS: beslutningsgrunnlag før støttepenger

**Kategori:** Penger

## Hvorfor høy verdi
Lageranalysen og Ordre 3 sier at alle pengekraner (SkatteFUNN, regionale ordninger) henger på org.nr og ENK-vs-AS. Uten dette er søknadsutkast bortkastet tid.

## Kilder i systemet ditt
- [Ordre 3 – Pengekranene](https://app.notion.com/p/4077b9c98a9b81468f32e325123fcf4d)
- [Lageranalyse – hva som er verdt tid og penger](https://app.notion.com/p/4087b9c98a9b813cbae5f50013df991c)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O30 "ENK eller AS: beslutningsgrunnlag før støttepenger"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. kildevakt henter gjeldende regler fra brreg.no, skatteetaten.no, altinn.no og nav.no: stiftelseskostnad, aksjekapital, ansvar, skatt, rettigheter ved sykdom/trygd.
2. Lag sammenligningstabell ENK vs AS for operatørens situasjon (lav startomsetning, digitale produkter, mulig støtte).
3. Kartlegg hvilke støtteordninger krever hva (SkatteFUNN, Innovasjon Norge, regionale i Vestland/Bergen).
4. Merk alt som avhenger av personlige forhold som UAVKLART — ikke gjett.
5. Lag sjekkliste: de eksakte stegene operatøren selv må gjøre med BankID.

## Leveranse
- `identitet/beslutning.md` med kilder og sjekkliste.

## Ferdigkrav
- [ ] Hver regel har kilde-URL og lest-dato.
- [ ] Ingen innlogging eller registrering utført.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Dette er ikke juridisk eller skatterådgivning; skriv det øverst.
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal identitet/beslutning.md har sammenligning, støttekrav og sjekkliste med kilde for hver regel
```
