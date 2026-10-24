import { h, $, tom, lastNed } from "../felles/web/dom.js";
import { lesDesimal, settMaal, visDesimal, bildeMeta, hindringer, ferdigstill, eksportPakke } from "./dist/befaring.js";
import * as L from "./lager.js";

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
const nett = () => { $("#nett").textContent = navigator.onLine ? "● på nett" : "● uten nett – alt lagres lokalt"; $("#nett").className = "status " + (navigator.onLine ? "ok" : "adv"); };
addEventListener("online", nett); addEventListener("offline", nett); nett();

let B = null; const urler = new Map(); let tidtaker = null;
const nå = () => new Date().toISOString();
const id = p => p + Math.random().toString(36).slice(2, 7).toUpperCase();
const bildeNokkel = (bid) => `${B.id}/${bid}`;

function endret() {
  B.endret = nå();
  clearTimeout(tidtaker);
  $("#lagret").textContent = "lagrer…";
  tidtaker = setTimeout(async () => { await L.lagreBefaring(B); $("#lagret").textContent = "utkast lagret lokalt " + new Date().toLocaleTimeString("nb-NO"); }, 250);
  tegn();
}
async function bildeUrl(bid) {
  if (!urler.has(bid)) { const d = await L.hentBilde(bildeNokkel(bid)); if (d) urler.set(bid, URL.createObjectURL(new Blob([d], { type: "image/jpeg" }))); }
  return urler.get(bid);
}
async function start() {
  const alle = await L.alleBefaringer();
  tom($("#app"), h("div", { class: "kort" }, h("h3", {}, "Befaringer på denne enheten"),
    alle.length ? h("ul", {}, alle.map(b => h("li", {}, h("a", { href: "#", "data-apne": b.id, onclick: e => { e.preventDefault(); aapne(b.id); } }, `${b.id} · ${b.adresse}`), ` (${b.arbeidsordre.status}, endret ${b.endret})`))) : h("p", { class: "svak" }, "Ingen ennå."),
    h("div", { class: "rad" }, h("button", { id: "demo", onclick: lastDemo }, "Last demobefaring"), h("button", { class: "sekundaer", onclick: nyBefaring }, "Ny befaring"))));
}
async function lastDemo() {
  const d = await fetch("data/demo.json").then(r => r.json());
  for (const b of d.bilder) await L.lagreBilde(`${d.id}/${b.id}`, new Uint8Array(await fetch("data/bilder/" + b.filnavn).then(r => r.arrayBuffer())));
  await L.lagreBefaring(d); aapne(d.id);
}
async function nyBefaring() {
  const b = { id: "BEF-" + Date.now().toString(36).toUpperCase(), adresse: prompt("Adresse") || "uten adresse", dato: nå().slice(0, 10), utfortAv: "", rom: [], bilder: [], funn: [],
    arbeidsordre: { id: "AO-" + Date.now().toString(36).toUpperCase(), status: "utkast", oppgaver: [] }, endret: nå() };
  await L.lagreBefaring(b); aapne(b.id);
}
async function aapne(bid) { B = await L.hentBefaring(bid); urler.clear(); history.replaceState(null, "", "#" + bid); tegn(); }

