/*
 * Fiksa – dekoderings-/analysemotor.
 * Regelbasert kunnskapsbase: kategori -> kjente problemer, matchet via nøkkelord
 * i fritekstbeskrivelse + symptomer. MVP-erstatning for ML-basert bildeanalyse.
 */

const CATEGORIES = [
  { id: "elektronikk", label: "Elektronikk", icon: "📺" },
  { id: "husholdning", label: "Husholdningsapparater", icon: "🧺" },
  { id: "møbler", label: "Møbler / IKEA", icon: "🪑" },
  { id: "trening", label: "Treningsutstyr", icon: "🏋️" },
  { id: "annet", label: "Annet", icon: "🧩" },
];

// Norske fyllord/verbositet som fjernes fra brukerens fritekst før den vises igjen.
const FLUFF_WORDS = [
  "liksom", "på en måte", "jeg vet ikke helt men", "jeg vet ikke", "bare",
  "egentlig", "på en eller annen måte", "for å være ærlig", "altså",
  "det er sånn at", "det er bare det at", "typ", "sikkert", "kanskje",
  "vet ikke helt", "hmm", "æsj", "uansett",
];

const PROBLEMS = [
  // ---------------- ELEKTRONIKK ----------------
  {
    id: "tv-svart-skjerm",
    category: "elektronikk",
    title: "TV slår seg på, men skjermen forblir svart / ingen bilde",
    keywords: ["tv", "skjerm", "svart skjerm", "ingen bilde", "bilde", "fjernsyn", "lys men ikke bilde", "standby"],
    difficulty: 2, timeMinutes: 20,
    tools: ["HDMI-kabel (helst en du vet fungerer)", "Lommelykt"],
    steps: [
      "Sjekk at strømkabelen sitter helt inne, både i TV og stikkontakt.",
      "Sjekk at riktig HDMI/kilde er valgt med fjernkontrollen (Source/Input-knapp).",
      "Bytt HDMI-kabel og prøv en annen HDMI-inngang på TV-en.",
      "Rett en lommelykt mot skjermen i et mørkt rom – ser du et svakt bilde, er det trolig bakgrunnsbelysningen (LED-backlight) som er defekt, ikke selve panelet.",
      "Gjør en strøm-reset: trekk ut støpselet, hold inne av/på-knappen på TV-en i 10 sekunder, koble til strøm igjen.",
    ],
    safety: ["Koble alltid fra strøm før du åpner bakdekselet.", "Kondensatorer inni TV-en kan holde spenning lenge etter avslått strøm – ikke åpne kabinettet selv."],
    whenPro: "Hvis lommelykt-testen viser et svakt bilde (backlight-feil), eller hvis skjermen har synlige riper/sprekker – dette krever fagperson eller bytte av panel.",
  },
  {
    id: "ruter-ikke-nett",
    category: "elektronikk",
    title: "Internett/ruter kobler ikke til eller er veldig treg",
    keywords: ["internett", "ruter", "router", "wifi", "wi-fi", "nett", "kobler ikke", "treg", "mister forbindelse", "modem"],
    difficulty: 1, timeMinutes: 15,
    tools: [],
    steps: [
      "Trekk ut strømmen til ruteren, vent 30 sekunder, koble til igjen (full omstart, ikke bare av/på-knapp).",
      "Sjekk alle kabler bak ruteren – de skal sitte helt inn, spesielt WAN/internett-kabelen fra veggkontakten.",
      "Se på lysene: fast grønt/blått = ok, blinkende rødt eller av = feil på den linjen. Sjekk ruterens manual for hva fargene betyr på akkurat din modell.",
      "Flytt ruteren vekk fra mikrobølgeovn, andre elektronikk og tykke vegger – dette forstyrrer WiFi-signalet.",
      "Hvis ingenting hjelper: fabrikkinnstill ruteren (nål i reset-hull i ca. 10 sek) – merk at dette sletter passord/oppsett du må sette opp på nytt.",
    ],
    safety: [],
    whenPro: "Hvis lysene viser feil selv rett etter omstart, eller hvis internett er nede for hele nabolaget – kontakt internettleverandøren, ikke fikse ruteren selv.",
  },

  // ---------------- HUSHOLDNINGSAPPARATER ----------------
  {
    id: "vaskemaskin-lekker-stoy",
    category: "husholdning",
    title: "Vaskemaskin lekker, bråker eller tømmer ikke vannet",
    keywords: ["vaskemaskin", "lekker", "lekkasje", "støy", "bråker", "tømmer ikke", "vann blir stående", "e-kode", "feilkode"],
    difficulty: 2, timeMinutes: 30,
    tools: ["Bøtte/klut (for restvann)", "Skrutrekker (evt.)"],
    steps: [
      "Sjekk pumpefilteret nederst foran på maskinen – skru det forsiktig opp over en bøtte, fjern mynter/knapper/lo som blokkerer.",
      "Sjekk at avløpsslangen bak ikke er knekt eller kveilet for høyt/lavt i forhold til maskinen.",
      "Sjekk at maskinen står i vater – bruk et vater-app eller vannpass, juster føttene under maskinen.",
      "Se etter feilkode i display og slå opp koden i bruksanvisningen for akkurat den modellen – koder betyr ofte spesifikt 'vannlås', 'pumpe' eller 'dør ikke lukket'.",
      "Rengjør filteret og gummilisten i døren jevnlig for å forebygge lukt og lekkasje.",
    ],
    safety: ["Koble fra strøm og steng vanntilførsel før du åpner filter eller slanger.", "Restvann i filteret kan være varmt – la maskinen avkjøles hvis den nettopp har kjørt et program."],
    whenPro: "Hvis maskinen lekker fra selve trommelen/bak panelet (ikke filter/slange), eller feilkoden peker på motor/elektronikk – tilkall autorisert hvitevareservice.",
  },
  {
    id: "kjokkenmaskin-stopper",
    category: "husholdning",
    title: "Kaffetrakter/kjøkkenmaskin/blender stopper å virke eller lager ikke det den skal",
    keywords: ["kaffetrakter", "kjøkkenmaskin", "blender", "stopper", "virker ikke", "lager ikke kaffe", "kalk", "kalkbelegg", "vil ikke starte"],
    difficulty: 1, timeMinutes: 25,
    tools: ["Eddik eller sitronsyre (avkalking)", "Myk klut"],
    steps: [
      "Sjekk at støpsel og stikkontakt fungerer – test med et annet apparat i samme kontakt.",
      "Hvis apparatet nettopp har vært i bruk lenge: la det stå og avkjøles i 30 minutter – mange har et overopphetingsvern som må resette seg selv.",
      "For kaffetraktere: kjør et program med eddik/vann (1:3) eller sitronsyre for å fjerne kalkbelegg som ofte stopper vanngjennomstrømning.",
      "Sjekk at lokk/deksel/mugg er satt riktig på – mange kjøkkenmaskiner har en sikkerhetsbryter som hindrer start hvis noe ikke er låst korrekt.",
      "Se etter en sikring/reset-knapp under eller bak apparatet (vanlig på blendere og kjøkkenmaskiner).",
    ],
    safety: ["Trekk alltid ut støpselet før du fjerner blader/knivdeler.", "Ikke ha hendene i nærheten av kniver selv når apparatet er avslått, med mindre støpselet er ute."],
    whenPro: "Hvis apparatet lukter brent, gnistrer, eller sikringen i sikringsskapet går hver gang du bruker det – slutt å bruke det og få det sjekket av fagperson.",
  },

  // ---------------- MØBLER / IKEA ----------------
  {
    id: "dor-skjev-hengsel",
    category: "møbler",
    title: "Skapdør henger skjevt eller lukker ikke ordentlig",
    keywords: ["dør", "skjev", "henger", "hengsel", "skap", "ikea", "lukker ikke", "skrenger"],
    difficulty: 1, timeMinutes: 10,
    tools: ["Stjerneskrutrekker (evt. inkludert IKEA-nøkkel)"],
    steps: [
      "Finn de to justeringsskruene på hengselet (som regel synlige når døren er åpen) – én justerer høyde, én justerer dybde/side-til-side.",
      "Skru den ene justeringsskruen litt om gangen og lukk døren for å sjekke – juster i små steg.",
      "Sjekk at hengselplaten er godt festet til skapsiden – etterstram skruene der om nødvendig.",
      "Hvis flere dører på samme skap henger skjevt: sjekk at hele skapet står i vater mot vegg/gulv, ikke bare hengselet.",
    ],
    safety: [],
    whenPro: "Hvis skruehullene er så utslitt at skruene ikke lenger tar tak (spinner rundt), fyll hullet med tannpirker + trelim, la tørke, og skru på nytt – går det fortsatt ikke, bytt hengselplate.",
  },
  {
    id: "mobel-vakler",
    category: "møbler",
    title: "Stol eller bord vakler / er ustabilt",
    keywords: ["stol", "bord", "vakler", "ustabil", "løs", "gynger", "møbel løst"],
    difficulty: 1, timeMinutes: 15,
    tools: ["Sekskantnøkkel (Allen-nøkkel, ofte inkludert)"],
    steps: [
      "Snu møbelet opp ned og etterstram alle synlige skruer og kam-låser (de runde plastlåsene i IKEA-møbler) – disse løsner naturlig over tid.",
      "Sjekk om noen hull er utslitt (skruen spinner uten å ta tak): fyll hullet med tannpirkere dyppet i trelim, la tørke i minst 1 time, skru inn på nytt.",
      "Sjekk at møbelet står på jevnt underlag – prøv å flytte det til et annet gulvområde for å utelukke at gulvet er ujevnt.",
      "Undersøk om en list eller stag har sprukket – dette krever ofte reparasjon med trelim og tvinge, ikke bare skruing.",
    ],
    safety: ["Sørg for at høye skap er sikret til vegg med tipp-sikring, spesielt der barn ferdes."],
    whenPro: "Hvis en bærende list eller ben er brukket/sprukket i selve trevirket, og møbelet bærer vekt (seng, stor bokhylle) – vurder bytte av del fremfor limreparasjon.",
  },
  {
    id: "skuff-seg-fast",
    category: "møbler",
    title: "Skuff går tregt, seg fast eller sporer av",
    keywords: ["skuff", "seg fast", "glir ikke", "skinne", "sporer av", "tung å åpne"],
    difficulty: 1, timeMinutes: 10,
    tools: ["Støvsuger/klut", "Silikonspray eller lysvoks"],
    steps: [
      "Trekk skuffen helt ut og rengjør skinnene for støv, hår og smuler med klut eller støvsuger.",
      "Smør skinnene tynt med silikonspray eller gni med lysvoks/såpe (unngå vanlig olje – den samler mer støv).",
      "Sjekk at skuffen ikke er overfylt eller lastet skjevt slik at den henger på én side.",
      "Se om skinnehjulet er sprukket eller mangler – dette må da byttes, ofte som reservedel fra produsent.",
    ],
    safety: [],
    whenPro: "Hvis metallskinnen selv er bøyd/skadet, kontakt forhandler for reservedel – dette er sjelden noe man kan rette opp selv.",
  },

  // ---------------- TRENINGSUTSTYR ----------------
  {
    id: "tredemolle-belte",
    category: "trening",
    title: "Tredemølle: beltet glipper, henger seg opp eller lager støy",
    keywords: ["tredemølle", "belte", "løpebånd", "glidebrett", "akser", "hakking", "sklir"],
    difficulty: 2, timeMinutes: 30,
    tools: ["Sekskantnøkkel (følger ofte med tredemøllen)", "Silikonsmøring for løpebånd (ikke vanlig olje)"],
    steps: [
      "Slå av og koble fra strøm før du justerer noe under beltet.",
      "Sjekk beltestrammingen: løft midt på beltet – skal løftes ca. 5-8 cm fra glidebrettet, ikke mer.",
      "Juster strammeskruene bak på rammen likt på begge sider for å rette opp belte som går skjevt.",
      "Smør mellom belte og glidebrett med produsentens anbefalte silikonsmøring hvis manualen tilsier det (ikke alle trenger dette, sjekk modellens manual).",
      "Lytt etter hvor lyden kommer fra: fremre/bakre valse (rulling) tyder ofte på behov for smøring, motorhus tyder på noe mer alvorlig.",
    ],
    safety: ["Aldri stikk fingre eller verktøy under beltet mens det er koblet til strøm.", "Sjekk nødstoppen fungerer før du bruker møllen igjen."],
    whenPro: "Hvis motoren lager ny lyd, lukter svidd, eller beltet henger seg fast gjentatte ganger etter justering – få den sjekket av fagperson, ikke fortsett å bruke den.",
  },
  {
    id: "vektutstyr-knirk",
    category: "trening",
    title: "Manual/vektstang eller styrkeapparat knirker eller er løst",
    keywords: ["manual", "vektstang", "hantel", "knirker", "løs", "styrkeapparat", "kabel", "wire"],
    difficulty: 1, timeMinutes: 15,
    tools: ["Fastnøkkel eller sekskantnøkkel som passer sluttstykkene"],
    steps: [
      "Sjekk sluttstykkene (collars) på hver ende av stangen – etterstram dem, de løsner ved bruk over tid.",
      "På apparater med wire/kabel: sjekk at kabelen løper rett i skivene (pulleys) og ikke har hoppet av sporet.",
      "Smør synlige lagerpunkter og gjenger lett med maskinolje der metall møter metall, ikke på gripeflater.",
      "Sjekk at alle bolter i rammen er tiltrukket i henhold til momentanbefaling i manualen, hvis tilgjengelig.",
    ],
    safety: ["Sjekk alltid at en wire ikke er flisete/frynsete før bruk – dette kan ryke under belastning.", "Test med lett vekt etter reparasjon før du bruker full belastning."],
    whenPro: "Hvis en wire er synlig frynsete/skadet, eller en sveis/ramme har synlig sprekk – dette er en sikkerhetsrisiko og må byttes av fagperson/produsent, ikke repareres.",
  },

  // ---------------- ANNET / DAGLIGDAGS ----------------
  {
    id: "glidelas-seg-fast",
    category: "annet",
    title: "Glidelås seg fast eller vil ikke gli",
    keywords: ["glidelås", "jakke", "sekk", "seg fast", "sitter fast"],
    difficulty: 1, timeMinutes: 5,
    tools: ["Blyant (grafitt) eller stearinlys/såpe"],
    steps: [
      "Se nøye etter om stoff har kilt seg i glidelåsen – dra forsiktig stoffet ut med negler eller en pinsett, ikke rykk i selve glideren.",
      "Gni grafitt fra en blyant, eller stearinlys/tørrsåpe, langs tennene på glidelåsen for å smøre den.",
      "Beveg glideren sakte opp og ned flere ganger for å fordele smøringen.",
      "Hvis glideren selv er utvidet/skadet (glipper etter lukking), klem den forsiktig sammen med en flattang.",
    ],
    safety: [],
    whenPro: "Hvis tenner mangler eller glideren er knekt, må hele glidelåsen som regel byttes av en syerske/skomaker – dette lar seg sjelden fikse hjemme.",
  },
  {
    id: "ripe-gulv-mobel",
    category: "annet",
    title: "Ripe i gulv, parkett eller møbeloverflate",
    keywords: ["ripe", "gulv", "parkett", "flekk", "møbeloverflate", "malingsskade"],
    difficulty: 1, timeMinutes: 20,
    tools: ["Voksstift eller retusjeringspenn i riktig farge", "Myk klut"],
    steps: [
      "Rengjør området med mild såpe og la tørke helt før du gjør noe annet.",
      "For lette riper i tre: gni valnøtt (ja, kjernen) langs ripen – oljen i nøtten kan skjule mindre riper.",
      "For dypere riper: bruk voksstift eller retusjeringspenn i matchende farge, fyll ripen og fjern overskudd med klut mens det er ferskt.",
      "Poler forsiktig med en myk klut når reparasjonen har tørket i henhold til produktets anvisning.",
    ],
    safety: [],
    whenPro: "Ved dype riper i lakkert parkett som går gjennom hele sjiktet, eller store synlige skader i synlige møbler, vurder profesjonell sliping/lakkering for et pent resultat.",
  },
];

