'use strict';
// Konspirasjonslabben – motoren.
// Rene funksjoner. Ingen nettverk, ingen tilstand. Alt her kan testes,
// noe som er mer enn man kan si om teoriene den produserer.

// ---------------------------------------------------------------------------
// Dagens sak
// ---------------------------------------------------------------------------

const SAK = {
  dato: '2026-10-25',
  tittel: 'Natt til søndag forsvant en time. Igjen.',
  ingress:
    'Klokka 03:00 natt til 25. oktober ble alle klokker i Norge stilt tilbake til 02:00. ' +
    'Vintertid. Timen mellom 02 og 03 skjedde to ganger. Skjenkestedene i Oslo stengte likevel kl. 03 – ' +
    'den andre gangen. Samme natt: farevarsel om storm på kysten av Rogaland og Hordaland ' +
    '(lavtrykket omtalt som «Boelo» i lokalpressen).',
  fakta: [
    'Norge har hatt sommertid fast siden 1980. Før det: 1916, 1940–45 og 1959–65.',
    'EU-parlamentet stemte i 2019 for å avskaffe klokkeskiftet. Saken har stått fast i Rådet siden.',
    'Ingen tid forsvinner. Den flyttes. Dagslyset er nøyaktig like langt uansett hva mikrobølgeovnen sier.',
    'Klokka på stekeovnen din er feil. Den har vært feil siden mars. Det er ikke en konspirasjon, det er latskap.',
  ],
};

// ---------------------------------------------------------------------------
// Oppgavene – stigende galskap
// ---------------------------------------------------------------------------

