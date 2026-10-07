// Felles skjema for nettleser og server. Én sannhet: endres her, endres overalt.
// Ingen fritekst. Det som ikke kan skrives inn, kan ikke lekke navn.

export const OMRADER = {
  sykehuskø: { navn: 'Sykehuskø', aktiv: true },
  barnevern: { navn: 'Barnevern', aktiv: false },
  nav: { navn: 'NAV', aktiv: false },
  trygd: { navn: 'Trygd', aktiv: false },
};

export const FYLKER = [
  'Oslo', 'Akershus', 'Østfold', 'Buskerud', 'Innlandet', 'Vestfold', 'Telemark',
  'Agder', 'Rogaland', 'Vestland', 'Møre og Romsdal', 'Trøndelag', 'Nordland',
  'Troms', 'Finnmark',
];

export const HELSEREGIONER = {
  'Helse Sør-Øst': ['Oslo', 'Akershus', 'Østfold', 'Buskerud', 'Innlandet', 'Vestfold', 'Telemark', 'Agder'],
  'Helse Vest': ['Rogaland', 'Vestland'],
  'Helse Midt-Norge': ['Møre og Romsdal', 'Trøndelag'],
  'Helse Nord': ['Nordland', 'Troms', 'Finnmark'],
};

export const FAGOMRADER = [
  'Ortopedi', 'Kreft', 'Hjerte og kar', 'Psykisk helse (voksen)', 'Psykisk helse (barn og unge)',
  'Rus', 'Nevrologi', 'Kvinnesykdommer', 'Øre-nese-hals', 'Øye', 'Hud', 'Mage og tarm',
  'Revmatologi', 'Annet',
];

export const HENDELSER = {
  lang_ventetid: 'Lang ventetid',
  fristbrudd: 'Fristbrudd (fristen gikk ut uten behandling)',
  forverring: 'Tilstanden ble verre mens jeg/vi ventet',
  avvist_henvisning: 'Henvisningen ble avvist',
  avlyst: 'Timen ble avlyst eller utsatt',
  dodsfall: 'Dødsfall mens personen sto i kø',
};

export const VENTETID = {
  u4: 'Under 4 uker',
  '4_12': '4–12 uker',
  '13_26': '13–26 uker',
  '27_52': '27–52 uker',
  o52: 'Over ett år',
};

export const MELDER = { pasient: 'Pasient', parorende: 'Pårørende' };

export const STATUS = {
  dokumentert: 'Dokumentert',
  nyhetssak: 'Nyhetssak',
  ubekreftet: 'Ubekreftet',
};

// Celler med færre saker enn dette vises som «<3». Små tall kan peke ut enkeltpersoner.
export const MIN_VIS = 3;

export function regionFor(fylke) {
  for (const [region, fylker] of Object.entries(HELSEREGIONER)) {
    if (fylker.includes(fylke)) return region;
  }
  return null;
}

// Validerer en innmelding. Returnerer { ok, sak } eller { ok:false, feil }.
// Ukjente felt kastes. Tidspunkt lagres kun som måned.
export function validerInnmelding(inn, naa = new Date()) {
  const feil = [];
  const v = inn && typeof inn === 'object' ? inn : {};

  if (!OMRADER[v.omrade]?.aktiv) feil.push('omrade');
  if (!FYLKER.includes(v.fylke)) feil.push('fylke');
  if (!FAGOMRADER.includes(v.fagomrade)) feil.push('fagomrade');
  if (!VENTETID[v.ventetid]) feil.push('ventetid');
  if (!MELDER[v.melder]) feil.push('melder');

  const hendelser = Array.isArray(v.hendelser) ? [...new Set(v.hendelser)] : [];
  if (!hendelser.length || hendelser.some((h) => !HENDELSER[h])) feil.push('hendelser');

  const m = /^(\d{4})-(\d{2})$/.exec(v.maned || '');
  const maned = m && new Date(Date.UTC(+m[1], +m[2] - 1, 1));
  const ytterst = new Date(Date.UTC(naa.getUTCFullYear() - 10, 0, 1));
  if (!maned || +m[2] < 1 || +m[2] > 12 || maned > naa || maned < ytterst) feil.push('maned');

  if (typeof v.harDokumentasjon !== 'boolean') feil.push('harDokumentasjon');

  if (feil.length) return { ok: false, feil };

  return {
    ok: true,
    sak: {
      omrade: v.omrade,
      fylke: v.fylke,
      region: regionFor(v.fylke),
      fagomrade: v.fagomrade,
      hendelser: hendelser.sort(),
      ventetid: v.ventetid,
      maned: v.maned,
      melder: v.melder,
      harDokumentasjon: v.harDokumentasjon,
      status: 'ubekreftet',
      kilde: 'innmeldt',
    },
  };
}
