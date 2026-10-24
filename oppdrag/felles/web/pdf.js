// Minimal PDF-skriver (PDF 1.4) uten avhengigheter. Tekst i WinAnsi (dekker æøå),
// linjer og rektangler. Mål i millimeter, origo øverst til venstre, A4 som standard.
const MM = 72 / 25.4;
const FONTER = { normal: "Helvetica", fet: "Helvetica-Bold", mono: "Courier" };

function winAnsi(s) {
  const ut = [];
  for (const ch of String(s)) {
    const c = ch.codePointAt(0);
    if (c === 0x20ac) ut.push(0x80);           // €
    else if (c === 0x2013) ut.push(0x96);      // –
    else if (c === 0x2014) ut.push(0x97);      // —
    else if (c === 0x2192) ut.push(0x2d, 0x3e); // → som ->
    else if (c < 256) ut.push(c);
    else ut.push(0x3f);
  }
  return ut;
}
function esc(bytes) {
  return bytes.map(b => (b === 0x28 || b === 0x29 || b === 0x5c) ? "\\" + String.fromCharCode(b)
    : (b < 32 || b > 126) ? "\\" + b.toString(8).padStart(3, "0") : String.fromCharCode(b)).join("");
}

export class Pdf {
  constructor({ bredde = 210, hoyde = 297, tittel = "" } = {}) { this.b = bredde; this.hy = hoyde; this.sider = []; this.tittel = tittel; }
  side() {
    const ops = []; const hy = this.hy;
    const s = {
      tekst(x, y, t, { str = 10, font = "normal", hoyre = false } = {}) {
        const by = winAnsi(t);
        let px = x * MM;
        if (hoyre) px -= (font === "mono" ? 0.6 : 0.52) * str * by.length;
        ops.push(`BT /${font === "fet" ? "F2" : font === "mono" ? "F3" : "F1"} ${str} Tf ${px.toFixed(2)} ${((hy - y) * MM).toFixed(2)} Td (${esc(by)}) Tj ET`);
        return s;
      },
      linje(x1, y1, x2, y2, tykk = 0.3) { ops.push(`${(tykk * MM).toFixed(2)} w ${(x1 * MM).toFixed(2)} ${((hy - y1) * MM).toFixed(2)} m ${(x2 * MM).toFixed(2)} ${((hy - y2) * MM).toFixed(2)} l S`); return s; },
      rekt(x, y, b, h, tykk = 0.3) { ops.push(`${(tykk * MM).toFixed(2)} w ${(x * MM).toFixed(2)} ${((hy - y - h) * MM).toFixed(2)} ${(b * MM).toFixed(2)} ${(h * MM).toFixed(2)} re S`); return s; },
      ops,
    };
    this.sider.push(s);
    return s;
  }
  bytes() {
    const obj = [];
    const legg = t => { obj.push(t); return obj.length; };
    const katalog = legg(null), sider = legg(null);
    const f1 = legg("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    const f2 = legg("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    const f3 = legg("<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>");
    const kids = [];
    for (const s of this.sider) {
      const innhold = s.ops.join("\n");
      const c = legg(`<< /Length ${innhold.length} >>\nstream\n${innhold}\nendstream`);
      kids.push(legg(`<< /Type /Page /Parent ${sider} 0 R /MediaBox [0 0 ${(this.b * MM).toFixed(2)} ${(this.hy * MM).toFixed(2)}] /Contents ${c} 0 R /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R /F3 ${f3} 0 R >> >> >>`));
    }
    obj[katalog - 1] = `<< /Type /Catalog /Pages ${sider} 0 R >>`;
    obj[sider - 1] = `<< /Type /Pages /Kids [${kids.map(k => k + " 0 R").join(" ")}] /Count ${kids.length} >>`;
    const info = legg(`<< /Title (${esc(winAnsi(this.tittel))}) /Producer (oppdrag/felles/pdf.js) >>`);
    let ut = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"; const xref = [];
    obj.forEach((o, i) => { xref.push(ut.length); ut += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const x = ut.length;
    ut += `xref\n0 ${obj.length + 1}\n0000000000 65535 f \n` + xref.map(o => String(o).padStart(10, "0") + " 00000 n \n").join("");
    ut += `trailer\n<< /Size ${obj.length + 1} /Root ${katalog} 0 R /Info ${info} 0 R >>\nstartxref\n${x}\n%%EOF\n`;
    // Alle tegn er allerede bytes 0–255 (escapet), så latin1-koding gir korrekte offsets.
    return Uint8Array.from(ut, c => c.charCodeAt(0));
  }
}
