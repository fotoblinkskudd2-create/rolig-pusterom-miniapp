# RESEARCH — hvor smerten bor, og hullene i gjerdet

Kl. 19-noe, 4. oktober 2026. Jeg graver gjennom Reddit-speil, GitHub-issues og App Store-søppel mens
renta på en eller annen Klarna-faktura tikker et sted i bakgrunnen. Spørsmålet er enkelt:
**hva klager folk over hver eneste dag, som én person med en iPhone og React kan fikse på en kveld?**

Ærlig om metoden: Reddit selv og de fleste speilene var sperret av nettverket i dette miljøet. Jeg brukte
websøk mot Reddit-diskusjoner, GummySearch-sammendrag, Product Hunt-tråder og GitHub-søk. Tallene under er
fra kildene som er lenket. Jeg har ikke lest hver tråd selv.

---

## 1. Hva folk faktisk klager over (Reddit og omegn)

| Smerte | Bevis | → App |
|---|---|---|
| **Abonnementsfellen.** Glemte prøveperioder, abonnementer man ikke bruker | 69 % har blitt trukket etter å ha glemt å si opp en gratis prøveperiode; 54 % har oppdaget et abonnement de hadde glemt ([BestMoney](https://www.bestmoney.com/financial-advisor/learn-more/how-to-cancel-subscriptions)). Ironien: alle abonnement-trackerne i App Store tar selv abonnement. | **Prøvefella** |
| **Abonnementstrøtthet generelt.** «Du finner knapt en grei app til 50 kr lenger» | [Lemmy/Reddit-tråd om subscription fatigue](https://lemmy.dbzer0.com/post/224429/361920), [Fast Company om app fatigue](https://fastcompany.co.za/tech/2025-01-29-app-fatigue-its-time-to-rethink-apps-business-models/) | Alle 10 er gratis, uten konto og uten abonnement |
| **ADHD + abonnement = selvskading.** ADHD-hjerner glemmer å si opp, og appen blir forlatt etter én uke med nyhetens interesse | [DEV: ADHD-app uten abonnement](https://dev.to/nucleusos/adhd-app-with-no-subscription-focus-and-organization-without-a-paywall-2fgk), [Product Hunt: «calm ADHD routine app with NO subscription»](https://www.producthunt.com/p/anchor-14/building-a-calm-adhd-routine-app-with-no-subscription-what-features-actually-stick-for-you) | **Startknappen** |
| **Personvern-folket vil ikke gi fra seg bank-innlogging.** r/personalfinance vil ha budsjett uten bankkobling | [Finny: budget apps Reddit recommends 2026](https://getfinny.app/blog/best-budget-apps-reddit-recommends-2026) | **Gjeldsradar** (manuelle tall, null bankkobling) |
| **Doomscrolling.** 186 telefonsjekker per dag; 2 t daglig = 730 t i året | [Jomo: doomscrolling 2026](https://jomo.so/blog/5-hacks-to-stop-doomscrolling-in-2026) | **Doombrems** |
| **«Pantry → oppskrift».** r/SomebodyMakeThis: «registrer ingrediensene du har, se hva du kan lage nå». En MVP fikk 100k+ nedlastinger | [GummySearch r/SomebodyMakeThis](https://gummysearch.com/r/SomebodyMakeThis) | **Kjøleskapet** |
| **Spleising uten Splitwise-paywall.** Splitwise har strupet gratisversjonen, og nye spleise-apper dukker opp hele tiden | [SettleTab på hunted.space](https://hunted.space/product/settletab), [Split Check i App Store](https://apps.apple.com/app/id6746783998) | **Spleiselapp** |
| **2026-trender:** AI-abonnementsstyring, mental helse-journal, «plain-language money tools» | [GummySearch](https://gummysearch.com/r/SomebodyMakeThis) / bigideasdb-oppsummering | **Inkasso-skjold**, **Minnehull** |

Og så de to som ikke kom fra Reddit, men fra repoet ditt og livet rundt det: **Kjøpebrems** (Lego på Klarna
kl. 14, ingen minne kl. 16) og **Minnehull** (DID/dissosiasjon – tid som forsvinner, spor i bank-appen).
Ingen av de store appene lager dette, fordi det ikke er et marked med investorpenger. Det er et marked med mennesker.

## 2. GitHub — hvor gigantene er sta

GitHub-søk etter de mest reagerte åpne feature-requestene viser samme mønster: folk ber om **lokal kontroll,
flere kontoer, eksport, offline** – og venter i årevis. Eksempler fra søket (åpne per i dag):

- `anthropics/claude-code#18435` – multi-konto-bytte, 1 000+ reaksjoner
- `hashicorp/terraform#13022` – variabler i backend-config, åpen siden 2017, 1 300 reaksjoner
- `microsoft/vscode#70764` – VS Code for iPad, 2 100 reaksjoner

Lærdommen for oss: **store team sier nei til det enkle fordi det ikke skalerer.** Én person kan si ja.
Ti små apper som gjør én ting hver, uten konto, slår én app med 40 funksjoner og en paywall.

## 3. Smutthullene (de lovlige)

Ikke hacking. Hull i *gjerdet rundt iPhone*, der Apple og abonnementsøkonomien har bygget et bomsystem.

1. **PWA forbi App Store.** En webapp på Hjem-skjerm: ingen utviklerkonto til 99 dollar i året, ingen App Review,
   ingen 30 % kutt, oppdatering på sekunder. iOS 26 åpner nettsteder lagt på Hjem-skjerm som webapper som standard
   ([Monterail](https://monterail.com/blog/pwa-for-apple-ios), [MagicBell](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide)).
2. **Kalender-alarmer i stedet for web push.** Web push på iOS virker bare fra Hjem-skjerm, og abonnementene
   «forsvinner» fortsatt tilfeldig ([webscraft](https://webscraft.org/blog/pwa-pushspovischennya-na-ios-u-2026-scho-realno-pratsyuye?lang=en)).
   En `.ics`-fil med `VALARM` lagt i Apple Kalender varsler alltid, offline, uten server. Brukt i Prøvefella,
   Garantiboksen, Inkasso-skjold og Kjøpebrems.
3. **Snarveier-automasjon som Skjermtid-API.** «Når TikTok åpnes → åpne URL». Native apper som *one sec* tar
   betalt for dette. Doombrems gjør det gratis, med en 5-minutters fil-sperre mot evig løkke.
4. **Lenka ER databasen.** Spleiselapp komprimerer hele regnskapet (`CompressionStream('deflate-raw')`) inn i
   `#hash`. Ingen server, ingen konto. Hash-en sendes aldri til noen server, heller ikke den som hoster sida.
5. **Ekte kryptering i nettleseren.** WebCrypto (PBKDF2 → AES-GCM) i Minnehull. PIN-en er nøkkelen, ikke en skjermlås.
6. **Fellen du må kjenne:** En Hjem-skjerm-app på iOS har **egen lagring**, adskilt fra Safari. Sletter du ikonet,
   forsvinner dataene. Derfor har alle 10 appene «Ta backup / Gjenopprett» som JSON-fil. Og Doombrems logger i
   Safari, fordi Snarveier alltid åpner URL-er der.