const NIVAER = [
  {
    id: 'cuibono',
    nr: 1,
    navn: 'Den stjålne timen',
    rang: 'Skeptisk tante',
    intro:
      'Jeg satt på kjøkkenet kl. 02:59 og så klokka på telefonen hoppe tilbake til 02:00 som om ingenting hadde skjedd. ' +
      'Kaffen min ble kald to ganger på samme time. Noen tjener på dette. Noen tjener ALLTID på dette. ' +
      'Spinn Cui Bono-maskinen, få en mistenkt, et motiv og et «bevis» – og skriv teorien med egne ord.',
    oppgave: 'Snurr maskinen. Skriv en teori (minst to setninger) om hvem som egentlig tjener på den ekstra timen.',
    bakrom: {
      navn: 'Cui bono-feilslutningen',
      tekst:
        'At noen tjener på noe, betyr ikke at de har forårsaket det. Reflekslobbyen tjener på mørke ettermiddager. ' +
        'Det gjør også lampebutikker, tekoppprodusenter og folk som liker å være sure i november. ' +
        '«Hvem tjener på det?» er et godt spørsmål for journalister – og et elendig bevis.',
    },
  },
  {
    id: 'tallmagi',
    nr: 2,
    navn: 'Tallmagi i Justervesenets kjeller',
    rang: 'Kommentarfelt-kriger',
    intro:
      'Klokka 03 ble til 02. 3 minus 2 er 1. EN time. Datoen 25.10.2026 – tverrsum 18. 18 er 6+6+6. ' +
      'Jeg måtte legge fra meg kalkulatoren og gå en tur i stormen. Kom tilbake. Regnet videre. ' +
      'Skriv inn HVA SOM HELST – en dato, navnet ditt, postnummeret – og se maskinen finne Det Hemmelige Tallet.',
    oppgave: 'Mat Tallmagi-maskinen med minst tre ulike ting. Legg merke til hva den må «legge til» for å få det til å stemme.',
    bakrom: {
      navn: 'Texas-skarpskytteren',
      tekst:
        'Skyt på låveveggen først, mal blinken rundt hullene etterpå. Med nok tall, nok regnearter og nok «magiske» mål ' +
        'kan du treffe hva som helst. Maskinen finner ALLTID et treff – fordi den har lov til å jukse med konstanter ' +
        'som «antall timer i døgnet» og «den stjålne timen». Akkurat som mennesker gjør.',
    },
  },
  {
    id: 'traad',
    nr: 3,
    navn: 'Den røde tråden',
    rang: 'Telegram-kanal-admin',
    intro:
      'Korktavla henger over sofaen nå. Naboen har sluttet å hilse. Stormen, klokka, Vinmonopolet, ' +
      'stekeovnen – det henger sammen, jeg ser det, jeg ser det bare ikke helt ennå. ' +
      'Koble brikkene. Hver tråd krever et «fordi». Hver tråd gjør historien bedre. Og mindre sann.',
    oppgave: 'Lag minst fire forbindelser på tavla. Bonus hvis du klarer å lage en sirkel.',
    bakrom: {
      navn: 'Konjunksjonsfeilen',
      tekst:
        'En historie med mange detaljer FØLES mer troverdig. Matematikken sier det motsatte: hver nye kobling ' +
        'må OGSÅ være sann, og sannsynlighetene ganges. Fire ledd på 35 % hver er 1,5 %. Ti ledd er 0,003 %. ' +
        'Og hvis tråden går i ring, har du ikke et bevis – du har et sirkelresonnement med teip på.',
    },
  },
  {
    id: 'sitat',
    nr: 4,
    navn: 'Sitatsmia',
    rang: 'Podkast med 4-timersepisoder',
    intro:
      'Jeg fikk tak i pressemeldingen. Den er kjedelig. Den er SKREVET for å være kjedelig. ' +
      'Men gjemt inni den kjedelige teksten står sannheten – du må bare fjerne ordene som er i veien for den.',
    oppgave: 'Klikk bort ord fra pressemeldingen til den sier noe uhyggelig. Alt du beholder er et «ekte sitat».',
    bakrom: {
      navn: 'Sitatfisking (quote mining)',
      tekst:
        'Hvert ord i sitatet ditt er ekte. Rekkefølgen er ekte. Og meningen er fullstendig falsk. ' +
        'Tre prikker er det farligste tegnet i det norske alfabetet. Sjekk alltid originalkilden – ' +
        'hvis noen ikke lenker til den, er det sjelden fordi de glemte det.',
    },
  },
  {
    id: 'immun',
    nr: 5,
    navn: 'Motbevis-immunforsvaret',
    rang: 'Ufalsifiserbar',
    intro:
      'De kom med fakta. Selvfølgelig kom de med fakta. Det er DET de gjør. ' +
      'Jeg satt i mørket (det var 16:30, så det var mørkt, takk for den, vintertid) og innså: ' +
      'en ekte teori blir STERKERE av motbevis. Gjør teorien din immun.',
    oppgave: 'For hvert motbevis: forklar hvorfor det egentlig bekrefter teorien.',
    bakrom: {
      navn: 'Ufalsifiserbarhet',
      tekst:
        'En påstand som ikke KAN motbevises, er ikke sterk – den er tom. Hvis både bevis og motbevis bekrefter teorien, ' +
        'sier teorien ingenting om verden. Karl Popper kalte det pseudovitenskap. Onkelen din kaller det «å tenke selv».',
    },
  },
  {
    id: 'viral',
    nr: 6,
    navn: 'Viralovnen',
    rang: 'Grand Master of the Red String',
    intro:
      'Siste steg. Alt jeg har funnet skal ut. Ikke i en rapport – ingen leser rapporter. ' +
      'Det skal ut i et innlegg med store bokstaver, tre emojier og ordene «DEL FØR DE SLETTER DETTE». ' +
      'Skriv innlegget. Viralovnen spår hvor langt det går. Spoiler: lenger enn sannheten.',
    oppgave: 'Skriv det endelige innlegget. Publiser det til Arkivet hvis du tør.',
    bakrom: {
      navn: 'Usannhet reiser raskere',
      tekst:
        'En MIT-studie av 126 000 saker på Twitter (Vosoughi, Roy & Aral, Science 2018) fant at usanne nyheter ' +
        'spredte seg raskere, lenger og bredere enn sanne – og at det var mennesker, ikke roboter, som delte dem. ' +
        'Det nye og opprørende vinner. Det kjedelige og korrekte taper. Hver gang du deler før du sjekker, ' +
        'er du en del av ovnen.',
    },
  },
];

// ---------------------------------------------------------------------------
// Nivå 1: Cui bono-maskinen
// ---------------------------------------------------------------------------

const MISTENKTE = [
  'Reflekslobbyen',
  'Den Hemmelige Lysforeningen av 1814',
  'Vinmonopolets tidsavdeling',
  'Stekeovnklokke-kartellet',
  'Mørketidsindustrien',
  'Lavtrykkskontoret (avdeling for navngitte stormer)',
  'Klokkestillere Uten Grenser',
  'Sauene på Utsira',
  'Det internasjonale ullsokk-konsortiet',
  'Dagslyslageret under Svalbard',
];

