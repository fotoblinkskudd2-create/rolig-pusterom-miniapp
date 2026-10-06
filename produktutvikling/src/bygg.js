// Bygger hoveddokumentet og ensidig sammendrag (Word).
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, LevelFormat, PageOrientation, Footer, Header,
  PageNumber, TableOfContents, BorderStyle,
} = require("docx");
const L = require("./lib");
const { FARGE, PORTRETT_BREDDE, LANDSKAP_BREDDE, nok, mnok, usd, h1, h2, h3, p, liten, kulepunkter, nummerert, tabell, nokkeltall, bilde, infoboks, luft } = L;
const INN = require("./innhold_produkter");

const HER = __dirname;
const ROT = path.join(HER, "..");
const M = JSON.parse(fs.readFileSync(path.join(HER, "modell.json"), "utf8"));
const PLAN = JSON.parse(fs.readFileSync(path.join(HER, "planer.json"), "utf8"));
const A = M.antakelser;
const USD_NOK = 10.5;
const PR = Object.fromEntries(M.produkter.map((x) => [x.id, x]));
const REKKE = ["glod", "avtrykk", "samklang", "lene", "kjerne"];

// ---------------------------------------------------------------- beregningshjelpere
function cogsOppdeling(prod, vol) {
  const bom = prod.bom.reduce((s, b) => s + b[1], 0) * A.bom_faktor[vol];
  const ass = prod.montasje[vol];
  const sub = (bom + ass) * (1 + A.kassasjon) * (1 + A.cm_paslag);
  const pa = sub - (bom + ass);
  const qc = A.qc_sert_per_enhet_usd;
  const log = (sub + qc) * prod.logistikk;
  return { bom, ass, pa, qc, log, tot: sub + qc + log };
}
function db(prod, pris, cogsNok) {
  const netto = pris / 1.25;
  const d2c = netto * (1 - A.d2c_betalingsgebyr - A.garantiavsetning) - prod.fulfil - cogsNok;
  const eng = netto / A.grossist_divisor;
  const b2b = eng * (1 - A.garantiavsetning) - prod.b2b_frakt - cogsNok;
  const mix = A.kanalmiks["år1"];
  return mix[0] * d2c + mix[1] * b2b + (prod.tilbehor_bidrag_per_kjerne || 0);
}
function breakEven(prod, { prisFaktor = 1, cogsFaktor = 1, fastFaktorMarkedsforing = 1 } = {}) {
  const fast = prod.fast_kost_nok + prod.lansering_nok * (fastFaktorMarkedsforing - 1);
  const c = prod.cogs["10k"].landet_nok * cogsFaktor;
  return Math.ceil(fast / db(prod, prod.pris * prisFaktor, c));
}
const pct = (v) => v.toLocaleString("nb-NO", { maximumFractionDigits: 1 }) + " %";
const sumScen = (prod, s, felt) => prod.scen[s].reduce((a, x) => a + x[felt], 0);
const aarPositiv = (prod, s) => {
  const i = prod.scen[s].findIndex((x) => x.akkumulert > 0);
  return i < 0 ? "> 3 år" : `År ${i + 1}`;
};

// ---------------------------------------------------------------- felles sidelayout
const MARG = { top: 1134, bottom: 1134, left: 1134, right: 1134, header: 567, footer: 567 };
function topptekst() {
  return new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "VÅR · Produktportefølje v1.0 · Konfidensielt", size: 15, color: FARGE.gra })] })] });
}
function bunntekst() {
  return new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: ["Side ", PageNumber.CURRENT, " av ", PageNumber.TOTAL_PAGES], size: 15, color: FARGE.gra })] })] });
}
const portrett = (children) => ({ properties: { page: { size: { width: 11906, height: 16838 }, margin: MARG } }, headers: { default: topptekst() }, footers: { default: bunntekst() }, children });
const landskap = (children) => ({ properties: { page: { size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE }, margin: MARG } }, headers: { default: topptekst() }, footers: { default: bunntekst() }, children });

const STILER = {
  default: { document: { run: { font: "Arial", size: 19 } } },
  paragraphStyles: [
    { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Arial", color: FARGE.mork }, paragraph: { spacing: { before: 120, after: 200 }, outlineLevel: 0 } },
    { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 25, bold: true, font: "Arial", color: FARGE.mork }, paragraph: { spacing: { before: 260, after: 120 }, outlineLevel: 1 } },
    { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 21, bold: true, font: "Arial", color: FARGE.aksent }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
  ],
};
const NUMMERERING = {
  config: [
    { reference: "kule", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }, { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1000, hanging: 270 } } } }] },
    { reference: "tall", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
    { reference: "tall2", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
    { reference: "tall3", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
  ],
};

// ---------------------------------------------------------------- sammenligningstabell (brukes to steder)
const VURDERING = {
  glod: { behov: "Svært høyt", tek: "Middels", ip: "Høy", tid: "15 mnd" },
  avtrykk: { behov: "Høyt", tek: "Høy", ip: "Svært høy", tid: "18 mnd" },
  samklang: { behov: "Høyt", tek: "Høy", ip: "Høy", tid: "17 mnd" },
  lene: { behov: "Høyt (lite segment)", tek: "Lav", ip: "Middels", tid: "12 mnd" },
  kjerne: { behov: "Høyt", tek: "Lav–middels", ip: "Middels–høy", tid: "12 mnd" },
};
function sammenligning(bredde = PORTRETT_BREDDE, str) {
  const rader = REKKE.map((id) => {
    const x = PR[id];
    const v = VURDERING[id];
    return [x.navn, `${nok(x.pris)} kr`, `${nok(x.cogs["10k"].landet_nok)} kr`, `${pct(x.bm_d2c)} / ${pct(x.bm_engros)}`, `${mnok(x.fast_kost_nok)} M`, nok(x.breakeven_10k), `${x.uker_prototype} uker`, v.tid, v.behov, v.tek];
  });
  return tabell(["Produkt", "Pris", "COGS 10k", "BM D2C / engros", "Invest.", "Break-even", "MVP", "Lansering", "Behov", "Tek. risiko"], rader, [12, 10, 9, 14, 9, 10, 9, 10, 10, 9], { bredde, hoyreKol: [1, 2, 4, 5], str: 15 });
}

// ---------------------------------------------------------------- kapitler
function forside() {
  return [
    luft(1800),
    new Paragraph({ children: [new TextRun({ text: "VÅR", size: 96, bold: true, color: FARGE.mork })] }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Fem nye intimprodukter for kvinner", size: 40, color: FARGE.mork })] }),
    new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: FARGE.aksent, space: 8 } }, spacing: { after: 300 }, children: [new TextRun({ text: "Fra markedshull til prototype, produksjon og økonomi", size: 26, color: FARGE.gra })] }),
    p("**Leveranse:** markedsanalyse, kravspesifikasjon, fem produktkonsepter med konsepttegninger (A3, ISO-stil), stykklister, COGS, økonomisk modell, testplan, IP og regulatorikk, og anbefaling."),
    p("**Versjon:** 1.0 (konseptfase) · **Dato:** 6. oktober 2026 · **Status:** Til beslutning"),
    p("**Arbeidsnavn merkevare:** VÅR. Navnet betyr både «vår» (eierskap) og årstiden (fornyelse). Varemerkesøk gjenstår, se kapittel 6."),
    luft(600),
    infoboks("Slik leser du dokumentet", [
      "Kapittel 0 er ensidig sammendrag og anbefaling. Kapittel 1–2 legger grunnlaget (marked og krav). Kapittel 3 inneholder de fem konseptene, hvert med nøkkeltall først, deretter detaljer og konsepttegning. Kapittel 4–7 dekker økonomi, testing, IP og regulatorikk og neste steg.",
      "Alle beløp er estimater for planlegging. Antakelsene står i kapittel 4.1, og kildene i vedlegg A. Beløp i NOK er inkl. mva. når det står «utsalgspris», ellers eks. mva.",
    ]),
  ];
}

function kap0() {
  const g = PR.glod, k = PR.kjerne;
  return [
    h1("0. Sammendrag og anbefaling"),
    p("Markedet for intimprodukter vokser med 7–9 % i året, men innovasjonen har stått stille siden lufttrykkteknologien kom i 2014. Produktene konkurrerer på kraft, pris og app-funksjoner, mens de største plagene for brukerne er uløste: **nummenhet og overstimulering, dårlig passform, bærbare produkter som faller av, utilgjengelig betjening, korte levetider og svakt personvern.** Vi foreslår fem nye produktprinsipper. Ingen av dem er en variant av et eksisterende produkt:"),
    tabell(["Produkt", "Nytt prinsipp", "Løser"], [
      ["**GLØD**", "Varme og rullende trykkbølge (termo-peristaltikk), ingen vibrasjon", "Overgangsalder, smerte, nummenhet"],
      ["**AVTRYKK**", "Formlås: formes etter kroppen og låses med vakuum (granulær jamming)", "Passform, håndfri bruk"],
      ["**SAMKLANG**", "Mikro-sugefeste (blekksprut-prinsipp) og stimulering som følger partnerens trykk og rytme", "Klitorisstimulering under samleie"],
      ["**LENE**", "Kilepute med magnetisk posisjonert modul og intensitet styrt av kroppstrykk", "Tilgjengelighet uten grep"],
      ["**KJERNE**", "Reparerbar drivkjerne med brukerutskiftbart batteri og skall som kan kokes", "Levetid, miljø, pris"],
    ], [14, 56, 30]),
    luft(80),
    sammenligning(PORTRETT_BREDDE),
    liten("BM = bruttomargin på netto pris. Investering = utvikling, verktøy, sertifisering, IP og lanseringsmarkedsføring år 1. Break-even er regnet på blandet dekningsbidrag (70 % D2C / 30 % engros) ved 10k-kostnad."),
    h3("Anbefaling: prioriter GLØD og KJERNE"),
    ...nummerert([
      `**GLØD** har det klareste udekkede behovet (overgangsalder og sensitivt vev er et voksende segment med høy betalingsvilje), det høyeste dekningsbidraget per enhet (${nok(g.db_d2c)} kr D2C) og break-even ved cirka ${nok(g.breakeven_10k)} enheter. Det gir tilgang til kanaler som er åpne for markedsføring (apotek, helsepersonell, medieomtale), og en mulig senere vei som medisinsk utstyr.`,
      `**KJERNE** har lavest teknisk risiko, kortest tid til marked (${k.uker_prototype} uker til prototype, lansering i måned 12), et inngangsprodukt til ${nok(k.pris)} kr og gjentakende inntekt fra skall. Den er også **plattformen** for resten av porteføljen: kjernen kan drive LENE-modulen og senere varianter, og den er et svar på EUs krav om utskiftbare batterier.`,
      "**AVTRYKK** videreføres som et rimelig FoU-spor (mulighetsstudie for jamming, 6 uker, cirka 150 000 kr) på grunn av høy IP-verdi. **SAMKLANG** venter til festeteksturen er validert (go/no-go uke 10 i eget FoU-spor). **LENE** bygges på KJERNE-plattformen og finansieres delvis via partnere og tilskudd.",
    ], "tall"),
    p(`**Kapitalbehov for de to prioriterte produktene:** cirka ${mnok(g.fast_kost_nok + k.fast_kost_nok)} MNOK inkludert lanseringsmarkedsføring år 1, hvorav ${mnok(g.fast_kost_nok - g.lansering_nok + k.fast_kost_nok - k.lansering_nok)} MNOK er utvikling, verktøy, sertifisering og IP. SkatteFUNN (19 % av FoU-kostnader) og Innovasjon Norge kan dekke en betydelig andel.`),
  ];
}

