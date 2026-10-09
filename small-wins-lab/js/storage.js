/* Small Wins Lab — lagret framdrift.
 * Lagrer bare: gjeldende oppgave, forsøk, løste oppgaver, brukte hint, innstillinger, dataversjon.
 * Ingen navn. Ingen kontaktinformasjon. Importerte data blir aldri kode eller HTML.
 */
(function (root) {
  'use strict';

  const NØKKEL = 'smallWinsLab.framdrift';
  const VERSJON = 1;
  const MAKS_IMPORT_TEGN = 200000;
  const INNSTILLINGER = { storTekst: 'boolean' };

  function tom() {
    return { versjon: VERSJON, gjeldende: null, forsøk: {}, løst: {}, hint: {}, innstillinger: { storTekst: false } };
  }
  const erObjekt = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const eget = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  // Mild opprydding ved lasting: redder det som er gyldig, dropper resten og forteller hva.
  function rens(rå, oppgaver, engine) {
    const advarsler = [];
    const ut = tom();
    if (erObjekt(rå) && rå.ødelagt === true) rå = 'ødelagt';
    if (!erObjekt(rå)) { if (rå !== null && rå !== undefined) advarsler.push('Lagret framdrift kunne ikke leses. Du starter på nytt.'); return { data: ut, advarsler }; }
    if (rå.versjon !== VERSJON) advarsler.push('Lagret framdrift har ukjent versjon. Det som kunne leses er tatt vare på.');
    const finn = id => oppgaver.find(t => t.id === id);
    if (typeof rå.gjeldende === 'string' && finn(rå.gjeldende)) ut.gjeldende = rå.gjeldende;
    const ødelagt = [];
    if (erObjekt(rå.forsøk)) {
      for (const id of Object.keys(rå.forsøk)) {
        const t = finn(id);
        if (!t) continue;
        if (engine.gyldigTilstand(t, rå.forsøk[id])) ut.forsøk[id] = rå.forsøk[id];
        else ødelagt.push(id);
      }
    }
    if (ødelagt.length) advarsler.push('Forsøket på ' + ødelagt.join(', ') + ' kunne ikke leses. ' + (ødelagt.length > 1 ? 'Oppgavene starter' : 'Oppgaven starter') + ' fra begynnelsen. Resten er tatt vare på.');
    if (erObjekt(rå.løst)) for (const id of Object.keys(rå.løst)) if (finn(id) && rå.løst[id] === true) ut.løst[id] = true;
    if (erObjekt(rå.hint)) for (const id of Object.keys(rå.hint)) {
      const n = rå.hint[id];
      if (finn(id) && Number.isInteger(n) && n >= 0 && n <= 2) ut.hint[id] = n;
    }
    if (erObjekt(rå.innstillinger)) for (const k of Object.keys(INNSTILLINGER)) {
      if (typeof rå.innstillinger[k] === INNSTILLINGER[k]) ut.innstillinger[k] = rå.innstillinger[k];
    }
    return { data: ut, advarsler };
  }

  // Streng kontroll av import. Hele filen må være gyldig før noe endres.
  function validerImport(tekst, oppgaver, engine) {
    if (typeof tekst !== 'string' || !tekst.trim()) return { ok: false, feil: 'Filen er tom.' };
    if (tekst.length > MAKS_IMPORT_TEGN) return { ok: false, feil: 'Filen er for stor til å være en framdriftsfil.' };
    let rå;
    try { rå = JSON.parse(tekst); } catch (e) { return { ok: false, feil: 'Filen er ikke en framdriftsfil (ikke gyldig JSON).' }; }
    if (!erObjekt(rå)) return { ok: false, feil: 'Filen har feil form.' };
    if (rå.app !== undefined && rå.app !== 'small-wins-lab') return { ok: false, feil: 'Filen er fra en annen app.' };
    if (rå.versjon !== VERSJON) return { ok: false, feil: 'Filen har versjon ' + String(rå.versjon).slice(0, 20) + '. Denne appen leser versjon ' + VERSJON + '.' };
    const finn = id => oppgaver.find(t => t.id === id);
    const ut = tom();
    const ignorert = [];
    if (rå.gjeldende !== null && rå.gjeldende !== undefined) {
      if (typeof rå.gjeldende !== 'string' || !finn(rå.gjeldende)) return { ok: false, feil: 'Gjeldende oppgave er ukjent.' };
      ut.gjeldende = rå.gjeldende;
    }
    for (const felt of ['forsøk', 'løst', 'hint']) {
      if (rå[felt] !== undefined && !erObjekt(rå[felt])) return { ok: false, feil: 'Feltet «' + felt + '» har feil form.' };
    }
    for (const id of Object.keys(rå.forsøk || {})) {
      const t = finn(id);
      if (!t) { ignorert.push(id); continue; }
      if (!engine.gyldigTilstand(t, rå.forsøk[id])) return { ok: false, feil: 'Forsøket på ' + id + ' er ikke gyldig.' };
      ut.forsøk[id] = JSON.parse(JSON.stringify(rå.forsøk[id]));
    }
    for (const id of Object.keys(rå.løst || {})) {
      if (!finn(id)) { ignorert.push(id); continue; }
      if (typeof rå.løst[id] !== 'boolean') return { ok: false, feil: 'Løst-merket for ' + id + ' er ikke gyldig.' };
      if (rå.løst[id]) ut.løst[id] = true;
    }
    for (const id of Object.keys(rå.hint || {})) {
      if (!finn(id)) { ignorert.push(id); continue; }
      const n = rå.hint[id];
      if (!Number.isInteger(n) || n < 0 || n > 2) return { ok: false, feil: 'Hint-tallet for ' + id + ' er ikke gyldig.' };
      ut.hint[id] = n;
    }
    if (rå.innstillinger !== undefined) {
      if (!erObjekt(rå.innstillinger)) return { ok: false, feil: 'Innstillingene har feil form.' };
      for (const k of Object.keys(INNSTILLINGER)) {
        if (eget(rå.innstillinger, k)) {
          if (typeof rå.innstillinger[k] !== INNSTILLINGER[k]) return { ok: false, feil: 'Innstillingen «' + k + '» er ikke gyldig.' };
          ut.innstillinger[k] = rå.innstillinger[k];
        }
      }
    }
    return { ok: true, data: ut, ignorert: Array.from(new Set(ignorert)) };
  }

  function eksporter(data) {
    return JSON.stringify(Object.assign({ app: 'small-wins-lab', eksportert: new Date().toISOString() }, data), null, 2);
  }

  // Finn lagringsplass. Faller tilbake til minnet hvis localStorage mangler eller nekter.
  function åpne(lager) {
    let backend = null;
    try {
      const ls = lager !== undefined ? lager : root.localStorage;
      const test = NØKKEL + '.test';
      ls.setItem(test, '1'); ls.removeItem(test);
      backend = ls;
    } catch (e) { backend = null; }
    const minne = {};
    return {
      varig: !!backend,
      les() {
        try {
          const s = backend ? backend.getItem(NØKKEL) : minne[NØKKEL];
          if (s === null || s === undefined) return null;
          return JSON.parse(s);
        } catch (e) { return { ødelagt: true }; }
      },
      skriv(data) {
        const s = JSON.stringify(data);
        if (backend) { try { backend.setItem(NØKKEL, s); return true; } catch (e) { this.varig = false; backend = null; } }
        minne[NØKKEL] = s; return false;
      }
    };
  }

  const storage = { NØKKEL, VERSJON, tom, rens, validerImport, eksporter, åpne };
  if (typeof module !== 'undefined' && module.exports) module.exports = storage;
  else { root.SWL = root.SWL || {}; root.SWL.storage = storage; }
})(typeof window !== 'undefined' ? window : globalThis);