const MOTIVER = [
  'samle opp alle stjålne timer i et hvelv og selge dem tilbake i mars',
  'gjøre ettermiddagene mørke nok til at ingen ser hva de holder på med',
  'teste om befolkningen merker at tiden manipuleres (de gjør ikke det)',
  'skjule at stormen egentlig startet en time tidligere',
  'gi skjenkestedene en ekstra time de ikke får lov til å bruke',
  'synkronisere alle norske mikrobølgeovner til ett felles signal',
  'trene nordmenn i å godta ting de ikke forstår, én time i året',
  'flytte en hel time ut av statsbudsjettet uten at Stortinget merker det',
];

const BEVIS = [
  'Klokka på stekeovnen min stilte seg IKKE. Hvorfor ikke? Hva vet den?',
  'Stormen kom SAMME natt. Tilfeldig? Meteorologene sier ja. Selvfølgelig sier de det.',
  'Skjenkestedene stengte 03:00 – men hvilken 03:00?',
  'EU ville avskaffe klokkeskiftet i 2019. Det står FORTSATT fast. Hvem stoppet det?',
  'Telefonen visste det før meg. Jeg sa ikke ifra til telefonen.',
  'Vintertid ble innført i natt. Natt. Når alle sover. Når ingen ser.',
  'Datoen 25.10 – 2510 – baklengs er det 0152. Kl. 01:52 var det fortsatt en vanlig time. Etter det: kaos.',
];

function trekk(liste, rnd) {
  return liste[Math.floor(rnd() * liste.length)];
}

function cuiBono(rnd = Math.random) {
  return { mistenkt: trekk(MISTENKTE, rnd), motiv: trekk(MOTIVER, rnd), bevis: trekk(BEVIS, rnd) };
}

// ---------------------------------------------------------------------------
// Tekstanalyse: overbevisningskraft vs. sannsynlighet
// ---------------------------------------------------------------------------

// Hver teknikk er ekte retorikk fra ekte kommentarfelt.
const TEKNIKKER = [
  { id: 'tilfeldig', re: /\b(tilfeldig\s*\?|ikke tilfeldig|ingen tilfeldighet|tilfeldighet\s*\?)/gi, vekt: 12,
    navn: '«Tilfeldig?»', forklaring: 'Antyder mønster uten å påstå det. Tilfeldigheter skjer hele tiden – det er det de gjør.' },
  { id: 'baresporre', re: /\b(bare (spør|stiller? spørsmål|lurer)|jeg bare spør|det er lov å spørre)/gi, vekt: 12,
    navn: 'Just asking questions', forklaring: 'Et spørsmål kan ikke tilbakevises. Derfor er det så praktisk å gjemme en påstand i ett.' },
  { id: 'de', re: /\b(de der oppe|de mektige|eliten|makteliten|de som styrer|de vil ikke at du)/gi, vekt: 10,
    navn: 'Det navnløse «de»', forklaring: 'Fienden har aldri navn, adresse eller lønnsslipp. Da kan den heller ikke etterprøves.' },
  { id: 'research', re: /\b(gjør (din|deres|egen) (egen )?research|sjekk selv|google det|søk det opp)/gi, vekt: 14,
    navn: '«Gjør din egen research»', forklaring: 'Betyr nesten alltid: let til du finner noen som er enig.' },
  { id: 'taushet', re: /\b(hvorfor (snakker|nevner|skriver) ingen|media(ne)? (tier|skjuler|nekter)|ingen tør å si|det de ikke forteller)/gi, vekt: 12,
    navn: 'Den talende tausheten', forklaring: 'At ingen skriver om noe, blir tatt som bevis for at det er sant. Det er heller bevis for at det er kjedelig eller feil.' },
  { id: 'penger', re: /\b(følg pengene|hvem tjener på|cui bono|hvem betaler)/gi, vekt: 10,
    navn: 'Følg pengene', forklaring: 'Motiv er ikke bevis. Se nivå 1.' },
  { id: 'vaakne', re: /\b(våkn(e|er) opp|sauer|sauene|saueflokk|sheeple|åpne øynene|de sover)/gi, vekt: 9,
    navn: 'Våkne vs. sauer', forklaring: 'Deler verden i innsikt (oss) og dumhet (alle andre). Smigrer leseren – og gjør kritikk til et sauetegn.' },
  { id: 'tenk', re: /\b(tenk over det|tenk på det|la det synke inn|ser du det nå|koble prikkene)/gi, vekt: 6,
    navn: 'Koble prikkene', forklaring: 'Overlater den siste, umulige slutningen til leseren – så slipper forfatteren å forsvare den.' },
  { id: 'slett', re: /\b(del (før|for) de sletter|blir sensurert|de kommer til å slette|før det forsvinner)/gi, vekt: 14,
    navn: 'Sensur-hastverk', forklaring: 'Skaper hastverk og immunitet på én gang: hvis innlegget fjernes, var det jo sant.' },
  { id: 'kilde', re: /\b(en venn av meg|kilder sier|jeg har hørt|en insider|noen som jobber i)/gi, vekt: 8,
    navn: 'Den anonyme insideren', forklaring: 'Kan ikke sjekkes, og derfor kan den heller ikke ta feil.' },
];