// Generisk fallback-guide når ingen kjent problem-mal matcher godt nok.
const GENERIC_FALLBACK = {
  id: "generisk",
  title: "Generell feilsøking",
  difficulty: 1, timeMinutes: 15,
  tools: ["Skrutrekkersett (stjerne + flat)", "Lommelykt", "Kamera (for å dokumentere før du skrur)"],
  steps: [
    "Ta bilde av produktet før du gjør noe, slik at du husker hvordan alt satt.",
    "Se etter merke, modellnummer og evt. serienummer (ofte på en liten plate/klistremerke) – dette gjør det lettere å søke opp riktig bruksanvisning.",
    "Søk opp produsentens bruksanvisning for nøyaktig denne modellen – de fleste produsenter har PDF-versjoner søkbare på nett.",
    "Sjekk det mest åpenbare først: strøm, tilkoblinger, løse skruer, blokkeringer eller smuss.",
    "Prøv en fullstendig av/på-omstart (koble fra strøm i minst 30 sekunder) hvis produktet er elektrisk.",
  ],
  safety: ["Koble fra strøm/batteri før du åpner noe elektrisk.", "Stopp og ikke fortsett hvis du lukter svidd lukt, ser gnister, eller produktet blir unormalt varmt."],
  whenPro: "Hvis du er usikker på om noe er en sikkerhetsrisiko (strøm, gass, bærende konstruksjon), eller garantien fortsatt gjelder – kontakt fagperson eller produsentens support fremfor å fortsette selv.",
};