function kap1() {
  const konk = [
    ["Womanizer Premium 2", "≈ 2 300", "Lufttrykk, «Autopilot»", "Silikon / ABS", "Kraftig, rask, sterkt merke", "Munnstykket passer ikke alle, overstimulering og nummenhet, sugelyd"],
    ["Satisfyer Pro 2 (Gen 3)", "≈ 450–600", "Lufttrykk + vibrasjon, app", "Silikon / ABS", "Pris og tilgjengelighet", "Varierende kvalitet og levetid, høylytt, app-personvern"],
    ["LELO Sona 2 Cruise", "≈ 1 700", "«Sonisk» trykkbølge", "Silikon / ABS", "Premium finish, stille", "Dyr, sensitiv for plassering"],
    ["LELO Enigma", "≈ 2 800", "Dobbel sonisk (inn/ut)", "Silikon / ABS", "Kombinasjonsstimulering", "Fast geometri passer få, tung"],
    ["We-Vibe Chorus", "≈ 2 200", "Bærbar C-form for par, app", "Silikon", "Parbruk, justerbar", "Glir ut, passformproblemer, app-avhengig"],
    ["Dame Eva II", "≈ 1 400", "Håndfri under kjønnsleppene", "Silikon", "Ingen stropper", "Faller av, svak"],
    ["Lioness 2.0", "≈ 2 500", "Vibrator med biofeedback-sensorer", "Silikon / ABS", "Data og innsikt", "Data uten handling, krever app, vanlig stimulering"],
    ["Magic Wand Rechargeable", "≈ 1 800", "Kraftig wand", "Silikonhode / ABS", "Kraft og robusthet", "Tung, stor, nummenhet, støy"],
    ["Lovense Lush 3", "≈ 1 300", "App-styrt egg, fjernstyring", "Silikon", "Langdistanse", "Personvernhendelser, tilkoblingsbrudd"],
    ["Tenga iroha Stick", "≈ 600", "Myk minivibrator", "Silikon / elastomer", "Estetikk, skånsom", "Svak, begrenset bruk"],
    ["Dame Pom", "≈ 1 100", "Fleksibel håndvibrator", "Silikon", "Delvis formbar", "Begrenset kraft, formen spretter tilbake"],
    ["Elvie Trainer (tilgrensende)", "≈ 2 000", "Bekkenbunnstrener + app", "Silikon", "Medisinsk troverdighet, apotek", "Ikke et lystprodukt, krever app"],
  ];
  return [
    h1("1. Markedsanalyse"),
    h2("1.1 Markedsoversikt"),
    p("Det globale markedet for sexleketøy anslås til **35–45 mrd. USD (2025)** med 7–9 % årlig vekst. Anslagene sprer seg mye mellom analysebyråene, så de bør brukes som størrelsesorden. To segmenter dominerer: et **volumsegment** under 700 kr (Satisfyer m.fl.) og et **premiumsegment** på 1 200–3 500 kr (LELO, Womanizer og We-Vibe i Lovehoney Group, Dame, Lioness). Lufttrykkteknologien har vært standarden siden 2014 og er i ferd med å bli en vare der produktene ligner hverandre."),
    p("Tre forskyvninger åpner for nye aktører. (1) **Wellness-normalisering:** produktene flytter inn i apotek og skjønnhetshandel. (2) **Femtech og helse:** overgangsalder og bekkenbunn er blitt egne kategorier, og Elvie og Perifit viser at kjøperne betaler for faglig troverdighet. (3) **Regulering og tillit:** EUs batteriforordning, produktsikkerhetsforordningen (GPSR) og personvernsaker (We-Vibe-forliket 2017, flere Lovense-saker) belønner reparerbarhet og løsninger som virker uten app. Den største flaskehalsen er markedsføring: Meta og Google begrenser annonser i kategorien, så vinnerne bygger egne kanaler (D2C), fellesskap og redaksjonelt innhold."),
    h2("1.2 Konkurrentkart (12 produkter)"),
    tabell(["Produkt", "Pris (NOK)", "Hovedfunksjon", "Materialer", "Styrker", "Svakheter"], konk, [17, 9, 17, 12, 18, 27], { hoyreKol: [1] }),
    liten("Prisene er omtrentlige veiledende priser i norsk og nordisk netthandel (2025) og må verifiseres før ekstern bruk. Svakhetene er en kvalitativ syntese av gjentakende temaer i anmeldelser og fora, se 1.3."),
    h2("1.3 Kundebehov og smertepunkter"),
    p("Syntesen bygger på gjentakende temaer i offentlige anmeldelser (nettbutikker, Amazon og Lovehoney), diskusjonsfora (f.eks. r/SexToys) og fagmiljøenes publikasjoner. **Anbefalt første aktivitet i prosjektet:** systematisk analyse av 3 000–5 000 anmeldelser (NLP-klassifisering) for å kvantifisere hyppighetene under."),
    tabell(["Smertepunkt", "Hva brukerne sier", "Hyppighet", "Adresseres av"], [
      ["Nummenhet og overstimulering", "«For intenst», «blir nummen etter få minutter», «må bruke det gjennom trusa»", "Høy", "GLØD, KJERNE (lavfrekvent voice-coil), AVTRYKK"],
      ["Passform", "«Munnstykket treffer ikke», «må holde den i rar vinkel»", "Høy", "AVTRYKK, KJERNE (skall)"],
      ["Bærbare faller av", "«Glir ut under sex», «passer ikke kroppen min»", "Høy", "SAMKLANG"],
      ["Levetid og batteri", "«Døde etter et år», «kan ikke bytte batteri»", "Middels–høy", "KJERNE"],
      ["Støy og diskresjon", "«Høres gjennom veggen»", "Middels", "Alle (mål ≤ 28–35 dB(A))"],
      ["Rengjøring og hygiene", "«Sømmer samler skitt», «ladeporten ruster»", "Middels", "Alle (sømløs IP67), KJERNE-skall kan kokes"],
      ["App og personvern", "«Må lage konto», «hva skjer med dataene?»", "Middels", "Alle (fungerer uten app)"],
      ["Betjening under bruk", "«Finner ikke knappen», «små knapper»", "Middels", "LENE, SAMKLANG (automatisk), GLØD (taktile former)"],
      ["Smerte og sensitivt vev", "«Ingenting er mildt nok», «tørr og sår»", "Middels, voksende", "GLØD"],
      ["Utseende som hjelpemiddel", "«Ser medisinsk og trist ut»", "Lav (stor i segmentet)", "LENE"],
    ], [18, 38, 13, 31]),
    h2("1.4 Markedssegmenter og personas"),
    tabell(["Persona", "Alder / livssituasjon", "Behov", "Betalingsvilje", "Kanal"], [
      ["**Ingrid** – «kroppen har endret seg»", "45–65, overgangsalder, ofte i parforhold", "Mildhet, varme, faglig trygghet, diskresjon", "2 000–3 500 kr", "Apotek, nett, helsepersonell"],
      ["**Maja** – «ingenting treffer»", "25–40, urban, erfaren bruker", "Passform, innovasjon, design", "1 500–3 000 kr", "Nett, sosiale medier, designmedier"],
      ["**Sara og Jonas** – «sammen»", "28–45, par (alle kombinasjoner)", "Håndfri stimulering under sex", "1 300–2 200 kr", "Nettbutikker, gave"],
      ["**Hanne** – «uten hjelp»", "30–70, funksjonsnedsettelse eller kronisk smerte", "Grepsfri betjening, verdighet", "1 000–2 000 kr (+ offentlig)", "Brukerorganisasjoner, ergoterapeut"],
      ["**Lea** – «én som varer»", "18–30, student, miljøbevisst", "Lav inngangspris, levetid, allsidighet", "500–1 200 kr", "Nett, studentkanaler"],
    ], [20, 20, 25, 15, 20]),
    h2("1.5 De seks hullene i dagens tilbud"),
    tabell(["#", "Hull", "Hvorfor det er en mulighet", "Konsept"], [
      ["1", "**Overgangsalder, smerte og sensitivt vev**", "Stort og voksende segment med høy betalingsvilje. Ingen produkter er kalibrert for det. Åpner for apotek og helsepersonell", "GLØD"],
      ["2", "**Tilpasning til anatomi**", "Den vanligste klagen. Ingen produkter lar brukeren endre fysisk form", "AVTRYKK, KJERNE"],
      ["3", "**Ekte håndfrihet med partner**", "«Orgasmegapet» er godt dokumentert, men dagens løsninger faller av eller tar plass", "SAMKLANG"],
      ["4", "**Tilgjengelighet**", "Nesten ubetjent segment. Universell utforming gir dessuten bedre produkter for alle", "LENE"],
      ["5", "**Levetid, reparasjon og miljø**", "Forseglede enheter blir avfall. EU 2023/1542 og rett til reparasjon trekker i samme retning", "KJERNE"],
      ["6", "**Tillit: materialer og personvern**", "Uklart materialinnhold og datalekkasjer. Fungerer uten app + materialpass som felles løfte", "Alle"],
    ], [5, 27, 50, 18]),
    h2("1.6 Konkrete markedsmuligheter"),
    ...kulepunkter([
      "**«Vibrasjonsfri» som ny underkategori** (GLØD). Lett å kommunisere, kan skape medieomtale og er relevant i helsekanalen.",
      "**Personalisering som fysisk funksjon** (AVTRYKK) og ikke bare app-innstillinger. Gir tydelig differensiering og designpriser.",
      "**Plattform og tilbehør** (KJERNE). Gjentakende inntekt, lavere CAC per ny variant og reparerbarhet som merkeløfte.",
      "**Offentlig og institusjonell kanal** (LENE). Rehabilitering, hjelpemidler og universell utforming, der konkurransen er minimal.",
      "**Nordisk tillit.** En «kroppstrygg fra Norden»-profil med materialpass, drift uten app og 10 års kjernegaranti.",
    ]),
  ];
}