const KOBLINGSORD = /\b(fordi|derfor|som betyr|altså|det betyr|dermed|som igjen|og det forklarer|nettopp derfor)\b/gi;

function tellTreff(tekst, re) {
  const m = tekst.match(re);
  return m ? m.length : 0;
}

function capsAndel(tekst) {
  const ord = tekst.match(/[A-Za-zÆØÅæøå]{3,}/g) || [];
  if (!ord.length) return 0;
  const store = ord.filter((o) => o === o.toUpperCase()).length;
  return store / ord.length;
}

// Overbevisningskraft og sannsynlighet beveger seg i motsatt retning. Det er hele poenget.
function analyser(tekst) {
  tekst = String(tekst || '').slice(0, 4000);
  const funnet = [];
  let poeng = 0;
  for (const t of TEKNIKKER) {
    const n = tellTreff(tekst, t.re);
    if (n) {
      funnet.push({ id: t.id, navn: t.navn, forklaring: t.forklaring, antall: n });
      poeng += t.vekt * Math.min(n, 3);
    }
  }
  const utrop = tellTreff(tekst, /[!?]{2,}/g);
  const tall = tellTreff(tekst, /\d+/g);
  const koblinger = tellTreff(tekst, KOBLINGSORD);
  const caps = capsAndel(tekst);
  const setninger = tekst.split(/[.!?]+/).filter((s) => s.trim().length > 8).length;

  poeng += Math.min(utrop, 5) * 4;
  poeng += Math.min(tall, 6) * 3;
  poeng += Math.min(koblinger, 8) * 5;
  poeng += Math.round(caps * 40);
  poeng += Math.min(setninger, 10) * 2;
  const overbevisning = Math.max(0, Math.min(100, poeng));

  // Hver påstand antas (sjenerøst) 50 % sann, hver kobling 35 %.
  const pastander = Math.max(1, setninger);
  const sannsynlighet = Math.pow(0.5, pastander) * Math.pow(0.35, koblinger);

  return {
    overbevisning,
    sannsynlighet,
    enAv: formaterEnAv(sannsynlighet),
    teknikker: funnet,
    statistikk: { setninger, koblinger, tall, utrop, caps: Math.round(caps * 100) },
    rang: rangFor(overbevisning),
  };
}

function rangFor(p) {
  if (p < 15) return 'Kritisk tenkende borger (kjedelig)';
  if (p < 30) return 'Skeptisk tante';
  if (p < 45) return 'Kommentarfelt-kriger';
  if (p < 60) return 'Telegram-kanal-admin';
  if (p < 75) return 'Podkast med 4-timersepisoder';
  if (p < 90) return 'Ufalsifiserbar';
  return 'Grand Master of the Red String';
}

function formaterEnAv(p) {
  if (p <= 0) return 'uendelig';
  const n = Math.round(1 / p);
  return n.toLocaleString('nb-NO');
}

// ---------------------------------------------------------------------------
// Nivå 2: Tallmagi
// ---------------------------------------------------------------------------

const MAGISKE_TALL = [
  { tall: 666, hvorfor: 'Dyrets tall. Selvfølgelig.' },
  { tall: 1814, hvorfor: 'Grunnloven. De har planlagt dette siden Eidsvoll.' },
  { tall: 33, hvorfor: 'Frimurernes høyeste grad. Alle vet det. Ingen vet hvorfor.' },
  { tall: 42, hvorfor: 'Svaret på alt. Douglas Adams visste.' },
  { tall: 112, hvorfor: 'Nødnummeret. Det er et rop om hjelp.' },
  { tall: 1905, hvorfor: 'Unionsoppløsningen. Svenskene har aldri tilgitt oss.' },
  { tall: 17, hvorfor: '17. mai. Nasjonaldagen er et dekke.' },
  { tall: 13, hvorfor: 'Ulykkestallet. Ingen hoteller har 13. etasje. Hvorfor?' },
  { tall: 1, hvorfor: 'ÉN time. Den stjålne timen. Den har vært her hele tiden.' },
];

