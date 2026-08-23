# Dagens AI-prompt – Rolig Pusterom

Én samlet prompt du kan lime inn i en AI-økt (Claude, ChatGPT, Midjourney o.l.) for å drive
dagens arbeid videre på dette prosjektet. Bygget ut fra faktisk kode i repoet
(`index.html`, README) – ingen bilder var vedlagt denne runden, så "se på inputbilder"-steget
er markert som åpent under **Ideer / bilder** og bør kjøres på nytt så snart bilder er lastet opp.

## Kontekst

Rolig Pusterom er en liten, rolig mini-app (ren HTML/CSS/JS, ingen backend, alt lagres i
`localStorage` på enheten) for å dempe stress og nedstemthet. Fem sider: Innsjekk, Pusterom
(pusteøvelse), Små grep, Speil (refleksjon + valgfri AI-kunst-prompt), Historikk. Designspråk:
lyst, mykt, grønt/beige palett, avrundede kort, ingen skarpe kanter, ingen larm.

Bruk denne konteksten i alt du genererer: **rolig, trygt, ikke-klinisk, norsk språk, lav terskel.**

## 1. Vibe coding (gjøres nå / i dag)

- [x] Ferdigstill og flett inn "Isolation Mirror"-prototypen som en ordentlig side (**Speil**) i
      hovedappen, med samme designsystem, lokal historikk og en trygg (escaped) render av
      brukertekst. *(Gjort i denne økten.)*
- [ ] Legg til en enkel "eksporter mine data" / "slett alle data"-knapp på Historikk-siden –
      viktig for tillit når alt kun ligger lokalt.
- [ ] Legg til en `manifest.json` + service worker slik at appen kan installeres/brukes offline
      som ekte mini-app (PWA).
- [ ] Vurder `prefers-color-scheme: dark` som en rolig mørk variant av samme palett.

## 2. Ideer

- En "pust sammen med noen"-modus: del en lenke, to sirkler puster synkront via `BroadcastChannel`
  eller en enkel WebRTC-forbindelse – ingen server, ingen konto.
- Ukentlig "mykt sammendrag": generér en kort, varm tekst fra ukens innsjekk-data (helt lokalt,
  ingen AI-kall nødvendig – enkel regelbasert oppsummering av humør-trend).
- Varsling (valgfri, med samtykke) som spør "vil du sjekke inn?" på faste tider – kun via
  `Notification API`, aldri påtrengende.

## 3. Oppfinnelser / konsepter

- **Rolig 2.0**: et sett med frittstående, spesialiserte "speil"-moduler (isolasjon, stress,
  søvn, ensomhet) som deler samme protokoll-motor og designsystem, men kan lanseres separat.
- **Mirror Art-motor**: en liten, ren funksjon som tar (humør, notat, valgfritt bilde) → deterministisk
  velger stil, farge og metafor, og produserer en AI-billedgenereringsprompt. I dag er dette
  gjort med en enkel tilfeldig stilvelger i `index.html`; neste steg er å gjøre valget følsomt for
  humør-verdien fra Innsjekk, ikke bare notatteksten.

## 4. Ting som skal gjøres ferdig

- [x] Speil-siden (tidligere `isolation-mirror.html`, stod ukoblet fra appen) – nå en integrert
      side med lokal historikk, bilde-forhåndsvisning (lagres aldri) og kopierbar AI-kunst-prompt.
- [ ] Kobl Speil-refleksjoner inn i den ukentlige oppsummeringen på Historikk-siden, slik at "tatt
      vare på deg selv X ganger" også teller refleksjoner, ikke bare innsjekk.
- [ ] Skriv et par enkle automatiserte tester (f.eks. Playwright) som verifiserer at ingen
      brukerinnhold rendres som HTML (regresjonstest for escaping-fiksen gjort i dag).

## 5. Kunstideer

- Stillbilde-serie generert fra `mirrorArtStyles`-listen i koden: fjordtåke, regn mot vindu,
  sprekke av lys, skog i motlys – bruk disse fire som base-prompts og be en bildemodell om et
  konsistent visuelt univers (samme fargepalett som appen: `#a8c5b0`, `#d4e4f0`, `#f0e9df`).
- Et generativt "pustemønster"-bakgrunnsbilde (SVG, animert sakte) som kan brukes som cover/ikon
  for appen – rolige, konsentriske sirkler i appens palett.

## 6. Bilder (input)

Ingen bilder var vedlagt i denne oppgaven. Neste gang bilder følger med:
1. Beskriv hva bildet skal bli til (moodboard for Speil-siden? app-ikon? Mirror Art-eksempel?).
2. Lim inn denne prompten sammen med bildene, så bygges resultatet inn i riktig del av appen
   over (Speil-siden, PWA-ikon, eller kunstserien i seksjon 5) i stedet for som løsrevet output.
