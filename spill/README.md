# Spill

Tre spillbare prototyper fra «20 bygg-prompts». Lokal state, ingen konto, rekord i `localStorage`.

| Spill | Alder | Lærer | Stack | Kjør |
|-------|-------|-------|-------|------|
| **Fjæreplytt** | 7–11 | Næringskjede | React (Vite) | `cd fjaereplytt && npm i && npm run dev` |
| **Kodebro** | 11–15 | Sekvens, løkke, vilkår | Ren HTML | Åpne `kodebro/index.html` |
| **Planteløp** | 7–11 | Hva en plante trenger | React (Vite) | `cd plantelop && npm i && npm run dev` |

`npm run dev` bruker `--host`, så du kan åpne adressen på telefonen på samme nett.

## Fjæreplytt

Fire lag: alger → tanglopper → småfisk → måke. Hvert lag spiser laget under hvert 8. sekund.
Ett grep per runde: **Slipp ut 2** (færre munner) eller **Vern** (ingen spiser laget denne runden).
Overlev 12 runder. Score = runder × minste lag.

Balansen er simulert: står du stille, brister kjeden i runde 5. Tilfeldige trykk overlever under 1 %.
Å bare verne det minste laget holder til ca. runde 7. Å lese hele kjeden holder 12.

## Kodebro

10 baner. Blokker: gå, hopp, snu ↰/↱, gjenta (×2–9, kan nøstes), og fra bane 7 «hvis hull → hopp, ellers gå».
Hver bane har et blokktak som tvinger fram løkker. Krasj markerer blokken som feilet.
Bane 10: trykk planker for å lage din egen bro (minst tre hull, aldri to på rad), så programmer over den.

Alle 10 baner er testet med en løsning innenfor taket.

## Planteløp

Fire potter med hver sin vri: Vindu (vanlig), Skygge (trenger 2 lys), Leire (vann pakker jorda), Sand (vannet renner ut).
Fire kort per runde (minst ett lys). Trykk kort, trykk potte. Trykk et kort på potta for å ta det tilbake.

Mangel vises som ett ord: **Tørst**, **Råte**, **Strekker**, **Sulten**, **Kvelt**.
Vann to runder på rad gir råte. Mye vann uten luft kveler røttene.
Raskeste mulige blomst: runde 4. Rekorden er laveste runde.