// Juksekonstantene. Hvert «treff» som bruker en av disse, er et treff du kjøpte.
const JUKSEKONSTANTER = [
  { tall: 1, hvorfor: 'den stjålne timen' },
  { tall: 3, hvorfor: 'klokka 03, da det skjedde' },
  { tall: 7, hvorfor: 'dager i uka' },
  { tall: 12, hvorfor: 'måneder i året' },
  { tall: 15, hvorfor: 'fylker i Norge' },
  { tall: 24, hvorfor: 'timer i døgnet' },
  { tall: 60, hvorfor: 'minutter i timen som forsvant' },
];

const BOKSTAVVERDI = 'abcdefghijklmnopqrstuvwxyzæøå';

function bokstavsum(ord) {
  let s = 0;
  for (const c of ord.toLowerCase()) {
    const i = BOKSTAVVERDI.indexOf(c);
    if (i >= 0) s += i + 1;
  }
  return s;
}

function tverrsum(n) {
  return String(Math.abs(n)).split('').reduce((a, d) => a + Number(d), 0);
}

function baklengs(n) {
  return Number(String(n).split('').reverse().join(''));
}

// Lager råmaterialet: alle tall vi kan «utlede» fra inputen.
function kandidater(input) {
  const ut = [];
  const legg = (verdi, kilde) => {
    if (Number.isFinite(verdi) && verdi > 0 && verdi < 1e7 && !ut.some((k) => k.verdi === verdi)) {
      ut.push({ verdi, kilde });
    }
  };
  const tall = String(input).match(/\d+/g) || [];
  const ord = String(input).match(/[A-Za-zÆØÅæøå]+/g) || [];
  for (const t of tall.slice(0, 6)) {
    const n = Number(t);
    legg(n, `${t}`);
    legg(tverrsum(n), `tverrsummen av ${t}`);
    legg(baklengs(n), `${t} baklengs`);
  }
  if (tall.length > 1) {
    const alle = tall.join('');
    legg(tverrsum(Number(alle)), `tverrsummen av alle sifrene`);
  }
  for (const o of ord.slice(0, 6)) {
    legg(bokstavsum(o), `bokstavverdien av «${o}»`);
    legg(o.length, `antall bokstaver i «${o}»`);
  }
  if (ord.length > 1) legg(bokstavsum(ord.join('')), 'bokstavverdien av hele teksten');
  return ut.slice(0, 24);
}

// Leter etter magiske tall. Finner alltid noe. Det er poenget.
function tallmagi(input) {
  const kand = kandidater(input);
  if (!kand.length) {
    return { kandidater: [], treff: [], kommentar: 'Ingen tall, ingen bokstaver. Mistenkelig tomt. Akkurat som de vil ha det.' };
  }
  const treff = [];
  const sett = new Set();
  const nytt = (mal, steg, juks) => {
    const key = mal.tall + '|' + steg;
    if (sett.has(key)) return;
    sett.add(key);
    treff.push({ mal: mal.tall, hvorfor: mal.hvorfor, steg, juks });
  };

  for (const mal of MAGISKE_TALL) {
    // Rene treff
    for (const a of kand) {
      if (a.verdi === mal.tall) nytt(mal, `${a.kilde} = ${mal.tall}`, null);
    }
    for (let i = 0; i < kand.length; i++) {
      for (let j = i + 1; j < kand.length; j++) {
        const a = kand[i], b = kand[j];
        if (a.verdi + b.verdi === mal.tall) nytt(mal, `${a.kilde} (${a.verdi}) + ${b.kilde} (${b.verdi}) = ${mal.tall}`, null);
        if (Math.abs(a.verdi - b.verdi) === mal.tall) {
          const [stor, liten] = a.verdi > b.verdi ? [a, b] : [b, a];
          nytt(mal, `${stor.kilde} (${stor.verdi}) − ${liten.kilde} (${liten.verdi}) = ${mal.tall}`, null);
        }
        if (a.verdi * b.verdi === mal.tall) nytt(mal, `${a.kilde} (${a.verdi}) × ${b.kilde} (${b.verdi}) = ${mal.tall}`, null);
      }
    }
    // Juks: én kandidat pluss/minus/ganger/delt på én konstant
    for (const a of kand) {
      for (const k of JUKSEKONSTANTER) {
        if (a.verdi + k.tall === mal.tall) nytt(mal, `${a.kilde} (${a.verdi}) + ${k.tall} (${k.hvorfor}) = ${mal.tall}`, k.hvorfor);
        if (a.verdi - k.tall === mal.tall) nytt(mal, `${a.kilde} (${a.verdi}) − ${k.tall} (${k.hvorfor}) = ${mal.tall}`, k.hvorfor);
        if (a.verdi * k.tall === mal.tall) nytt(mal, `${a.kilde} (${a.verdi}) × ${k.tall} (${k.hvorfor}) = ${mal.tall}`, k.hvorfor);
        if (a.verdi / k.tall === mal.tall) nytt(mal, `${a.kilde} (${a.verdi}) ÷ ${k.tall} (${k.hvorfor}) = ${mal.tall}`, k.hvorfor);
      }
    }
  }

  // Siste utvei: når alt annet feiler, er det «nesten» et magisk tall.
  if (!treff.length) {
    const a = kand[0];
    let best = MAGISKE_TALL[0];
    for (const m of MAGISKE_TALL) if (Math.abs(m.tall - a.verdi) < Math.abs(best.tall - a.verdi)) best = m;
    const diff = best.tall - a.verdi;
    nytt(best, `${a.kilde} (${a.verdi}) ${diff >= 0 ? '+' : '−'} ${Math.abs(diff)} (antall ganger de har løyet til deg) = ${best.tall}`, 'ren oppfinnelse');
  }

  // Rene treff først – de er de «sterkeste bevisene».
  treff.sort((x, y) => (x.juks ? 1 : 0) - (y.juks ? 1 : 0));
  const rene = treff.filter((t) => !t.juks).length;
  return {
    kandidater: kand,
    treff: treff.slice(0, 8),
    antallTreff: treff.length,
    rene,
    kommentar:
      rene > 0
        ? `${treff.length} treff, ${rene} uten juks. Med ${kand.length} utgangstall og 3 regnearter fins det hundrevis av kombinasjoner. Noen MÅ treffe.`
        : `${treff.length} treff – men alle krevde en «konstant». Legg merke til hvor naturlig «timer i døgnet» føltes.`,
  };
}

