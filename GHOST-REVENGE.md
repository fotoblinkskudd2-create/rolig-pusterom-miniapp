# GHOST / REVENGE — en modus i Flow, ikke en ny agent

Oppgaven ba om «én agent». Det hadde vært agent nummer to, en uke etter at Ragnarok drepte alle unntatt én.
Så dette er en blokk du limer **nederst i FLOW-prompten**. Samme eier, samme port, samme svarformat.

---

## Prompt-blokk (lim inn under KREATIV MODUS i FLOW.md)

```text
GHOST / REVENGE (aktiveres med «ghost:» eller «revenge:» først i meldinga)

Felles:
- Kjører bare på GRØNN port. Teller som dagens kreative leveranse, ikke i tillegg.
- Leser og skriver kun i mappa arkiv/ (struktur under). Aldri i et offentlig repo.
- Fakta og myte blandes aldri i samme fil.

GHOST — familien (bestemor, Karelen, Stalin, «Norge først»)
- Input: et minne, et dokument, et navn, et sted.
- Skriv først hva som er FAKTA (med kilde: hvem sa det, hvilket dokument) inn i fakta.md.
- Skriv så ett myte-fragment (150–400 ord) inn i myte.md. Hver påstand er enten [F#] (peker til fakta.md)
  eller [MYTE] (din fortolkning). Aldri en oppdiktet dato, navn eller hendelse uten [MYTE].
- Avslutt med 1–3 linjer i hull.md: hva som må spørres/søkes for å gjøre én [MYTE] til [F].
- Stemme: førsteperson, barnebarnet, nåtid. Krypteres lokalt (age -p) når økta er ferdig.

REVENGE — borettslaget
Leverer alltid tre ting, i denne rekkefølgen:
1. NESTE BREV: saklig, datert, til styret (kopi forvalter). Bare hendelser fra logg.md med dato og bevis-fil.
   Vis til vedtektene og borettslagsloven (slå opp riktig paragraf på lovdata.no, ikke gjett).
   Krev skriftlig svar innen 14 dager. Ingen sarkasme, ingen adjektiver, ingen trusler.
2. DIKT: satirisk, rettet mot systemet (portalen, forvalteren, «saken er mottatt»), aldri mot en
   navngitt privatperson. Til deg, ikke til styret.
3. MEDIEVINKEL: bare hvis brev er sendt og fristen er passert. Mønsteret, ikke personen.
   Si alltid: «navngi ingen privatperson — ærekrenkelse kan gi erstatningsansvar».
Brevet sendes aldri av deg. Flow spør før noe sendes (irreversibelt).
```

## Filstruktur (vokser over tid, lokalt, utenfor git)

```
arkiv/
├── ghost/
│   ├── kilder/      originaler: skann, brev, lydopptak. Endres aldri.
│   ├── fakta.md     F1, F2 … — én linje: påstand · kilde · dato funnet
│   ├── myte.md      fragmentene, nyeste øverst
│   └── hull.md      spørsmål til slekt / arkiv
└── revenge/
    ├── logg.md      dato · hva · hvem varslet · bevis-fil
    ├── bevis/       bilder, skjermbilder, e-poster (filnavn starter med dato)
    ├── brev/        2026-11-10-styret.md … (sendte, aldri redigert etterpå)
    └── dikt.md
```

Kryptering: `age -p -o ghost.age <(tar c arkiv/ghost)` etter hver økt, slett klartekst. Passordet står ikke på samme maskin.

---

## Tre runder — SIMULERING (ingen ekte materiale fantes i Notion eller repo)

Alt under er oppdiktet for å vise formen. Navn, datoer og hendelser er plassholdere, ikke din familie eller ditt borettslag.

### Runde 1 — Ghost

**Input (simulert):** «Bestemor sa alltid 'Norge først' når vi spiste. Hun kom fra Viipuri-kanten.»

**fakta.md**
```
F1 · Bestemor sa «Norge først» ved måltider · kilde: Alexander, eget minne · 2026-11-10
F2 · Fra området rundt Viipuri/Viborg · kilde: Alexander, familiefortelling (ikke dokumentert) · 2026-11-10
F3 · Rundt 400 000 ble evakuert fra avstått finsk Karelen 1940 og igjen 1944 · kilde: SJEKK (Kansallisarkisto / leksikon)
```

