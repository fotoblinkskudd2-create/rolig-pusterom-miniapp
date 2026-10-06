// Hjelpefunksjoner for docx-bygging (docx-js).
const fs = require("fs");
const {
  Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType,
  ImageRun, PageBreak, BorderStyle, VerticalAlign,
} = require("docx");

const FARGE = { mork: "1F3A5F", aksent: "2A78D6", lys: "EEF3FB", gra: "52514E", linje: "C9CED6", gronn: "E8F6EF", gul: "FFF6DD" };
const PORTRETT_BREDDE = 9638;   // A4, 2 cm marger
const LANDSKAP_BREDDE = 14570;

const nok = (v) => Math.round(v).toLocaleString("nb-NO").replace(/ /g, " ");
const mnok = (v, d = 1) => (v / 1e6).toLocaleString("nb-NO", { minimumFractionDigits: d, maximumFractionDigits: d });
const usd = (v) => "$" + v.toFixed(2);

// **fet** og _kursiv_ i enkel markup
function runs(tekst, base = {}) {
  const ut = [];
  const re = /(\*\*[^*]+\*\*|_[^_]+_)/g;
  let sist = 0;
  let m;
  while ((m = re.exec(tekst)) !== null) {
    if (m.index > sist) ut.push(new TextRun({ text: tekst.slice(sist, m.index), ...base }));
    const t = m[0];
    if (t.startsWith("**")) ut.push(new TextRun({ text: t.slice(2, -2), bold: true, ...base }));
    else ut.push(new TextRun({ text: t.slice(1, -1), italics: true, ...base }));
    sist = m.index + t.length;
  }
  if (sist < tekst.length) ut.push(new TextRun({ text: tekst.slice(sist), ...base }));
  return ut;
}

const h1 = (t, sideskift = true) => new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: sideskift, children: [new TextRun(t)] });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const h3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });
const p = (t, opt = {}) => new Paragraph({ spacing: { after: 120 }, ...opt, children: runs(t, opt.run || {}) });
const liten = (t) => new Paragraph({ spacing: { after: 80 }, children: runs(t, { size: 16, color: FARGE.gra }) });
const kulepunkter = (arr, nivaa = 0) => arr.map((t) => new Paragraph({ numbering: { reference: "kule", level: nivaa }, spacing: { after: 60 }, children: runs(t) }));
const nummerert = (arr, ref = "tall") => arr.map((t) => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 }, children: runs(t) }));
const sideskift = () => new Paragraph({ children: [new PageBreak()] });

function celle(tekst, bredde, opt = {}) {
  const linjer = String(tekst).split("\n");
  return new TableCell({
    width: { size: bredde, type: WidthType.DXA },
    shading: opt.fyll ? { type: ShadingType.CLEAR, color: "auto", fill: opt.fyll } : undefined,
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: opt.span,
    children: linjer.map((l) => new Paragraph({
      alignment: opt.hoyre ? AlignmentType.RIGHT : AlignmentType.LEFT,
      children: runs(l, { size: opt.str || 17, bold: !!opt.fet, color: opt.farge }),
    })),
  });
}

// tabell(hoder, rader, andeler, {bredde, hoyreKol: [indekser], sumRad: true})
function tabell(hoder, rader, andeler, opt = {}) {
  const total = opt.bredde || PORTRETT_BREDDE;
  const sum = andeler.reduce((a, b) => a + b, 0);
  const b = andeler.map((a) => Math.floor((a / sum) * total));
  b[b.length - 1] += total - b.reduce((x, y) => x + y, 0);
  const hk = new Set(opt.hoyreKol || []);
  const rows = [];
  if (hoder) {
    rows.push(new TableRow({ tableHeader: true, children: hoder.map((h, i) => celle(h, b[i], { fyll: FARGE.mork, fet: true, farge: "FFFFFF", hoyre: hk.has(i), str: opt.str })) }));
  }
  rader.forEach((r, ri) => {
    const erSum = opt.sumRad && ri === rader.length - 1;
    const fyll = erSum ? FARGE.lys : (opt.stripet !== false && ri % 2 === 1 ? "F7F8FA" : undefined);
    rows.push(new TableRow({ children: r.map((c, i) => celle(c, b[i], { fyll: (opt.forsteKolFyll && i === 0) ? FARGE.lys : fyll, fet: erSum || (opt.forsteKolFet && i === 0), hoyre: hk.has(i), str: opt.str })) }));
  });
  const kant = { style: BorderStyle.SINGLE, size: 4, color: FARGE.linje };
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: b,
    borders: { top: kant, bottom: kant, left: kant, right: kant, insideHorizontal: kant, insideVertical: kant },
    rows,
  });
}

// Nøkkeltall-boks: to kolonner, lys bakgrunn
function nokkeltall(par, bredde = PORTRETT_BREDDE) {
  return tabell(null, par, [38, 62], { bredde, stripet: false, forsteKolFyll: true, forsteKolFet: true });
}

function bilde(sti, bredde, hoyde, bildetekst) {
  const ut = [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [new ImageRun({ type: "png", data: fs.readFileSync(sti), transformation: { width: bredde, height: hoyde } })] })];
  if (bildetekst) ut.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: runs(bildetekst, { size: 16, italics: true, color: FARGE.gra }) }));
  return ut;
}

function infoboks(tittel, tekst, fyll = FARGE.gul) {
  return new Table({
    width: { size: PORTRETT_BREDDE, type: WidthType.DXA },
    columnWidths: [PORTRETT_BREDDE],
    borders: { top: { style: BorderStyle.SINGLE, size: 12, color: "EDA100" }, bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } },
    rows: [new TableRow({ children: [new TableCell({ width: { size: PORTRETT_BREDDE, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, color: "auto", fill: fyll }, margins: { top: 100, bottom: 100, left: 160, right: 160 }, children: [new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: tittel, bold: true, size: 19 })] }), ...[].concat(tekst).map((t) => new Paragraph({ spacing: { after: 40 }, children: runs(t, { size: 18 }) }))] })] })],
  });
}

const luft = (etter = 120) => new Paragraph({ spacing: { after: etter }, children: [] });

module.exports = { FARGE, PORTRETT_BREDDE, LANDSKAP_BREDDE, nok, mnok, usd, runs, h1, h2, h3, p, liten, kulepunkter, nummerert, sideskift, tabell, nokkeltall, bilde, infoboks, luft, celle };