function kap2() {
  return [
    h1("2. Kravspesifikasjon (gjelder alle produkter)"),
    h2("2.1 Sikkerhet og materialer"),
    tabell(["Krav", "Spesifikasjon", "Verifikasjon"], [
      ["Kroppskontakt", "Medisinsk eller kroppsvennlig platinaherdet LSR (f.eks. Wacker SILPURAN/ELASTOSIL LR medisinsk, Shin-Etsu, Momentive). Ingen PVC, TPE/TPR eller jelly mot kropp", "Materialsertifikat per lot, ISO 10993 på ferdig del"],
      ["Biokompatibilitet", "ISO 10993-1 risikovurdering. Testene -5 (cytotoksisitet), -10 (sensibilisering) og -23 (irritasjon) på ferdig produkt", "Akkreditert lab (f.eks. Nelson Labs, Eurofins)"],
      ["Ftalater og kjemikalier", "REACH vedlegg XVII post 51/52 (DEHP, DBP, BBP, DIBP < 0,1 %), ingen SVHC > 0,1 % (SCIP-melding om nødvendig), RoHS 2011/65/EU", "Leverandørerklæring + stikkprøve (GC-MS)"],
      ["Harde deler", "PC/ABS bare internt. Ingen BPA-holdig PC i kroppskontakt", "Konstruksjonsgjennomgang"],
      ["Overflate", "Sømløs mot kropp, Ra ≤ 0,8 µm (polert form SPI A2), ingen porøsitet", "Visuell kontroll, profilometer"],
      ["Mekanisk sikkerhet", "ISO 3533:2021: ingen klemfarer, ingen løse smådeler. Innvendige produkter har håndtak eller stopp", "Testrapport ISO 3533"],
      ["Temperatur", "Kontaktflate ≤ 41 °C i normal drift, ≤ 43 °C ved enkeltfeil", "IEC 60335-2-32, IR-kartlegging"],
      ["Materialpass", "QR på emballasjen med full materialdeklarasjon og testrapporter", "Publiseres ved lansering"],
    ], [18, 52, 30]),
    h2("2.2 Elektriske krav"),
    tabell(["Krav", "Spesifikasjon"], [
      ["IP-klasse", "Minimum **IP67** (IEC 60529, 30 min / 1 m). IP68 som mål for KJERNE"],
      ["Spenning", "Batteri ≤ 3,7 V nominelt, lading 5 V. Ingen nettspenning i produktet (LVD gjelder ikke)"],
      ["Batteri", "Li-ion med PCM (overlading, dyp utlading, kortslutning, overtemperatur). **IEC 62133-2** og **UN38.3**, MSDS. Merking etter **EU 2023/1542**"],
      ["Lading", "Magnetisk kontakt eller forseglede pogo-pinner (ingen åpne porter). Laderate ≤ 1C. Ladestopp ved fuktdeteksjon. Standard USB-C-kabel i esken"],
      ["EMC", "EMC-direktivet 2014/30/EU: EN 55014-1/-2 (eller EN 55032/35). ESD ±8 kV luft"],
      ["Radio (der det brukes)", "RED 2014/53/EU: EN 300 328, EN 301 489-1/-17, EN 62479. FCC Part 15C"],
      ["Strømforbruk", "Hvilemodus ≤ 10 µA. Reiselås forhindrer utilsiktet start"],
      ["Personvern", "Fungerer uten app. Ingen skydata. BLE kryptert og kun lokal paring"],
    ], [20, 80]),
    h2("2.3 Vedlikehold og rengjøring"),
    ...kulepunkter([
      "Alle produkter: vask med lunkent vann og mild, parfymefri såpe. Tåler kort avtørking med 70 % isopropanol.",
      "Ingen sømmer eller åpninger der væske kan samle seg. Ladekontaktene tåler vask.",
      "KJERNE-skall uten elektronikk kan **kokes i 3 minutter** og vaskes i øverste kurv i oppvaskmaskin.",
      "Tekstiler (LENE): trekket tåler vask på 60 °C, med vanntett innertrekk.",
      "Bruksanvisningen sier: bruk bare vannbasert glidemiddel på silikonprodukter, oppbevar produktet i medfølgende bomullspose, og del ikke produkter mellom personer uten kondom eller grundig rengjøring.",
    ]),
    h2("2.4 Prisnivåer og designparametre"),
    tabell(["Parameter", "Lav", "Mellom", "Premium"], [
      ["Utsalgspris (inkl. mva.)", "400–900 kr", "900–1 900 kr", "1 900–3 500 kr"],
      ["Mål for landet COGS (andel av netto pris)", "≤ 30 %", "≤ 25 %", "≤ 18 %"],
      ["Vekt (håndholdt)", "≤ 120 g", "≤ 180 g", "≤ 220 g"],
      ["Størrelse (håndholdt)", "≤ 110 mm", "≤ 140 mm", "≤ 160 mm"],
      ["Støy @ 30 cm, middels nivå", "≤ 38 dB(A)", "≤ 35 dB(A)", "≤ 30 dB(A)"],
      ["Driftstid", "≥ 60 min", "≥ 90 min", "≥ 60 min med varme, ellers ≥ 100 min"],
      ["Garanti", "2 år", "2 år", "3 år (KJERNE-kjerne: 10 år)"],
      ["Emballasje", "Resirkulert papp, ingen plast (PPWR (EU) 2025/40-klar)", "Som lav + bomullspose", "FSC-eske, bomullspose, materialpass"],
    ], [34, 22, 22, 22]),
    liten("Porteføljen: KJERNE er lav/mellom, LENE og SAMKLANG mellom, GLØD og AVTRYKK premium."),
  ];
}

