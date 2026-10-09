/* Skriver docs/losbarhet.md: søkerom, antall gyldige løsninger og alle løsninger per oppgave. Kjør: node tests/rapport.js */
'use strict';
const fs = require('fs'), path = require('path');
const E = require('../js/engine.js'), D = require('../js/data.js'), X = require('../js/tekst.js');
const rom = t => ({ signaler: () => Math.pow(2, t.komponenter.brytere.length) + ' bryterkombinasjoner',
  rekkefølge: () => [1, 1, 2, 6, 24, 120, 720][t.komponenter.kort.length] + ' rekkefølger',
  mønstre: () => Math.pow(t.komponenter.palett.length, t.komponenter.sekvens.filter(x => x === null).length) + ' brikkekombinasjoner',
  ruter: () => 'bredde-først-søk over (felt, besøkte kontrollpunkter)',
  feilsøking: () => (t.komponenter.operasjoner.length * t.komponenter.valg.length) + ' enkeltbytter' })[t.tema]();
const l = ['# Løsbarhet — alle 30 oppgaver', '', 'Generert ' + new Date().toISOString() + ' av `node tests/rapport.js`. Uavhengig kryssjekk: `tests/logic.test.js`.', '',
  '| ID | Tittel | Søkerom | Gyldige | Løsninger (motorens fulle opptelling) |', '|---|---|---|---|---|'];
for (const t of D.OPPGAVER) {
  const løs = E.løsninger(t);
  const n = t.tema === 'ruter' ? 'korteste ' + E.rute.korteste(t) + ' steg' : String(løs.length);
  const vis = løs.map(s => X.tilstand(t, s, D.KORT).replace(/\|/g, '/')).join('<br>');
  l.push('| ' + [t.id, t.tittel, rom(t), n, vis].join(' | ') + ' |');
}
fs.writeFileSync(path.join(__dirname, '..', 'docs', 'losbarhet.md'), l.join('\n') + '\n');
console.log(l.slice(6).length + ' oppgaver skrevet');
