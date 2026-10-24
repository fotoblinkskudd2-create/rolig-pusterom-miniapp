import { h, $, tom, lastNed } from "../felles/web/dom.js";
import { lesEml } from "./dist/eml.js";
import { lagKort, rett, godkjenn, eksport } from "./dist/uttrekk.js";

let kort = null, aktivt = null;
const FELT = [["navn", "Navn"], ["epost", "E-post"], ["telefon", "Telefon"], ["jobb", "Ønsket jobb"], ["sted", "Sted"], ["frist", "Frist (ÅÅÅÅ-MM-DD)"]];
const nå = () => new Date().toISOString();

function behandle(navn, raa) {
  kort = navn.endsWith(".eml") ? lagKort(navn, { type: "eml", navn }, lesEml(raa)) : lagKort(navn, { type: "tekst", navn }, { tekst: raa });
  aktivt = null; tegn();
}
function kildetekst() {
  const t = kort.tekst, merker = [];
  for (const [n] of FELT) { const f = kort.felt[n]; if (f && f.span) merker.push({ n, s: f.span[0], e: f.span[1] }); }
  for (const v of kort.vedlegg) if (v.span) merker.push({ n: "vedlegg", s: v.span[0], e: v.span[1] });
  merker.sort((a, b) => a.s - b.s);
  const deler = []; let pos = 0;
  for (const m of merker) { if (m.s < pos) continue; deler.push(t.slice(pos, m.s)); deler.push(h("mark", { class: aktivt === m.n ? "aktiv" : "", title: m.n, "data-felt": m.n }, t.slice(m.s, m.e))); pos = m.e; }
  const ny = kort.nyDelSlutt;
  // Del ved grensen mellom ny tekst og sitat
  const rest = t.slice(pos);
  if (pos < ny) deler.push(t.slice(pos, ny), h("span", { class: "sitert", title: "sitert historikk – ikke brukt" }, t.slice(ny)));
  else deler.push(h("span", { class: "sitert" }, rest));
  return deler;
}
function tegn() {
  if (!kort) return;
  const ut = $("#kortvisning");
  tom(ut, h("div", { class: "to" },
    h("div", { class: "kort" }, h("h3", {}, `Kildetekst · ${kort.kilde.navn}`), h("div", { class: "kilde", id: "kildetekst" }, kildetekst()),
      kort.nyDelSlutt < kort.tekst.length && h("p", { class: "svak" }, "Skravert: sitert historikk, vist men ikke brukt.")),
    h("div", { class: "kort" }, h("h3", {}, "Arbeidskort ", h("span", { class: "merke " + (kort.status === "godkjent" ? "ok" : "adv"), id: "status" }, kort.status)),
      FELT.map(([n, etikett]) => { const f = kort.felt[n]; return h("div", { class: "feltrad" }, h("span", {}, etikett),
        h("div", {}, h("input", { "data-felt": n, value: f ? f.verdi : "", onfocus: () => { aktivt = n; marker(); }, onchange: e => { kort = rett(kort, n, e.target.value.trim(), nå()); tegn(); } }),
          f && h("div", { class: "svak", style: "font-size:12px" }, `${f.kilde} · ${f.sikkerhet}${f.merknad ? " · " + f.merknad : ""}`))); }),
      h("p", {}, h("b", {}, "Vedlegg: "), kort.vedlegg.length ? kort.vedlegg.map(v => v.filnavn).join(", ") : "ingen"),
      h("div", { class: kort.mangler.length ? "adv" : "ok", id: "mangler" }, h("b", {}, "Mangler: "), kort.mangler.length ? h("ul", {}, kort.mangler.map(m => h("li", {}, m))) : "ingenting"),
      kort.advarsler.length > 0 && h("div", { class: "adv" }, h("b", {}, "Merk: "), h("ul", {}, kort.advarsler.map(a => h("li", {}, a)))),
      kort.rettelser.length > 0 && h("details", {}, h("summary", {}, `${kort.rettelser.length} rettelse(r)`), h("ul", {}, kort.rettelser.map(r => h("li", {}, `${r.felt}: ${r.fra ?? "tom"} → ${r.til}`)))),
      h("div", { class: "rad" },
        h("button", { id: "godkjenn", onclick: () => { try { kort = godkjenn(kort); tegn(); } catch (e) { alert(e.message); } } }, "Godkjenn kort"),
        h("button", { id: "eksporter", disabled: kort.status !== "godkjent", onclick: () => lastNed(`arbeidskort_${kort.id}.json`, JSON.stringify(eksport(kort), null, 2), "application/json") }, "Eksporter JSON")))));
}
function marker() { document.querySelectorAll("mark").forEach(m => m.classList.toggle("aktiv", m.dataset.felt === aktivt)); }

const liste = await fetch("data/index.json").then(r => r.json());
liste.forEach(f => $("#eksempel").append(h("option", { value: f }, f)));
$("#eksempel").onchange = async e => { if (e.target.value) behandle(e.target.value, await fetch("data/" + e.target.value).then(r => r.text())); };
$("#fil").onchange = async e => { const f = e.target.files[0]; if (f) behandle(f.name, await f.text()); };
$("#behandle").onclick = () => behandle("innlimt.txt", $("#innlim").value);
