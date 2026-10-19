# 02 — PUSTESTEIN · Labben-kjøring

```
Grok-bot runtime. /lab. Klasse M.
PROBLEM: Når ordene svikter. Panikk, dissosiasjon, sorg — skjermen er for mye, appen er for langt unna.
BRUKER: én person, lokal, ingen sky, ofte i mørket
RAMMER: 48t, lokal-first, ingen marketplace, ingen app+sky
DNA: fototerapi + passiv mekanikk + 48t
Seed 7. Drepe minst 3. IRP på overlevende #1.
```

Kilden: Pusterom har en pustesirkel på 4–2–6 sekunder. Den krever skjerm, lys, øyne åpne.
Isolation Mirror sier *bildet blir på enheten*. Og en linje som ikke handler om teknologi i det hele tatt:
*hold morfar hånd når ordene svikter.*

Hva om pustesirkelen var noe du kunne holde i hånda, med øynene lukket, med bildet av den du savner under tommelen?

## Seed 7

| # | Idé | Én setning |
|---|-----|-----------|
| 1 | **Pustestein** | En tung, håndvarm stein med et tommelspor som *er* pusten: 4 s opp, 2 s hvile, 6 s ned. Under: et fotovindu for ett bilde. |
| 2 | Vindvarsel | App som varsler før stormen (53 mph) slik at kroppen rekker å forberede seg. |
| 3 | Morfar-boks | Liten høyttaler-boks som spiller et stemmeopptak når du klemmer. |
| 4 | Lysterapi-lampe | Vintermørke-lampe for nordnorsk desember. |
| 5 | Fjordvindu | E-ink-ramme med lokale bilder. |
| 6 | Vektpledd | Tungt pledd. |
| 7 | Pusteklokke | Mekanisk pendel/timeglass som går i 4–2–6. |

## Drep

- **#2 Vindvarsel — DREPT.** Yr finnes. En app til som piper. Ikke passiv.
- **#3 Morfar-boks — DREPT.** Elektronikk, batteri, CE. Og sorg + stemme er et minefelt; feil øyeblikk = retraumatisering. Opptak kan ligge på telefonen.
- **#4 Lysterapi — DREPT.** Mettet marked (Lumie, Philips), medisinsk-nært, strøm, CE.
- **#5 Fjordvindu — DREPT.** Aura og Nixplay finnes. Sky-først. Bryter regel 1.
- **#6 Vektpledd — DREPT.** Finnes overalt, kan ikke tas med i lomma.
- **#7 Pusteklokke — PARKERT.** Et timeglass kan ikke gå 4–2–6 uten å snus. Mekanikken er vakker, men v2. Ideen om *tempo i fysisk form* lever videre i #1.

## Overlevende: #1 Pustestein

## IRP

**I — Innsikt.** Pustesirkelen i Pusterom virker bare når du ser den. Men panikk lukker øynene, dissosiasjon tar fra deg skjermen, og sorg kommer kl 03:00 uten lys. En *rille* er en pustesirkel du kan ta på. Lengden på rillen ganget med tommelens fart *er* tiden. Dybden forteller deg hvor du er: rillen grunnes mens du puster inn (tommelen løftes), tre knotter mens du holder, seks tverr-ribber mens du puster ut — tell dem. Ingen skjerm. Ingen batteri. Ingen sky. 4+2+6 = 12 s = 5 pust i minuttet — nær resonansfrekvensen (~6/min) som HRV-forskningen peker på.

Og under: et passbilde, 35 × 45 mm. Morfar. Hunden. Fjorden fra Batsverk. Fototerapi uten skjerm: snu steinen, se, snu tilbake, pust.

**R — Risiko.**
- *Tommelfart er individuell.* Ingen litteratur gir et tall vi kan stole på → **appen måler din fart** og CAD-skriptet bygger rillen etter den. Steinen er personlig, bokstavelig talt.
- *Vekt i lomma* → mål 150–250 g. Sand eller stålhagl støpes inn under print (pause-at-height).
- *Medisinsk påstand* → ingen. Det er en stein med et spor. Pust er gratis.
- *Bilde av avdød kan trigge* → vinduet har lokk; bildet er valgfritt; ramme kan printes blank.

**P — Prototype (48t).**
1. `pustestein.html`: guide (4–2–6 på stein-silhuett), kalibrering (bankkort mot skjermen → mm), tommel-test (mål mm/s), passbilde-beskjæring til 35 × 45 mm @ 300 dpi, eksport av `parametre.json`.
2. `cad/pustestein.py`: leser `parametre.json`, bygger stein + rille + knotter + ribber + fotolomme + hulrom for vekt + ramme. STL + bilder.

## Nynorsk, ≤3 setningar

> Pustesteinen er ein tung stein med eit spor for tommelen som er like langt som eitt rolig andedrag.
> Du kjenner med tommelen kvar du er: opp, kvil, ned — og tel ribbene medan du pustar ut.
> Under ligg eitt bilete, berre for deg, og ingenting av det treng straum.

Stopp. Ikke nytt OS.