function produktKapittel(id, nr) {
  const x = PR[id];
  const t = INN[id];
  const plan = PLAN[id];
  const c = { "1k": cogsOppdeling(x, "1k"), "10k": cogsOppdeling(x, "10k"), "50k": cogsOppdeling(x, "50k") };
  const verktoySum = t.verktoy.reduce((s, v) => s + v[1], 0);
  const portrettDel = [
    h1(`3.${nr} ${x.navn} – ${x.undertittel}`, nr !== 1),
    p(`_${t.tagline}_`, { run: { size: 22, color: FARGE.mork } }),
    h3("Nøkkeltall"),
    nokkeltall([
      ["Utsalgspris (inkl. mva.)", `${nok(x.pris)} kr (≈ €${Math.round(x.pris / 11.5 / 10) * 10 - 1} / $${Math.round(x.pris / 10.5 / 10) * 10 - 1})`],
      ["BOM ved 10k", `${usd(x.bom_sum_10k)} ≈ ${nok(x.bom_sum_10k * USD_NOK)} kr`],
      ["Landet COGS 1k / 10k / 50k", `${nok(x.cogs["1k"].landet_nok)} / ${nok(x.cogs["10k"].landet_nok)} / ${nok(x.cogs["50k"].landet_nok)} kr`],
      ["Bruttomargin D2C / engros (10k)", `${pct(x.bm_d2c)} / ${pct(x.bm_engros)}`],
      ["Dekningsbidrag per enhet D2C / engros", `${nok(x.db_d2c)} / ${nok(x.db_engros)} kr`],
      ["Investering (utvikling, verktøy, sertifisering, IP, lansering år 1)", `${mnok(x.fast_kost_nok, 2)} MNOK`],
      ["Break-even", `${nok(x.breakeven_10k)} enheter (${nok(x.breakeven_1k)} ved 1k-kostnad)`],
      ["Tid til funksjonell prototype / lansering", `${x.uker_prototype} uker / måned ${plan.lansering}`],
    ]),
    h2("Målgruppe og persona"),
    ...kulepunkter(t.persona),
    h2("Problemet det løser"),
    ...t.problem.map((s) => p(s)),
    h2("Hovedidé og konsept"),
    ...t.ide.map((s) => p(s)),
    h2("Differensiering"),
    ...kulepunkter(t.diff),
    h2("Nøkkelfunksjoner"),
    ...kulepunkter(t.funksjoner),
    h2("Tekniske spesifikasjoner"),
    tabell(["Parameter", "Verdi"], t.specs, [28, 72], { forsteKolFet: true }),
    h2("Ergonomi og brukeropplevelse"),
    ...kulepunkter(t.ergonomi),
    h2("Sikkerhet og samsvar"),
    ...kulepunkter(t.samsvar),
    h2("Prototypeplan"),
    tabell(["Når", "Trinn", "Innhold", "Metoder og verktøy"], t.prototype, [12, 20, 40, 28]),
    h2("Produksjonsmetode, verktøy og MOQ"),
    ...kulepunkter(t.produksjon),
    tabell(["Verktøy / engangskostnad", "USD", "NOK"], [...t.verktoy.map((v) => [v[0], nok(v[1]), nok(v[1] * USD_NOK)]), ["Sum verktøy", nok(verktoySum), nok(verktoySum * USD_NOK)]], [60, 20, 20], { hoyreKol: [1, 2], sumRad: true }),
    p(`**MOQ og ledetid:** ${t.moq}`),
    liten("Verktøykostnadene er bransjetypiske tilbudsnivåer fra LSR- og plaststøperier i Kina (stålformer, T1–T2 inkludert). Innhent minst 3 tilbud. Myke aluminiumsformer for β-serier koster typisk 25–40 % av en stålform."),
    h2("Stykkliste (BOM)"),
    tabell(["Komponent", "USD @1k", "USD @10k", "USD @50k"], [
      ...x.bom.map((b) => [b[0], usd(b[1] * A.bom_faktor["1k"]), usd(b[1]), usd(b[1] * A.bom_faktor["50k"])]),
      ["Sum BOM", usd(x.cogs["1k"].bom_usd), usd(x.bom_sum_10k), usd(x.cogs["50k"].bom_usd)],
    ], [58, 14, 14, 14], { hoyreKol: [1, 2, 3], sumRad: true }),
    h2("Enhetskostnad (COGS) ved 1k / 10k / 50k"),
    tabell(["Kostnadselement (USD per enhet)", "1 000", "10 000", "50 000"], [
      ["BOM", usd(c["1k"].bom), usd(c["10k"].bom), usd(c["50k"].bom)],
      ["Montasje og sluttest", usd(c["1k"].ass), usd(c["10k"].ass), usd(c["50k"].ass)],
      ["Kassasjon 3 % + fabrikkpåslag 20 %", usd(c["1k"].pa), usd(c["10k"].pa), usd(c["50k"].pa)],
      ["QC og sertifiseringsandel", usd(c["1k"].qc), usd(c["10k"].qc), usd(c["50k"].qc)],
      [`Frakt, toll og forsikring (${Math.round(x.logistikk * 100)} %)`, usd(c["1k"].log), usd(c["10k"].log), usd(c["50k"].log)],
      ["Landet COGS (USD)", usd(c["1k"].tot), usd(c["10k"].tot), usd(c["50k"].tot)],
      ["Landet COGS (NOK)", `${nok(x.cogs["1k"].landet_nok)} kr`, `${nok(x.cogs["10k"].landet_nok)} kr`, `${nok(x.cogs["50k"].landet_nok)} kr`],
    ], [52, 16, 16, 16], { hoyreKol: [1, 2, 3], sumRad: true }),
    liten("Verktøy og utvikling er ikke inkludert i COGS (behandles som faste kostnader i kapittel 4). Tollsats 0 % til EU og Norge for HS 9019 (massasjeapparater). USA har betydelig tollrisiko for kinesisk produksjon."),
    h2("Utsalgspris og margin"),
    tabell(["", "D2C (egen nettbutikk)", "Engros (forhandler)"], [
      ["Pris eks. mva.", `${nok(x.netto_pris)} kr`, `${nok(x.engros_pris)} kr`],
      ["Landet COGS (10k)", `${nok(x.cogs["10k"].landet_nok)} kr`, `${nok(x.cogs["10k"].landet_nok)} kr`],
      ["Bruttomargin", `${pct(x.bm_d2c)}`, `${pct(x.bm_engros)}`],
      ["Betaling, garanti, frakt", `${nok(x.netto_pris - x.cogs["10k"].landet_nok - x.db_d2c)} kr`, `${nok(x.engros_pris - x.cogs["10k"].landet_nok - x.db_engros)} kr`],
      ["Dekningsbidrag per enhet (før markedsføring)", `${nok(x.db_d2c)} kr`, `${nok(x.db_engros)} kr`],
    ], [40, 30, 30], { hoyreKol: [1, 2], sumRad: true }),
    ...(id === "kjerne" ? [p(`**Tilbehør:** ekstra skall ${x.tilbehor.skall_pris} kr, reservecelle ${x.tilbehor.batteri_pris} kr, «Trio»-pakke (kjerne + 3 skall) 1 590 kr. Modellen antar 0,6 skall og 0,15 celler per solgte kjerne, som gir cirka ${nok(x.tilbehor_bidrag_per_kjerne)} kr i ekstra dekningsbidrag per kjerne.`)] : []),
    h2("Lanseringskanaler og markedsføringsvinkel"),
    ...nummerert(t.kanaler, "tall2"),
    h2("Tidslinje til MVP og lansering"),
    ...bilde(path.join(ROT, "grafer", `gantt_${id}.png`), 640, 292, `Grov Gantt for ${x.navn}. Funksjonell prototype (MVP) i uke ${x.uker_prototype}, lansering i måned ${plan.lansering}.`),
    h2("Risikoanalyse og avbøtende tiltak"),
    tabell(["Risiko", "Sannsynlighet", "Konsekvens", "Tiltak"], t.risiko, [28, 12, 12, 48]),
  ];
  const tegn = [
    new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(`Konsepttegning ${x.navn} (A3, ISO-stil, første vinkels projeksjon)`)] }),
    ...bilde(path.join(ROT, "tegninger", t.tegning), 834, 590),
  ];
  const seksjoner = [portrett(portrettDel), landskap(tegn)];
  if (t.tegning2) {
    seksjoner.push(landskap([
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(`Konsepttegning ${x.navn} – skallfamilie`)] }),
      ...bilde(path.join(ROT, "tegninger", t.tegning2), 834, 590),
    ]));
  }
  return seksjoner;
}

