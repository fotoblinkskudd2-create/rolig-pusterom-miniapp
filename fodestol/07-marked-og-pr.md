# 07 — Presentasjon, PR og markedsføring

## 7.1 Navn

**LIVA** — fra norsk *liv* og *li* (å la noe gå sin gang). Kort, uttales likt på norsk, engelsk, tysk, fransk, polsk. Ingen negative betydninger funnet i de største EU-språkene (sjekk formelt). **Varemerkesøk (EUIPO/Patentstyret, klasse 10 og 20) er ikke gjort** — må gjøres før navnet brukes eksternt.

Alternativer hvis LIVA er opptatt: **OPPA** (opp + pappa/mamma; «oppreist»), **HALDA** (å holde), **REIS**.

Produktfamilie:
- **LIVA Plattform** — hovedprodukt
- **LIVA QBL** — blodtapsmodul, også som retrofit for andre senger/krakker
- **LIVA Sadel** — jordmors stol

## 7.2 Posisjonering

> **Kvinnen velger stillingen. Jordmor velger høyden.**

Underlinjer:
- *Krakkens fysiologi. Sengens trygghet. Én plattform.*
- *Ett grep til flatt.*
- *Blodtap er et tall, ikke et blikk.*

## 7.3 Konkurransefortrinn (rangert)

1. **Uavhengige akser** — eneste plattform der krakkgeometri for kvinnen kombineres med ergonomisk arbeidshøyde for jordmor. Direkte svar på jordmødrenes viktigste hverdagsproblem.
2. **Mekanisk AKUTT FLAT fra alle moduser** — gjør det tryggere for avdelingen å si ja til oppreiste stillinger.
3. **Integrert QBL** — objektiv blodtapsdata i hver fødsel. Gjentakende inntekt fra forbruk.
4. **Hygiene uten trekk** — kortere omløp på fødestua.
5. **Nordisk design og klinisk forankring** — utviklet med norske jordmødre, perinealprogrammets land.

**Patenterbarhet (må vurderes av patentrådgiver):** kombinasjonen hestesko-sete + uavhengig fotbrett på løfteplattform + perineum-lås; mekanisk flerseksjons AKUTT-utløsning; QBL integrert i perinealsone. Gjør nyhetssøk (Espacenet) før noe vises offentlig — *publiser ikke presentasjonen før patentsøknad er inngitt eller bevisst valgt bort.*

## 7.4 Målgrupper og budskap

| Målgruppe | Hva de bryr seg om | Budskap | Bevis |
|---|---|---|---|
| Jordmødre | Rygg, kontroll, perinealstøtte, enkelhet | «Slutt å jobbe på gulvet.» | Ergonomi-lab-data (P0/P1), demo |
| Fødselsleger | Sikkerhet, akutt, instrumentell | «Ett grep til flatt. Gyn-modus på 950 mm.» | AKUTT-tidsmåling, simuleringsdrill |
| Fødende | Kontroll, verdighet, bevegelse | «Føde slik kroppen vil.» | Brukerhistorier, CEQ2-data |
| Avdelingsledelse | HMS, sykefravær, kapasitet, rengjøring | «Færre løft, raskere omløp, data på blodtap.» | Tidsstudier, HMS-data |
| Innkjøp/MTU | TCO, service, standarder, CE | «Standardkomponenter, 30-min modulbytte, full 60601-dokumentasjon.» | Teknisk fil, servicemanual |
| Investorer | Marked, margin, skalerbarhet, risiko | «En kategori uten fornyelse på 20 år, med gjentakende forbruksinntekt.» | Markedsestimat, plan, regulatorisk strategi |

## 7.5 Marked og forretningsmodell (estimater — **[verifiser]**)

- **EU/EØS**: ca. 3,7–4 mill. fødsler/år. Antall fødestuer i størrelsesorden 15 000–25 000 (anslag basert på ~150–250 fødsler per rom per år).
- **Utskiftingssyklus** for fødesenger: 10–15 år → ~1 000–2 500 enheter/år i EU som erstatningsmarked.
- **Realistisk mål år 5 etter CE**: 2–4 % av erstatningsmarkedet + Norden-fokus → 150–300 enheter/år ≈ €2,5–5,5 mill. maskinvare + QBL-forbruk (~150 fødsler × €3 × installert base).
- **Modeller**: Salg, leasing (5 år inkl. service), eller «per fødsel»-avtale for små fødestuer.
- **Go-to-market**: Norge (pilot via innovasjonspartnerskap) → Norden (felles anbud, nordisk jordmortradisjon) → DACH/NL/UK via distributør.
- **Konkurrentrespons**: Store aktører kan kopiere løftet krakk på 3–4 år. Forsvar: patenter, klinisk data, førstegangs-relasjoner, QBL-økosystem.

## 7.6 Visuell identitet

