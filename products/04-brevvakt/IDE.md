# 04 — BREVVAKT · Labben-kjøring

```
Grok-bot runtime. /lab. Klasse M.
PROBLEM: Inkassobrevet ligger åpent. Eller uåpnet, i en skuff, i tre uker. Gebyrene vokser. Ingen vet om de er lovlige.
BRUKER: én person, 250k gjeld, brevangst, lokal, ingen sky
RAMMER: 48t, lokal-first, ingen marketplace, ingen app+sky
DNA: fototerapi + passiv mekanikk + 48t
Seed 7. Drepe minst 3. IRP på overlevende #1.
```

Kilden: hver eneste gonzo-scene i instruksen din har et inkassobrev i seg. «Skriv mens inkassobrevet ligger åpent.» Det er ikke rekvisitt. Det er vær.

Og: Norges Bank sier over 30 % av forbruksgjelden ligger hos inkassoselskaper (se 01). Inkassoforskriften har *tak* på hva de kan kreve. Takene er offentlige, presise, og nesten ingen sjekker dem.

## Seed 7

| # | Idé | Én setning |
|---|-----|-----------|
| 1 | **Brevvakt** | Lim inn brevet. Den finner beløpene, regner lovlig maks salær og forsinkelsesrente etter forskriften, viser overkrav, og skriver innsigelsen. Pluss en brevhylle som gjør det umulig å gjemme brev. |
| 2 | Gjeldsoversikt | Hent alt fra Gjeldsregisteret. |
| 3 | Forhandlingsbot | AI ringer kreditor. |
| 4 | Inkasso-OCR | Fotografer brev, få tekst. |
| 5 | Gjeldssnøball-kalkulator | Hvilken gjeld først. |
| 6 | Klage-generator | Ferdig klage til Finansklagenemnda. |
| 7 | Brevkasse-sensor | Varsler når posten kommer. |

## Drep

- **#2 Gjeldsoversikt — DREPT.** Gjeldsregisteret.com finnes og er gratis. BankID-sky.
- **#3 Forhandlingsbot — DREPT.** Sky, stemme, juss, og en maskin som snakker på vegne av deg til folk som vil ha pengene dine. Nei.
- **#4 OCR — DREPT som produkt.** Telefonen gjør det allerede (Live Text / Google Lens). Brevvakt tar imot den teksten.
- **#5 Snøball — DREPT.** Hundre kalkulatorer finnes.
- **#6 Klage-generator — BEHOLDT som organ.** Innsigelsen i #1 er første steg; nemnd er neste.
- **#7 Sensor — DREPT.** Elektronikk. Og posten er ikke problemet — å åpne den er.

## Overlevende: #1 Brevvakt + Brevhylle

## IRP

**I — Innsikt.** Brevangst er ikke latskap; et brev er et lite stykke trussel med en frist. Det som gjør det tålelig er å *vite*: hva er dette, hvor lang tid har jeg, og er det de krever lovlig? Forskriften svarer på det siste med en tabell. En tabell kan kjøres. Og hver gang den finner et overkrav, skifter makten litt.

**R — Risiko.**
- *Juridisk feil* → bare paragrafer jeg har lest i Lovdata (inkassoforskriften §§ 1-2, 2-1–2-4, sist endret 19.12.2025) og Finanstilsynets rentetabell. Alt annet sier «sjekk». Ikke juridisk rådgivning, og det står der.
- *Feil utlesing av brevet* → hvert felt kan rettes; utlesing er forslag, aldri fasit.
- *Falsk trygghet* → appen sier aldri «du trenger ikke betale». Den sier hva taket er, og hvem du kan spørre (NAV 55 55 33 39, Finanstilsynet).

**P — Prototype (48t).** `brevvakt.html` + `cad/brevhylle.py`.

**Passiv mekanikk:** Brevhylla har to spor: *Uåpnet* foran og lavt, så brevene alltid synes — de kan ikke forsvinne i en skuff. *Håndtert* bak og høyt. I frontkanten: et spor for brevkanten med et fanget 9 mm brekkblad — en brevåpner der en finger ikke får plass. Å åpne skal være lettere enn å la være.

## Nynorsk, ≤3 setningar

> Brevvakta les inkassobrevet ditt og reknar ut kor mykje dei lovleg kan krevje etter forskrifta.
> Ho viser deg fristen, kva som skjer vidare, og skriv innseiinga om dei krev for mykje.
> Hylla framfor deg gøymer ingenting, og det er lettare å opne brevet enn å la vere.

Stopp. Ikke nytt OS.