// ---------------------------------------------------------------------------
// Nivå 3: Den røde tråden
// ---------------------------------------------------------------------------

const BRIKKER = [
  { id: 'klokka', navn: 'Klokka 03→02', ikon: '🕒' },
  { id: 'stormen', navn: 'Stormen på Vestlandet', ikon: '🌪️' },
  { id: 'skjenk', navn: 'Skjenkestopp kl. 03 (hvilken?)', ikon: '🍺' },
  { id: 'stekeovn', navn: 'Stekeovnklokka', ikon: '🔥' },
  { id: 'eu', navn: 'EU-vedtaket fra 2019', ikon: '🇪🇺' },
  { id: 'refleks', navn: 'Refleksvesten', ikon: '🦺' },
  { id: 'sauer', navn: 'Sauene på Utsira', ikon: '🐑' },
  { id: 'brunost', navn: 'Brunostprisen', ikon: '🧀' },
  { id: 'grunnloven', navn: '1814', ikon: '📜' },
  { id: 'telefonen', navn: 'Telefonen som visste', ikon: '📱' },
];

function harSirkel(lenker) {
  const naboer = new Map();
  for (const l of lenker) {
    if (!naboer.has(l.fra)) naboer.set(l.fra, []);
    if (!naboer.has(l.til)) naboer.set(l.til, []);
    naboer.get(l.fra).push(l.til);
    naboer.get(l.til).push(l.fra);
  }
  // Uretta graf: sirkel finnes hvis antall kanter >= noder i en sammenhengende komponent.
  const besokt = new Set();
  for (const start of naboer.keys()) {
    if (besokt.has(start)) continue;
    const stakk = [start];
    let noder = 0, grad = 0;
    besokt.add(start);
    while (stakk.length) {
      const n = stakk.pop();
      noder++;
      grad += naboer.get(n).length;
      for (const m of naboer.get(n)) if (!besokt.has(m)) { besokt.add(m); stakk.push(m); }
    }
    if (grad / 2 >= noder) return true;
  }
  return false;
}

