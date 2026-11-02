# 4. Droner i kulde: «Varmt batteri, kaldt luftrom»

## Problemet

Litium-batterier mister kapasitet i kulde, og flytiden synker kraftig. Det gjelder både i Norden og i områder med ekstrem vinter. Løsningene som finnes bruker energi fra batteriet selv, og det taper det som er igjen. Og mange kompenserer med å bare fly mindre, noe som koster verdi.

## Hypotese

Det er dyrt å varme et batteri under flukt fra batteriet selv. Det er billig å varme det **på bakken, med nettstrøm**, før start, og så holde varmen med isolasjon. Flytiden avhenger av hvor kaldt batteriet er under flukt, ikke av hvor kaldt luften er.

To tiltak:
1. **Forvarming fra nett** (eller fra ladeboks) før start.
2. **Isolasjon med faseendrende materiale (PCM)** som holder temperaturen stabil i noen minutter ekstra.

## Prototype

- **Batterihylse:** `cad/batterihylse.scad`. Parametrisk kasse rundt et batteri, med 15 mm isolasjon, PCM-lomme over batteriet og kontaktspor. Dimensjoner er eksempel (6S, 150 × 75 × 40 mm). Sett fra batteriets datablad.
- **Flytidsmodell:** `sim/flight_model.py`. Simulerer flytid ved ulike temperaturer, med og uten hylse. Parametrene er placeholdere (merket i koden). Fyll inn fra datablad og målinger.
- **Skisse:** `design.svg`.
- **Produksjon (konsept):** isolasjon i skum eller aerogel, PCM i forseglet pose, skall i laminert plate. Ikke 3D-print.

## Resultat fra modellen

Kjørt med placeholder-parametrene i `flight_model.py`:

| Utetemperatur | Uten hylse (min) | Med hylse, forvarmet til 10 °C (min) |
|---------------|------------------|--------------------------------------|
| 10 °C         | 14.2             | 14.2                                 |
| 0 °C          | 12.9             | 14.0                                 |
| -10 °C        | 11.6             | 13.7                                 |
| -20 °C        | 10.4             | 13.5                                 |

*Tallene er en konsekvens av placeholder-verdiene i `flight_model.py`. De er ikke målinger. Ved -20 °C gir hylsen +30 % i denne modellen, akkurat på suksesskriteriet. Det er et resultat av antakelsene, ikke et bevis.*

Det viktige funnet er strukturelt: forvarming fra nett er gratis for flytiden. Varme fra batteriet selv trekker fra flytiden. Modellen viser det, men styrken i effekten avhenger av tidskonstanten (30 min er en antakelse) og kapasitetskurven (0,8 % per grad er en antakelse). Begge må måles.

## Testplan

1. **Kapasitet vs. temperatur.** Lad og utlad batteriet ved -20, -10, 0, 10 og 25 °C i kjølekammer. Dette er den viktigste kurven i hele prosjektet.
2. **Termisk tidskonstant.** Varm batteriet til 10 °C, og mål hvor raskt det avkjøles med og uten hylse, i stillestående luft og i vind.
3. **Forvarmingstid og -energi.** Hvor lang tid fra nettstart til ønsket temperatur? Hvor mye energi?
4. **Flytest.** Samme drone, samme last, to batterier. Logg spenning, strøm og temperatur. Kun i henhold til lokale regler for droneflyging.

Suksesskriterium (forslag): flytid ved -20 °C økes med minst 30 % sammenlignet med referanse, uten at forvarming tar mer enn 5 minutter. `[verifiser: kriterium]`

## Markedsanalyse (utkast)

- **Kunder:** bedrifter som flyr drone i kulde (inspeksjon av kraftledninger, landbruk, redning, kartlegging), og i en viss grad hobby.
- **Verdi:** tapt flytid og flere batteribytter per oppdrag. `[verifiser: kostnad per oppdrag i kalde områder]`
- **Konkurranse:** varmeelementer i batteri, batteri-isolasjon fra droneprodusenter, og valg av batterikjemi (f.eks. LiFePO4 for kulde). Vår tilnærming er ekstern forvarming og PCM, som kan kombineres med andre tiltak.
- **Sikkerhet:** litium-batterier skal ikke lades under 0 °C uten egnet styring. Forvarming må ha temperaturbegrensning og overvåkning. Dette må sjekkes mot batteriprodusentens krav.
- **Modenhet:** konsept og simulering. Ingen flytest er gjort.

## Markedsføring

**Gonzo-versjon:**
> Jeg står på et jorde i minus tjue med en drone i hendene, et batteri som føles som en isklump, og en flytid som krymper for hvert minutt jeg står her. Dronen skal fly over en kraftlinje og finne en feil. Batteriet sier nei. Jeg sier: hvorfor skal du varme deg selv med egne penger? Varm på bakken, med nettstrøm. Hold varmen med isolasjon. Så flyr du. Sånn enkelt, og sånn irriterende at ingen har gjort det ferdig.

**B2B-versjon:**
> Batterihylse med forvarming fra nett og PCM-isolasjon. Mer flytid i kulde uten å tappe batteriet under flukt. Prototype under testing.

*Merk: «mer flytid» er et mål. Ikke bruk før flytesten er gjennomført.*

## Feilsøking og kjente feilkilder

| Symptom | Mulig årsak | Hvordan sjekke |
|---------|-------------|----------------|
| Batteriet slutter brått under flukt | Cellene er kaldere enn sensor viser, eller spenningsfall under last | Temperatur på flere celler, spenning under last |
| Forvarming er for treg | Varmeelement for svakt eller varmekontakt dårlig | Mål temperaturstigning per minutt |
| PCM smelter ikke/stivner ikke | Feil smeltepunkt for ønsket temperatur | DSC eller enkel test med kjent smeltepunkt |
| Kondens inni hylsen | Ingen fuktsperre, varmt batteri i kaldt luftrom | Sjekk for fukt etter test |
| Flytiden faller mer enn modellen viser | Modellen mangler strømforbruk fra varme eller last | Sammenlign logg med modell |

## Åpne spørsmål

- Hvilken batterikjemi og størrelse skal modelleres? (Placeholder er 6S 5 Ah.)
- Hva er tillatt temperaturområde for lading, ifølge batteriprodusent?
