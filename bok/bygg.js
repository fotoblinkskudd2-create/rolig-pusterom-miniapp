// Bygger «Manual for å lese Bibelen» til bygdo.docx
// Kjør: node bok/bygg.js
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, Footer, Header,
  PageNumber, BorderStyle, ShadingType, HeadingLevel, TableOfContents,
} = require("docx");

const front = require("./front.js");
const deler = [];
for (let i = 1; i <= 10; i++) {
  const f = path.join(__dirname, `del${String(i).padStart(2, "0")}.js`);
  if (fs.existsSync(f)) deler.push(require(f));
}

const FONT = "Georgia";
const ACCENT = "8B2E16"; // brent rødbrun
const SOFT = "F4EDE1";   // pergament
const INK = "222222";

const romer = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 110, line: 290 },
    alignment: AlignmentType.LEFT,
    ...opts.para,
    children: [new TextRun({ text, font: FONT, size: 20, color: INK, ...opts.run })],
  });
}

function spacer(after = 200) {
  return new Paragraph({ spacing: { after }, children: [] });
}

function boks(label, text, fill) {
  return new Paragraph({
    spacing: { before: 60, after: 90, line: 270 },
    shading: { type: ShadingType.CLEAR, fill, color: "auto" },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT, space: 6 } },
    indent: { left: 120, right: 60 },
    children: [
      new TextRun({ text: label + "  ", font: FONT, size: 16, bold: true, color: ACCENT, characterSpacing: 20 }),
      new TextRun({ text, font: FONT, size: 18, color: INK }),
    ],
  });
}

const children = [];

// ---------- Tittelside ----------
children.push(spacer(1800));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 120 },
  children: [new TextRun({ text: "MANUAL", font: FONT, size: 64, bold: true, color: ACCENT, characterSpacing: 120 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 120 },
  children: [new TextRun({ text: "for å lese", font: FONT, size: 32, italics: true, color: INK })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 600 },
  children: [new TextRun({ text: "BIBELEN", font: FONT, size: 64, bold: true, color: ACCENT, characterSpacing: 120 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 120 },
  border: { top: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 12 } },
  children: [new TextRun({ text: "100 ting mennesker trenger å vite –", font: FONT, size: 22, color: INK })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: 120 },
  children: [new TextRun({ text: "uansett hva de tror på", font: FONT, size: 22, color: INK })],
}));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---------- Forord / bruksanvisning ----------
for (const sec of front.forord) {
  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 240 },
    children: [new TextRun({ text: sec.t, font: FONT, size: 34, bold: true, color: ACCENT })],
  }));
  for (const para of sec.b) children.push(p(para));
  children.push(new Paragraph({ children: [new PageBreak()] }));
}

// ---------- Innhold ----------
children.push(new Paragraph({
  heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 },
  children: [new TextRun({ text: "Innhold", font: FONT, size: 34, bold: true, color: ACCENT })],
}));
let nr = 0;
deler.forEach((d, i) => {
  children.push(new Paragraph({
    spacing: { before: 160, after: 40 }, keepNext: true,
    children: [new TextRun({ text: `Del ${romer[i]} · ${d.title}`, font: FONT, size: 19, bold: true, color: ACCENT })],
  }));
  for (const it of d.items) {
    nr++;
    children.push(new Paragraph({
      spacing: { after: 0, line: 250 }, indent: { left: 200 },
      children: [new TextRun({ text: `${nr}. ${it.t}`, font: FONT, size: 17, color: INK })],
    }));
  }
});
children.push(new Paragraph({
  spacing: { before: 160, after: 40 },
  children: [new TextRun({ text: front.etterord.t, font: FONT, size: 19, bold: true, color: ACCENT })],
}));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---------- Delene ----------
nr = 0;
deler.forEach((d, i) => {
  // delside
  children.push(spacer(2200));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 160 },
    children: [new TextRun({ text: `DEL ${romer[i]}`, font: FONT, size: 24, bold: true, color: ACCENT, characterSpacing: 160 })],
  }));
  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { after: 300 },
    children: [new TextRun({ text: d.title, font: FONT, size: 44, bold: true, color: INK })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 200 }, indent: { left: 500, right: 500 },
    children: [new TextRun({ text: d.sub, font: FONT, size: 20, italics: true, color: "555555" })],
  }));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  for (const it of d.items) {
    nr++;
    children.push(new Paragraph({
      spacing: { after: 0 },
      children: [new TextRun({ text: String(nr), font: FONT, size: 40, bold: true, color: ACCENT })],
    }));
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_2, spacing: { after: 120 }, keepNext: true,
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 4 } },
      children: [new TextRun({ text: it.t, font: FONT, size: 26, bold: true, color: INK })],
    }));
    children.push(new Paragraph({
      spacing: { after: 140, line: 260 }, indent: { left: 360, right: 360 },
      children: [
        new TextRun({ text: `«${it.q[0]}»`, font: FONT, size: 18, italics: true, color: "444444" }),
        new TextRun({ text: `  — ${it.q[1]}`, font: FONT, size: 16, color: ACCENT }),
      ],
    }));
    it.b.forEach((para) => children.push(p(para)));
    children.push(boks("UANSETT TRO", it.u, SOFT));
    children.push(boks("GJØR DETTE", it.g, "FFFFFF"));
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }
});

// ---------- Etterord ----------
children.push(new Paragraph({
  heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 240 },
  children: [new TextRun({ text: front.etterord.t, font: FONT, size: 34, bold: true, color: ACCENT })],
}));
for (const para of front.etterord.b) children.push(p(para));

const doc = new Document({
  creator: "Manual for å lese Bibelen",
  title: "Manual for å lese Bibelen",
  description: "100 ting mennesker trenger å vite – uansett hva de tror på",
  styles: {
    default: { document: { run: { font: FONT, size: 20 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 34, bold: true }, paragraph: { outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 26, bold: true }, paragraph: { outlineLevel: 1 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 8391, height: 11906 }, // A5
        margin: { top: 900, bottom: 900, left: 850, right: 850, header: 400, footer: 400 },
      },
      titlePage: true,
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "MANUAL FOR Å LESE BIBELEN", font: FONT, size: 14, color: "999999", characterSpacing: 60 })],
      })] }),
      first: new Header({ children: [] }),
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: ACCENT })],
      })] }),
      first: new Footer({ children: [] }),
    },
    children,
  }],
});

const out = path.join(__dirname, "..", "bygdo.docx");
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf);
  console.log("Skrev", out, "–", nr, "kapitler");
});