async function tegn() {
  if (!B) return start();
  const låst = B.arbeidsordre.status === "ferdigstilt";
  const hind = hindringer(B);
  const innhold = [
    h("div", { class: "kort" }, h("div", { class: "rad" }, h("b", {}, B.id), h("span", {}, B.adresse), h("span", { class: "merke " + (låst ? "ok" : "adv"), id: "aostatus" }, B.arbeidsordre.status),
      h("button", { class: "sekundaer", onclick: () => { B = null; history.replaceState(null, "", "#"); start(); } }, "Alle befaringer"))),
  ];
  for (const r of B.rom) {
    const bilder = B.bilder.filter(x => x.romId === r.id);
    innhold.push(h("div", { class: "kort", "data-rom": r.id }, h("h3", {}, r.navn),
      h("table", {}, r.maal.map(m => { const p = lesDesimal(m.raa); return h("tr", {}, h("td", {}, m.navn),
        h("td", {}, h("input", { class: "maal", inputmode: "decimal", value: m.raa, disabled: låst, "data-maal": m.id, onchange: e => { Object.assign(m, settMaal(m, e.target.value)); endret(); } }), " ", m.enhet,
          p.feil && h("div", { class: "feltfeil" }, p.feil), !p.feil && h("div", { class: "svak", style: "font-size:12px" }, "lest som " + visDesimal(p.verdi))),
        h("td", {}, h("label", { style: "flex-direction:row;gap:4px" }, h("input", { type: "checkbox", checked: m.kontrollert, disabled: låst || p.verdi === null, "data-kontroller": m.id, onchange: e => { m.kontrollert = e.target.checked; endret(); } }), "kontrollert"))); })),
      !låst && h("button", { class: "sekundaer", onclick: () => { const n = prompt("Navn på mål"); if (n) { r.maal.push({ id: id("M"), navn: n, raa: "", verdi: null, enhet: "m", kontrollert: false }); endret(); } } }, "+ mål"),
      !låst && h("label", {}, "Ta/legg til bilde", h("input", { type: "file", accept: "image/jpeg", capture: "environment", "data-bilde-rom": r.id, onchange: e => leggTilBilde(r.id, e.target.files[0]) })),
      ...await Promise.all(B.funn.filter(f => f.romId === r.id).map(f => funnKort(f, bilder, låst))),
      !låst && h("button", { class: "sekundaer", onclick: () => { const t = prompt("Beskriv funnet"); if (t) { B.funn.push({ id: id("F"), romId: r.id, tekst: t }); endret(); } } }, "+ funn")));
  }
  innhold.push(h("div", { class: "kort" }, !låst && h("button", { class: "sekundaer", onclick: () => { const n = prompt("Romnavn"); if (n) { B.rom.push({ id: id("R"), navn: n, maal: [] }); endret(); } } }, "+ rom"),
    h("h3", {}, "Arbeidsordre " + B.arbeidsordre.id), h("ul", {}, B.arbeidsordre.oppgaver.map(o => h("li", {}, `${o.id}: ${o.tekst} — funn: ${B.funn.filter(f => f.oppgaveId === o.id).map(f => f.id).join(", ") || "ingen"}`))),
    !låst && h("button", { class: "sekundaer", onclick: () => { const t = prompt("Oppgave"); if (t) { B.arbeidsordre.oppgaver.push({ id: id("O"), tekst: t }); endret(); } } }, "+ oppgave"),
    hind.length ? h("div", { class: "adv", id: "hindringer" }, h("b", {}, "Før ferdigstilling: "), h("ul", {}, hind.map(x => h("li", {}, x)))) : h("p", { class: "ok" }, "Alle mål er kontrollert."),
    h("div", { class: "rad" }, h("button", { id: "ferdigstill", disabled: låst || hind.length > 0, onclick: () => { B = ferdigstill(B, nå()); endret(); } }, "Ferdigstill arbeidsordre"),
      h("button", { id: "eksport", onclick: eksport }, "Eksporter pakke (PDF + JSON + originalbilder)"))));
  tom($("#app"), innhold);
}
async function funnKort(f, bilder, låst) {
  const meta = f.bildeId && B.bilder.find(b => b.id === f.bildeId);
  const url = meta ? await bildeUrl(meta.id) : null;
  let boks = null;
  if (url) {
    const img = h("img", { src: url, alt: f.tekst, "data-funnbilde": f.id });
    boks = h("div", { class: "bildeboks" }, img, f.markering && h("div", { class: "mark", style: `left:${f.markering.x * 100}%;top:${f.markering.y * 100}%;width:${f.markering.b * 100}%;height:${f.markering.h * 100}%` }));
    if (!låst) { let s = null; const pos = e => { const r = img.getBoundingClientRect(); return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) }; };
      boks.addEventListener("pointerdown", e => { s = pos(e); boks.setPointerCapture(e.pointerId); });
      boks.addEventListener("pointerup", e => { if (!s) return; const p = pos(e); const m = { x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), b: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) }; s = null; if (m.b > 0.01 && m.h > 0.01) { f.markering = m; endret(); } }); }
  }
  return h("div", { class: "kort", "data-funn": f.id }, h("b", {}, `${f.id}: ${f.tekst}`),
    h("div", { class: "rad" }, h("label", {}, "Bilde", h("select", { disabled: låst, onchange: e => { f.bildeId = e.target.value || undefined; f.markering = undefined; endret(); } }, h("option", { value: "" }, "ingen"), bilder.map(b => h("option", { value: b.id, selected: b.id === f.bildeId }, `${b.id} ${b.filnavn}`)))),
      h("label", {}, "Knytt til oppgave", h("select", { disabled: låst, "data-oppgave": f.id, onchange: e => { f.oppgaveId = e.target.value || undefined; endret(); } }, h("option", { value: "" }, "ingen"), B.arbeidsordre.oppgaver.map(o => h("option", { value: o.id, selected: o.id === f.oppgaveId }, `${o.id} ${o.tekst}`))))),
    boks, meta && h("div", { class: "svak", style: "font-size:12px" }, `${meta.filnavn} · ${meta.bredde}×${meta.hoyde} · EXIF ${meta.orientering}${låst ? "" : " · dra på bildet for å markere"}`));
}
async function leggTilBilde(romId, fil) {
  if (!fil) return;
  const d = new Uint8Array(await fil.arrayBuffer());
  let meta; try { meta = bildeMeta(id("B"), fil.name, d, romId); } catch (e) { return alert(e.message); }
  await L.lagreBilde(bildeNokkel(meta.id), d); B.bilder.push(meta); endret();
}
async function eksport() {
  const bilder = new Map();
  for (const b of B.bilder) bilder.set(b.id, await L.hentBilde(bildeNokkel(b.id)));
  try { lastNed(`befaring_${B.id}.zip`, await eksportPakke(B, bilder), "application/zip"); } catch (e) { alert(e.message); }
}
const fraUrl = location.hash.slice(1);
if (fraUrl) aapne(fraUrl).catch(start); else start();
