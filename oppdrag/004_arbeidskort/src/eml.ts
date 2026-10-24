// Enkel EML-leser: headere (med folding og RFC 2047 encoded-words), multipart, quoted-printable og base64.
// Returnerer tekstdelen og en liste over vedlegg (bare navn/type/størrelse – innhold åpnes aldri).

export interface Vedlegg { filnavn: string; type: string; bytes: number }
export interface Epost { fra: string; til: string; emne: string; dato: string; tekst: string; vedlegg: Vedlegg[] }

function dekodBytes(b: number[], tegnsett: string): string {
  try { return new TextDecoder(tegnsett.toLowerCase() === "latin1" ? "iso-8859-1" : tegnsett).decode(new Uint8Array(b)); }
  catch { return new TextDecoder("utf-8").decode(new Uint8Array(b)); }
}
function b64(s: string): number[] { const bin = atob(s.replace(/\s+/g, "")); return Array.from(bin, c => c.charCodeAt(0)); }
function qp(s: string, hode = false): number[] {
  if (hode) s = s.replace(/_/g, " ");
  s = s.replace(/=\r?\n/g, "");
  const ut: number[] = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "=" && /^[0-9A-Fa-f]{2}$/.test(s.slice(i + 1, i + 3))) { ut.push(parseInt(s.slice(i + 1, i + 3), 16)); i += 2; }
    else ut.push(...new TextEncoder().encode(s[i]));
  }
  return ut;
}
export function dekodHode(v: string): string {
  return v.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (_, cs, enc, tekst) => dekodBytes(enc.toUpperCase() === "B" ? b64(tekst) : qp(tekst, true), cs));
}
function deler(raa: string): { hoder: Record<string, string>; kropp: string } {
  const skille = raa.search(/\r?\n\r?\n/);
  const hodeTekst = skille < 0 ? raa : raa.slice(0, skille);
  const kropp = skille < 0 ? "" : raa.slice(skille).replace(/^\r?\n\r?\n/, "");
  const hoder: Record<string, string> = {};
  let siste = "";
  for (const linje of hodeTekst.split(/\r?\n/)) {
    if (/^\s/.test(linje) && siste) hoder[siste] += " " + linje.trim();
    else { const m = linje.match(/^([\w-]+):\s*(.*)$/); if (m) { siste = m[1].toLowerCase(); hoder[siste] = m[2]; } }
  }
  return { hoder, kropp };
}
const param = (h: string | undefined, navn: string) => {
  const m = (h || "").match(new RegExp(navn + '(\\*?)="?([^";]+)"?', "i"));
  if (!m) return "";
  // RFC 2231: filename*=utf-8''plan%C3%B8sning.pdf
  if (m[1] === "*") { const r = m[2].match(/^([^']*)'[^']*'(.*)$/); try { return decodeURIComponent(r ? r[2] : m[2]); } catch { return m[2]; } }
  return dekodHode(m[2]);
};

function innhold(hoder: Record<string, string>, kropp: string): string {
  const enc = (hoder["content-transfer-encoding"] || "").toLowerCase();
  const cs = param(hoder["content-type"], "charset") || "utf-8";
  if (enc === "base64") return dekodBytes(b64(kropp), cs);
  if (enc === "quoted-printable") return dekodBytes(qp(kropp), cs);
  return kropp;
}

export function lesEml(raa: string): Epost {
  const { hoder, kropp } = deler(raa);
  const vedlegg: Vedlegg[] = [];
  let tekst = "";
  const gaa = (h: Record<string, string>, k: string) => {
    const type = (h["content-type"] || "text/plain").split(";")[0].trim().toLowerCase();
    const grense = param(h["content-type"], "boundary");
    if (type.startsWith("multipart/") && grense) {
      for (const del of k.split("--" + grense).slice(1)) {
        if (del.startsWith("--")) break;
        const d = deler(del.replace(/^\r?\n/, ""));
        gaa(d.hoder, d.kropp);
      }
      return;
    }
    const filnavn = param(h["content-disposition"], "filename") || param(h["content-type"], "name");
    if (filnavn || /attachment/i.test(h["content-disposition"] || "")) {
      const rå = k.replace(/\s+/g, "");
      vedlegg.push({ filnavn: filnavn || "uten navn", type, bytes: (h["content-transfer-encoding"] || "").toLowerCase() === "base64" ? Math.floor(rå.length * 3 / 4) : k.length });
    } else if (type === "text/plain" && !tekst) tekst = innhold(h, k);
  };
  gaa(hoder, kropp);
  return { fra: dekodHode(hoder["from"] || ""), til: dekodHode(hoder["to"] || ""), emne: dekodHode(hoder["subject"] || ""), dato: hoder["date"] || "", tekst: tekst.replace(/\r\n/g, "\n"), vedlegg };
}