function vurderTraad(lenker) {
  const gyldige = new Set(BRIKKER.map((b) => b.id));
  const sett = new Set();
  const rene = [];
  for (const l of (Array.isArray(lenker) ? lenker : []).slice(0, 45)) {
    if (!l || !gyldige.has(l.fra) || !gyldige.has(l.til) || l.fra === l.til) continue;
    const key = [l.fra, l.til].sort().join('-');
    if (sett.has(key)) continue;
    sett.add(key);
    rene.push({ fra: l.fra, til: l.til, fordi: String(l.fordi || '').slice(0, 300) });
  }
  const tekst = rene.map((l) => l.fordi).join('. ');
  const a = analyser(tekst);
  const sirkel = harSirkel(rene);
  const sannsynlighet = Math.pow(0.35, rene.length);
  const overbevisning = Math.min(100, a.overbevisning + rene.length * 6 + (sirkel ? 15 : 0));
  return {
    antall: rene.length,
    sirkel,
    overbevisning,
    sannsynlighet,
    enAv: formaterEnAv(sannsynlighet),
    teknikker: a.teknikker,
    rang: rangFor(overbevisning),
    kommentar: sirkel
      ? 'Tråden går i ring. A beviser B, B beviser C, C beviser A. Gratulerer: du har bygget et perpetuum mobile av tro.'
      : rene.length >= 4
        ? 'Tavla ser overbevisende ut. Det er det som er problemet.'
        : 'For få tråder. Ingen blir paranoide av tre tråder.',
  };
}

// ---------------------------------------------------------------------------
// Nivå 4: Sitatsmia
// ---------------------------------------------------------------------------

// Fiktiv pressemelding. Fiktiv rådgiver. Ekte kjedelighet.
const PRESSEMELDING =
  'Natt til søndag stilles klokka tilbake én time, og vi går over til normaltid. ' +
  'Vi har full kontroll på tiden, og det er ingen grunn til bekymring. ' +
  'De fleste vil ikke merke noe, bortsett fra at det blir mørkt tidligere på ettermiddagen. ' +
  'Telefoner og datamaskiner stiller seg automatisk, men klokker på stekeovner og i biler må stilles manuelt. ' +
  'Vi anbefaler alle å bruke den ekstra timen til å sove, og ikke til å stille spørsmål ved hvorfor bilklokka fortsatt er feil. ' +
  'Tiden blir ikke borte, den blir bare flyttet, sier seniorrådgiver Tor Tidemann.';

const UHYGGEORD = /\b(kontroll|ingen grunn|ikke merke|mørkt|automatisk|sove|ikke .*spørsmål|borte|flyttet|bekymring|alle)\b/gi;

function ordliste(tekst) {
  return tekst.split(/\s+/).filter(Boolean);
}

function vurderSitat(beholdt) {
  const ord = ordliste(PRESSEMELDING);
  const idx = [...new Set((Array.isArray(beholdt) ? beholdt : []).map(Number))]
    .filter((i) => Number.isInteger(i) && i >= 0 && i < ord.length)
    .sort((a, b) => a - b);
  if (!idx.length) {
    return { sitat: '', dodelighet: 0, overbevisning: 0, kommentar: 'Du har slettet alt. Selv konspirasjonsteoretikere trenger minst ett ord.' };
  }
  let sitat = '';
  for (let k = 0; k < idx.length; k++) {
    if (k > 0 && idx[k] !== idx[k - 1] + 1) sitat += ' ...';
    sitat += (k === 0 ? '' : ' ') + ord[idx[k]];
  }
  sitat = sitat.replace(/^[a-zæøå]/, (c) => c.toUpperCase()).replace(/[,.]$/, '') + '.';
  const fjernet = 1 - idx.length / ord.length;
  const hull = idx.reduce((n, v, k) => n + (k > 0 && v !== idx[k - 1] + 1 ? 1 : 0), 0);
  const uhygge = tellTreff(sitat, UHYGGEORD);
  const overbevisning = Math.min(100, Math.round(fjernet * 40 + uhygge * 9 + Math.min(hull, 6) * 4));
  return {
    sitat: `«${sitat}» – seniorrådgiver Tor Tidemann`,
    dodelighet: Math.round(fjernet * 100),
    hull,
    overbevisning,
    rang: rangFor(overbevisning),
    kommentar:
      fjernet > 0.85
        ? `Du har fjernet ${Math.round(fjernet * 100)} % av konteksten. Hvert ord er ekte. Ingenting er sant.`
        : 'Fortsatt for mye kontekst. Kontekst er fienden.',
  };
}

// ---------------------------------------------------------------------------
// Nivå 5: Motbevis-immunforsvaret
// ---------------------------------------------------------------------------

