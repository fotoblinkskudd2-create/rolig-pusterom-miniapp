# 01 — KJØLEROM · Labben-kjøring

```
Grok-bot runtime. /lab. Klasse M.
PROBLEM: Impulskjøp på avbetaling. Én del kjøper kl 14, en annen våkner med pakker og inkasso.
BRUKER: én person, mange deler, lokal, ingen sky
RAMMER: 48t, lokal-first, ingen marketplace, ingen app+sky
DNA: fototerapi + passiv mekanikk + 48t
Seed 7. Drepe minst 3. IRP på overlevende #1.
```

Kilden er ikke en markedsrapport. Kilden er mønstrene i dette repoet og i deg:
Pusterom (regulering før handling), Isolation Mirror (bildet blir på enheten),
Labben-formatet (seed, drep, IRP), «48t», «passiv mekanikk», og den ene setningen
som går igjen: *en del kjøpte Lego på Klarna og jeg husker det ikke.*

## Seed 7

| # | Idé | Én setning |
|---|-----|-----------|
| 1 | **Kjølerom** | Alt en del vil kjøpe havner i et fryserom i 48t. Neste del som fronter ser ønsket, hvem som ville ha det og hvorfor — og avgjør. |
| 2 | Klarna-blokker (nettleser-utvidelse) | Blokkerer checkout-sider for BNPL. |
| 3 | Gjeldsbombe-ur | Live teller som viser renter tikke i sanntid på låseskjerm. |
| 4 | Bank-API-vakt | PSD2-kobling som varsler ved hvert kjøp. |
| 5 | Kortkappe | Fysisk hylse over bankkortet. Du må ta den av. Under står setningen en annen del skrev til deg. |
| 6 | Del-dagbok | Ren switch-logg for DID-systemer. |
| 7 | Tidslås-boks | Kitchen Safe-klone for kortet. |

## Drep

- **#2 Klarna-blokker — DREPT.** Krig mot én leverandør. Del-en som vil kjøpe åpner Safari på mobilen og går rundt. Skam-design, ikke regulering.
- **#3 Gjeldsbombe-ur — DREPT.** Panikk som UI. Stress-app som produserer stress. Pusterom-DNA sier nei.
- **#4 Bank-API-vakt — DREPT.** PSD2 = sky, konsesjon, tredjepart som ser alle kjøpene dine. Bryter lokal-first i første linje.
- **#6 Del-dagbok — DREPT som produkt, BEHOLDT som organ.** Simply Plural finnes, er gratis, og løser front-sporing. Alene er det duplikat. Inne i #1 er det motoren.
- **#7 Tidslås-boks — DREPT.** Kitchen Safe finnes (39,95 USD ved lansering, 84+ USD nå). Elektronikk, batteri, CE-merking. Og: kortnummeret ligger lagret i Klarna uansett. Boksen låser feil ting.

## Overlevende: #1 Kjølerom + #5 Kortkappe (én kropp)

Appen er hjernen. Kappen er den passive mekanikken — ingen batteri, ingen sky,
bare friksjon og en setning skrevet av en annen del.

## IRP på #1

**I — Innsikt.** Banker har bygget *kategori-sperrer* (Barclays 2018: av/på for gambling,
restaurant, drivstoff). Ingen har bygget en *forsinkelse med overlevering*. Problemet for et
system med deler er ikke at «jeg» mangler viljestyrke. Det er at den som kjøper og den som betaler
ikke er samme del, og ingen av dem vet om den andre. Hukommelsestap er ikke en karakterbrist.
Det er et grensesnittproblem. Grensesnittproblemer kan designes.

**R — Risiko.**
- Del som vil kjøpe sletter appen → mot: eksport + «hvis du sletter meg, er det greit, men skriv hvorfor først». Ingen tvang. Tvang skaper motstand i systemet.
- Skam → mot: språket sier aldri «impuls», «feil», «synd». Ønsket er gyldig. Det får bare vente.
- Klinisk påstand → mot: ikke medisinsk utstyr. Ingen diagnose. Ingen behandling. Et kjøleskap med notater.

**P — Prototype (48t).** Én HTML-fil. localStorage. Ønske inn → 48t nedtelling → hvem/hvorfor/hva det koster
med rente → «Fortsatt ja?» besluttet av en *annen* registrert del eller samme del etter søvn.
Kortkappe som 3D-printbar STL.

## Skrevet på nynorsk, ≤3 setningar

> Kjølerommet tek imot alt ein del vil kjøpe, og fryser det i 48 timar.
> Den neste som er framme, ser kven som ville ha det, kvifor, og kva det kostar med rente.
> Ingen skam, ingen sky — berre eit rom der ønsket får kjølne før kortet varmar seg.

Stopp. Ikke nytt OS.
