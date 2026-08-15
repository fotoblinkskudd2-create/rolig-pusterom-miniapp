# rolig-pusterom-miniapp
Samling av små, uavhengige mini-apper. Alle er statisk HTML/CSS/JS uten byggeprosess, med lokal lagring (`localStorage`) og ingen backend.

## Pusterom (`index.html`)
Rolig mini-app for å dempe stress og nedstemthet. 4 sider: Innsjekk, Pusterom, Små grep, Historikk.

## Isolation Mirror (`isolation-mirror.html`)
Enkeltsides refleksjonsverktøy: skriv en note eller last opp et bilde, få en privat protokoll.

## Fiksa (`fiksa/`)
Reparasjons- og feilsøkingsapp. Bruker beskriver et problem (tekst, symptomer, produktinfo, bilder) på tvers av kategorier — elektronikk, husholdningsapparater, møbler/IKEA, treningsutstyr og annet — og får en konkret, konsis reparasjonsguide (steg, verktøy/deler, vanskelighetsgrad, tidsestimat, sikkerhetshensyn, terskel for å kalle fagperson).

Åpne `fiksa/index.html` (evt. via en enkel lokal HTTP-server, f.eks. `python3 -m http.server`, siden appen bruker en service worker for offline-cache).

**MVP-avgrensninger / videre arbeid:**
- Analysemotoren er regelbasert nøkkelordmatching mot en kuratert kunnskapsbase (`fiksa/knowledge.js`), ikke en ML-modell — dekker 5 kategorier med flere kjente problemtyper hver, pluss en generell fallback-guide.
- Bildeanalyse er MVP-erstattet med manuell tagging per bilde og klikk-baserte annoteringspunkter (nummererte markører med notat), i tråd med spesifikasjonens "MVP: manuell tagging".
- Offline-støtte er implementert som en app-shell service worker (`fiksa/sw.js`) — historikk og genererte guider er alltid tilgjengelige lokalt via `localStorage`, selv offline.
- Dette er en web-basert (HTML/CSS/JS) mini-app, ikke en native React Native/Flutter-app med separat ML-backend. Et evt. produksjonsløp med ekte bildegjenkjenning, delt backend-database og A/B-testing av instruksjonsformat krever egen infrastruktur utover denne mini-app-samlingen.
