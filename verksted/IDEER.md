# IDEER — fra søppelbøtta på internett til ti apper på Hjem-skjermen

Klokka er 19:28 en søndag i oktober, og GitHub sier `403 API rate limit exceeded` til meg midt i et søk. Reddit sier ingenting. Reddit slipper meg ikke inn i det hele tatt – `unable to fetch`. Så jeg gjør det alle gjør: graver i søkeresultat-snippets, Product Hunt-kommentarer og speilsider, som en rotte i en container bak Rema.

Det jeg fant var ikke nytt. Det var gammelt, vondt og ubesvart. Folk betaler for ting de har glemt. Folk mister kvitteringer. Folk scroller til øynene blør. Folk har gjeld de ikke tør se på. Og hver eneste app som lover å fikse det, vil ha **konto, abonnement og dataen din på en server i Virginia**.

Det er smutthullet.

---

## Del 1 — Konseptene (Vibe Code · full stack · iOS web · React)

**Grunnregel for alle ti:** React-PWA, lokal-først, ingen konto, ingen backend som kan dø eller selge deg. Telefonen *er* serveren. Alt kan legges på Hjem-skjermen og virker uten nett.

«Full stack» her betyr: UI (React) → tilstand (hooks) → lagring (localStorage + IndexedDB) → synk/deling (komprimert JSON i lenka, `.ics`-filer, Snarveier-URL-er) → offline (service worker). Ingen database å drifte. Ingen GDPR-mareritt. Ingen månedlig regning til Vercel.

---

## Del 2 — GitHub: smutthullene

Ikke hacking. Hull i *markedet* og hull i *plattformen* – ting de store ikke gidder, eller ting iOS egentlig ikke vil at du skal gjøre, men lar deg gjøre likevel.

| # | Smutthull | Hvorfor det virker | Brukt i |
|---|---|---|---|
| 1 | **`.ics`-kalenderfiler i stedet for push** | Web-push på iOS krever at appen er installert og er notorisk ustabil. En kalenderhendelse med `VALARM` kommer *alltid*. | Abo-Liket, Kvitt |
| 2 | **Snarveier → «Når app åpnes» → Åpne URL** | iOS lar ikke en webapp blokkere Instagram. Men Snarveier-automasjon kan kaste deg inn i en webapp hver gang Instagram åpnes. Med en tidsstempel-fil i iCloud unngår du loop. | Doom-Brems |
| 3 | **`?add=tekst` som API** | En statisk side har ingen API. Men en URL-parameter + «Åpne URL» i Snarveier = «Hei Siri, dump». | Dump |
| 4 | **Hele databasen i lenka** | Ingen server for deling? `CompressionStream('deflate-raw')` + base64url i `#hash`. Hash-delen sendes aldri til noen server. | Splitt |
| 5 | **Støy som WAV-blob i `<audio>`** | Web Audio dempes av lydløs-bryteren på iPhone. `<audio>`-elementet gjør ikke det – og spiller videre med låst skjerm. | Brunstøy |
| 6 | **Én origin, mange apper** | Hver undermappe har eget manifest → eget ikon på Hjem-skjermen. Én service worker cacher alt. | Hele verkstedet |
| 7 | **Bilder i IndexedDB, krympet med canvas** | localStorage dør ved ~5 MB. En 12 MP kvittering krympes til ~150 KB JPEG og lagres som Blob. | Kvitt |
| 8 | **Offentlig strømpris-API med CORS** | hvakosterstrommen.no gir Nord Pool-priser gratis, uten nøkkel. Cachet lokalt for offline. | Strømvakt |

**Fra GitHub-issues:** de mest stemte åpne feature-requests (f.eks. Steam-for-Linux Wayland, 1 847 reaksjoner; Firebase web-crashlytics, 934) er fulle av samme mønster: brukere som venter *år* på at en stor aktør skal gidde. Små, fokuserte verktøy som bare *gjør det* vinner der.

---

## Del 3 — Reddit: det alle klager over (og som jeg gidder å fikse)

Funnene, kokt ned:

- **Abonnement som spiser deg.** Å glemme å si opp er bokstavelig talt et ADHD-symptom; abonnementsmodellen tjener på det. «Smart abonnementssporer med oppsigelsespåminnelse» står øverst på 2026-lister over validerte app-ideer. → **Abo-Liket**
- **ADHD-apper er for kompliserte.** Folk vil ha *én boks*, ikke tags, prosjekter og hierarkier. → **Dump**
- **«One-time payment, or they'll never see a dime from me.»** Abonnementstrøtthet overalt. → hele verkstedet er gratis og lokalt.
- **Splitwise-opprøret.** Dagsgrense på utgifter bak paywall fikk folk til å lete etter alternativer. → **Splitt**
- **Doomscrolling.** «Jeg åpner appen for én ting og blir dratt inn i en feed.» Variable belønninger = spilleautomat. Opal, one sec og co. koster penger. → **Doom-Brems**
- **Finans er nisjen med flest «would pay»-signaler** (193 i én 2026-analyse). → **Gjeld-Snøball, Kjøpekarantene, Kvitt**
- **Brun støy / body doubling** er ADHD-folkemedisin på TikTok og r/ADHD. → **Brunstøy**
- **Norsk kontekst:** strømpris, reklamasjonsrett, Klarna-kultur. → **Strømvakt, Kvitt, Kjøpekarantene**
- **Plurale systemer / DID** mangler trygge, lokale verktøy for front-logg og intern kommunikasjon. → **Systemtavla**

Kilder (sett gjennom søk – Reddit selv var sperret fra dette miljøet):
- [How to track subscriptions when you have ADHD – subtracker.io](https://subtracker.io/best/subscription-tracking-with-adhd)
- [ANCHOR – calm ADHD routine app with no subscription (Product Hunt)](https://www.producthunt.com/p/anchor-14/building-a-calm-adhd-routine-app-with-no-subscription-what-features-actually-stick-for-you)
- [ADHD app with no subscription – DEV](https://dev.to/nucleusos/adhd-app-with-no-subscription-focus-and-organization-without-a-paywall-2fgk)
- [How to find app ideas on Reddit 2026 – Context Studios](https://www.contextstudios.ai/blog/how-to-find-app-ideas-on-reddit-the-ultimate-guide-for-founders-2026)
- [Mobile app ideas 2026 – BigIdeasDB](https://bigideasdb.com/mobile-app-ideas-2026)
- [Rewi – privacy-first subscription tracker](https://www.producthunt.com/p/rewi-subscription-manager/rewi)
- [Sora / slop / doomscrolling – Fortune](https://dc.fortune.com/2025/10/01/openai-sora-social-media-app-slop-doomscrolling-wellbeing)
- [r/ADHD: What ADHD apps do you use? (speil)](https://cal1.lr.ggtyler.dev/r/ADHD/comments/1ervz6i/what_adhd_apps_do_you_use/li2jmpr)
- GitHub: [steam-for-linux#4924](https://github.com/ValveSoftware/steam-for-linux/issues/4924), [firebase-js-sdk#710](https://github.com/firebase/firebase-js-sdk/issues/710)

---

## Del 4 — De ti

| # | App | Smerten | Kjernegrep |
|---|---|---|---|
| 1 | **Abo-Liket** | Glemte abonnement, prøveperioder som biter | Månedsblødning, «Drep»-knapp, sparekirkegård, `.ics`-varsler |
| 2 | **Dump** | Hodet fullt, ADHD-apper for tunge | Én boks, «Én ting»-modus, Siri-snarvei via `?add=` |
| 3 | **Kvitt** | Kvitteringer bleker, ingen vet reklamasjonsfristen | Foto → IndexedDB, 2/5 år-nedtelling, ferdig reklamasjonsbrev |
| 4 | **Splitt** | Splitwise-paywall | Grupper, minimale overføringer, hele gruppa i en lenke |
| 5 | **Doom-Brems** | Doomscrolling | Snarveier-automasjon, pust, alternativ, statistikk |
| 6 | **Strømvakt** | Når er strømmen billig? | Spotpris NO1–5, billigste vindu for vask/elbil, støtte/Norgespris |
| 7 | **Kjøpekarantene** | Impulskjøp og delbetaling | Nedtelling 24t–30d, refleksjonsspørsmål, delbetalings-sannhet |
| 8 | **Gjeld-Snøball** | Gjeld man ikke tør se på | Snøball vs skred, gjeldfri-dato, graf, «du betaler ikke nok»-alarm |
| 9 | **Brunstøy** | Fokus, ADHD | Brun/rosa/hvit/regn, kroppsdobbel-økt, wake lock |
| 10 | **Systemtavla** | Plurale systemer mangler trygt verktøy | Hvem er fremme, tavle mellom medlemmer, tapt tid, grounding, PIN-gardin |

Bonus som ikke kom med denne runden: **offline stemmenotat med transkripsjon** (nr. 2 på 2026-listene) – Safari sin talegjenkjenning er for ustabil i standalone-modus til at jeg vil love den.

Promptene ligger i [`PROMPTS.md`](./PROMPTS.md). Koden ligger i `src/apps/`. Ferdig bygg ligger i `../leveranse/verksted-app.zip`.