const MOTBEVIS = [
  'Meteorologisk institutt viser at lavtrykket ble varslet flere dager i forveien, lenge før klokkeskiftet.',
  'Klokkeskiftet har skjedd siste søndag i oktober hvert år siden 1980. Det står i forskriften.',
  'Stekeovnklokka di stilte seg ikke fordi den ikke har nettilkobling. Den har heller ingen hemmeligheter.',
  'Dagslyset er like langt uansett hva klokka viser. Ingen tid er lagret noe sted.',
  'Seniorrådgiver Tor Tidemann finnes ikke. Vi fant ham på i nivå 4.',
];

const IMMUNMONSTRE = [
  { re: /\b(akkurat det de vil|nettopp derfor|som forventet|selvfølgelig sier de|det beviser)/gi, navn: 'Motbevis som bevis', vekt: 14 },
  { re: /\b(betalt|finansiert|kjøpt|lønnet|sponset)/gi, navn: 'Kilden er kjøpt', vekt: 10 },
  { re: /\b(dekk(e|operasjon)|avledning|distraksjon|røykteppe)/gi, navn: 'Det er et dekke', vekt: 10 },
  { re: /\b(også med på det|del av planen|de er inne i det|involvert)/gi, navn: 'Konspirasjonen vokser', vekt: 12 },
  { re: /\b(hvem sa|hvem bestemte|hvem skrev)/gi, navn: 'Mistenkeliggjøring av avsender', vekt: 8 },
];

function vurderImmun(svar) {
  const liste = (Array.isArray(svar) ? svar : []).slice(0, MOTBEVIS.length).map((s) => String(s || '').slice(0, 600));
  let poeng = 0;
  const brukt = new Map();
  let besvart = 0;
  for (const s of liste) {
    if (s.trim().length > 10) besvart++;
    for (const m of IMMUNMONSTRE) {
      const n = tellTreff(s, m.re);
      if (n) {
        poeng += m.vekt * Math.min(n, 2);
        brukt.set(m.navn, (brukt.get(m.navn) || 0) + n);
      }
    }
  }
  const a = analyser(liste.join(' '));
  poeng += a.overbevisning * 0.4 + besvart * 6;
  const overbevisning = Math.min(100, Math.round(poeng));
  const immunitet = Math.round((besvart / MOTBEVIS.length) * 100);
  return {
    besvart,
    immunitet,
    overbevisning,
    falsifiserbarhet: Math.max(0, 100 - immunitet),
    monstre: [...brukt.entries()].map(([navn, antall]) => ({ navn, antall })),
    rang: rangFor(overbevisning),
    kommentar:
      immunitet === 100
        ? 'Teorien er 100 % immun mot virkeligheten. Den sier dermed 0 % om virkeligheten.'
        : `Teorien tåler ${besvart} av ${MOTBEVIS.length} motbevis. Ett eneste ubesvart motbevis, og hele korthuset ryker.`,
  };
}

// ---------------------------------------------------------------------------
// Nivå 6: Viralovnen
// ---------------------------------------------------------------------------

function vurderViral(tekst) {
  const a = analyser(tekst);
  const emoji = tellTreff(String(tekst || ''), /\p{Extended_Pictographic}/gu);
  const viralitet = Math.min(100, a.overbevisning + Math.min(emoji, 6) * 3);
  // Delinger vokser eksponentielt med opprørthet. Faktainnhold synker lineært.
  const delinger = Math.round(4 * Math.exp(viralitet / 11));
  const faktainnhold = Math.max(0, Math.round(100 - viralitet * 1.05));
  const rettelseDelinger = Math.max(1, Math.round(delinger * 0.06));
  return {
    ...a,
    viralitet,
    delinger,
    faktainnhold,
    rettelseDelinger,
    kommentar:
      `Innlegget ditt deles anslagsvis ${delinger.toLocaleString('nb-NO')} ganger. ` +
      `Rettelsen, når den kommer, deles ${rettelseDelinger.toLocaleString('nb-NO')} ganger.`,
  };
}

function vurder(nivaa, data) {
  switch (nivaa) {
    case 'cuibono': return analyser(data && data.tekst);
    case 'traad': return vurderTraad(data && data.lenker);
    case 'sitat': return vurderSitat(data && data.beholdt);
    case 'immun': return vurderImmun(data && data.svar);
    case 'viral': return vurderViral(data && data.tekst);
    default: return null;
  }
}

module.exports = {
  SAK, NIVAER, BRIKKER, PRESSEMELDING, MOTBEVIS,
  cuiBono, analyser, tallmagi, vurderTraad, vurderSitat, vurderImmun, vurderViral, vurder,
  harSirkel, bokstavsum, tverrsum, rangFor, ordliste,
};
