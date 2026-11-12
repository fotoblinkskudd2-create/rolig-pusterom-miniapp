---
name: konsultasjonsagenda
description: "Oppgave 18/50 (Fullfør kode): FocusDump: agenda før legetime."
disable-model-invocation: true
effort: high
metadata:
  nr: 18
  kategori: "Fullfør kode"
---
# 18 · FocusDump: agenda før legetime

**Kategori:** Fullfør kode

## Hvorfor høy verdi
Forskningsbanken anbefaler nettopp dette fremfor en «depresjonslege»: kortere vei fra kaos i hodet til en ryddig liste til fagperson. Nyttig for deg selv i møte med helsevesenet.

## Kilder i systemet ditt
- [Forskningsbank, designoppgaver og realitetstest](https://app.notion.com/p/3f97b9c98a9b816f9561e39e6af22612)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O18 "FocusDump: agenda før legetime"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Bygg en enkel PWA: diktér eller skriv fritt → strukturert agenda med Symptomer/endringer, Hva er prøvd, Spørsmål til legen, Hva jeg ønsker.
2. Datoer og tidslinje hentes fra teksten; ukjente datoer merkes UKJENT.
3. Eksport til PDF eller utskrift på én side.
4. Ingen diagnose, ingen råd, ingen sky. Lokal lagring.
5. Tre syntetiske testtekster, inkludert en som ber om medisinråd (skal avvises høflig med henvisning til lege).

## Leveranse
- PWA, tre testcases, ensides eksempel-PDF.

## Ferdigkrav
- [ ] Ingen generert tekst inneholder diagnose eller dosering.
- [ ] Fungerer offline.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal konsultasjonsagenda-PWA genererer ensides agenda for alle tre testtekster uten diagnose eller dosering
```
