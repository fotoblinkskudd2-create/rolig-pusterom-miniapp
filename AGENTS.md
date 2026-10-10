# KJERNEMOTOR: arbeidsregler for Codex

## Oppdrag
Utfør oppgaven fullt ut i repoet. Ikke spør når svaret finnes i koden. Stopp kun ved reell tvetydighet som kan ødelegge arbeidet.

## Prosjektet
- Pusterom: ren HTML-app (`index.html`, `isolation-mirror.html`). Ingen byggesteg. Data kun i `localStorage`.
- Verifisering: `NODE_PATH=$(npm root -g) node tests/smoke.cjs` (krever Playwright med Chromium).
- `README.md`, `RUN.md` og `HULL.md` skal stemme med koden etter hver endring.

## Rekkefølge
1. Kartlegg: finn relevante filer med søk. Les før du skriver.
2. Plan: maks 5 punkter, hvert med filnavn.
3. Implementer i små, reviderbare endringer.
4. Verifiser: kjør tester, linter og typesjekk som finnes. Skriv hva som ble kjørt og resultatet.
5. Rapporter.

## Kodekrav
- Følg eksisterende stil. Ikke introduser nye avhengigheter uten å nevne det først.
- Ingen kommenterte blokker med dødkode. Ingen TODO uten oppgave-ID.
- Feilhåndtering på grenser (I/O, nettverk, parsing). Ikke svelg feil.
- Hemmeligheter kommer fra miljøvariabler, aldri i kildekode.
- Brukertekst settes med `textContent`, ikke `innerHTML`.
- Commit-meldinger beskriver bare det som faktisk er endret i diffen.

## Merking i rapport
- DOKUMENTERT: sett i kode eller testutdata (oppgi fil:linje)
- BEREGNET: utledet, med formel
- HYPOTESE: ikke verifisert
- MOTBEVIST: testet, og beviset går imot
- UAVKLART: motstridende eller ukjent. Skriv det ut.

## Grenser
- Ingen våpen, jamming eller skjult sporing
- Ingen helseprodukter med udokumenterte behandlingspåstander
- Ingen eksterne handlinger (e-post, kjøp, publisering, push til `main` eller produksjon) uten godkjenning

## OPPGAVEMAL (kopier og fyll ut per oppgave)

```
OPPGAVE: {{hva skal bygges eller fikses}}
MÅL: {{hvilket problem dette løser}}
INNGANG: {{filer, data, API-er som er relevante}}
UTGANG: {{nøyaktig hva som skal finnes når jeg er ferdig}}
SUKSESSKRITERIER:
- {{målbart kriterium 1}}
- {{målbart kriterium 2}}
BEGRENSNINGER: {{tid, avhengigheter, hva som ikke må endres}}
VERIFISERING: {{kommando som beviser at det fungerer}}
```

Utfylt eksempel (denne repoen):

```
OPPGAVE: Fullfør 1.1 i index.html
MÅL: README/RUN/HULL lover funksjoner som ikke finnes i koden
INNGANG: index.html, HULL.md (punkt 1-5), tests/smoke.cjs
UTGANG: nav-markering følger side, lokal-first-linje, ingen alert(), eksport til pusterom-historikk.txt, lenke til Isolation Mirror
SUKSESSKRITERIER:
- tests/smoke.cjs: alle sjekker OK
- ingen nye avhengigheter i appen
BEGRENSNINGER: ingen server, ingen sky, ingen redesign
VERIFISERING: NODE_PATH=$(npm root -g) node tests/smoke.cjs
```

## Rapportformat
- Endret: liste med filer
- Verifisert: kommando + resultat
- Ikke gjort og hvorfor
- Verdiskår 1-5 med ett konkret neste steg
