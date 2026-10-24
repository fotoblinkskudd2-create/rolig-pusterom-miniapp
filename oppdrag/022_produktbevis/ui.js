import { h, $, tom, lastNed } from "../felles/web/dom.js";
import { vurder, valider, eksport, sha256 } from "./dist/bevis.js";
// IndexedDB: «saker» (JSON) og «filer» (bytes per fil-id)
const db = await new Promise((ok, feil) => { const r = indexedDB.open("produktbevis", 1); r.onupgradeneeded = () => { r.result.createObjectStore("saker"); r.result.createObjectStore("filer"); }; r.onsuccess = () => ok(r.result); r.onerror = () => feil(r.error); });
const tx = (s, m, f) => new Promise((ok, feil) => { const t = db.transaction(s, m); const r = f(t.objectStore(s)); t.oncomplete = () => ok(r && r.result); t.onerror = () => feil(t.error); });
const urler = new Map();
let S = await tx("saker", "readonly", s => s.get("aktiv"));
const lagre = async () => { await tx("saker", "readwrite", s => s.put(S, "aktiv")); tegn(); };
async function filUrl(id) { if (!urler.has(id)) { const d = await tx("filer", "readonly", s => s.get(id)); const f = S.filer.find(x => x.id === id); urler.set(id, URL.createObjectURL(new Blob([d], { type: f.type }))); } return urler.get(id); }
async function lastDemo() {
  const s = await fetch("data/sak.json").then(r => r.json());
  for (const f of s.filer) { const d = new Uint8Array(await fetch("data/filer/" + f.navn).then(r => r.arrayBuffer())); await tx("filer", "readwrite", st => st.put(d, f.id)); }
  S = s; urler.clear(); lagre();
}
async function leggTilFil(fil) {
  const d = new Uint8Array(await fil.arrayBuffer()); const id = "F" + (S.filer.length + 1) + Date.now().toString(36);
  await tx("filer", "readwrite", s => s.put(d, id)); S.filer.push({ id, navn: fil.name, type: fil.type || "application/octet-stream", sha256: await sha256(d), bytes: d.length }); return id;
}
const fillenke = async id => { const f = S.filer.find(x => x.id === id); return f ? h("a", { href: await filUrl(id), target: "_blank", "data-fil": id }, f.navn) : h("span", { class: "feil" }, `mangler ${id}`); };
async function tegn() {
  if (!S) return tom($("#app"), h("div", { class: "kort" }, h("p", {}, "Ingen sak registrert."), h("button", { id: "demo", onclick: lastDemo }, "Last fiktiv kjøkkenholder")));
  const feil = valider(S), V = vurder(S);
  const grunn = S.revisjoner.find(r => r.grunnlinje), ny = S.revisjoner.find(r => !r.grunnlinje);
  const bilde = async r => { const id = r && r.filIder.find(i => S.filer.find(f => f.id === i)?.type.startsWith("image")); return id ? h("img", { src: await filUrl(id), alt: r.beskrivelse }) : h("p", { class: "svak" }, "intet bilde"); };
  tom($("#app"),
    h("div", { class: "kort" }, h("h3", {}, `${S.produkt} · ${S.id}`), h("p", {}, h("b", {}, "Problem: "), S.problem), h("p", {}, h("b", {}, "Brukssituasjon: "), S.brukssituasjon),
      h("p", {}, h("b", {}, "Kilde: "), S.kilde, " · originalfoto: ", await fillenke(S.originalfoto))),
    feil.length > 0 && h("div", { class: "kort feil" }, feil.join("; ")),
    h("div", { class: "ff" }, h("div", { class: "kort" }, h("b", {}, `Før – rev ${grunn.id}: ${grunn.beskrivelse}`), await bilde(grunn)), h("div", { class: "kort" }, h("b", {}, `Etter – rev ${ny?.id}: ${ny?.beskrivelse}`), await bilde(ny))),
    h("div", { class: "kort" }, h("h3", {}, "Hypoteser og vurdering"), h("table", {}, h("tr", {}, ["", "Antatt årsak", "Foreslått endring", "Metode", "Status", "Grunnlag"].map(x => h("th", {}, x))),
      S.hypoteser.map(hy => { const v = V.find(x => x.hypotese === hy.id); const m = S.metoder.find(x => x.id === hy.metode);
        return h("tr", { "data-hyp": hy.id }, h("td", {}, hy.id), h("td", {}, hy.antattAarsak), h("td", {}, `${hy.foreslattEndring} (rev ${hy.revisjon})`), h("td", {}, `${m?.navn} (${m?.bedre} er bedre, terskel ${m?.terskel} ${m?.enhet})`),
          h("td", { class: { "støttet av prøving": "ok", "ikke støttet av prøving": "feil", hypotese: "adv" }[v.status], "data-status": hy.id }, v.status), h("td", { class: "svak" }, v.grunn)); }))),
    h("div", { class: "kort" }, h("h3", {}, "Prototypetester"), h("table", {}, h("tr", {}, ["Test", "Revisjon", "Metode", "Verdier", "Filer", "Dato", "Merknad", ""].map(x => h("th", {}, x))),
      await Promise.all(S.tester.map(async t => h("tr", {}, h("td", {}, t.id), h("td", {}, t.revisjon), h("td", {}, t.metode), h("td", {}, t.verdier.join("; ")), h("td", {}, ...(await Promise.all(t.filIder.map(fillenke))).flatMap(x => [x, " "]), t.filIder.length === 0 && h("span", { class: "feil" }, "ingen fil – teller ikke")),
        h("td", {}, t.dato), h("td", { class: "svak" }, t.merknad), h("td", {}, h("label", { class: "sekundaer" }, "+ fil", h("input", { type: "file", style: "display:none", "data-test": t.id, onchange: async e => { t.filIder.push(await leggTilFil(e.target.files[0])); lagre(); } }))))))),
      h("div", { class: "rad" }, h("b", {}, "Ny test:"), h("select", { id: "nt-rev" }, S.revisjoner.map(r => h("option", { value: r.id }, r.id))), h("select", { id: "nt-met" }, S.metoder.map(m => h("option", { value: m.id }, m.navn))),
        h("input", { id: "nt-v", placeholder: "verdier, f.eks. 2,9; 3,1" }), h("button", { id: "nt-lagre", onclick: () => { S.tester.push({ id: "T" + (S.tester.length + 1), revisjon: $("#nt-rev").value, metode: $("#nt-met").value, verdier: $("#nt-v").value.split(";").map(x => Number(x.trim().replace(",", "."))).filter(Number.isFinite), filIder: [], dato: new Date().toISOString().slice(0, 10), merknad: "registrert i UI" }); lagre(); } }, "Legg til"))),
    h("div", { class: "kort" }, h("p", {}, h("b", {}, "Patentnyhet: "), S.uavklart.patentnyhet, " · ", h("b", {}, "Markedsetterspørsel: "), S.uavklart.markedsetterspoersel),
      h("div", { class: "rad" }, h("button", { id: "eksport", onclick: async () => { const d = new Map(); for (const f of S.filer) d.set(f.id, await tx("filer", "readonly", s => s.get(f.id))); try { lastNed(`testpakke_${S.id}.zip`, await eksport(S, d), "application/zip"); } catch (e) { alert(e.message); } } }, "Eksporter testpakke (ZIP)"),
        h("button", { class: "sekundaer", onclick: () => { S = null; tx("saker", "readwrite", s => s.delete("aktiv")); tegn(); } }, "Fjern saken fra enheten"))));
}
tegn();