function kap4() {
  const sc = ["Konservativ", "Sannsynlig", "Aggressiv"];
  const investRader = REKKE.map((id) => {
    const x = PR[id];
    return [x.navn, nok(x.utvikling_nok), nok(x.verktoy_usd * USD_NOK), nok(x.sert_usd * USD_NOK), nok(x.ip_nok), nok(x.lansering_nok), nok(x.fast_kost_nok)];
  });
  const sumInv = REKKE.reduce((s, id) => s + PR[id].fast_kost_nok, 0);
  investRader.push(["Sum portefølje", nok(REKKE.reduce((s, id) => s + PR[id].utvikling_nok, 0)), nok(REKKE.reduce((s, id) => s + PR[id].verktoy_usd * USD_NOK, 0)), nok(REKKE.reduce((s, id) => s + PR[id].sert_usd * USD_NOK, 0)), nok(REKKE.reduce((s, id) => s + PR[id].ip_nok, 0)), nok(REKKE.reduce((s, id) => s + PR[id].lansering_nok, 0)), nok(sumInv)]);

  const beRader = REKKE.map((id) => {
    const x = PR[id];
    return [x.navn, `${nok(x.db_blandet_1k)} kr`, `${nok(x.db_blandet_10k)} kr`, nok(x.breakeven_1k), nok(x.breakeven_10k), aarPositiv(x, "Sannsynlig")];
  });
  const scenRader = [];
  REKKE.forEach((id) => {
    const x = PR[id];
    sc.forEach((s) => {
      const a = x.scen[s];
      scenRader.push([s === "Konservativ" ? x.navn : "", s, a.map((y) => nok(y.enheter)).join(" / "), mnok(sumScen(x, s, "omsetning")), mnok(sumScen(x, s, "db")), mnok(a[2].akkumulert)]);
    });
  });
  const port = sc.map((s) => [s, mnok(REKKE.reduce((t, id) => t + sumScen(PR[id], s, "omsetning"), 0)), mnok(REKKE.reduce((t, id) => t + PR[id].scen[s][2].akkumulert, 0)), mnok(["glod", "kjerne"].reduce((t, id) => t + sumScen(PR[id], s, "omsetning"), 0)), mnok(["glod", "kjerne"].reduce((t, id) => t + PR[id].scen[s][2].akkumulert, 0))]);

  const sens = ["glod", "kjerne"].map((id) => {
    const x = PR[id];
    return [x.navn, nok(breakEven(x)), nok(breakEven(x, { prisFaktor: 0.85 })), nok(breakEven(x, { cogsFaktor: 1.25 })), nok(breakEven(x, { fastFaktorMarkedsforing: 1.5 })), nok(breakEven(x, { prisFaktor: 0.85, cogsFaktor: 1.25, fastFaktorMarkedsforing: 1.5 }))];
  });

  return [
    h1("4. Økonomisk modell"),
    h2("4.1 Antakelser"),
    tabell(["Antakelse", "Verdi", "Begrunnelse / kilde"], [
      ["Valuta", "1 USD = 10,5 NOK, 1 EUR = 11,5 NOK", "Planleggingskurs. Valutarisiko sikres ved ordre"],
      ["BOM-skalering", "1k: ×1,38 · 10k: ×1,00 · 50k: ×0,86", "Typisk volumrabatt på komponenter (bransjeerfaring)"],
      ["Montasje og test", "Produktspesifikk, 1,9–7,5 USD", "Arbeidstid 6–25 min/enhet à cirka 6–7 USD/t i Guangdong"],
      ["Fabrikkpåslag / kassasjon", "20 % / 3 %", "Typisk for kontraktsprodusent (EMS/OEM)"],
      ["Frakt, toll, forsikring", "7–8 % (LENE 14 %)", "Sjø- og flyfraktmiks til nordisk 3PL. 0 % toll i EU og Norge (HS 9019)"],
      ["Mva.", "25 %", "Norge (EU-land 19–27 %)"],
      ["D2C-kostnader", "2,5 % betaling, 3 % garanti, 55 kr fulfilment (LENE 120 kr)", "Nordisk 3PL-tariff"],
      ["Engrospris", "Netto utsalgspris / 2,0", "Typisk forhandlerpåslag i kategorien"],
      ["Kanalmiks D2C/engros", "År 1: 70/30 · År 2: 60/40 · År 3: 55/45", "D2C først for margin og data, deretter bredere distribusjon"],
      ["Markedsføring", "År 1: fast lanseringsbudsjett · År 2–3: 18 % av omsetning", "Kategorien kan ikke bruke Meta og Google fullt ut. PR, partnere og innhold"],
      ["Investering", "Utvikling + verktøy + sertifisering + IP + lansering år 1", "Se 4.2. Ekskl. lønn til grunnleggerteam og arbeidskapital"],
    ], [24, 34, 42]),
    h2("4.2 Investering per produkt (NOK)"),
    tabell(["Produkt", "Utvikling", "Verktøy", "Sertifisering", "IP", "Lansering år 1", "Sum"], investRader, [16, 14, 14, 14, 12, 15, 15], { hoyreKol: [1, 2, 3, 4, 5, 6], sumRad: true }),
    liten("Utvikling omfatter industridesign, mekanikk, elektronikk og fastvare (innleid eller egne timer à cirka 1 100 kr), prototyper og to brukertestrunder. Sertifisering: ISO 10993-pakke (cirka 120–180k kr), EMC/RED (60–150k kr), batteri (40–80k kr), IEC 60335 (60–120k kr)."),
    h2("4.3 Break-even per produkt"),
    tabell(["Produkt", "Blandet DB/enhet (1k-kost)", "Blandet DB/enhet (10k-kost)", "Break-even (1k)", "Break-even (10k)", "Akkumulert positivt (sannsynlig)"], beRader, [14, 18, 18, 15, 15, 20], { hoyreKol: [1, 2, 3, 4] }),
    liten("Blandet DB = 70 % D2C + 30 % engros, før markedsføring. Break-even = investering / blandet DB. KJERNE inkluderer tilbehørsbidrag per kjerne."),
    h3("Følsomhet for de to prioriterte (break-even, enheter)"),
    tabell(["Produkt", "Basis", "Pris −15 %", "COGS +25 %", "Lanseringsbudsjett +50 %", "Alle tre samtidig"], sens, [16, 14, 14, 14, 22, 20], { hoyreKol: [1, 2, 3, 4, 5] }),
    p("GLØD tåler prisfall og kostnadsøkning godt på grunn av høy margin. KJERNE er mer følsom for pris, noe som støtter en verdibasert prising med tilbehør og ikke en ren lavprisstrategi."),
    h2("4.4 Scenarier (3 år)"),
    tabell(["Produkt", "Scenario", "Enheter år 1 / 2 / 3", "Omsetning 3 år (MNOK)", "DB 3 år (MNOK)", "Akk. resultat etter år 3 (MNOK)"], scenRader, [13, 14, 23, 16, 14, 20], { hoyreKol: [3, 4, 5] }),
    liten("Omsetning er netto (eks. mva.) etter kanalmiks. Akkumulert resultat = DB − markedsføring − investering (uten lønn til grunnleggerteam, finansiering og felles kostnader)."),
    ...bilde(path.join(ROT, "grafer", "scenarier.png"), 640, 278, "Akkumulert netto omsetning år 1–3 per produkt og scenario. Tallene står i tabellen over."),
    h3("Porteføljen samlet"),
    tabell(["Scenario", "Omsetning 3 år, alle fem (MNOK)", "Akk. resultat, alle fem (MNOK)", "Omsetning 3 år, GLØD + KJERNE (MNOK)", "Akk. resultat, GLØD + KJERNE (MNOK)"], port, [16, 21, 21, 21, 21], { hoyreKol: [1, 2, 3, 4] }),
    h2("4.5 Anbefalt prisstrategi og distribusjonsmodell"),
    tabell(["Produkt", "Prisstrategi", "Distribusjon"], [
      ["GLØD", "Verdibasert premium (2 990 kr). Ingen rabattkampanjer det første året. Fagrabatt via ambassadører", "D2C + apotek og wellness-handel + helsepersonell (henvisningskoder)"],
      ["AVTRYKK", "Premium med forhåndsbestillingspris (−15 %) for tidlige kjøpere", "D2C først, deretter utvalgte designbutikker"],
      ["SAMKLANG", "Mellom/premium, gavepakker i sesong", "Grossist (nordiske og europeiske nettbutikker) + D2C"],
      ["LENE", "To prisnivåer: forbruker 1 990 kr og institusjon (pakke med ekstra trekk og service)", "D2C + institusjonelt salg + eventuell offentlig rammeavtale"],
      ["KJERNE", "Lav inngangspris på startsett (990 kr) med margin på skall og tilbehør. Skall-klubb som abonnement", "D2C + bred engros + abonnement"],
    ], [14, 46, 40]),
    ...kulepunkter([
      "**D2C som kjerne** (Shopify eller tilsvarende med betalingsleverandør som aksepterer kategorien; noen klassifiserer den som høyrisiko). Gir margin, kundedata og kontroll over budskapet.",
      "**Grossist selektivt:** 3–5 nøkkelforhandlere per marked med prisdisiplin (MAP-policy).",
      "**Abonnement bare der det gir mening:** skall og tilbehør (KJERNE) og forbruksvarer (glidemiddel og rengjøring i VÅR-serien). Ikke på enheter.",
      "**Garanti og reparasjon som merkevare:** reservedeler, bytteprogram og 10 år på kjernen.",
    ]),
  ];
}

function kap5() {
  return [
    h1("5. Prototypetest og brukertesting"),
    h2("5.1 Rekrutteringskriterier"),
    tabell(["Kriterium", "Krav"], [
      ["Alder og samtykke", "18+ (25+ for GLØD-segmentet 45–65). Skriftlig informert samtykke. Kan trekke seg når som helst uten begrunnelse"],
      ["Spredning", "Alder, erfaring (nybegynner til erfaren), kroppsstørrelse, seksuell orientering, sivilstatus. Minst 30 % uten tidligere leketøyserfaring"],
      ["Segmentspesifikt", "GLØD: perimenopause/menopause eller vulvodyni (selvrapportert). AVTRYKK: tidligere frustrasjon med passform. SAMKLANG: par i fast forhold, begge samtykker. LENE: nedsatt hånd-/armfunksjon eller kronisk smerte, rekruttert via brukerorganisasjoner. KJERNE: bred gruppe 18–35"],
      ["Eksklusjon", "Graviditet, pågående underlivsinfeksjon, nylig underlivskirurgi (< 3 mnd), kjent silikonallergi, pacemaker/ICD (LENE og KJERNE pga. magneter), nedsatt temperatursans (GLØD)"],
      ["Utvalgsstørrelse", "Runde 1: 10–15 per produkt (kvalitativ). Runde 2: 25–30 per produkt (kvantitativ indikasjon)"],
      ["Kompensasjon", "Gavekort 500–1 000 kr + produktet etter lansering. Ingen kobling mellom kompensasjon og svarene"],
    ], [22, 78]),
    h2("5.2 Etikk, personvern og sikkerhet"),
    ...kulepunkter([
      "Opplysninger om seksualliv er **særlige kategorier personopplysninger** (GDPR art. 9). Krever uttrykkelig samtykke, en personvernkonsekvensvurdering (DPIA), pseudonymisering og lagring i EU/EØS. Ingen opptak av bilde eller lyd under bruk.",
      "Produktutvikling uten helsepåstander trenger normalt ikke REK-godkjenning. Hvis det samles helsedata for medisinske påstander (f.eks. GLØD-spor mot MDR), må det vurderes klinisk utprøving og REK.",
      "Testenheter bruker kroppsvennlig silikon av medisinsk grad, er rengjort og pakket individuelt, og testes elektrisk og termisk på forhånd. Innvendige prototyper brukes med kondom.",
      "**Stoppkriterier:** smerte, hudreaksjon, temperatur over 41 °C eller feilfunksjon gir umiddelbar stopp, avviksrapport og gjennomgang før videre testing.",
      "Hjemmetest over 2 uker med anonym digital dagbok, etterfulgt av intervju på 30–45 minutter (video uten kamera eller telefon) med en kvinnelig moderator med sexologisk kompetanse.",
    ]),
    h2("5.3 Testscenarier og måleparametre"),
    tabell(["Område", "Scenario", "Måleparameter", "Mål (go)"], [
      ["Komfort", "Første bruk og 3 påfølgende økter", "Komfort 1–7 (Likert), ubehagshendelser", "≥ 5,5 i snitt, < 10 % ubehag"],
      ["Tilfredshet", "Etter 2 uker", "Tilfredshet 1–7, NPS, villighet til å betale (Van Westendorp)", "≥ 5,5 · NPS ≥ +30"],
      ["Funksjonalitet", "Oppstart, modusbytte, lading og rengjøring uten instruks", "Oppgaveløsning (%), tid, SUS (System Usability Scale)", "≥ 90 % · SUS ≥ 75"],
      ["Effekt", "Fri bruk", "Opplevd opphisselse og tid til orgasme (valgfritt, selvrapportert), nummenhet 0–10", "Bedre enn brukerens nåværende produkt hos ≥ 60 %"],
      ["Sikkerhet", "Alle økter + benktest", "Hudreaksjoner, overflatetemperatur (logg), mekaniske feil", "0 alvorlige hendelser"],
      ["Produktspesifikt: GLØD", "Varme og bølge", "Foretrukket temperatur og bølgehastighet, nummenhetsskår", "Nummenhet ≤ 2/10"],
      ["Produktspesifikt: AVTRYKK", "Forme, låse, bruke håndfritt", "Andel som lykkes med låsing første gang, stivhetsopplevelse", "≥ 80 %"],
      ["Produktspesifikt: SAMKLANG", "Samleie i 3 stillinger", "Feste (sitter / løsner), hudmerker, opplevd respons", "Sitter ≥ 85 % av øktene"],
      ["Produktspesifikt: LENE", "Bruk uten assistanse", "Selvstendighet (ja/nei), anstrengelse (Borg CR10)", "≥ 80 % selvstendig, Borg ≤ 3"],
      ["Produktspesifikt: KJERNE", "Bytte skall og batteri", "Tid, feil, tetthet etter test", "< 60 s, 0 lekkasjer"],
    ], [16, 24, 36, 24]),
    h2("5.4 Iterasjonsråd basert på tilbakemeldinger"),
    ...nummerert([
      "**Geometri først, funksjon etterpå:** ved komfort under 5,5 eller ubehag hos 10 % eller flere endres formen før elektronikken. Det er raskt og billig med printede former.",
      "**Kill eller pivot:** hvis effektmålet ikke nås i runde 1 og en justering ikke gir forbedring i en mini-runde (n = 5), stoppes konseptet eller hovedprinsippet byttes (f.eks. GLØD: mer puls).",
      "**Prioriter etter alvorlighet × hyppighet:** sikkerhet, så funksjon, så komfort, så estetikk.",
      "**Lås kravspesifikasjonen etter runde 2:** endringer etter verktøyfrys koster 10–25 % av verktøyet per endring.",
      "**Lukk sløyfen:** alle deltakere får en oppsummering av hva som er endret. Det øker lojaliteten og gir ambassadører ved lansering.",
    ], "tall3"),
  ];
}

