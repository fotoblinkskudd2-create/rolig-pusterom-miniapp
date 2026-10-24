// Befaringsmodell, kontrollregler og eksport. Ren logikk – lagring (IndexedDB) ligger i UI-laget.
import { Pdf, jpegStorrelse } from "../../felles/web/pdf.js";
import { lagZip } from "../../felles/web/zip.js";

export interface Maal { id: string; navn: string; raa: string; verdi: number | null; enhet: "m" | "mm"; kontrollert: boolean }
export interface Rom { id: string; navn: string; maal: Maal[] }
export interface BildeMeta { id: string; filnavn: string; orientering: number; bredde: number; hoyde: number; romId: string }
export interface Markering { x: number; y: number; b: number; h: number } // normalisert 0–1 i VISNINGSretning (etter EXIF)
export interface Funn { id: string; romId: string; tekst: string; bildeId?: string; markering?: Markering; oppgaveId?: string }
export interface Oppgave { id: string; tekst: string }
export interface Befaring {
  id: string; adresse: string; dato: string; utfortAv: string; rom: Rom[]; bilder: BildeMeta[]; funn: Funn[];
  arbeidsordre: { id: string; status: "utkast" | "ferdigstilt"; oppgaver: Oppgave[]; ferdigstilt?: string };
  endret: string;
}

/** Leser desimaltall skrevet med komma eller punktum. Tall med både komma og punktum avvises som tvetydige. */
export function lesDesimal(raa: string): { verdi: number | null; feil?: string } {
  const t = raa.trim().replace(/\s+/g, "");
  if (t === "") return { verdi: null, feil: "tomt" };
  if (t.includes(",") && t.includes(".")) return { verdi: null, feil: `«${raa}» har både komma og punktum – skriv f.eks. 2,45` };
  if (!/^-?\d+([.,]\d+)?$/.test(t)) return { verdi: null, feil: `«${raa}» er ikke et tall` };
  return { verdi: Number(t.replace(",", ".")) };
}
export const visDesimal = (v: number | null) => v === null ? "–" : String(v).replace(".", ",");

export function settMaal(m: Maal, raa: string): Maal {
  const r = lesDesimal(raa);
  // Endret mål må kontrolleres på nytt
  return { ...m, raa, verdi: r.verdi, kontrollert: false };
}

/** EXIF-orientering (tag 0x0112) fra JPEG. 1 hvis den mangler. */
export function exifOrientering(b: Uint8Array): number {
  if (b[0] !== 0xff || b[1] !== 0xd8) return 1;
  let i = 2;
  while (i + 4 < b.length) {
    if (b[i] !== 0xff) return 1;
    const m = b[i + 1], len = (b[i + 2] << 8) | b[i + 3];
    if (m === 0xe1 && String.fromCharCode(b[i + 4], b[i + 5], b[i + 6], b[i + 7]) === "Exif") {
      const t = i + 10, le = b[t] === 0x49;
      const u16 = (o: number) => le ? b[t + o] | (b[t + o + 1] << 8) : (b[t + o] << 8) | b[t + o + 1];
      const u32 = (o: number) => le ? (b[t + o] | (b[t + o + 1] << 8) | (b[t + o + 2] << 16) | (b[t + o + 3] << 24)) >>> 0 : ((b[t + o] << 24) | (b[t + o + 1] << 16) | (b[t + o + 2] << 8) | b[t + o + 3]) >>> 0;
      const ifd = u32(4), n = u16(ifd);
      for (let k = 0; k < n; k++) { const e = ifd + 2 + k * 12; if (u16(e) === 0x0112) return u16(e + 8); }
      return 1;
    }
    if (m === 0xda) return 1;
    i += 2 + len;
  }
  return 1;
}
export function rotasjon(orient: number): 0 | 90 | 180 | 270 {
  const r = ({ 1: 0, 3: 180, 6: 90, 8: 270 } as Record<number, 0 | 90 | 180 | 270>)[orient];
  if (r === undefined) throw new Error(`EXIF-orientering ${orient} (speilet) støttes ikke – ta bildet på nytt`);
  return r;
}
export function bildeMeta(id: string, filnavn: string, jpeg: Uint8Array, romId: string): BildeMeta {
  const { bredde, hoyde } = jpegStorrelse(jpeg); const o = exifOrientering(jpeg);
  const snu = rotasjon(o) % 180 !== 0;
  return { id, filnavn, orientering: o, bredde: snu ? hoyde : bredde, hoyde: snu ? bredde : hoyde, romId };
}