**myte.md**
> Hun skjærer brødet mot seg, med kniven inn mot brystet, sånn man gjør når man har lært at brød er noe som kan bli tatt [MYTE]. «Norge først,» sier hun [F1], og jeg er sju år og tror hun mener at vi skal be for kongen. Hun mener noe annet. Hun mener: dette landet tok imot meg, så dette landet spiser først. Stalin tok kjøkkenet hennes [MYTE] — ikke ham personlig, han var aldri i Viipuri [MYTE], men streken hans på kartet gikk gjennom komfyren [F2, F3]. Hun bar ingenting med seg over grensa. Bare en setning med tre stavelser, som hun la på bordet hver middag i seksti år, som en kniv ingen andre så.

**hull.md**
```
- Hvilken landsby? Spør (slektning). Søk evakueringsregister.
- Når kom hun til Norge, og hvordan? Riksarkivet: innvandring/statsborgerskap.
- Var det kniven, eller er det mitt bilde? Spør den som husker henne.
```

### Runde 2 — Revenge

**logg.md (simulert)**
```
2026-09-02 · Lekkasje i tak, bod 14 · meldt i forvalterportalen, sak #—— · bevis/2026-09-02-tak.jpg
2026-09-30 · Purret. Svar: «Saken er mottatt» · bevis/2026-09-30-svar.png
2026-10-28 · Mugglukt i bod. Ingen befaring · bevis/2026-10-28-bod.jpg
```

**1. Neste brev**
> Til styret i (borettslag), kopi (forvalter) · Bergen, 10. november 2026
> **Gjelder: Lekkasje i tak over bod 14 — krav om utbedring**
> Lekkasjen ble meldt 2. september 2026 i forvalterportalen og purret 30. september. Svaret var at saken var mottatt. Den 28. oktober ble det registrert mugglukt i boden. Det er ikke gjennomført befaring. Bilder fra alle tre datoer er vedlagt.
> Etter vedtektene og borettslagsloven [paragraf om lagets vedlikeholdsplikt — slå opp på lovdata.no] er taket lagets ansvar.
> Jeg ber om skriftlig svar innen 14 dager, senest 24. november 2026, med dato for befaring og plan for utbedring.
> Med vennlig hilsen, (navn), andel (nr.)

**2. Dikt** — *Saken er mottatt*
> Taket mitt gråter i bod fjorten,
> portalen har et skjema for tårer.
> Jeg fylte det ut i september.
> Det svarte: *mottatt*. Som et kyss
> fra en automat på Flesland
> som har lært å si «god tur»
> men aldri har sett et fly.
> Nå gror det noe grønt i hjørnet.
> Det er det eneste her som vokser
> uten å ha fått saksnummer.

**3. Medievinkel:** ikke ennå. Fristen er 24.11. Etterpå: «Hvor lang tid tar en takdrypp i et norsk borettslag?» — mønsteret med portal-svar uten befaring, flere beboere, ingen navn.

### Runde 3 — Kombinert

**Input:** «Bestemor mistet huset sitt til en strek på et kart. Jeg holder på å miste boden min til et saksnummer.»

**Output (myte.md, Ghost-siden — brevet over er urørt):**
> Hun mistet et hus til en strek [F3]. Jeg mister en bod til en kø. Det er ikke det samme, og jeg skal ikke late som. Men det er samme lyd: en penn som skraper et sted du aldri får se, og så er tingen din ikke din lenger [MYTE]. Hun svarte med tre stavelser ved middagsbordet. Jeg svarer med en dato og en frist: 24. november. «Norge først,» sa hun [F1]. Greit, bestemor. Da sjekker vi om Norge leser e-posten sin.

**Regel som overlevde runde 3:** myten får låne kraft fra klagen. Klagen får aldri låne et eneste ord fra myten.

---

## Ukentlig kjøring (søndag, 30 min, bare GRØNN port)

1. **Revenge først** hvis en frist går ut neste uke: `revenge:` + nye hendelser → brev + dikt (+ medievinkel bare etter frist).
2. **Ellers Ghost:** `ghost:` + ett minne eller ett dokument → fakta + ett fragment + hull.
3. Krypter `arkiv/ghost`. Ferdig. Det er ukas kreative leveranse — ikke en ekstra.
