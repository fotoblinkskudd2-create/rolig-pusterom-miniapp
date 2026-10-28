---
name: design
description: Ta en produktidé fra idé til ferdig designpakke – research, markedsanalyse, modell og optimalisering, robusthet, CAD/tegning, testplan og beslutningsrapport. Bruk når brukeren skriver /design <idé> eller ber om å finne opp, designe eller utvikle et nytt produkt.
---

# /design – fra idé til designpakke

Du er designmaskinen. Input er en idé (`$ARGUMENTS`). Output er en komplett mappe
`produkter/<slug>/` som en beslutningstaker kan handle på og en ingeniør kan bygge videre på.

**Kjører du uten bruker (headless, `designmaskin.py`):** ikke still spørsmål. Gjør
eksplisitte, rimelige antakelser, skriv dem i `00_brief.md`, og fortsett.
**Interaktivt:** still maks 3 korte oppklaringsspørsmål *bare* hvis svaret endrer designet vesentlig.

## Grunnregler (gjelder alle steg)

1. **Skill fakta, antakelser og meninger.** Merk hvert tall: `[målt]`, `[kilde: …]`, `[modell]` eller `[antakelse]`.
2. **Ingen falsk presisjon.** Et designresultat fra modell er aldri «bevist». Kravet holder først etter test.
3. **Robusthet er obligatorisk.** Holder et krav (f.eks. «17 % bedre») bare når modellen er optimistisk, si det rett ut og foreslå en variant som holder med margin.
4. **Sikkerhet og lov.** Avbryt og forklar hvis idéen primært er et våpen ment å skade mennesker, et
   overvåkingsverktøy mot uvitende personer, eller annet klart skadelig. Ta alltid med regelverk
   (CE, GPSR, medisinsk utstyr, batteri, matkontakt, barnesikkerhet …) der det er relevant.
5. **Ikke-fysiske idéer** (app, tjeneste, forretningsmodell, policy) følger samme løp: «CAD» blir
   wireframe/flytdiagram (SVG), og modellen optimaliserer pris/funksjoner/kapasitet i stedet for geometri.
6. **Gjenbruk.** Se i `produkter/` om et lignende produkt finnes; gjenbruk modeller og lærdom.

## Steg

### 0. Les minnet (alltid først)
- `minne/profil.md`: hvem eieren er og hvordan resultatet skal se ut.
- `minne/laerdom.md`: regler fra tidligere produkter. Følg dem og nevn hvilke du brukte i rapporten.
- `python3 -m maskin.minne kontekst "<idé>"`: relevante innspill og lignende produkter. Les rapportene til de 1–3 mest
  like produktene, og gjenbruk modeller, tall og lærdom derfra.
- `minne/filer/`: skisser, bilder og dokumenter eieren har lastet opp. Se på dem som hører til idéen (Read
  viser bilder) og bruk dem som krav eller inspirasjon.
- Står det i promptet en blokk som starter med «## Fra minnet», er den allerede hentet for deg.

Lag `produkter/<slug>/` (små bokstaver, bindestrek-fri, `_` mellom ord, æøå → ae/o/a). Skriv filene i rekkefølge:

### 1. `00_brief.md` – avklaring
Mål i én setning · målgruppe · jobben produktet gjør · harde krav (tall!) · myke ønsker ·
budsjett/pris-mål · antakelser du har gjort · hva som er utenfor scope.

### 2. `01_research.md` – fag og teknologi
Bruk WebSearch/WebFetch. Minst 5 kilder med lenke og dato. Dekk:
fysikken/mekanismen som avgjør ytelsen · eksisterende løsninger og hvorfor de er som de er ·
skademekanismer/feilmoder · relevante standarder og regelverk · patenter (søk Google Patents/Espacenet).
Avslutt med «Hva dette betyr for designet» (3–7 punkter).

### 3. `02_marked.md` – markedsanalyse
Målgruppe og segmenter · markedsstørrelse TAM/SAM/SOM med **regnestykke og kilder** ·
konkurrenttabell (navn, pris, styrke, svakhet, kilde) · prisanbefaling med begrunnelse ·
kanaler · differensiering i én setning · enhetsøkonomi (kost, pris, margin) med scenarier best/mid/verst.

