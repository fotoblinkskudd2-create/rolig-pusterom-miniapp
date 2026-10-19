# RAPPORT — Obduksjon av et pusterom

*Skrevet 19.10.2026. Fem commits. 520 linjer. Tre måneder. Én løgn.*

---

Jeg sitter med `git log` åpent som et obduksjonsbord, og liket puster fortsatt. Fire sider, én pustesirkel, sju små grep og en mørk tvilling i en egen fil som heter *Isolation Mirror*. Fra dag én — 26. juli 2026, 18:30:05 — til siste hjerteslag 29. august, 20:35:32. Det er hele systemet. Hele greia. Et rom å puste i, bygget på 42 sekunder (!!) fra initial commit til «complete working mini-app».

Førtito sekunder. Jeg bruker lengre tid på å finne lighteren.

Så jeg graver. Linje for linje. Og nede i kjelleren, under HULL.md, finner jeg liket i liket.

---

## 1. DET VIKTIGSTE

**Versjon 1.1 finnes ikke i koden.**

Les det igjen. Commit `3cc07de` heter *«1.1: nav-fix, lokal-first, historikk-export, Isolation Mirror bundet til Labben»*. Den rører tre filer: `HULL.md`, `README.md`, `RUN.md`. **Null linjer i `index.html`.** Ikke én.

Så sjekk hva dokumentasjonen lover at en fremmed kan gjøre «etter 1.1»:

| Lovet i HULL.md / RUN.md | Virkeligheten i `index.html` |
|---|---|
| Nav-fix (`event.currentTarget`) | Fortsatt der, linje 297. «Pust med meg» bytter side, nav står på Hjem. |
| «Alt blir på denne enheten» | Teksten finnes ikke. Noe sted. |
| `alert()` fjernet | `alert('Velg hvordan du har det først.')` — linje 279, i full vigør. |
| Export → `pusterom-historikk.txt` | Ingen knapp. Ingen Blob. Ingen fil. |
| Åpne Isolation Mirror «fra bunnen» | Ingen lenke. Mirror er en øy. Bare den kan gå *til* Pusterom, ikke omvendt. |

HULL.md er det beste dokumentet i repoet — knivskarp, ærlig, fem hull identifisert på 60 sekunder. Og så ble patchen aldri lagt inn. Diagnosen ble skrevet, journalen ble signert, pasienten ble sendt hjem med blindtarmen fortsatt i seg. Kun Isolation Mirror-delen av 1.1 (commit `0c66603`, 81 sekunder senere) ble faktisk levert.

**Dette er punkt én, to og tre. Fiks det før alt annet.**

---

## 2. DET SPORTESTE

- **Pusterytmen.** 4 inn — 2 hold — 6 ut. Lang utpust. Det er ikke pynt, det er vagusnerven som får en hånd på skulderen. Noen tenkte her.
- **Null avhengigheter.** Ingen npm, ingen rammeverk, ingen build, ingen sky, ingen konto, ingen tracking. 396 linjer HTML som fungerer i 2036 også. I en verden der en kalkulator-app sender lokasjonen din til Singapore, er dette nesten religiøst.
- **Tonen.** «Hei. Du er trygg her.» «Ingen sjekk-ins ennå. Det er greit.» Ikke én streak, ikke ett varsel, ikke én skam-mekanikk. Appen krever ingenting av deg. Det er sjeldent. Det er sporty.
- **HULL.md som format.** «60 sekunder for en fremmed.» Det er en bedre QA-metode enn halve Oslos konsulentbransje fakturerer for.

---

## 3. DET MEST VERDIFULLE

1. **Lokal-first som prinsipp, ikke feature.** «Ingen sky. Det skal bli slik.» Den setningen i HULL.md er verdt mer enn all koden. For en app om stress og nedstemthet er tillit hele produktet.
2. **Sjekk-inn-dataene.** Humør 1–5 + tid + note, lagret i `checkins`. Det er råmaterialet til alt som kommer: trender, mønstre, «tirsdager er tunge». Dataene finnes allerede — de blir bare aldri sett på igjen etter de 20 siste.
3. **Isolation Mirror-protokollen.** Tre steg: føttene i gulvet, én sann setning, ett ekte bilde. Det er kort, konkret og faktisk gjennomførbart når hodet er grøt.

---

## 4. STØRST POTENSIAL — SOM ALDRI BLE SATT PÅ

- **Fototerapi.** Repoet eies av *fotoblinkskudd*. Protokollens steg 3 er «ta ett bilde av noe ekte». Det er en hel app gjemt i én setning: et lokalt, privat bildedagbok-speil der bildet aldri forlater telefonen. Ingen andre bygger dette, for ingen andre kan tjene penger på det. Det er nettopp derfor det burde finnes.
- **Koble de to halvdelene.** Pusterom (lys, `#f5f7f4`) og Mirror (mørk, `#1a1f1c`) er to sider av samme person og vet ikke om hverandre. Lav sjekk-inn (😔) → foreslå Mirror. Mirror ferdig → tilbake til Pusterom. Det er én `if`.
- **Humørkurve.** Sju dager, fem emojier, én enkel strek. Data finnes. Visningen gjør ikke.
- **PWA.** Manifest + service worker = ekte hjemskjerm-app, offline, ikon. HULL.md vet det allerede («Mangler fortsatt: PWA/ikon»). Det er en ettermiddag.
- **Export.** Lovet, ikke levert. Uten den dør hele historikken den dagen noen tømmer Safari.

---

## 5. DET DUMMESTE