function kap6() {
  return [
    h1("6. IP, regulatorikk og merking"),
    h2("6.1 Patentkandidater (funksjonelle innovasjoner)"),
    tabell(["Produkt", "Oppfinnelse (kravtema)", "Type", "Prioritet"], [
      ["GLØD", "Ekstern genital stimulator med oppvarmet gelmembran og bevegelig rullevogn som gir en vandrende trykkbølge, med lukket temperatursløyfe og redundant sikring", "Patent (NO → PCT)", "**1 – søk før offentliggjøring**"],
      ["AVTRYKK", "Intimprodukt med brukerformbar del som låses ved granulær jamming, med lagring av formprofil og aktivering av haptiske noder etter kapasitiv kontakt", "Patent (NO → PCT)", "**1** (etter FTO)"],
      ["SAMKLANG", "Bærbar intim pute med mikrostrukturert suge-tekstur for våt adhesjon, og stimulering styrt av partnertrykk og bevegelsesrytme", "Patent (NO → PCT)", "2 (etter FoU-validering)"],
      ["LENE", "Støttepute med skinne og magnetisk posisjonert stimuleringsmodul gjennom tekstil, med kroppstrykkstyrt intensitet", "Patent eller nyttemodell (DE/CN)", "3"],
      ["KJERNE", "Forseglet utskiftbar drivkjerne med brukerutskiftbar celle og magnetisk skall-ID som velger profil automatisk", "Patent (NO → PCT)", "**1**"],
    ], [12, 54, 18, 16]),
    p("**Fremgangsmåte:** (1) nyhetssøk og FTO-analyse hos patentkontor (cirka 30–60k kr per konsept), (2) norsk prioritetssøknad før testing utenfor NDA, (3) PCT innen 12 måneder, (4) nasjonal fase i EP, US og CN etter 30 måneder, avhengig av salgsdata. Fastvarealgoritmer (rytmegjenkjenning, oppbyggingsprogrammer) beskyttes som forretningshemmeligheter."),
    h2("6.2 Merkevare- og designbeskyttelse"),
    tabell(["Rettighet", "Omfang", "Omtrentlig kostnad"], [
      ["Varemerke VÅR (ord + logo)", "Norge (Patentstyret), EU (EUIPO), senere USA (USPTO). Klasser 10 og eventuelt 3, 5, 35", "EUIPO cirka €850 (1 klasse) · NO cirka 3–5k kr · USPTO cirka $350 per klasse. Rådgiver 15–30k kr"],
      ["Produktnavn", "GLØD, KJERNE og LENE er beskrivende eller vanlige norske ord og vanskelige å registrere alene. Brukes sammen med VÅR (f.eks. «VÅR Glød»), eller registreres som figurmerke", "Inngår i søknaden over"],
      ["Registrert design", "Alle fem formene + KJERNE-skall (EU-design, flerdesignsøknad). Søk før offentliggjøring (eller innen 12 mnd nyhetsfrist)", "EUIPO cirka €350 for første design + lavere tillegg for flere · NO noen tusen kr"],
      ["US design patent", "GLØD og KJERNE ved USA-lansering", "Cirka $3–6k per design inkl. rådgiver"],
      ["Patent (per konsept)", "NO-søknad + PCT + nasjonal fase", "NO 60–100k kr · PCT 50–70k kr · nasjonal fase 150–300k kr per region over 3–4 år"],
      ["Domener og sosiale håndtak", "vaar.no / vaar.eu / alternativer", "Lavt"],
    ], [22, 50, 28]),
    h2("6.3 Regelverk i EU/EØS og Norge"),
    tabell(["Regelverk", "Gjelder", "Hva det betyr"], [
      ["GPSR (EU) 2023/988", "Alle", "Generell produktsikkerhet, risikovurdering, teknisk dokumentasjon, ansvarlig økonomisk aktør i EU, sporbarhet og varsling av ulykker"],
      ["ISO 3533:2021", "Alle (frivillig standard)", "Design- og sikkerhetskrav for sexleketøy. Anbefales som presumpsjon for sikkerhet"],
      ["EMC 2014/30/EU", "Alle", "CE-merking, samsvarserklæring (DoC), EN 55014"],
      ["RED 2014/53/EU", "SAMKLANG, LENE", "Radiokrav, inkl. cybersikkerhet etter delegert forordning (EU) 2022/30 (EN 18031) fra 1.8.2025"],
      ["RoHS 2011/65/EU · WEEE 2012/19/EU", "Alle", "Stoffbegrensninger. Registrering hos returselskap for EE-avfall i hvert land (Norge: f.eks. Elretur/RENAS)"],
      ["REACH (EF) 1907/2006", "Alle", "Ftalater, SVHC og SCIP-melding"],
      ["Batteriforordningen (EU) 2023/1542", "Alle", "Merking, CE for batterier, produsentansvar, utskiftbarhet (art. 11) fra 18.2.2027 (unntak for våte miljøer må vurderes)"],
      ["Emballasjeforordningen (EU) 2025/40", "Alle", "Resirkulerbarhet, minimering og merking (trinnvis fra 2026)"],
      ["MDR (EU) 2017/745", "Bare ved medisinske påstander", "GLØD (helsepåstander) og LENE (hjelpemiddel, klasse I). Ikke ved wellness-lansering"],
      ["Norge (EØS)", "Alle", "Produktkontrolloven og el-tilsynsloven (DSB), Miljødirektoratet (kjemikalier). Markedsføringsloven og Forbrukertilsynet (påstander), forbrukerkjøpsloven (5 års reklamasjonsfrist for varer som skal vare vesentlig lenger enn 2 år)"],
    ], [26, 18, 56]),
    h2("6.4 Regelverk i USA"),
    tabell(["Regelverk", "Hva det betyr"], [
      ["FCC 47 CFR Part 15 (B/C)", "Ikke-radiosendere (15B) og BLE-produkter (15C, FCC ID)"],
      ["CPSC / CPSA", "Generell produktsikkerhet. Ingen egen standard for sexleketøy. Krav om tilbakekalling ved feil"],
      ["FDA", "Ikke regulert som medisinsk utstyr uten terapeutiske påstander. Ved påstander: 21 CFR 884.5960 (terapeutisk genital vibrator) eller 884.5970 (klitorisstimulering, klasse II, 510(k))"],
      ["Batteri", "UN38.3 / 49 CFR (transport). UL 2054 / UL 1642 anbefales av forhandlere"],
      ["California Prop 65", "Advarsel ved listede stoffer (f.eks. visse ftalater). Leverandørerklæring"],
      ["FTC", "Markedsføringspåstander må dokumenteres («Made in», «medical grade»)"],
      ["Delstatsregler", "Alabama forbyr fortsatt salg av enheter primært for genital stimulering (Code of Ala. §13A-12-200.2). Geoblokker salg"],
      ["Toll", "Høy og ustabil toll på kinesiskproduserte varer. Vurder produksjon i Vietnam eller Malaysia for USA-volum"],
    ], [26, 74]),
    h2("6.5 Merking, advarsler og bruksanvisning"),
    h3("På produktet (graveres eller trykkes i silikon/hus)"),
    ...kulepunkter(["CE-merke, WEEE-symbol (utkrysset søppeldunk), batterisymbol", "Produsentnavn og modell, lot- eller serienummer (sporbarhet etter GPSR)", "FCC ID (SAMKLANG, LENE) ved USA-salg"]),
    h3("På emballasjen"),
    ...kulepunkter(["Produsent og ansvarlig økonomisk aktør i EU med adresse og e-post/nettside", "Materialdeklarasjon (f.eks. «100 % medisinsk silikon, ftalatfri»), batteritype og kapasitet", "IP-klasse, 18+-merking, QR til materialpass og digital bruksanvisning", "Resirkuleringsmerking (PPWR) og EE-returinformasjon"]),
    h3("I bruksanvisningen (minimum, på alle salgsspråk)"),
    ...kulepunkter([
      "Tiltenkt bruk (utvendig, innvendig eller vaginal) og hva produktet **ikke** skal brukes til (f.eks. «Bue: ikke anal bruk»)",
      "Rengjøring før og etter bruk, kompatible glidemidler (bare vannbasert), oppbevaring og lading (ikke lad når produktet er vått)",
      "Advarsler: avbryt ved smerte eller irritasjon, ikke bruk på skadet eller infisert hud, konsulter lege ved graviditet eller etter underlivskirurgi",
      "**GLØD:** varmeadvarsel, ikke bruk ved nedsatt følelse eller temperatursans (f.eks. nevropati), ikke sovne med produktet på",
      "**LENE og KJERNE:** magnetadvarsel (pacemaker/ICD ≥ 15 cm). **KJERNE:** bruk bare godkjente celler, bytt O-ring hvert 2. år",
      "Oppbevares utilgjengelig for barn. Batteri og smådeler",
      "Garanti, reklamasjon, reservedeler, avfallshåndtering og kontaktinformasjon",
      "Samsvarserklæring (forenklet DoC med lenke) og radiodata (frekvens, maks effekt) for radioprodukter",
    ]),
  ];
}

