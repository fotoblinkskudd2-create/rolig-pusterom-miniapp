---
name: cowboy-salgsside
description: "Oppgave 27/50 (Penger): Cowboy-økonomi: fra diktat til salgsside."
disable-model-invocation: true
effort: high
argument-hint: "[fil med diktat]"
metadata:
  nr: 27
  kategori: "Penger"
---
# 27 · Cowboy-økonomi: fra diktat til salgsside

**Kategori:** Penger

## Hvorfor høy verdi
Lageranalysens P0: største dokumenterte nær-publikum av bøkene dine, kan gjøres fra senga, 0 kr test (DOKUMENTERT i Lageranalysen). Forhåndssalg til 249 kr (HYPOTESE-pris) er den raskeste verdiløkka du har.

## Kilder i systemet ditt
- [Ordre 4 – Bøker til produkter](https://app.notion.com/p/4077b9c98a9b8116b0eae27029a404f0)
- [Lageranalyse – hva som er verdt tid og penger](https://app.notion.com/p/4087b9c98a9b813cbae5f50013df991c)
- [Voice, stil og native agentfiler](https://app.notion.com/p/3f97b9c98a9b81b1ad61f3fb649ad872)

## Før du starter
1. Opprett kontrakt: `python3 tools/kontrakt.py ny O27 "Cowboy-økonomi: fra diktat til salgsside"` og fyll inn akseptkriteriene under.
2. Les kildene over. Notion-status er historisk; verifiser før du bygger på den.
3. Argument fra operatøren: $ARGUMENTS

## Fremgangsmåte
1. Input: operatørens 300-ords diktat ($ARGUMENTS). Mangler den: lag tre spørsmål som fremkaller en konkret sparehistorie, og stopp.
2. Rens diktatet med stemmevakt. Bevar operatørens bilder og rytme.
3. Bygg statisk salgsside (én HTML-fil): åpningstekst, hva boka er (80 s, gonzo, sparing og indeksfond), hva du får for 249 kr (HYPOTESE-pris: signert e-bok + navn i takkelista), betalingsknapp som placeholder.
4. Legg inn ansvarsfraskrivelse: generell kunnskap, ikke individuelle investeringsråd.
5. kildevakt verifiserer alle tall (VFF-tall, Substack-gebyr 10 %) — alt som ikke bekreftes merkes UAVKLART.
6. Ingen publisering. Siden ligger lokalt.

## Leveranse
- `cowboy/salgsside.html`, `cowboy/aapning.md`, `kilder.md`.

## Ferdigkrav
- [ ] Merkevakt 0 funn.
- [ ] Stemmescore over terskel fra oppgave 15.
- [ ] Ikke publisert.
- [ ] Subagenten `motprove` gir BESTÅTT eller begrunnet UAVKLART.
- [ ] `python3 tools/merkevakt.py` på all levert tekst gir 0 funn.
- [ ] Leveransekort (format i CLAUDE.md) er skrevet til slutt.

## Stopp
- Standard stopp fra CLAUDE.md gjelder (hemmelighet, 3 like feil, kosttak, operatør sier stopp).

## Kjør med mål
```
/goal cowboy/salgsside.html finnes, merkevakt gir 0 funn og ingen publisering er gjort
```
