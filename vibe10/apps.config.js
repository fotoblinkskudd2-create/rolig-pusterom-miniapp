// Én kilde for alle 10 appene: navn, farge, ikon-glyph, beskrivelse.
// Brukes av vite.config.js, ikon-generatoren, manifestene og hubben.
export const apps = [
  { id: 'provefella', name: 'Prøvefella', short: 'Prøvefella', color: '#e5484d', glyph: '⏳', tagline: 'Drep prøveperioden før den dreper kontoen.' },
  { id: 'gjeld', name: 'Gjeldsradar', short: 'Gjeld', color: '#f76b15', glyph: '📉', tagline: 'Klarna, kort, lån – én plan, én gjeldsfri-dato.' },
  { id: 'brems', name: 'Kjøpebrems', short: 'Kjøpebrems', color: '#ffb224', glyph: '🧊', tagline: 'Fryser impulskjøpet til du har kjølt deg ned.' },
  { id: 'start', name: 'Startknappen', short: 'Start', color: '#30a46c', glyph: '▶️', tagline: 'Én oppgave. To minutter. En kropp ved siden av deg.' },
  { id: 'doom', name: 'Doombrems', short: 'Doombrems', color: '#12a594', glyph: '🛑', tagline: 'Stopper TikTok-hånda før tommelen tar over.' },
  { id: 'garanti', name: 'Garantiboksen', short: 'Garanti', color: '#0090ff', glyph: '🧾', tagline: 'Kvitteringer, garanti og reklamasjonsrett – på telefonen.' },
  { id: 'spleis', name: 'Spleiselapp', short: 'Spleis', color: '#3e63dd', glyph: '🍕', tagline: 'Del regninga uten konto. Del lenka, ferdig.' },
  { id: 'kjokken', name: 'Kjøleskapet', short: 'Kjøleskap', color: '#8e4ec6', glyph: '🥚', tagline: 'Hva kan jeg lage med det jeg faktisk har?' },
  { id: 'minnehull', name: 'Minnehull', short: 'Minnehull', color: '#d6409f', glyph: '🫧', tagline: 'Logg for tid som forsvant – for systemer og dissosiasjon.' },
  { id: 'skjold', name: 'Inkasso-skjold', short: 'Skjold', color: '#687076', glyph: '🛡️', tagline: 'Frister, brev og maler når regningene angriper.' },
]
