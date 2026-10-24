// Bevismodell for én produktforbedring. En hypotese kan bare bli «støttet av prøving» når det finnes
// en grunnlinjetest på opprinnelig revisjon OG en test på ny revisjon med samme målemetode, begge med
// koblede filer, og endringen oppfyller terskelen. Ellers forblir den en hypotese.
import { lagZip } from "../../felles/web/zip.js";
const median = (v) => { const s = [...v].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
export function valider(s) {
    const f = [];
    const filer = new Set(s.filer.map(x => x.id));
    const rev = new Set(s.revisjoner.map(r => r.id));
    const met = new Set(s.metoder.map(m => m.id));
    if (!filer.has(s.originalfoto))
        f.push("originalfoto peker på manglende fil");
    for (const r of s.revisjoner)
        for (const id of r.filIder)
            if (!filer.has(id))
                f.push(`revisjon ${r.id}: manglende fil ${id}`);
    for (const t of s.tester) {
        if (!rev.has(t.revisjon))
            f.push(`test ${t.id}: ukjent revisjon ${t.revisjon}`);
        if (!met.has(t.metode))
            f.push(`test ${t.id}: ukjent målemetode ${t.metode}`);
        for (const id of t.filIder)
            if (!filer.has(id))
                f.push(`test ${t.id}: manglende fil ${id}`);
    }
    if (s.revisjoner.filter(r => r.grunnlinje).length !== 1)
        f.push("nøyaktig én revisjon må være grunnlinje");
    return f;
}
export function vurder(s) {
    const grunn = s.revisjoner.find(r => r.grunnlinje);
    return s.hypoteser.map(h => {
        const m = s.metoder.find(x => x.id === h.metode);
        const medBevis = (t) => t.metode === h.metode && t.filIder.length > 0 && t.verdier.length > 0;
        const før = s.tester.filter(t => t.revisjon === grunn.id && medBevis(t));
        const etter = s.tester.filter(t => t.revisjon === h.revisjon && medBevis(t));
        if (!m)
            return { hypotese: h.id, status: "hypotese", grunn: "målemetode mangler", tester: [] };
        if (!før.length || !etter.length)
            return { hypotese: h.id, status: "hypotese", grunn: !før.length ? "mangler grunnlinjetest med filbevis" : "mangler test av ny revisjon med filbevis", tester: [...før, ...etter].map(t => t.id) };
        const g = median(før.flatMap(t => t.verdier)), n = median(etter.flatMap(t => t.verdier));
        const endring = m.bedre === "høyere" ? n - g : g - n;
        const ok = endring >= m.terskel;
        return { hypotese: h.id, status: (ok ? "støttet av prøving" : "ikke støttet av prøving"),
            grunn: `median ${g} → ${n} ${m.enhet}; endring ${endring.toFixed(2)} ${ok ? "≥" : "<"} terskel ${m.terskel} (n = ${før.flatMap(t => t.verdier).length}/${etter.flatMap(t => t.verdier).length})`,
            grunnlinje: g, ny: n, endring, tester: [...før, ...etter].map(t => t.id) };
    });
}
export async function sha256(d) { return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", d)), x => x.toString(16).padStart(2, "0")).join(""); }
/** Eksportpakke: sak.json, vurdering.json og alle filer under filer/<sha256>_<navn>. Manifestet kobler fil-id → sti → sha256. */
export async function eksport(s, data) {
    const f = valider(s);
    if (f.length)
        throw new Error(f.join("; "));
    const manifest = [];
    const filer = [];
    for (const x of s.filer) {
        const d = data.get(x.id);
        if (!d)
            throw new Error("mangler data for " + x.id);
        const h = await sha256(d);
        if (h !== x.sha256)
            throw new Error(`fil ${x.navn} er endret siden registrering (sha256 avviker)`);
        const sti = `filer/${h.slice(0, 12)}_${x.navn}`;
        filer.push({ navn: sti, data: d });
        manifest.push({ id: x.id, sti, sha256: h, bytes: d.length });
    }
    return lagZip([{ navn: "sak.json", data: JSON.stringify(s, null, 2) }, { navn: "vurdering.json", data: JSON.stringify(vurder(s), null, 2) },
        { navn: "manifest.json", data: JSON.stringify({ sak: s.id, filer: manifest, uavklart: s.uavklart }, null, 2) }, ...filer]);
}