function kap7() {
  const g = PR.glod, k = PR.kjerne;
  return [
    h1("7. Neste steg: de første 90 dagene"),
    tabell(["Uke", "Aktivitet", "Leveranse", "Budsjett (NOK)"], [
      ["1–2", "Analyse av anmeldelser (3–5k), 12 dybdeintervjuer (GLØD- og KJERNE-segment)", "Kvantifisert behovsrapport", "60 000"],
      ["1–3", "Nyhetssøk og FTO for GLØD, KJERNE og AVTRYKK", "FTO-notat, søknadsstrategi", "120 000"],
      ["2–6", "AVTRYKK fase 0: mulighetsstudie for jamming", "Go/no-go-rapport", "150 000"],
      ["3–6", "Norske prioritetssøknader for GLØD og KJERNE", "Innleverte søknader", "180 000"],
      ["2–8", "CAD og simulering for GLØD og KJERNE", "Låst konsept-CAD", "350 000"],
      ["6–12", "Funksjonelle α-prototyper (GLØD 6 stk, KJERNE 10 stk + 3 skall)", "MVP-er + benktestrapport", "380 000"],
      ["8–12", "Søknad om SkatteFUNN og Innovasjon Norge. Leverandørkartlegging (3 LSR-fabrikker, fabrikkbesøk)", "Søknader, leverandørliste", "90 000"],
      ["10–13", "Rekruttering og etikk/DPIA for brukertest runde 1", "Testpanel klart", "40 000"],
      ["", "**Sum 90 dager**", "", "**1 370 000**"],
    ], [10, 52, 22, 16], { hoyreKol: [3], sumRad: true }),
    h2("Beslutninger som trengs nå"),
    ...kulepunkter([
      `Godkjenne prioritering av GLØD og KJERNE (samlet investering cirka ${mnok(g.fast_kost_nok + k.fast_kost_nok)} MNOK over 15 måneder, inkludert lanseringsmarkedsføring).`,
      "Godkjenne FoU-sporene AVTRYKK fase 0 (150k kr) og SAMKLANG-tekstur (cirka 200k kr, oppstart i måned 3).",
      "Velge første marked: Norden + Tyskland/Nederland (EU) i år 1. USA vurderes i år 2 (toll og delstatsregler).",
      "Engasjere patentkontor og regulatorisk rådgiver (GPSR/IEC 60335) før noe vises eksternt.",
    ]),
    h2("Organisering (minimumsteam)"),
    tabell(["Rolle", "Omfang", "Merknad"], [
      ["Produktleder / prosjektleder", "100 %", "Eier tidslinje, leverandører og budsjett"],
      ["Industridesigner", "60–100 %", "Form, CMF, CAD (innleid eller ansatt)"],
      ["Mekanikk- og elektronikkingeniør", "2 × 50–100 %", "Innleid (f.eks. norsk designbyrå + fastvareutvikler)"],
      ["Sexolog / fagrådgiver", "10–20 %", "Testdesign, tekster, ambassadørprogram"],
      ["Regulatorisk rådgiver", "Ved behov", "CE, ISO 10993, batteri, påstander"],
      ["Innkjøp / kvalitet i Asia", "Ved behov", "Fabrikkoppfølging, QC-inspeksjoner (tredjepart)"],
    ], [34, 18, 48]),
  ];
}

function vedlegg() {
  return [
    h1("Vedlegg A – Kilder og referanser"),
    h3("Standarder og regelverk"),
    ...kulepunkter([
      "ISO 3533:2021 Sex toys – Design and safety requirements for products in direct contact with the genitalia, the anus, or both.",
      "ISO 10993-1, -5, -10, -23 Biological evaluation of medical devices.",
      "IEC 60335-1 og IEC 60335-2-32 Household and similar electrical appliances – Particular requirements for massage appliances.",
      "IEC 62133-2:2017 Secondary cells and batteries – Safety requirements (lithium). UN Manual of Tests and Criteria, del III, 38.3. IEC 60529 (IP-koder).",
      "Forordning (EU) 2023/988 (GPSR), (EU) 2023/1542 (batterier), (EU) 2025/40 (emballasje), (EU) 2017/745 (MDR), (EF) 1907/2006 (REACH). Direktivene 2011/65/EU (RoHS), 2012/19/EU (WEEE), 2014/30/EU (EMC), 2014/53/EU (RED) og delegert forordning (EU) 2022/30.",
      "USA: 47 CFR Part 15 (FCC), 21 CFR 884.5960 og 884.5970 (FDA), California Proposition 65, Code of Alabama §13A-12-200.2.",
    ]),
    h3("Forskning og bransje"),
    ...kulepunkter([
      "Herbenick D. mfl. (2018). Women's Experiences With Genital Touching, Sexual Pleasure, and Orgasm: Results From a U.S. Probability Sample of Women Ages 18 to 94. _J Sex Marital Ther_ 44(2):201–212.",
      "Brown E. mfl. (2010). Universal robotic gripper based on the jamming of granular material. _PNAS_ 107(44):18809–18814 (prinsippet bak AVTRYKK).",
      "Baik S. mfl. (2017). A wet-tolerant adhesive patch inspired by protuberances in suction cups of octopi. _Nature_ 546:396–400 (prinsippet bak SAMKLANG).",
      "O'Connell H. E. mfl. (2005). Anatomy of the clitoris. _J Urol_ 174(4):1189–1195 (klitoriskompleksets utbredelse, grunnlag for GLØD).",
      "Markedsstørrelse: offentlig tilgjengelige sammendrag fra Grand View Research, Statista m.fl. (2024–2025). Anslagene varierer, så de brukes som størrelsesorden.",
      "Personvernsaker: forlik i N.P. v. Standard Innovation (We-Vibe), 2017. Offentlig omtalte sikkerhetshull i app-styrte leketøy (2017–2025).",
      "Konkurrentpriser: produsentenes nettsider og nordiske nettbutikker, observert 2025 (må verifiseres).",
      "Kostnadsnivåer (verktøy, montasje, sertifisering): bransjetypiske tilbudsnivåer fra kontraktsprodusenter i Guangdong og europeiske testlaboratorier. Må erstattes med faktiske tilbud i fase 2.",
      "Offentlige ordninger: SkatteFUNN (Forskningsrådet), Innovasjon Norge (oppstarts- og innovasjonstilskudd), NAV hjelpemidler.",
    ]),
    h1("Vedlegg B – Ordliste", false),
    tabell(["Begrep", "Forklaring"], [
      ["BOM", "Bill of materials, stykkliste med komponentkostnader"],
      ["COGS (landet)", "Kostnad per enhet levert på lager i Norden: BOM, montasje, påslag, QC og frakt/toll"],
      ["D2C", "Direkte til forbruker (egen nettbutikk)"],
      ["DB", "Dekningsbidrag: pris minus variable kostnader, før markedsføring og faste kostnader"],
      ["DFM", "Design for manufacturing, tilpasning til produksjon"],
      ["ERM / LRA / voice-coil", "Aktuatortyper: eksentermotor, lineær resonansaktuator, bredbånds elektromagnetisk aktuator"],
      ["FTO", "Freedom to operate, analyse av om andres patenter hindrer kommersialisering"],
      ["Granulær jamming", "Granulat som går fra flytende til fast tilstand når luften suges ut"],
      ["LSR", "Liquid silicone rubber, sprøytestøpbar platinaherdet silikon"],
      ["MOQ", "Minimum order quantity, minste ordrestørrelse"],
      ["MVP / α / β", "Minste funksjonelle prototype, første funksjonsprototype, produksjonsnær prototype"],
      ["PVT", "Production validation test, pilotserie fra serieverktøy"],
    ], [24, 76]),
    h1("Vedlegg C – Filer i leveransen", false),
    tabell(["Fil", "Innhold"], [
      ["VAR_Produktportefolje_v1.docx", "Dette dokumentet"],
      ["VAR_Sammendrag_1side.docx", "Ensidig sammendrag og anbefaling"],
      ["tegninger/VAR_Tegningssett_A3.pdf", "6 konsepttegninger A3 (vektor), ISO-stil med tittelfelt, mål, snitt og stykkliste"],
      ["tegninger/*.png", "Samme tegninger som rasterbilder"],
      ["grafer/*.png", "Gantt per produkt og scenariograf"],
      ["src/modell.py, src/modell.json", "Økonomisk modell (parametrisk, kan kjøres på nytt med nye antakelser)"],
      ["src/tegninger.py, src/tegnelib.py", "Parametriske tegningsgeneratorer (mål kan justeres og tegningene genereres på nytt)"],
    ], [40, 60]),
  ];
}

