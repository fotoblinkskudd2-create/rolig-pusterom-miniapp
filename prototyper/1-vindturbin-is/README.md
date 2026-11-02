# 1. Is på vindturbinblader: «Tuberkel-forkant»

## Problemet

Is på forkanten gir tapt produksjon, ubalanse og vibrasjon, stopp, og iskast som er en fare for mennesker og utstyr. Dagens løsning er elektrisk oppvarming av bladet, som bruker mye energi. Ingen av dem har lav energi og lav risiko samtidig.

## Hypotese: tre lag, fra passivt til aktivt

1. **Tuberkel-forkant** (inspirert av finnene til knølhval). Bølgete forkant som kan gi stabilere strømning ved høy angrepsvinkel. *Dette er en aerodynamisk hypotese. At det reduserer isvekst er ikke dokumentert og må testes.*
2. **Væske-smurt overflate** (SLIPS-prinsippet, inspirert av kannplanten). Porøs overflate fylt med smøreolje gjør at is har lav vedheft. Passivt, ingen energi.
3. **Lokal varme**, kun ved isdetektor og kun på de første 0–10 % av korden. Aktiv backup for det passive laget ikke klarer.

Poenget er å ikke varme hele bladet. Passivt først, varme bare der det trengs.

## Prototype

- **CAD:** `cad/forkant_manchett.scad`. Skalamodell av et 300 mm segment av forkanten. Parametre: R = 15 mm, A = 6 mm, bølgelengde 40 mm. Dette er en forenklet modell, ikke et ekte bladprofil.
- **Skisse:** `design.svg`.
- **Montering:** klemmer i hver ende. Ikke modellert ennå.
- **Materiale (konsept):** glassfiber-kompatibel kantlist i polymer eller aluminium, med SLIPS-belegg påført i etterkant.

## Testplan

1. **Isvedheft på prøvestykker.** Flat overflate, ubehandlet, SLIPS-behandlet, og tuberkel-profil. Mål skjærkraft for å løsne is i kjølekammer. Sjekk relevant standard før testen starter.
2. **Aerodynamikk.** Vindtunnel eller rigg for løft og luftmotstand, med og uten tuberkler. Målet er å finne ut om tuberklene gjør noe skadelig.
3. **Energi.** Mål W/m² for lokal varme mot full forkant-varme. Hele regnestykket er verdt lite uten dette tallet.
4. **Levetid.** Erosjonstest (regn, sand). SLIPS-effekten kan forsvinne når smøreoljen vaskes ut.

Suksesskriterium før videre arbeid (forslag): isvedheft reduseres med minst 50 % mot ubehandlet referanse, og aerodynamisk ytelse ikke svekkes. `[verifiser: kriterium]`

## Markedsanalyse (utkast)

- **Kunder:** vindturbinprodusenter (OEM), operatører og eiere, bladservicefirmaer.
- **Verdi:** tapt produksjon × antall timer med is per år. `[verifiser: tapt produksjon per turbin i kalde klimaer]`
- **Konkurranse:** eksisterende forkantbeskyttelse (lakk og tape) og elektrisk avising. Vårt bidrag er kombinasjonen passivt + lokal varme. Vi har ikke sjekket patentsituasjonen. Det må gjøres før noe annet.
- **Hovedrisiko:** erosjon. Hvis belegget slites ned på et halvt år, er det verdiløst.
- **Modenhet:** konsept og laboratorietest (lavt nivå).

## Markedsføring

**Gonzo-versjon (for rådgivere og journalister, ikke for innkjøpere):**
> Jeg står på en åker i Nord-Norge klokka fire om natten. Vinden slår meg i fleisen med minus tjue. Bladet over meg står stille, fordi det har et lag med is på seg tjukt som en gjeldsbrev. Så tenker jeg: hvorfor skal vi varme hele greia for å slippe å tenke? Gi bladet en forkant som ikke vil ha is. Varm bare der det trengs. Og ja, det er akkurat så enkelt, og akkurat så vanskelig.

**B2B-versjon:**
> Tuberkel-forkant reduserer isoppbygging med passiv overflate og lokal varme. Mindre energi, færre stopp, tryggere i kalde områder. Prototype under testing.

*Merk: «reduserer isoppbygging» er et mål, ikke et bevist resultat. Ikke bruk den formuleringen før testen foreligger.*

## Feilsøking og kjente feilkilder

| Symptom | Mulig årsak | Hvordan sjekke |
|---------|-------------|----------------|
| Is fester seg i bølgedalen | Dalen er for dyp, eller dreneringen mangler | Foto med høyhastighetskamera i kjølekammer |
| SLIPS-effekt borte etter få timer | Smøreolje vaskes ut eller fordamper | Mål kontaktvinkel før og etter erosjon |
| Is vokser bak varmesonen | Varmesonen er for liten, vannfilm fryser igjen | Termisk kamera, sjekk hvor isen starter |
| Skjøtene mellom segmenter er isfeste | Ujevn overflate eller hull i belegget | Visuell inspeksjon og profilmåling |
| Isdetektor utløser ikke | Terskel for høy, eller detektor plassert feil | Logg detektorsignal mot observert is |

## Åpne spørsmål

- Hvilket bladprofil skal modelleres? (Ekte profil må hentes fra bladprodusent, ikke gjettes.)
- Hva er krav til levetid i år?
- Hva er grensen for akseptabel energiøkning fra varme?