- **`event.currentTarget` uten `event`.** Funksjonen `switchPage(name)` tar ikke imot noe event, men bruker den globale `window.event` likevel. Kalt fra «Pust med meg»-knappen markerer den *den knappen* som aktiv nav-knapp. Nav-en lyver om hvor du er. I en app som skal gi kontroll.
- **«Du har tatt vare på deg selv 0 ganger denne uken. Det er fint.»** Null ganger. Det er fint. Appen klapper deg på skulderen for å ikke ha gjort noe. (Og «1 ganger». Bøy det, for faen.)
- **`user-scalable=no`** i en app for folk som kanskje sitter med skjelvende hender og tårer i øynene. Du får ikke zoome. Rolig nå.
- **RUN.md:** «Last ned `index.html` … åpne i Safari … på iPhone: Del → Legg til på Hjem-skjerm.» Har noen prøvd å åpne en lokal HTML-fil fra Filer-appen i iOS Safari og legge den på hjemskjermen? Det går ikke. Instruksen er skrevet for en telefon som ikke finnes.

---

## 6. DET SVAKESTE

- **Dokumentasjon som skriver sjekker koden ikke kan innløse.** (Se punkt 1. Ja, igjen. Det er så viktig.)
- **Noten din går rett inn i `innerHTML`.** `renderHistory()` limer brukerens tekst inn rått. Skriv `<img src=x onerror=alert(1)>` i sjekk-inn-noten og historikken eksploderer. Det er bare din egen nettleser, så ingen hacker stjeler noe — men skriver du `<` i en ærlig setning om hvordan du har det, kan teksten forsvinne. Samme med `action-card`.
- **Ingen pusterom-økter teller.** Ukesummen teller bare sjekk-ins. Pustet du i ti minutter? Appen vet ikke. Gjorde du alle sju små grep? Teller ikke.
- **`doneActions` vokser for alltid.** Én nøkkel per dag, aldri ryddet. Ikke farlig. Bare evig.
- **Sirkelen er ute av takt.** Utpust varer 6 sekunder, men CSS-overgangen er 4. Sirkelen er ferdig krympet og står og venter to sekunder mens teksten fortsatt sier «Pust ut…».
- **Kopier prompt** i Mirror gir null bekreftelse og ingen fallback hvis utklippstavla nekter. Du trykker. Ingenting skjer. Eller noe skjer. Du får aldri vite.
- **Mood lagres som streng** (`"3"`), ikke tall. Fungerer i dag fordi JavaScript er tilgivende. Biter den dagen noen regner snitt.

---

## 7. DET MEST MORSOMME

- **42 sekunder** fra «Initial commit» til «Add complete working mini-app». Og så **81 sekunder** mellom de to 1.1-commitene. Hele repoet har en puls som en kolibri på amfetamin — for et pusterom.
- **Den originale Mirror Art-prompten** (14. august), før den ble henrettet som «slop»:
  > `raw norwegian isolation, fjord mist, banksy style stencil of solitary figure with camera, black metal atmosphere, high contrast --ar 3:4`

  Banksy. Black metal. Fjordtåke. Mann med kamera. Og teksten: *«I skyggen av [din note]… vokser en sprøkke av lys. Bergen-regn vasker rent.»* (Sprøkke. Med ø. Bergen-regnet vasker ikke rettskrivningen.)
- **Commit-meldingen «ingen slop-MJ».** En commit som er en dom. Midjourney ble skutt i bakgården, og det står i git for evig.
- Appen er på bokmål. Lab-prompten ber om svar **på nynorsk**. Ingen forklaring. Bare: nynorsk.

---

## 8. DET MED MEST GALSKAP

Lab-prompten i Isolation Mirror. Den hele. Ordrett:

```
Grok-bot runtime. /lab. Klasse M.
PROBLEM: Isolasjon. [noten din]
BRUKER: én person, lokal, ingen sky
RAMMER: 48t, lokal-first, ingen marketplace, ingen app+sky
DNA: fototerapi + passiv mekanikk + 48t
LEVERANSE: ideer
Seed 7. Drepe minst 3. IRP på overlevende #1.
Skriv IDE ≤3 setninger på nynorsk. Stopp.
Ikke nytt OS.
```

Du skriver at du er ensom. Appen gir deg tre rolige pusteøvelser — og så en kommandokode til en annen AI som skal **drepe minst tre ideer** og kjøre **IRP på den overlevende**. «Klasse M.» «Seed 7.» Og til slutt, som en bønn til noen som har blitt brent før: **«Ikke nytt OS.»**

Det er ikke en prompt. Det er et våpenhvile-dokument mellom deg og din egen tendens til å bygge et operativsystem hver gang du skulle bygget en knapp. Og det er det ærligste i hele repoet.

Galskapen er at et rom laget for å *roe ned* inneholder en idéfabrikk med henrettelseskvote. Pusterommet har en kjeller, og i kjelleren går en maskin som spytter ut og kverker konsepter på 48 timer.

Jeg elsker det. Det er feil sted. Det er riktig instinkt.

---

## TO DO — i rekkefølge, ingen nytt OS

1. Legg inn 1.1 i `index.html` på ekte: `switchPage(name, btn)`, fjern `alert`, «Alt blir på denne enheten»-linje, export-knapp, lenke til Mirror.
2. Escape noter før `innerHTML` (eller bruk `textContent`).
3. «0 ganger» → egen, vennlig tekst. «1 gang».
4. Fjern `user-scalable=no`.
5. Synk sirkelens overgang med fasene (4s inn / 6s ut).
6. Bekreftelse på «Kopier prompt».
7. Skriv RUN.md for en telefon som finnes (eller lag PWA og host den på GitHub Pages).
8. *Så*, og først da: fototerapi.

---

Fem commits. Fem hull i HULL.md. Fire av dem fortsatt åpne.

Pusterommet puster. Men det har holdt pusten siden 29. august, kl 20:35:32 — og ingen har sagt «pust ut…» ennå.