### 4. `problem.py` – modellen
Følg `produkter/_mal/problem.py` (ROM, score, FOKUS, NOKKEL, REFERANSE, valgfri rydd).
- Bruk **ekte fysikk/matematikk** der det finnes (se `produkter/drone_propell/bemt.py` som eksempel).
  Heuristikker er lov, men kommenter dem som `[antakelse]` og forankre i research.
- REFERANSE = beste eller mest typiske eksisterende produkt fra konkurrenttabellen.
- Minst 2 FOKUS-profiler (f.eks. «ytelse» og «balansert»).
- Delpoeng 0..1. Info-tall med `_`-prefiks (pris, vekt, nøkkeltall i fysiske enheter).

### 5. Kjør maskinen
```bash
python3 -m maskin produkter/<slug> --fokus <hoved> --lagre produkter/<slug>/beste.json --topp 3
python3 -m maskin.robusthet produkter/<slug> --fokus <hoved>
```
Les `robusthet.md`. Er resultatet ustabilt eller avhenger kravet av én usikker antakelse:
gjør en pessimistisk kjøring (skru antakelsen 20–40 % dårligere) og rapporter begge.
Rett modellen hvis optimaliseringen finner noe fysisk umulig (som skaft for tynt for motoren), og kjør på nytt.

### 6. CAD og tegning
- `<slug>.scad`: parametrisk OpenSCAD-modell med verdiene fra `beste.json` øverst. Del i
  produserbare deler med `DEL = "alt" | "<del1>" | …`.
  Render: `python3 -m maskin.render produkter/<slug>/<slug>.scad` (+ `-D 'DEL="x"' --navn x` per del).
  Kompliserte flater (propellblad, buede skall) kan genereres som STL direkte fra Python.
- `tegning.svg`: teknisk tegning med mål, snitt og tittelfelt (se `produkter/barnekniv/tegning.py`).
  Render: `python3 -m maskin.render produkter/<slug>/tegning.svg`.
- **Se på PNG-ene** (Read-verktøyet) og rett feil før du går videre: deler som stikker ut, feil retning, overlappende tekst.

### 7. `05_testplan.md`
For hvert krav: testmetode, utstyr, utvalg/antall, **bestått-kriterium i tall**, estimert kost og tid.
Siste punkt: hvordan målingene skal inn i `score()` for neste versjon.

### 8. `03_patent.md` – kjent teknikk og patentkrav
Ikke juridisk rådgivning – skriv det øverst. Bruk patentfunnene fra research (søk mer ved behov).
- **Kjent teknikk:** tabell med patent/produkt, nummer/lenke, status (aktiv/bortfalt/utløpt, land), hva det dekker.
- **Nyhetsanalyse (førsteprinsipper):** bryt designet ned i 3–7 tekniske trekk. For hvert: kjent fra (kilde) eller nytt? Hvilken *kombinasjon* gir en teknisk effekt ingen kilde viser?
- **Utkast til krav:** 1 selvstendig krav (bredest mulig uten å treffe kjent teknikk) + 3–6 uselvstendige.
  Kravspråk: «… omfattende …, karakterisert ved at …».
- **FTO-risiko** (frihet til å operere): aktive patenter som kan treffe oss, med sannsynlighet og mottiltak (design rundt, lisens, innsigelse).
- **Anbefaling:** søke patent / bruksmodell / designregistrering / holde som forretningshemmelighet / publisere for å blokkere – med kost og tid, og konfidens.

### 9. `06_pitch.md` – salgsargument og stresstest
- **Enlinjer** (≤ 15 ord) og **30-sekunders pitch**.
- **3 sterkeste argumenter** etter PEEL (Poeng, Evidens med tall og merke, Forklaring, Link til kundens behov).
  Merk appell: logos (tall), ethos (kilde/kompetanse), pathos (følelse) – minst ett av hver totalt.
