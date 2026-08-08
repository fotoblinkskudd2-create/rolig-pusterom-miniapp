# CLAUDE.md — rolig-pusterom-miniapp

## Hva dette er
Pusterom er en rolig mini-app som demper stress og nedstemthet i øyeblikket.
Fire sider: Innsjekk (humør + notat), Pusterom (styrt pust), Små grep
(mikro-handlinger), Historikk (oversikt uten prestasjonspress). Ren
HTML/CSS/JS, ingen backend, ingen avhengigheter — alt lagres lokalt i
nettleseren.

## Kjerneverdier
Disse er utledet fra koden selv, ikke oppfunnet — behold dem som filter for
enhver endring:

1. **Trygghet før alt.** Appen åpner med "Du er trygg her." Ingen krav,
   ingen skam. Selv streak-telleren sier "Det er fint" ved 0.
2. **Lavterskel.** Ingen innlogging, ingen onboarding, ingen server. Åpne
   og bruk med én gang.
3. **Personvern by design.** All data blir i `localStorage` på enheten.
   Ikke legg til analytics, tracking eller ekstern lagring uten eksplisitt
   ønske fra bruker.
4. **Enkelhet over funksjoner.** Ett HTML-dokument, ingen build-steg,
   ingen rammeverk. Legg til funksjonalitet forsiktig — kompleksitet er en
   reell kostnad i en app som skal senke skuldrene til folk.
5. **Ikke-dømmende språk.** Skriv aldri "du burde", "du må", "bare". Bruk
   varm, anerkjennende tone: "Det er greit", "Det er bra at du sjekket
   inn."
6. **Kroppsbasert ro.** Pusteøvelsen bruker forlenget utpust (4-2-6 sek) —
   en kjent teknikk for å aktivere det parasympatiske nervesystemet. Behold
   denne asymmetrien i fremtidige pusteøvelser.

## Designspråk
- Palett: dempet grønn/blå/beige (`--accent: #a8c5b0`, `--soft-blue:
  #d4e4f0`, `--soft-beige: #f0e9df`)
- Runde hjørner (16px), myke skygger, ingen skarpe kanter eller sterke
  farger
- Mobile-first, `max-width: 440px`, bunn-navigasjon med 4 faner
- System-font, ingen eksterne fonter/CDN-avhengigheter

## Tekniske konvensjoner
- Vanilla JS, ingen npm/build-steg med mindre eksplisitt bedt om
- All persistens via `localStorage` (nøkler: `checkins`, `doneActions`)
- Norsk (bokmål) i all brukervendt tekst
- Test i nettleser før en endring rapporteres som ferdig

## Arbeidsmåte for fremtidige økter
- Ved nye funksjoner: vurder om det hører hjemme i én av de fire
  eksisterende sidene, eller om det er en tydelig egen femte side — ikke
  overbelast Innsjekk eller Pusterom
- Ved UI-endringer: behold paletten og rundingen; sjekk kontrast og
  touch-targets på mobil
- Ikke legg til pushvarsler, gamification-poeng eller prestasjonstrykk —
  det bryter med kjerneverdi 1 og 5
- Hvis appen vokser forbi ett HTML-fil: splitt i `index.html` + `app.js` +
  `style.css` først når filen faktisk blir vanskelig å navigere, ikke før

## Idégrunnlag
Se `docs/idemylder.md` for vibe-koder, produktideer og visuell retning
bygget videre på disse verdiene.
