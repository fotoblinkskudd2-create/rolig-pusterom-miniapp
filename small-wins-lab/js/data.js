/* Small Wins Lab — oppgavedata.
 * 30 utfordringer: 5 temaer × 3 nivåer × 2. Bare data. Reglene tolkes av js/engine.js.
 * Felt: id, tema, nivå, tittel, kort_instruksjon, komponenter, starttilstand, tillatte_handlinger,
 *       regler, hint_1, hint_2, forklaring, eksempelløsning, gyldighetskontroll, materiell.
 */
(function (root) {
  'use strict';

  const DATAVERSJON = 1;

  const TEMAER = [
    { id: 'signaler', navn: 'Signaler', prefiks: 'SIG', ikon: '⏻', kort: 'Brytere og porter' },
    { id: 'rekkefølge', navn: 'Rekkefølge', prefiks: 'REK', ikon: '⇄', kort: 'Flytt kort i riktig rekkefølge' },
    { id: 'mønstre', navn: 'Mønstre', prefiks: 'MON', ikon: '◐', kort: 'Fyll tomme plasser' },
    { id: 'ruter', navn: 'Ruter', prefiks: 'RUT', ikon: '⌖', kort: 'Finn veien i rutenettet' },
    { id: 'feilsøking', navn: 'Feilsøking', prefiks: 'FEI', ikon: '⚙', kort: 'Reparer tallmaskinen' }
  ];
  const NIVÅER = { 1: 'Lett', 2: 'Middels', 3: 'Vanskelig' };

  // ---------- byggeklosser ----------
  const KORT = {
    sirkel: { id: 'sirkel', navn: 'blå sirkel', symbol: '●', farge: 'blå' },
    firkant: { id: 'firkant', navn: 'rød firkant', symbol: '■', farge: 'rød' },
    trekant: { id: 'trekant', navn: 'gul trekant', symbol: '▲', farge: 'gul' },
    stjerne: { id: 'stjerne', navn: 'grønn stjerne', symbol: '★', farge: 'grønn' },
    rute: { id: 'rute', navn: 'lilla rute', symbol: '◆', farge: 'lilla' },
    hjerte: { id: 'hjerte', navn: 'oransje hjerte', symbol: '♥', farge: 'oransje' }
  };
  const kort = (...ids) => ids.map(id => KORT[id]);
  const fig = (form, fyll, antall) => ({ form, fyll: fyll || 'fylt', antall: antall || 1 });
  const tall = n => ({ tall: n });
  const op = s => ({ op: s[0] === '−' ? '-' : s[0], n: Number(s.slice(1)) });
  const ops = (...l) => l.map(op);
  const STANDARDVALG = ops('+1', '+2', '+3', '−1', '−2', '×2', '×3');

  const BRYTER_HANDLING = ['Trykk på en bryter for å slå den PÅ eller AV.', 'Trykk «Sjekk» når lampen skal vurderes.'];
  const KORT_HANDLING = ['Velg et kort og flytt det til venstre eller høyre.', 'Tastatur: piltast venstre/høyre flytter valgt kort.', 'Trykk «Sjekk» når rekkefølgen er klar.'];
  const MØNSTER_HANDLING = ['Velg en tom plass.', 'Velg en brikke fra paletten for å fylle plassen.', 'Trykk «Sjekk».'];
  const RUTE_HANDLING = ['Gå ett felt opp, ned, til venstre eller til høyre.', 'Trykk på et nabofelt eller bruk piltastene.', '«Angre» tar bort siste steg.'];
  const MASKIN_HANDLING = ['Velg en del i maskinen.', 'Bytt den til en av de tillatte delene.', 'Se mellomresultatene og trykk «Sjekk».'];

  const OPPGAVER = [
    // =================================================================
    // SIGNALER
    // =================================================================
    {
      id: 'SIG-01', tema: 'signaler', nivå: 1, tittel: 'Snu signalet',
      kort_instruksjon: 'Lampen er av. Få lampen til å lyse.',
      komponenter: { brytere: ['A'], krets: { id: 'NOT', port: 'NOT', inn: ['A'] } },
      starttilstand: { A: true },
      tillatte_handlinger: BRYTER_HANDLING,
      regler: [
        { type: 'lampe', verdi: true, tekst: 'Lampen skal lyse.' }
      ],
      hint_1: 'Se på porten mellom bryteren og lampen. Den heter NOT.',
      hint_2: 'NOT snur signalet. Når A er PÅ, får lampen AV. Når A er AV, får lampen PÅ.',
      forklaring: 'NOT-porten snur signalet. Bryter A må være AV for at lampen skal få PÅ.',
      eksempelløsning: { A: false },
      gyldighetskontroll: { metode: 'Alle 2 bryterkombinasjoner er undersøkt.', antall_løsninger: 1 },
      materiell: 'En mynt som bryter (kron = PÅ, mynt = AV).'
    },
    {
      id: 'SIG-02', tema: 'signaler', nivå: 1, tittel: 'Begge må være med',
      kort_instruksjon: 'Få lampen til å lyse.',
      komponenter: { brytere: ['A', 'B'], krets: { id: 'AND', port: 'AND', inn: ['A', 'B'] } },
      starttilstand: { A: false, B: false },
      tillatte_handlinger: BRYTER_HANDLING,
      regler: [
        { type: 'lampe', verdi: true, tekst: 'Lampen skal lyse.' }
      ],
      hint_1: 'Porten heter AND. Prøv én bryter først og se hva som skjer.',
      hint_2: 'AND gir signal bare når alle inngangene er PÅ.',
      forklaring: 'AND krever at A og B er PÅ samtidig. Én bryter er ikke nok.',
      eksempelløsning: { A: true, B: true },
      gyldighetskontroll: { metode: 'Alle 4 bryterkombinasjoner er undersøkt.', antall_løsninger: 1 },
      materiell: 'To mynter som brytere.'
    },
    {
      id: 'SIG-03', tema: 'signaler', nivå: 2, tittel: 'Én er nok',
      kort_instruksjon: 'Få lampen på med bare én aktiv bryter.',
      komponenter: { brytere: ['A', 'B'], krets: { id: 'OR', port: 'OR', inn: ['A', 'B'] } },
      starttilstand: { A: false, B: false },
      tillatte_handlinger: BRYTER_HANDLING,
      regler: [
        { type: 'lampe', verdi: true, tekst: 'Lampen skal lyse.' },
        { type: 'antallPå', antall: 1, tekst: 'Nøyaktig én bryter skal være PÅ.' }
      ],
      hint_1: 'Porten heter OR. Det finnes mer enn én måte å gjøre dette på.',
      hint_2: 'OR gir signal når minst én inngang er PÅ. Da holder det med A eller B.',
      forklaring: 'OR trenger bare én aktiv inngang. Både «bare A» og «bare B» er riktige løsninger.',
      eksempelløsning: { A: true, B: false },
      gyldighetskontroll: { metode: 'Alle 4 bryterkombinasjoner er undersøkt. Begge enkeltbrytere godtas.', antall_løsninger: 2 },
      materiell: 'To mynter som brytere.'
    },
    {
      id: 'SIG-04', tema: 'signaler', nivå: 2, tittel: 'Bare én av dem',
      kort_instruksjon: 'Begge bryterne er på, men lampen er av. Få lampen til å lyse.',
      komponenter: { brytere: ['A', 'B'], krets: { id: 'XOR', port: 'XOR', inn: ['A', 'B'] } },
      starttilstand: { A: true, B: true },
      tillatte_handlinger: BRYTER_HANDLING,
      regler: [
        { type: 'lampe', verdi: true, tekst: 'Lampen skal lyse.' }
      ],
      hint_1: 'Porten heter XOR. Se hva som skjer når du slår av én bryter.',
      hint_2: 'XOR gir signal når nøyaktig én inngang er PÅ. To PÅ gir AV.',
      forklaring: 'XOR betyr «den ene eller den andre, men ikke begge». Slå av A eller B.',
      eksempelløsning: { A: false, B: true },
      gyldighetskontroll: { metode: 'Alle 4 bryterkombinasjoner er undersøkt. Begge enkeltbrytere godtas.', antall_løsninger: 2 },
      materiell: 'To mynter som brytere.'
    },
    {
      id: 'SIG-05', tema: 'signaler', nivå: 3, tittel: 'Ja til A, nei til B',
      kort_instruksjon: 'Få lampen til å lyse.',
      komponenter: { brytere: ['A', 'B'], krets: { id: 'AND', port: 'AND', inn: ['A', { id: 'NOT', port: 'NOT', inn: ['B'] }] } },
      starttilstand: { A: false, B: true },
      tillatte_handlinger: BRYTER_HANDLING,
      regler: [
        { type: 'lampe', verdi: true, tekst: 'Lampen skal lyse.' }
      ],
      hint_1: 'Bryter B går gjennom en NOT før den når AND.',
      hint_2: 'AND trenger to PÅ. A gir PÅ når A er PÅ. NOT gir PÅ når B er AV.',
      forklaring: 'AND får A direkte og B snudd av NOT. Lampen lyser når A er PÅ og B er AV.',
      eksempelløsning: { A: true, B: false },
      gyldighetskontroll: { metode: 'Alle 4 bryterkombinasjoner er undersøkt.', antall_løsninger: 1 },
      materiell: 'To mynter som brytere.'
    },
    {
      id: 'SIG-06', tema: 'signaler', nivå: 3, tittel: 'Tre brytere',
      kort_instruksjon: 'Få lampen til å lyse.',
      komponenter: { brytere: ['A', 'B', 'C'], krets: { id: 'AND', port: 'AND', inn: [{ id: 'XOR', port: 'XOR', inn: ['A', 'B'] }, 'C'] } },
      starttilstand: { A: false, B: false, C: false },
      tillatte_handlinger: BRYTER_HANDLING,
      regler: [
        { type: 'lampe', verdi: true, tekst: 'Lampen skal lyse.' }
      ],
      hint_1: 'Lampen sitter etter AND. Se hva AND trenger fra XOR og fra C.',
      hint_2: 'C må være PÅ. XOR må gi PÅ, og det gjør den når nøyaktig én av A og B er PÅ.',
      forklaring: 'AND trenger PÅ fra både XOR og C. XOR gir PÅ med bare A eller bare B. A+C og B+C virker begge.',
      eksempelløsning: { A: true, B: false, C: true },
      gyldighetskontroll: { metode: 'Alle 8 bryterkombinasjoner er undersøkt. A+C og B+C godtas.', antall_løsninger: 2 },
      materiell: 'Tre mynter som brytere.'
    },

    // =================================================================
    // REKKEFØLGE
    // =================================================================
    {
      id: 'REK-01', tema: 'rekkefølge', nivå: 1, tittel: 'Trekanten til slutt',
      kort_instruksjon: 'Flytt kortene slik at begge reglene stemmer.',
      komponenter: { kort: kort('sirkel', 'firkant', 'trekant') },
      starttilstand: ['trekant', 'sirkel', 'firkant'],
      tillatte_handlinger: KORT_HANDLING,
      regler: [
        { type: 'før', a: 'sirkel', b: 'trekant', tekst: 'Blå sirkel ● kommer før gul trekant ▲.' },
        { type: 'sist', a: 'trekant', tekst: 'Gul trekant ▲ står sist.' }
      ],
      hint_1: 'Begynn med regelen om hvem som står sist.',
      hint_2: 'Når trekanten står sist, kommer sirkelen automatisk før den. Firkanten kan stå hvor som helst foran.',
      forklaring: 'Trekanten må stå sist. Da er sirkelen alltid før trekanten. ● ■ ▲ og ■ ● ▲ er begge riktige.',
      eksempelløsning: ['sirkel', 'firkant', 'trekant'],
      gyldighetskontroll: { metode: 'Alle 6 rekkefølger er undersøkt.', antall_løsninger: 2 },
      materiell: 'Tre papirkort: ●, ■, ▲.'
    },
    {
      id: 'REK-02', tema: 'rekkefølge', nivå: 1, tittel: 'Stjernen leder',
      kort_instruksjon: 'Flytt kortene slik at begge reglene stemmer.',
      komponenter: { kort: kort('sirkel', 'firkant', 'trekant', 'stjerne') },
      starttilstand: ['firkant', 'trekant', 'stjerne', 'sirkel'],
      tillatte_handlinger: KORT_HANDLING,
      regler: [
        { type: 'først', a: 'stjerne', tekst: 'Grønn stjerne ★ står først.' },
        { type: 'rettEtter', a: 'sirkel', b: 'firkant', tekst: 'Rød firkant ■ står rett etter blå sirkel ●.' }
      ],
      hint_1: 'Sirkel og firkant hører sammen. Tenk på dem som ett par.',
      hint_2: '«Rett etter» betyr at ingen annen brikke får stå mellom ● og ■.',
      forklaring: 'Stjernen står først. Paret ● ■ kan stå før eller etter trekanten: ★ ● ■ ▲ eller ★ ▲ ● ■.',
      eksempelløsning: ['stjerne', 'sirkel', 'firkant', 'trekant'],
      gyldighetskontroll: { metode: 'Alle 24 rekkefølger er undersøkt.', antall_løsninger: 2 },
      materiell: 'Fire papirkort: ●, ■, ▲, ★.'
    },
    {
      id: 'REK-03', tema: 'rekkefølge', nivå: 2, tittel: 'Naboer',
      kort_instruksjon: 'Flytt kortene slik at alle tre reglene stemmer.',
      komponenter: { kort: kort('sirkel', 'firkant', 'trekant', 'stjerne') },
      starttilstand: ['firkant', 'stjerne', 'sirkel', 'trekant'],
      tillatte_handlinger: KORT_HANDLING,
      regler: [
        { type: 'nabo', a: 'sirkel', b: 'trekant', tekst: 'Blå sirkel ● og gul trekant ▲ står ved siden av hverandre.' },
        { type: 'sist', a: 'firkant', tekst: 'Rød firkant ■ står sist.' },
        { type: 'ikkeFørst', a: 'stjerne', tekst: 'Grønn stjerne ★ står ikke først.' }
      ],
      hint_1: 'Sett firkanten sist først. Da er det tre plasser igjen.',
      hint_2: 'Stjernen kan ikke stå først. Hvis den står i midten, blir ● og ▲ skilt. Den må stå på plass 3.',
      forklaring: '■ står sist og ★ må stå på plass 3. Da står ● og ▲ sammen foran: ● ▲ ★ ■ eller ▲ ● ★ ■.',
      eksempelløsning: ['sirkel', 'trekant', 'stjerne', 'firkant'],
      gyldighetskontroll: { metode: 'Alle 24 rekkefølger er undersøkt.', antall_løsninger: 2 },
      materiell: 'Fire papirkort: ●, ■, ▲, ★.'
    },
    {
      id: 'REK-04', tema: 'rekkefølge', nivå: 2, tittel: 'Følget',
      kort_instruksjon: 'Flytt kortene slik at alle fire reglene stemmer.',
      komponenter: { kort: kort('sirkel', 'firkant', 'trekant', 'stjerne', 'rute') },
      starttilstand: ['rute', 'trekant', 'stjerne', 'firkant', 'sirkel'],
      tillatte_handlinger: KORT_HANDLING,
      regler: [
        { type: 'før', a: 'sirkel', b: 'trekant', tekst: 'Blå sirkel ● kommer før gul trekant ▲.' },
        { type: 'før', a: 'firkant', b: 'trekant', tekst: 'Rød firkant ■ kommer før gul trekant ▲.' },
        { type: 'rettEtter', a: 'trekant', b: 'rute', tekst: 'Lilla rute ◆ står rett etter gul trekant ▲.' },
        { type: 'sist', a: 'stjerne', tekst: 'Grønn stjerne ★ står sist.' }
      ],
      hint_1: 'Trekanten og ruten henger sammen. Hvor kan paret ▲ ◆ stå?',
      hint_2: 'Både ● og ■ må stå før ▲. Da må ▲ ◆ stå på plass 3 og 4, rett før stjernen.',
      forklaring: '★ står sist. ▲ ◆ må komme etter både ● og ■, altså på plass 3–4. ● og ■ kan bytte plass.',
      eksempelløsning: ['sirkel', 'firkant', 'trekant', 'rute', 'stjerne'],
      gyldighetskontroll: { metode: 'Alle 120 rekkefølger er undersøkt.', antall_løsninger: 2 },
      materiell: 'Fem papirkort: ●, ■, ▲, ★, ◆.'
    },
    {
      id: 'REK-05', tema: 'rekkefølge', nivå: 3, tittel: 'Ikke ved siden av',
      kort_instruksjon: 'Flytt kortene slik at alle fem reglene stemmer.',
      komponenter: { kort: kort('sirkel', 'firkant', 'trekant', 'stjerne', 'rute') },
      starttilstand: ['firkant', 'sirkel', 'trekant', 'rute', 'stjerne'],
      tillatte_handlinger: KORT_HANDLING,
      regler: [
        { type: 'nabo', a: 'stjerne', b: 'rute', tekst: 'Grønn stjerne ★ og lilla rute ◆ står ved siden av hverandre.' },
        { type: 'før', a: 'sirkel', b: 'stjerne', tekst: 'Blå sirkel ● kommer før grønn stjerne ★.' },
        { type: 'sist', a: 'trekant', tekst: 'Gul trekant ▲ står sist.' },
        { type: 'ikkeNabo', a: 'firkant', b: 'sirkel', tekst: 'Rød firkant ■ og blå sirkel ● står ikke ved siden av hverandre.' },
        { type: 'ikkeFørst', a: 'firkant', tekst: 'Rød firkant ■ står ikke først.' }
      ],
      hint_1: 'Firkanten kan ikke stå først og ikke ved sirkelen. Hvor er det plass til den?',
      hint_2: 'Med ▲ sist er plass 4 den eneste som er langt nok fra ● når ● står først. Da står ★ og ◆ i midten.',
      forklaring: '▲ sist. ● må stå først, ellers rekker ikke ★ å komme etter. ■ må stå på plass 4. ★ ◆ eller ◆ ★ fyller plass 2–3.',
      eksempelløsning: ['sirkel', 'stjerne', 'rute', 'firkant', 'trekant'],
      gyldighetskontroll: { metode: 'Alle 120 rekkefølger er undersøkt.', antall_løsninger: 2 },
      materiell: 'Fem papirkort: ●, ■, ▲, ★, ◆.'
    },
    {
      id: 'REK-06', tema: 'rekkefølge', nivå: 3, tittel: 'Seks i rekke',
      kort_instruksjon: 'Flytt kortene slik at alle seks reglene stemmer.',
      komponenter: { kort: kort('sirkel', 'firkant', 'trekant', 'stjerne', 'rute', 'hjerte') },
      starttilstand: ['hjerte', 'trekant', 'firkant', 'rute', 'stjerne', 'sirkel'],
      tillatte_handlinger: KORT_HANDLING,
      regler: [
        { type: 'før', a: 'sirkel', b: 'firkant', tekst: 'Blå sirkel ● kommer før rød firkant ■.' },
        { type: 'rettEtter', a: 'sirkel', b: 'stjerne', tekst: 'Grønn stjerne ★ står rett etter blå sirkel ●.' },
        { type: 'nabo', a: 'rute', b: 'hjerte', tekst: 'Lilla rute ◆ og oransje hjerte ♥ står ved siden av hverandre.' },
        { type: 'sist', a: 'trekant', tekst: 'Gul trekant ▲ står sist.' },
        { type: 'ikkeFørst', a: 'hjerte', tekst: 'Oransje hjerte ♥ står ikke først.' },
        { type: 'ikkeNabo', a: 'firkant', b: 'rute', tekst: 'Rød firkant ■ og lilla rute ◆ står ikke ved siden av hverandre.' }
      ],
      hint_1: 'Lag to par: ● ★ og ◆ ♥ (eller ♥ ◆). Trekanten står sist.',
      hint_2: 'Paret ● ★ må komme før ■. Firkanten får ikke røre ruten. Prøv å sette ♥ mellom ■ og ◆.',
      forklaring: 'Med ▲ sist og to faste par er det tre rekkefølger som holder alle reglene, for eksempel ● ★ ■ ♥ ◆ ▲.',
      eksempelløsning: ['sirkel', 'stjerne', 'firkant', 'hjerte', 'rute', 'trekant'],
      gyldighetskontroll: { metode: 'Alle 720 rekkefølger er undersøkt.', antall_løsninger: 3 },
      materiell: 'Seks papirkort: ●, ■, ▲, ★, ◆, ♥.'
    },

    // =================================================================
    // MØNSTRE
    // =================================================================
    {
      id: 'MON-01', tema: 'mønstre', nivå: 1, tittel: 'Annenhver',
      kort_instruksjon: 'To former bytter på. Fyll den tomme plassen.',
      komponenter: {
        sekvens: [fig('sirkel'), fig('trekant'), fig('sirkel'), fig('trekant'), fig('sirkel'), null],
        palett: [fig('sirkel'), fig('trekant'), fig('firkant')]
      },
      starttilstand: { svar: [null] },
      tillatte_handlinger: MØNSTER_HANDLING,
      regler: [
        { type: 'periode', egenskap: 'form', periode: 2, tekst: 'Formen gjentas annenhver plass.' }
      ],
      hint_1: 'Se på plassen rett før den tomme. Hva står der?',
      hint_2: 'Sirkel og trekant bytter på. Etter en sirkel kommer en trekant.',
      forklaring: 'Det som gjentas: sirkel, trekant. Plass 6 er lik plass 2 og 4, altså trekant.',
      eksempelløsning: { svar: [1] },
      gyldighetskontroll: { metode: 'Alle 3 brikker er prøvd på den tomme plassen.', antall_løsninger: 1 },
      materiell: 'Papirbrikker: sirkler, trekanter og firkanter.'
    },
    {
      id: 'MON-02', tema: 'mønstre', nivå: 1, tittel: 'Tre i ring',
      kort_instruksjon: 'De tre første formene gjentas. Fyll de to tomme plassene.',
      komponenter: {
        sekvens: [fig('firkant'), fig('sirkel'), fig('trekant'), fig('firkant'), fig('sirkel'), null, null],
        palett: [fig('sirkel'), fig('trekant'), fig('firkant')]
      },
      starttilstand: { svar: [null, null] },
      tillatte_handlinger: MØNSTER_HANDLING,
      regler: [
        { type: 'periode', egenskap: 'form', periode: 3, tekst: 'De tre første formene gjentas i samme rekkefølge.' }
      ],
      hint_1: 'Pek på de tre første formene. Si dem høyt.',
      hint_2: 'Firkant, sirkel, trekant – og så starter det på nytt. Plass 6 er lik plass 3.',
      forklaring: 'Gruppen firkant–sirkel–trekant gjentas. Plass 6 blir trekant og plass 7 blir firkant.',
      eksempelløsning: { svar: [1, 2] },
      gyldighetskontroll: { metode: 'Alle 9 brikkekombinasjoner er prøvd.', antall_løsninger: 1 },
      materiell: 'Papirbrikker: sirkler, trekanter og firkanter.'
    },
    {
      id: 'MON-03', tema: 'mønstre', nivå: 2, tittel: 'Par for par',
      kort_instruksjon: 'Hver form kommer to ganger på rad. Rekkefølgen er sirkel, trekant, firkant, og så på nytt.',
      komponenter: {
        sekvens: [fig('sirkel'), fig('sirkel'), fig('trekant'), fig('trekant'), fig('firkant'), null, fig('sirkel'), fig('sirkel'), null, fig('trekant'), fig('firkant'), fig('firkant')],
        palett: [fig('sirkel'), fig('trekant'), fig('firkant')]
      },
      starttilstand: { svar: [null, null] },
      tillatte_handlinger: MØNSTER_HANDLING,
      regler: [
        { type: 'periode', egenskap: 'form', periode: 6, tekst: 'Mønsteret ●● ▲▲ ■■ gjentas.' }
      ],
      hint_1: 'Finn parene. Hvilken form står alene?',
      hint_2: 'Hver form står to ganger. Firkanten på plass 5 mangler makker, og trekanten på plass 10 mangler makker.',
      forklaring: 'Det som gjentas er parene ●● ▲▲ ■■. Plass 6 blir firkant og plass 9 blir trekant.',
      eksempelløsning: { svar: [2, 1] },
      gyldighetskontroll: { metode: 'Alle 9 brikkekombinasjoner er prøvd.', antall_løsninger: 1 },
      materiell: 'Papirbrikker: sirkler, trekanter og firkanter.'
    },
    {
      id: 'MON-04', tema: 'mønstre', nivå: 2, tittel: 'Tallhjulet',
      kort_instruksjon: 'Legg til 2 hver gang. Etter 7 starter du på 1 igjen.',
      komponenter: {
        sekvens: [tall(1), tall(3), tall(5), tall(7), tall(1), null, null, tall(7)],
        palett: [1, 2, 3, 4, 5, 6, 7].map(tall)
      },
      starttilstand: { svar: [null, null] },
      tillatte_handlinger: MØNSTER_HANDLING,
      regler: [
        { type: 'syklus', egenskap: 'tall', verdier: [1, 3, 5, 7], tekst: 'Tallene går 1, 3, 5, 7 og starter på nytt.' }
      ],
      hint_1: 'Se på tallet rett før den første tomme plassen.',
      hint_2: '1 + 2 = 3, og 3 + 2 = 5. Etter 7 kommer 1 igjen.',
      forklaring: 'Hjulet 1–3–5–7 går rundt. Etter 1 kommer 3, og etter 3 kommer 5. Da passer 7 på plass 8.',
      eksempelløsning: { svar: [2, 4] },
      gyldighetskontroll: { metode: 'Alle 49 tallkombinasjoner er prøvd.', antall_løsninger: 1 },
      materiell: 'Tallkort 1–7.'
    },
    {
      id: 'MON-05', tema: 'mønstre', nivå: 3, tittel: 'To regler samtidig',
      kort_instruksjon: 'Formen bytter hver gang: sirkel, trekant. Hver tredje figur er hul.',
      komponenter: {
        sekvens: [fig('sirkel'), fig('trekant'), fig('sirkel', 'hul'), fig('trekant'), fig('sirkel'), fig('trekant', 'hul'), null, fig('trekant'), null],
        palett: [fig('sirkel'), fig('sirkel', 'hul'), fig('trekant'), fig('trekant', 'hul')]
      },
      starttilstand: { svar: [null, null] },
      tillatte_handlinger: MØNSTER_HANDLING,
      regler: [
        { type: 'periode', egenskap: 'form', periode: 2, tekst: 'Formen bytter hver gang: sirkel, trekant.' },
        { type: 'periode', egenskap: 'fyll', periode: 3, tekst: 'Plass 3, 6 og 9 er hule. De andre er fylte.' }
      ],
      hint_1: 'Sjekk én regel om gangen. Først formen, så om figuren er hul.',
      hint_2: 'Plass 7 og 9 er oddetall, så formen er sirkel. Plass 9 er en «hver tredje»-plass, så den er hul.',
      forklaring: 'Formen gjentas hver 2. plass og hulheten hver 3. plass. Plass 7: fylt sirkel. Plass 9: hul sirkel.',
      eksempelløsning: { svar: [0, 1] },
      gyldighetskontroll: { metode: 'Alle 16 brikkekombinasjoner er prøvd.', antall_løsninger: 1 },
      materiell: 'Papirbrikker: sirkler og trekanter, fylte og hule (tegn bare omrisset).'
    },
    {
      id: 'MON-06', tema: 'mønstre', nivå: 3, tittel: 'Form og antall',
      kort_instruksjon: 'Antallet går 1, 2, 3 og starter på nytt. Hver gang antallet starter på nytt, bytter formen.',
      komponenter: {
        sekvens: [fig('sirkel', 'fylt', 1), fig('sirkel', 'fylt', 2), fig('sirkel', 'fylt', 3), fig('trekant', 'fylt', 1), fig('trekant', 'fylt', 2), fig('trekant', 'fylt', 3), fig('sirkel', 'fylt', 1), null, null],
        palett: [fig('sirkel', 'fylt', 1), fig('sirkel', 'fylt', 2), fig('sirkel', 'fylt', 3), fig('trekant', 'fylt', 1), fig('trekant', 'fylt', 2), fig('trekant', 'fylt', 3)]
      },
      starttilstand: { svar: [null, null] },
      tillatte_handlinger: ['Bygg neste del: velg en tom plass og en brikke med riktig form og antall.', 'Trykk «Sjekk».'],
      regler: [
        { type: 'periode', egenskap: 'antall', periode: 3, tekst: 'Antallet går 1, 2, 3 og starter på nytt.' },
        { type: 'periode', egenskap: 'form', periode: 6, tekst: 'Formen bytter mellom sirkel og trekant for hver runde med 1, 2, 3.' }
      ],
      hint_1: 'Plass 7 har én sirkel. Da har en ny runde begynt.',
      hint_2: 'I en runde er formen den samme. Antallet øker: 1, 2, 3.',
      forklaring: 'Antallet gjentas hver 3. plass og formen hver 6. plass. Neste del er 2 sirkler og så 3 sirkler.',
      eksempelløsning: { svar: [1, 2] },
      gyldighetskontroll: { metode: 'Alle 36 brikkekombinasjoner er prøvd.', antall_løsninger: 1 },
      materiell: 'Små gjenstander (knapper eller mynter) og papirtrekanter.'
    },

    // =================================================================
    // RUTER  (S = start, M = mål, # = stein, 1/2 = kontrollpunkt, . = fritt)
    // =================================================================
    {
      id: 'RUT-01', tema: 'ruter', nivå: 1, tittel: 'Første tur',
      kort_instruksjon: 'Gå fra S til M. Steinene kan du ikke gå gjennom.',
      komponenter: { rutenett: ['S..#', '.#..', '.#.#', '...M'] },
      starttilstand: { sti: [[0, 0]] },
      tillatte_handlinger: RUTE_HANDLING,
      regler: [
        { type: 'mål', tekst: 'Ruten slutter på M.' }
      ],
      hint_1: 'Se på kolonnen helt til venstre. Den er åpen hele veien ned.',
      hint_2: 'Gå ned langs venstre kant og så til høyre langs bunnen.',
      forklaring: 'Alle ruter som går ett felt av gangen, ikke på skrå og ikke gjennom stein, og som ender på M, er riktige.',
      eksempelløsning: { sti: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3]] },
      gyldighetskontroll: { metode: 'Bredde-først-søk finner at M kan nås (korteste: 6 steg).', korteste: 6 },
      materiell: 'Rutearket fra utskriften og en liten gjenstand som brikke.'
    },
    {
      id: 'RUT-02', tema: 'ruter', nivå: 1, tittel: 'Korteste vei',
      kort_instruksjon: 'Gå fra S til M på så få steg som mulig.',
      komponenter: { rutenett: ['S...', '##.#', '....', '.#.M'] },
      starttilstand: { sti: [[0, 0]] },
      tillatte_handlinger: RUTE_HANDLING,
      regler: [
        { type: 'mål', tekst: 'Ruten slutter på M.' },
        { type: 'korteste', tekst: 'Ruten er så kort som mulig.' }
      ],
      hint_1: 'Det finnes bare én åpning gjennom den andre raden.',
      hint_2: 'Åpningen er i kolonne 3. Gå dit langs toppen, og så ned mot M.',
      forklaring: 'Korteste rute er 6 steg. Det finnes mer enn én: du kan gå ned før eller etter at du går til høyre i rad 3.',
      eksempelløsning: { sti: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 3], [3, 3]] },
      gyldighetskontroll: { metode: 'Bredde-først-søk: korteste rute er 6 steg.', korteste: 6 },
      materiell: 'Rutearket fra utskriften og en liten gjenstand som brikke.'
    },
    {
      id: 'RUT-03', tema: 'ruter', nivå: 2, tittel: 'Svingete',
      kort_instruksjon: 'Gå fra S til M på så få steg som mulig.',
      komponenter: { rutenett: ['S.#..', '..#.#', '#...#', '.##..', '....M'] },
      starttilstand: { sti: [[0, 0]] },
      tillatte_handlinger: RUTE_HANDLING,
      regler: [
        { type: 'mål', tekst: 'Ruten slutter på M.' },
        { type: 'korteste', tekst: 'Ruten er så kort som mulig.' }
      ],
      hint_1: 'Steinmuren i midten har åpninger. Finn åpningen i rad 3.',
      hint_2: 'Gå til rad 3 i kolonne 2, så langs rad 3 til kolonne 4, og ned mot M.',
      forklaring: 'Den korteste ruten er 8 steg. Den slynger seg gjennom åpningen i midten.',
      eksempelløsning: { sti: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2], [2, 3], [3, 3], [4, 3], [4, 4]] },
      gyldighetskontroll: { metode: 'Bredde-først-søk: korteste rute er 8 steg.', korteste: 8 },
      materiell: 'Rutearket fra utskriften og en liten gjenstand som brikke.'
    },
    {
      id: 'RUT-04', tema: 'ruter', nivå: 2, tittel: 'Innom flagget',
      kort_instruksjon: 'Gå fra S til M. Ruten må innom kontrollpunkt 1 først.',
      komponenter: { rutenett: ['S..#.', '.#.#1', '.#...', '.#.#.', '...#M'] },
      starttilstand: { sti: [[0, 0]] },
      tillatte_handlinger: RUTE_HANDLING,
      regler: [
        { type: 'mål', tekst: 'Ruten slutter på M.' },
        { type: 'kontrollpunkter', tekst: 'Ruten går innom kontrollpunkt 1.' }
      ],
      hint_1: 'Kontrollpunkt 1 står øverst til høyre. Hvordan kommer du dit?',
      hint_2: 'Gå mot høyre langs rad 3. Derfra kan du gå opp til 1 og så ned til M.',
      forklaring: 'Alle ruter som når M etter å ha vært på 1 er riktige. Den korteste er 10 steg, men en lengre rute godtas også her.',
      eksempelløsning: { sti: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 3], [2, 4], [1, 4], [2, 4], [3, 4], [4, 4]] },
      gyldighetskontroll: { metode: 'Bredde-først-søk med besøkte kontrollpunkter: rute finnes (korteste: 10 steg).', korteste: 10 },
      materiell: 'Rutearket fra utskriften og en liten gjenstand som brikke.'
    },
    {
      id: 'RUT-05', tema: 'ruter', nivå: 3, tittel: 'Omvei som må til',
      kort_instruksjon: 'Gå fra S til M via kontrollpunkt 1, på så få steg som mulig.',
      komponenter: { rutenett: ['S.#.M', '..#..', '.....', '.##.#', '1....'] },
      starttilstand: { sti: [[0, 0]] },
      tillatte_handlinger: RUTE_HANDLING,
      regler: [
        { type: 'mål', tekst: 'Ruten slutter på M.' },
        { type: 'kontrollpunkter', tekst: 'Ruten går innom kontrollpunkt 1.' },
        { type: 'korteste', tekst: 'Ruten er så kort som mulig (når den går innom 1).' }
      ],
      hint_1: 'Kontrollpunkt 1 ligger nede i hjørnet. Gå dit først.',
      hint_2: 'Fra 1 kan du gå tilbake opp, eller langs bunnen og opp gjennom åpningen i kolonne 4. Begge veiene er like lange.',
      forklaring: 'Uten kontrollpunktet er veien 8 steg. Omveien ned til 1 gjør korteste rute 12 steg. Søket godtar alle ruter på 12 steg.',
      eksempelløsning: { sti: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [4, 2], [4, 3], [3, 3], [2, 3], [1, 3], [0, 3], [0, 4]] },
      gyldighetskontroll: { metode: 'Bredde-først-søk med besøkte kontrollpunkter: korteste rute er 12 steg (8 uten kontrollpunktet).', korteste: 12 },
      materiell: 'Rutearket fra utskriften og en liten gjenstand som brikke.'
    },
    {
      id: 'RUT-06', tema: 'ruter', nivå: 3, tittel: 'To flagg',
      kort_instruksjon: 'Gå fra S til M via kontrollpunkt 1 og 2, i valgfri rekkefølge, på så få steg som mulig.',
      komponenter: { rutenett: ['S..#.2', '.#.#..', '.#....', '1..##.', '.#....', '...#.M'] },
      starttilstand: { sti: [[0, 0]] },
      tillatte_handlinger: RUTE_HANDLING,
      regler: [
        { type: 'mål', tekst: 'Ruten slutter på M.' },
        { type: 'kontrollpunkter', tekst: 'Ruten går innom kontrollpunkt 1 og 2.' },
        { type: 'korteste', tekst: 'Ruten er så kort som mulig (når den går innom begge).' }
      ],
      hint_1: 'Ett av punktene ligger nær starten. Ta det først.',
      hint_2: 'Ta 1 på vei ned. Gå så opp langs kolonne 3 og ut til høyre mot 2, og ned til M.',
      forklaring: 'Søket prøver alle rekkefølger av punktene. 1 først, så 2, og så M gir korteste rute: 16 steg.',
      eksempelløsning: { sti: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [2, 2], [2, 3], [2, 4], [1, 4], [0, 4], [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5]] },
      gyldighetskontroll: { metode: 'Bredde-først-søk over (felt, besøkte punkter): korteste rute er 16 steg.', korteste: 16 },
      materiell: 'Rutearket fra utskriften og en liten gjenstand som brikke.'
    },

    // =================================================================
    // FEILSØKING
    // =================================================================
    {
      id: 'FEI-01', tema: 'feilsøking', nivå: 1, tittel: 'Nesten riktig',
      kort_instruksjon: 'Maskinen skal gi 11. Bytt én del.',
      komponenter: { start: 2, operasjoner: ops('+3', '×2', '−1'), valg: STANDARDVALG },
      starttilstand: { ops: ops('+3', '×2', '−1') },
      tillatte_handlinger: MASKIN_HANDLING,
      regler: [
        { type: 'resultat', mål: 11, tekst: 'Sluttresultatet er 11.' },
        { type: 'maksEndringer', n: 1, tekst: 'Bare én del kan byttes.' }
      ],
      hint_1: 'Maskinen gir 9. Det mangler 2. Se på den siste delen.',
      hint_2: 'Etter × 2 er tallet 10. Hvilken del gjør 10 om til 11?',
      forklaring: 'Bytt − 1 med + 1: 2 → 5 → 10 → 11. Det går også å bytte + 3 med × 3: 2 → 6 → 12 → 11.',
      eksempelløsning: { ops: ops('+3', '×2', '+1') },
      gyldighetskontroll: { metode: 'Alle enkeltbytter er prøvd (3 deler × 7 valg).', antall_løsninger: 2 },
      materiell: 'Kort med + 1, + 2, + 3, − 1, − 2, × 2, × 3 og en blyant.'
    },
    {
      id: 'FEI-02', tema: 'feilsøking', nivå: 1, tittel: 'For lite',
      kort_instruksjon: 'Maskinen skal gi 9. Bytt én del.',
      komponenter: { start: 5, operasjoner: ops('−2', '×2', '+1'), valg: STANDARDVALG },
      starttilstand: { ops: ops('−2', '×2', '+1') },
      tillatte_handlinger: MASKIN_HANDLING,
      regler: [
        { type: 'resultat', mål: 9, tekst: 'Sluttresultatet er 9.' },
        { type: 'maksEndringer', n: 1, tekst: 'Bare én del kan byttes.' }
      ],
      hint_1: 'Maskinen gir 7. Det mangler 2.',
      hint_2: 'Du kan rette til slutt (+ 1 → + 3) eller i starten, før tallet dobles.',
      forklaring: 'Bytt + 1 med + 3: 5 → 3 → 6 → 9. Eller bytt − 2 med − 1: 5 → 4 → 8 → 9.',
      eksempelløsning: { ops: ops('−2', '×2', '+3') },
      gyldighetskontroll: { metode: 'Alle enkeltbytter er prøvd (3 deler × 7 valg).', antall_løsninger: 2 },
      materiell: 'Kort med + 1, + 2, + 3, − 1, − 2, × 2, × 3 og en blyant.'
    },
    {
      id: 'FEI-03', tema: 'feilsøking', nivå: 2, tittel: 'Dobbelt så mye',
      kort_instruksjon: 'Maskinen skal gi 14. Bytt én del.',
      komponenter: { start: 1, operasjoner: ops('+2', '×3', '−4', '×2'), valg: STANDARDVALG },
      starttilstand: { ops: ops('+2', '×3', '−4', '×2') },
      tillatte_handlinger: MASKIN_HANDLING,
      regler: [
        { type: 'resultat', mål: 14, tekst: 'Sluttresultatet er 14.' },
        { type: 'maksEndringer', n: 1, tekst: 'Bare én del kan byttes.' }
      ],
      hint_1: 'Siste del dobler. Hvilket tall må komme inn i den for å gi 14?',
      hint_2: '14 er det dobbelte av 7. Hvilken del gjør 9 om til 7?',
      forklaring: 'Regn baklengs: 14 / 2 = 7. Tallet før er 9, så − 4 må bli − 2: 1 → 3 → 9 → 7 → 14.',
      eksempelløsning: { ops: ops('+2', '×3', '−2', '×2') },
      gyldighetskontroll: { metode: 'Alle enkeltbytter er prøvd (4 deler × 7 valg).', antall_løsninger: 1 },
      materiell: 'Kort med + 1, + 2, + 3, − 1, − 2, × 2, × 3 og en blyant.'
    },
    {
      id: 'FEI-04', tema: 'feilsøking', nivå: 2, tittel: 'Under null',
      kort_instruksjon: 'Maskinen skal gi 6, og tallet får aldri bli under 0. Bytt én del.',
      komponenter: { start: 4, operasjoner: ops('−2', '−3', '+3', '×2'), valg: STANDARDVALG },
      starttilstand: { ops: ops('−2', '−3', '+3', '×2') },
      tillatte_handlinger: MASKIN_HANDLING,
      regler: [
        { type: 'resultat', mål: 6, tekst: 'Sluttresultatet er 6.' },
        { type: 'aldriUnder', n: 0, tekst: 'Tallet blir aldri under 0 underveis.' },
        { type: 'maksEndringer', n: 1, tekst: 'Bare én del kan byttes.' }
      ],
      hint_1: 'Se på mellomresultatene. Hvor blir tallet under 0?',
      hint_2: 'Å bytte × 2 med × 3 gir 6, men tallet har allerede vært −1. Rett tidligere i maskinen.',
      forklaring: 'Tallet må holde seg på 0 eller mer. Bytt − 3 med − 2 (4 → 2 → 0 → 3 → 6) eller − 2 med − 1 (4 → 3 → 0 → 3 → 6).',
      eksempelløsning: { ops: ops('−2', '−2', '+3', '×2') },
      gyldighetskontroll: { metode: 'Alle enkeltbytter er prøvd. × 3 til slutt gir 6, men bryter «aldri under 0» og avvises.', antall_løsninger: 2 },
      materiell: 'Kort med + 1, + 2, + 3, − 1, − 2, × 2, × 3 og en blyant.'
    },
    {
      id: 'FEI-05', tema: 'feilsøking', nivå: 3, tittel: 'Taket',
      kort_instruksjon: 'Maskinen skal gi 19, og tallet får aldri bli over 20. Bytt én del.',
      komponenter: { start: 3, operasjoner: ops('+1', '+3', '×3', '−1', '+2'), valg: STANDARDVALG },
      starttilstand: { ops: ops('+1', '+3', '×3', '−1', '+2') },
      tillatte_handlinger: MASKIN_HANDLING,
      regler: [
        { type: 'resultat', mål: 19, tekst: 'Sluttresultatet er 19.' },
        { type: 'aldriOver', n: 20, tekst: 'Tallet blir aldri over 20 underveis.' },
        { type: 'maksEndringer', n: 1, tekst: 'Bare én del kan byttes.' }
      ],
      hint_1: 'Etter × 3 er tallet 21. Det er over taket.',
      hint_2: 'Tallet før × 3 må være mindre. Hva hvis det var 6 i stedet for 7?',
      forklaring: 'Bytt + 3 med + 2: 3 → 4 → 6 → 18 → 17 → 19. Å endre bare slutten gir 19, men tallet har vært 21 og avvises.',
      eksempelløsning: { ops: ops('+1', '+2', '×3', '−1', '+2') },
      gyldighetskontroll: { metode: 'Alle enkeltbytter er prøvd. + 2 → − 1 gir 19, men bryter taket og avvises.', antall_løsninger: 1 },
      materiell: 'Kort med + 1, + 2, + 3, − 1, − 2, × 2, × 3 og en blyant.'
    },
    {
      id: 'FEI-06', tema: 'feilsøking', nivå: 3, tittel: 'Kontrollampen',
      kort_instruksjon: 'Maskinen skal gi 12, og etter del 2 skal tallet være 6. Bytt én del.',
      komponenter: { start: 2, operasjoner: ops('+2', '×2', '+1', '×2', '−2'), valg: STANDARDVALG },
      starttilstand: { ops: ops('+2', '×2', '+1', '×2', '−2') },
      tillatte_handlinger: MASKIN_HANDLING,
      regler: [
        { type: 'resultat', mål: 12, tekst: 'Sluttresultatet er 12.' },
        { type: 'mellom', etter: 2, verdi: 6, tekst: 'Etter del 2 er tallet 6.' },
        { type: 'maksEndringer', n: 1, tekst: 'Bare én del kan byttes.' }
      ],
      hint_1: 'Etter del 2 er tallet 8. Feilen sitter i del 1 eller del 2.',
      hint_2: 'Fra 2 til 6 på to steg: du kan endre første steg eller andre steg.',
      forklaring: 'Kontrollampen sier at feilen er tidlig. + 1 i del 1 (2 → 3 → 6) eller + 2 i del 2 (2 → 4 → 6). Resten gir 12.',
      eksempelløsning: { ops: ops('+1', '×2', '+1', '×2', '−2') },
      gyldighetskontroll: { metode: 'Alle enkeltbytter er prøvd (5 deler × 7 valg).', antall_løsninger: 2 },
      materiell: 'Kort med + 1, + 2, + 3, − 1, − 2, × 2, × 3 og en blyant.'
    }
  ];

  const data = { DATAVERSJON, TEMAER, NIVÅER, OPPGAVER, KORT };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else { root.SWL = root.SWL || {}; root.SWL.data = data; }
})(typeof window !== 'undefined' ? window : globalThis);