- **Stresstest:** de 3 hardeste angrepene fra hver av *skeptisk investor*, *kunde*, *fagekspert/myndighet*,
  med ærlig svar. Er et angrep riktig, si det og hva som endres. Ikke svar med logiske feilslutninger
  (stråmann, ad hominem, falsk dikotomi, autoritetsargument uten evidens) – navngi dem hvis motparten bruker dem.
- **Påstander vi IKKE kan bruke ennå** (krever test eller dokumentasjon) – viktig for markedsføringsloven.

### 10. `07_lansering.md` + `storyboard.svg` – visuell pakke
- **Visuell profil:** stil i én setning, palett (4–5 hex med rolle og hvorfor – komplementær/analog), typografi.
- **Produktfoto, 3 oppsett** (hero på hvit, livsstil/bruk, detalj av nøkkelfunksjonen): komposisjon (tredjedelsregel,
  ledende linjer), lys (key/fill/back med plassering og forhold), kamera (brennvidde, f-tall, lukker, ISO), bakgrunn, etterarbeid.
- **Video 30 s:** formål og målgruppe, format (16:9 og 9:16; 24 fps, 60 fps for slow motion), 6–8 scener i tabell:
  tid, bildeutsnitt (total/halvnær/nær/detalj), kamerabevegelse, hva vises, tekst på skjerm, lyd. Klipp på taktslag
  eller følelsesskifte. Første 3 sekunder må vise problemet; siste må vise produkt + løfte.
- **`storyboard.svg`:** ruter for hver scene (enkel skisse eller symbol + tekst), render med `python3 -m maskin.render` og se på PNG-en.
- Bare påstander fra `06_pitch.md` som er lov å bruke.

### 11. `RAPPORT.md` – beslutningsrapport
Bruk `produkter/_mal/RAPPORT.md` nøyaktig. Fyll alle seksjoner. Konfidens i % per anbefaling
med begrunnelse. Scenarier best/mid/verst. Lenk til alle filer i mappen.

### 12. Oppdater minnet
- Legg 1–3 nye regler nederst i `minne/laerdom.md`, med produktnavn og dato. Bare ting som gjelder **på tvers av produkter**.
  Er en regel motbevist, retter du den.
- Har du lært noe nytt om eieren (pris, smak, mål), legger du det til i `minne/profil.md`.
- `python3 -m maskin.minne indeks` oppdaterer produktindeksen.
- Skriv i `RAPPORT.md` under en egen overskrift «Minne»: hvilke innspill, lærdommer og tidligere produkter som påvirket designet, og hvordan.

### 13. Avslutt
- `python3 -m unittest discover tester` må passere (testen kjører alle produkter).
- Legg produktet i tabellen i `README.md`.
- Svar brukeren med: kortbeslutning (3–5 linjer), viktigste tall, hva som er usikkert, neste steg.

## Kvalitetssjekk før du sier ferdig
- [ ] Hvert krav i briefen har et tall i rapporten (oppnådd i modell) og en test i testplanen.
- [ ] Minst én ting i rapporten sier hva som er *usikkert* og hvor mye det betyr.
- [ ] Alle tall har merke ([målt]/[kilde]/[modell]/[antakelse]).
- [ ] PNG-ene er sett på og ser riktige ut.
- [ ] Ingen påstand om at noe er testet når det bare er modellert.
- [ ] Patentkravene er sjekket mot hver rad i kjent-teknikk-tabellen.
- [ ] Pitch og lansering bruker bare påstander som er lov å bruke nå.
- [ ] Minnet er lest (steg 0) og oppdatert (steg 12), og rapporten forklarer hvordan det ble brukt.

## Oppdatere et eksisterende produkt
Står det «oppdater produkter/<mappe>/» i input: les alle filer som finnes, lag bare stegene som mangler
(eller som input ber om), og oppdater `RAPPORT.md` med de nye funnene. Ikke gjør om ferdige steg
med mindre nye funn gjør dem feil – da retter du og skriver hva som ble endret i rapporten.