// ---------------------------------------------------------------- sammensetning
async function hoved() {
  const seksjoner = [];
  seksjoner.push(portrett([...forside()]));
  seksjoner.push(portrett([
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Innhold")] }),
    ...[
      "0. Sammendrag og anbefaling", "1. Markedsanalyse", "   1.1 Markedsoversikt · 1.2 Konkurrentkart · 1.3 Kundebehov · 1.4 Personas · 1.5 Seks hull · 1.6 Muligheter",
      "2. Kravspesifikasjon", "   2.1 Sikkerhet og materialer · 2.2 Elektriske krav · 2.3 Vedlikehold · 2.4 Prisnivåer og designparametre",
      "3. Fem produktkonsepter", "   3.1 GLØD · 3.2 AVTRYKK · 3.3 SAMKLANG · 3.4 LENE · 3.5 KJERNE (hver med konsepttegning A3)",
      "4. Økonomisk modell", "   4.1 Antakelser · 4.2 Investering · 4.3 Break-even · 4.4 Scenarier · 4.5 Pris- og distribusjonsstrategi",
      "5. Prototypetest og brukertesting", "6. IP, regulatorikk og merking", "7. Neste steg: de første 90 dagene",
      "Vedlegg A – Kilder · Vedlegg B – Ordliste · Vedlegg C – Filer",
    ].map((t) => new Paragraph({ spacing: { after: t.startsWith("   ") ? 140 : 40 }, indent: t.startsWith("   ") ? { left: 360 } : undefined, children: [new TextRun({ text: t.trim(), size: t.startsWith("   ") ? 17 : 21, bold: !t.startsWith("   "), color: t.startsWith("   ") ? FARGE.gra : FARGE.mork })] })),
    liten("Bruk navigasjonsruten i Word (Vis → Navigasjonsrute) for å hoppe mellom kapitler."),
    ...kap0(),
    ...kap1(),
    ...kap2(),
    h1("3. Fem produktkonsepter"),
    p("Hvert konsept starter med en nøkkeltalltabell og følger samme struktur: persona, problem, idé, differensiering, funksjoner, spesifikasjoner, ergonomi, samsvar, prototypeplan, produksjon, BOM, COGS, pris og margin, kanaler, tidslinje og risiko. Konsepttegningen (A3) står på egen liggende side etter hvert konsept."),
    tabell(["#", "Konsept", "Nytt prinsipp", "Segment", "Pris"], REKKE.map((id, i) => [String(i + 1), PR[id].navn, INN[id].tagline, PR[id].segment, `${nok(PR[id].pris)} kr`]), [5, 14, 51, 16, 14], { hoyreKol: [4] }),
  ]));
  REKKE.forEach((id, i) => seksjoner.push(...produktKapittel(id, i + 1).map((s, j) => {
    if (j === 0) s.children[0] = h1(`3.${i + 1} ${PR[id].navn} – ${PR[id].undertittel}`, false);
    return s;
  })));
  seksjoner.push(portrett([...kap4().map((x, i) => (i === 0 ? h1("4. Økonomisk modell", false) : x)), ...kap5(), ...kap6(), ...kap7(), ...vedlegg()]));

  const doc = new Document({
    creator: "VÅR produktteam", title: "VÅR – Produktportefølje v1.0", description: "Fem nye intimprodukter for kvinner",
    styles: STILER, numbering: NUMMERERING, sections: seksjoner,
  });
  fs.writeFileSync(path.join(ROT, "VAR_Produktportefolje_v1.docx"), await Packer.toBuffer(doc));

  // Ensidig sammendrag
  const g = PR.glod, k = PR.kjerne;
  const smal = (t) => new Paragraph({ spacing: { after: 70 }, children: L.runs(t, { size: 17 }) });
  const en = new Document({
    creator: "VÅR produktteam", title: "VÅR – Sammendrag", styles: STILER, numbering: NUMMERERING,
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 850, bottom: 700, left: 900, right: 900 } } },
      children: [
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "VÅR – fem nye intimprodukter for kvinner", bold: true, size: 30, color: FARGE.mork })] }),
        new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: FARGE.aksent, space: 4 } }, spacing: { after: 120 }, children: [new TextRun({ text: "Ensidig sammendrag og anbefaling · 6. oktober 2026 · Konfidensielt", size: 17, color: FARGE.gra })] }),
        smal("**Situasjon:** markedet (35–45 mrd. USD, +7–9 % i året) er dominert av lufttrykk- og vibrasjonsvarianter. De største plagene er uløste: nummenhet, passform, bærbare som faller av, utilgjengelig betjening, korte levetider og svakt personvern. Vi foreslår fem nye produktprinsipper som ikke er kopier av eksisterende leketøy."),
        tabell(["Produkt", "Nytt prinsipp", "Pris", "COGS 10k", "BM D2C", "Invest.", "Break-even", "Lansering", "Teknisk risiko"], REKKE.map((id) => {
          const x = PR[id];
          const kort = { glod: "Varme og rullende trykkbølge, ingen vibrasjon", avtrykk: "Formes etter kroppen og låses med vakuum", samklang: "Mikro-sugefeste og stimulering som følger partneren", lene: "Grepsfri kilepute, kroppstrykk styrer", kjerne: "Reparerbar kjerne + skall som kan kokes" }[id];
          return [`**${x.navn}**`, kort, `${nok(x.pris)} kr`, `${nok(x.cogs["10k"].landet_nok)} kr`, `${pct(x.bm_d2c)}`, `${mnok(x.fast_kost_nok)} M`, `${nok(x.breakeven_10k)} stk`, VURDERING[id].tid, VURDERING[id].tek];
        }), [12, 26, 9, 8, 8, 8, 10, 10, 9], { bredde: 10106, hoyreKol: [2, 3, 4, 5, 6], str: 15 }),
        new Paragraph({ spacing: { before: 60, after: 120 }, children: L.runs("Investering = utvikling, verktøy, sertifisering, IP og lanseringsmarkedsføring år 1. BM = bruttomargin på netto pris. Break-even på blandet DB (70 % D2C / 30 % engros).", { size: 14, color: FARGE.gra }) }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Anbefaling: prioriter GLØD og KJERNE", bold: true, size: 22, color: FARGE.mork })] }),
        smal(`**1. GLØD (premium, ${nok(g.pris)} kr):** størst udekket behov (overgangsalder, smerte, nummenhet), høyest dekningsbidrag (${nok(g.db_d2c)} kr per enhet D2C), break-even ved cirka ${nok(g.breakeven_10k)} enheter, og tilgang til kanaler som ikke rammes av annonsebegrensningene (apotek, helsepersonell, medieomtale). Patentkandidat. MVP i uke ${g.uker_prototype}, lansering i måned 15.`),
        smal(`**2. KJERNE (inngang, ${nok(k.pris)} kr):** lavest teknisk risiko og raskest til marked (MVP i uke ${k.uker_prototype}, lansering i måned 12). Gjentakende inntekt fra skall, svar på EUs krav om utskiftbare batterier og **plattform** for LENE og senere varianter.`),
        smal("**Parallelt (lav kostnad):** AVTRYKK fase 0-mulighetsstudie for jamming (6 uker, 150k kr) på grunn av høy IP-verdi. SAMKLANG-teksturspor med go/no-go i uke 10. LENE bygges på KJERNE-plattformen med partnere og tilskudd."),
        new Paragraph({ spacing: { before: 100, after: 60 }, children: [new TextRun({ text: "Økonomi (sannsynlig scenario, 3 år)", bold: true, size: 20, color: FARGE.mork })] }),
        tabell(["", "GLØD", "KJERNE", "Sum prioritert"], [
          ["Enheter år 1 / 2 / 3", g.scen.Sannsynlig.map((y) => nok(y.enheter)).join(" / "), k.scen.Sannsynlig.map((y) => nok(y.enheter)).join(" / "), ""],
          ["Netto omsetning 3 år", `${mnok(sumScen(g, "Sannsynlig", "omsetning"))} MNOK`, `${mnok(sumScen(k, "Sannsynlig", "omsetning"))} MNOK`, `${mnok(sumScen(g, "Sannsynlig", "omsetning") + sumScen(k, "Sannsynlig", "omsetning"))} MNOK`],
          ["Investering inkl. lansering", `${mnok(g.fast_kost_nok)} MNOK`, `${mnok(k.fast_kost_nok)} MNOK`, `${mnok(g.fast_kost_nok + k.fast_kost_nok)} MNOK`],
          ["Akk. resultat etter år 3*", `${mnok(g.scen.Sannsynlig[2].akkumulert)} MNOK`, `${mnok(k.scen.Sannsynlig[2].akkumulert)} MNOK`, `${mnok(g.scen.Sannsynlig[2].akkumulert + k.scen.Sannsynlig[2].akkumulert)} MNOK`],
        ], [34, 22, 22, 22], { bredde: 10106, hoyreKol: [1, 2, 3] }),
        new Paragraph({ spacing: { before: 40, after: 100 }, children: L.runs("*DB minus markedsføring og investering, før lønn til grunnleggerteam og felles kostnader. SkatteFUNN (19 %) og Innovasjon Norge kan redusere egenkapitalbehovet.", { size: 14, color: FARGE.gra }) }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Neste 90 dager (1,37 MNOK)", bold: true, size: 20, color: FARGE.mork })] }),
        smal("Analyse av anmeldelser og intervjuer → FTO og norske prioritetssøknader (GLØD, KJERNE) → CAD og simulering → funksjonelle α-prototyper (uke 12) → AVTRYKK fase 0 → søknader om SkatteFUNN og Innovasjon Norge → rekruttering til brukertest runde 1."),
        smal("**Beslutning som trengs:** godkjenne prioritering, 90-dagersbudsjett og engasjement av patentkontor og regulatorisk rådgiver før noe vises eksternt."),
      ],
    }],
  });
  fs.writeFileSync(path.join(ROT, "VAR_Sammendrag_1side.docx"), await Packer.toBuffer(en));
  console.log("ok");
}

hoved().catch((e) => { console.error(e); process.exit(1); });