export function hindringer(b: Befaring): string[] {
  const h: string[] = [];
  for (const r of b.rom) for (const m of r.maal) {
    if (m.verdi === null) h.push(`${r.navn}: «${m.navn}» mangler gyldig verdi`);
    else if (!m.kontrollert) h.push(`${r.navn}: «${m.navn}» er ikke kontrollert`);
  }
  if (!b.arbeidsordre.oppgaver.length) h.push("arbeidsordren har ingen oppgaver");
  for (const o of b.arbeidsordre.oppgaver) if (!b.funn.some(f => f.oppgaveId === o.id)) h.push(`oppgave «${o.tekst}» er ikke knyttet til noe funn`);
  for (const f of b.funn) {
    if (f.bildeId && !b.bilder.some(x => x.id === f.bildeId)) h.push(`funn «${f.tekst}» peker på manglende bilde ${f.bildeId}`);
    if (f.oppgaveId && !b.arbeidsordre.oppgaver.some(o => o.id === f.oppgaveId)) h.push(`funn «${f.tekst}» peker på manglende oppgave ${f.oppgaveId}`);
  }
  return h;
}
export function ferdigstill(b: Befaring, tid: string): Befaring {
  const h = hindringer(b); if (h.length) throw new Error("kan ikke ferdigstille: " + h.join("; "));
  const n: Befaring = JSON.parse(JSON.stringify(b)); n.arbeidsordre.status = "ferdigstilt"; n.arbeidsordre.ferdigstilt = tid; n.endret = tid; return n;
}

export function lagPdf(b: Befaring, bilder: Map<string, Uint8Array>): Uint8Array {
  const pdf = new Pdf({ tittel: `Befaring ${b.id}` });
  let s = pdf.side(), y = 20;
  const ny = (behov: number) => { if (y + behov > 280) { s = pdf.side(); y = 20; } };
  s.tekst(15, y, `Befaring ${b.id} – ${b.adresse}`, { str: 15, font: "fet" }); y += 7;
  s.tekst(15, y, `Dato ${b.dato} · utført av ${b.utfortAv} · arbeidsordre ${b.arbeidsordre.id} (${b.arbeidsordre.status})`, { str: 9 }); y += 10;
  for (const r of b.rom) {
    ny(20); s.tekst(15, y, r.navn, { str: 12, font: "fet" }); y += 6;
    for (const m of r.maal) { ny(6); s.tekst(20, y, `${m.navn}: ${visDesimal(m.verdi)} ${m.enhet}${m.kontrollert ? "" : "  (IKKE KONTROLLERT)"}`, { str: 10 }); y += 5; }
    for (const f of b.funn.filter(x => x.romId === r.id)) {
      const o = b.arbeidsordre.oppgaver.find(x => x.id === f.oppgaveId);
      ny(8); s.tekst(20, y, `Funn ${f.id}: ${f.tekst}${o ? ` → oppgave ${o.id}` : ""}`, { str: 10 }); y += 5;
      const meta = f.bildeId ? b.bilder.find(x => x.id === f.bildeId) : undefined; const jpeg = f.bildeId ? bilder.get(f.bildeId) : undefined;
      if (meta && jpeg) {
        const maksB = 90, maksH = 70, sk = Math.min(maksB / meta.bredde, maksH / meta.hoyde);
        const bb = meta.bredde * sk, hh = meta.hoyde * sk; ny(hh + 6);
        s.bilde(jpeg, 25, y, bb, hh, rotasjon(meta.orientering));
        if (f.markering) s.rekt(25 + f.markering.x * bb, y + f.markering.y * hh, f.markering.b * bb, f.markering.h * hh, 0.8);
        s.tekst(25 + bb + 3, y + 4, `${meta.filnavn} (${meta.bredde}×${meta.hoyde}, EXIF ${meta.orientering})`, { str: 7 });
        y += hh + 5;
      }
    }
    y += 3;
  }
  ny(20); s.tekst(15, y, "Arbeidsordre", { str: 12, font: "fet" }); y += 6;
  for (const o of b.arbeidsordre.oppgaver) { ny(6); s.tekst(20, y, `${o.id}: ${o.tekst} (funn: ${b.funn.filter(f => f.oppgaveId === o.id).map(f => f.id).join(", ")})`, { str: 10 }); y += 5; }
  return pdf.bytes();
}

export async function sha256(d: Uint8Array): Promise<string> {
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", d));
  return Array.from(h, x => x.toString(16).padStart(2, "0")).join("");
}
export async function eksportPakke(b: Befaring, bilder: Map<string, Uint8Array>): Promise<Uint8Array> {
  const filer: { navn: string; data: Uint8Array | string }[] = [];
  const manifest: { befaring: string; arbeidsordre: string; generert: string; bilder: { id: string; fil: string; sha256: string; bytes: number }[] } = { befaring: b.id, arbeidsordre: b.arbeidsordre.status, generert: b.endret, bilder: [] };
  for (const m of b.bilder) {
    const d = bilder.get(m.id); if (!d) throw new Error("mangler bildedata for " + m.id);
    const fil = `bilder/original/${m.id}_${m.filnavn}`;
    filer.push({ navn: fil, data: d }); manifest.bilder.push({ id: m.id, fil, sha256: await sha256(d), bytes: d.length });
  }
  filer.unshift({ navn: "befaring.json", data: JSON.stringify(b, null, 2) }, { navn: "arbeidsordre.pdf", data: lagPdf(b, bilder) });
  filer.push({ navn: "manifest.json", data: JSON.stringify(manifest, null, 2) });
  return lagZip(filer, new Date(Date.parse(b.endret) || Date.UTC(2026, 0, 1)));
}
