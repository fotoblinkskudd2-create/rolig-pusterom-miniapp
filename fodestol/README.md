# LIVA — fødeplattform som løfter krakken

FoU-prosjekt: fra kartlegging av dagens fødesenger og fødekrakker i Norge/Europa til en prototypeklar ny generasjon fødeplattform.

**Kjerneidéen i én setning:** Den fødende skal kunne sitte, stå, knele eller ligge i den stillingen kroppen vil — mens jordmorens arbeidshøyde reguleres *uavhengig* av stillingen. I dag velger man mellom en lav krakk der jordmor jobber på gulvet, og en høy seng som presser kvinnen bakover. LIVA fjerner det valget.

## Les i denne rekkefølgen

| # | Fil | Innhold |
|---|-----|---------|
| 1 | [`01-research.md`](01-research.md) | Fødselspraksis Norge/Europa, utstyrsmarked, evidens om fødestillinger, helsepersonellets belastning |
| 2 | [`02-svakheter.md`](02-svakheter.md) | 14 svakheter, hver med problem → årsak → konsekvens → alvorlighet → forbedring → gevinst. Prioriteringsmatrise |
| 3 | [`03-konsepter.md`](03-konsepter.md) | Idémyldring (24 idéer), hva som ble drept og hvorfor, 5 konsepter, Pugh-matrise, valgt konsept |
| 4 | [`04-produktspesifikasjon.md`](04-produktspesifikasjon.md) | Mål, moduser, mekanikk, materialer, elektronikk, BOM, produksjon, kostnad, prototypeplan |
| 5 | [`05-test-og-regulatorisk.md`](05-test-og-regulatorisk.md) | Testplan, FMEA, kjente svakheter i prototypen, MDR/IEC 60601/ISO 14971 m.m. |
| 6 | [`06-effekt.md`](06-effekt.md) | Sammenligning mot dagens løsninger, hva som er dokumentert og hva som må måles |
| 7 | [`07-marked-og-pr.md`](07-marked-og-pr.md) | Navn, identitet, budskap, konkurransefortrinn, forretningsmodell, pitch-manus |
| — | [`presentasjon/index.html`](presentasjon/index.html) | Pitch-deck i nettleser (piltaster). Sykehus, jordmødre, partnere, investorer |
| — | [`cad/liva.scad`](cad/liva.scad) | Parametrisk CAD-modell (OpenSCAD). Bytt `MODE` for å se hver fødestilling |
| — | [`tegninger/`](tegninger/) | Tekniske tegninger (SVG) med hovedmål — generert av `tegninger/generer.py` |

## Ærlighetserklæring

- Tall merket **[verifiser]** er fra offentlige kilder etter beste kunnskap, men skal sjekkes mot primærkilde før de brukes eksternt.
- Produsentdata er typiske verdier fra brosjyrer/datablad. Ingen produsent er kontaktet.
- Alle effektpåstander om LIVA er **hypoteser** inntil klinisk utprøving. `06-effekt.md` sier eksakt hvordan de skal måles.
- CAD-modellen er et konsept- og proporsjonsgrunnlag (LOD 300), ikke produksjonsunderlag. Den må over i SolidWorks/Creo/Onshape med FEM før alfa-prototypen kuttes.
- «Realistiske produktbilder» kan ikke fotograferes før noe er bygget. Presentasjonen bruker de tekniske tegningene og en renderspesifikasjon (`07`, §6) som kan gis til en 3D-visualisør eller kjøres i Blender/KeyShot fra CAD-eksporten.

## Rendre CAD

```sh
openscad -o liva-krakk.stl -D 'MODE="krakk"' cad/liva.scad
openscad -o liva.png --render --imgsize=1600,1200 -D 'MODE="seng"' cad/liva.scad
python3 tegninger/generer.py   # regenererer SVG-tegningene
```