/**
 * Fjerner vanlige fyllord/verbositet fra fritekst, uten å endre kjerneinnholdet.
 */
function stripFluff(text) {
  let cleaned = text;
  FLUFF_WORDS.forEach((w) => {
    cleaned = cleaned.replace(new RegExp(w, "gi"), "");
  });
  return cleaned.replace(/\s{2,}/g, " ").replace(/\s+([,.!?])/g, "$1").trim();
}

/**
 * Matcher fritekst + symptomer + valgt kategori mot kunnskapsbasen.
 * Returnerer beste treff (eller generisk fallback) og en score for gjennomsiktighet.
 */
function matchProblem(categoryId, freeText, symptomLines) {
  const haystack = (freeText + " " + symptomLines.join(" ")).toLowerCase();
  let best = null;
  let bestScore = 0;

  PROBLEMS.forEach((p) => {
    let score = 0;
    p.keywords.forEach((kw) => {
      if (haystack.includes(kw.toLowerCase())) score += 1;
    });
    if (categoryId && p.category === categoryId) score += 1.5; // kategori-bonus
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  });

  if (!best || bestScore < 1) {
    return { problem: GENERIC_FALLBACK, matched: false, score: 0 };
  }
  return { problem: best, matched: true, score: bestScore };
}

function difficultyLabel(level) {
  if (level <= 1) return { text: "Enkelt", cls: "badge-green" };
  if (level === 2) return { text: "Middels", cls: "badge-yellow" };
  return { text: "Krevende", cls: "badge-red" };
}
