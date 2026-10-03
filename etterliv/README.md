# Etterliv — første bygg: SISTE ORD

Produktstudien (`Etterliv-produktlab.html`) peker på én første kommersielle test:
**SISTE ORD, assistert, 2 900 kr.** Tre godkjente brev. Mål arbeidstid, revisjoner og om kunden opplever teksten som sin egen.
Deretter: HVERDAGSARV som første programvareprodukt. Black box (ETTERLÅS) og nye tekster i avdødes stil (EKKO) venter til tillit, rettigheter og utlevering fungerer.

## `siste-ord.html`

Én fil. Ingen server. Ingen konto. Ingen KI. Alt i `localStorage` på enheten.

| Steg | Hva skjer |
|------|-----------|
| Start | Avsender, signatur, pakke (selvbetjent 990 / assistert 2 900 — testpriser) |
| Mottakere | Maks tre. Ett brev per person |
| Spørsmål | Seks korte spørsmål per brev. Diktering fungerer |
| Utkast | Brevet settes sammen **bare av svarene**. Kun tegnsetting, stor forbokstav og «eh/ehm» fjernes. Måler «egne ord %» live |
| Godkjenning | Endring må lagres → avkrysning → godkjenn. Låses med SHA-256. «Åpne for endring» trekker godkjenningen tilbake og logges |
| Levering | Bare godkjente brev: utskrift (ett brev per side) og `.txt`. Hele saken som `.json`. **Ingen automatisk sending** |
| Måling | Aktiv arbeidstid, revisjoner (revisjon 3+ merkes utenfor pakken i assistert), egne ord %, opplevd 1–5. Eksport `.csv` |

## Test

```
NODE_PATH=$(npm root -g) node etterliv/test-siste-ord.cjs
```

23 funksjonelle sjekker i Chromium: rensing, maks tre mottakere, utkast fra egne ord, godkjenning blokkert ved ulagret endring, SHA-256, revisjon utenfor pakken, nedlasting = godkjent tekst, omlasting, tilbaketrekking, CSV, sletting, escaping av navn, ingen JS-feil.

## Stoppkriterier for testen (forslag)

- Snitt arbeidstid per assistert pakke > 3 timer → prisen bærer ikke.
- Opplevd egne ord < 4 på mer enn ett av tre brev → metoden virker ikke.
- Under 3 av 10 spurte betaler 2 900 kr → test 990 kr selvbetjent før noe annet bygges.

## Ikke i dette bygget

Sending, kontoer, sky, deling, kryptert hvelv, tale-til-tekst på server, KI-omskriving. Et brev er ikke et testament.
