'use strict';
// Arkivet: teoriene deltakerne publiserer. Lagres som én JSON-fil.
// Bevisst enkelt – dette er et kursopplegg, ikke en database for Den Dype Staten.

const fs = require('fs');
const path = require('path');

const MAKS = 500;

class Arkiv {
  constructor(fil) {
    this.fil = fil;
    this.teorier = [];
    try {
      const raa = JSON.parse(fs.readFileSync(fil, 'utf8'));
      if (Array.isArray(raa)) this.teorier = raa;
    } catch {
      // Ingen fil ennå. Eller noen har slettet den. Vi starter blankt.
    }
  }

  lagre() {
    fs.mkdirSync(path.dirname(this.fil), { recursive: true });
    const tmp = this.fil + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.teorier, null, 2));
    fs.renameSync(tmp, this.fil);
  }

  legg(teori) {
    this.teorier.unshift(teori);
    if (this.teorier.length > MAKS) this.teorier.length = MAKS;
    this.lagre();
    return teori;
  }

  stem(id, type) {
    const t = this.teorier.find((x) => x.id === id);
    if (!t) return null;
    t.stemmer[type] = (t.stemmer[type] || 0) + 1;
    this.lagre();
    return t;
  }

  liste(sort) {
    const kopi = this.teorier.slice();
    if (sort === 'topp') {
      kopi.sort((a, b) => (b.stemmer.aapnet - b.stemmer.sjekket) - (a.stemmer.aapnet - a.stemmer.sjekket) || b.overbevisning - a.overbevisning);
    }
    return kopi.slice(0, 100);
  }
}

module.exports = { Arkiv };