| Element | Valg | Begrunnelse |
|---|---|---|
| Logo | Ordmerke **LIVA** i rund geometrisk sans, «V» utformet som en åpen bue (hestesko sett ovenfra) | Produktets kjerne som symbol |
| Primærfarge | Havre `#D8C7A4` | Varm, ikke-klinisk, matcher puter |
| Sekundær | Salvie `#7FA08A`, Skifer `#3B4045` | Ro, nordisk natur, kontrast |
| Signalfarge | Akutt-rød `#C8341F` — *kun* for AKUTT | Rød betyr én ting |
| Typografi | Inter / Söhne-lignende grotesk; tall i tabulær variant | Lesbarhet, tekniske tall |
| Foto-stil | Varmt dagslys, mennesker i bevegelse, aldri ansiktsløse «pasienter», jordmorens hender i fokus | Verdighet |
| Tone | Kort, konkret, ingen superlativer | Helsepersonell avviser markedsføringsspråk |

## 7.7 Renderspesifikasjon (for 3D-visualisør / Blender / KeyShot)

Eksporter fra `cad/liva.scad` (STL per modus) → retopologi/avrunding i Blender (CAD-modellen har bevisst skarpe kanter).

| Bilde | Modus | Scene | Kamera | Lys |
|---|---|---|---|---|
| Hero | Krakk | Lys fødestue, tregulv, lin-gardin, U-bøyle oppe, sadelstol tom | 3/4 front, 35 mm, øyehøyde 1 100 | Myk dagslys fra venstre, 5 500 K |
| Detalj 1 | — | Hesteskosete + fotbrett + LED | Nær, 85 mm, f/2.8 | Arbeidslys på, rom dimmet |
| Detalj 2 | — | Rød AKUTT-spak i bruk (hånd) | 50 mm | Nøytralt |
| Sekvens | Alle 6 | Hvit bakgrunn, samme kamera | Ortografisk side | Studio |
| Livsstil | Krakk | Kvinne (modell, kledd) + jordmor på sadel, partner bak med hender på U-bøylen | 35 mm | Kveldslys, varme lamper |
| Teknisk | Sprengskisse | Hvit | Isometrisk | — |

Materialer: puter matt PU (roughness 0,6, havre), chassis pulverlakk (roughness 0,45), rustfritt (børstet), TPE (matt mørk).

**Merk:** Bildene i `render/` er rå OpenSCAD-forhåndsvisninger for proporsjon og funksjon — ikke markedsføringsbilder.

## 7.8 Reklamemateriell (utkast)

**Annonse fagblad (Tidsskrift for Jordmødre / Midwifery-konferanse):**
> *Bilde: jordmor på sadelstol, hender ved albuehøyde, kvinne oppreist på løftet hestesko.*
> **Du har jobbet på gulvet lenge nok.**
> LIVA gir kvinnen krakkens fysiologi og deg en arbeidshøyde som ikke ødelegger ryggen. Ett grep til flatt hvis noe skjer.
> *Book en demo i simuleringssenteret.*

**Messe-stand (NJF, ICM, NFOG):** Fysisk LIVA i krakkmodus + vanlig krakk side om side. Besøkende jordmødre setter seg på sadelstolen og prøver å nå en perineal-modell — begge stasjoner. Ergonomi-sensor viser ryggvinkel live på skjerm. *Opplevelsen er argumentet.*

**LinkedIn/presse-hook:** «Fødestolen er beskrevet allerede i antikken. Nå har den fått en løftesøyle.»

**Innkjøpsark (1 side):** spesifikasjonstabell fra `04`, standarder fra `05`, servicevilkår, TCO 10 år.

## 7.9 Pitch-manus (10 min, 10 slides — se `presentasjon/index.html`)

1. **Åpning:** «I Norge føder ca. 150 kvinner hver dag. Mange vil opp. Sengen drar dem ned — og krakken drar jordmor ned på gulvet.»
2. **Problemet:** Bilde av jordmor knelende ved krakk. Tre svakheter: arbeidshøyde, akutt, blodtap.
3. **Evidensen:** Cochrane: oppreist → færre instrumentelle. Men flere rifter og mer blodtap. BUMPES: med epidural, legg deg på siden. → Utstyret må kunne alt.
4. **Innsikten:** To akser. Kvinnen velger stilling, jordmor velger høyde.
5. **LIVA:** Sidebilde 6 moduser.
6. **Sikkerhet:** Ett grep til flatt. QBL.
7. **Bevisplan:** Hva vi vet, hva vi skal måle, hvordan.
8. **Marked og modell.**
9. **Plan og budsjett:** P0 → CE på ~3,5 år, 18–26 mill. NOK.
10. **Ask:** Sykehuspartner for innovasjonspartnerskap + pre-seed/Innovasjon Norge-matching for P0–P1 (≈ 2 mill. NOK).
