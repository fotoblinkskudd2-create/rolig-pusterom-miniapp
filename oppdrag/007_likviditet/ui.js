import { h, $, tom, lastNed } from "../felles/web/dom.js";
import { beregn, flytt, scenario, csv, ukeNr } from "./dist/likviditet.js";
const les = f => fetch("data/" + f).then(r => r.json());
const basis = await les("basis.json");
const defs = [["basis", null], ["forsinket", await les("scenario_forsinket.json")], ["ansettelse", await les("scenario_ansettelse.json")]];
const NOKKEL = "likviditet.flytt.v1";
let flyttinger = {}; try { flyttinger = JSON.parse(localStorage.getItem(NOKKEL)) || {}; } catch {}
let A = "basis", B = "forsinket";
const kr = n => n.toLocaleString("nb-NO") + " kr";
function modell(navn) {
  const d = defs.find(x => x[0] === navn)[1];
  let m = d ? scenario(basis, d.navn, d) : structuredClone(basis);
  for (const [id, uker] of Object.entries(flyttinger[navn] || {})) if (uker) m = flytt(m, id, uker);
  return m;
}
for (const [n] of defs) { $("#sa").append(h("option", { value: n, selected: n === A }, n)); $("#sb").append(h("option", { value: n, selected: n === B }, n)); }
$("#sa").onchange = e => { A = e.target.value; tegn(); }; $("#sb").onchange = e => { B = e.target.value; tegn(); };
$("#csv").onclick = () => lastNed(`likviditet_${A}.csv`, csv(modell(A)), "text/csv");
$("#nullstill").onclick = () => { flyttinger = {}; lagre(); };
function lagre() { try { localStorage.setItem(NOKKEL, JSON.stringify(flyttinger)); } catch {} tegn(); }
function tegn() {
  const ma = modell(A), mb = modell(B), ra = beregn(ma), rb = beregn(mb);
  tom($("#nokkel"), h("div", { class: "rad" },
    h("span", {}, "Laveste saldo A: ", h("b", { id: "laveste", class: ra.laveste.saldo < 0 ? "feil" : "" }, kr(ra.laveste.saldo)), ra.laveste.uke ? ` (uke ${ra.laveste.uke})` : " (inngående)"),
    h("span", {}, "B: ", h("b", { class: rb.laveste.saldo < 0 ? "feil" : "" }, kr(rb.laveste.saldo))),
    h("span", {}, "Sluttsaldo A: ", h("b", {}, kr(ra.sluttsaldo))),
    h("span", { class: ra.avstemt ? "ok" : "feil", id: "avstemt" }, ra.avstemt ? "✓ avstemt uke for uke" : "✗ avstemming feilet"),
    ra.utenforHorisont.length > 0 && h("span", { class: "adv" }, `${ra.utenforHorisont.length} post(er) utenfor 13 uker: ${ra.utenforHorisont.map(p => p.id).join(", ")}`)));
  // Graf
  const alle = [...ra.uker, ...rb.uker].map(u => u.utgaaende).concat([0, ma.inngaaendeSaldo]);
  const maks = Math.max(...alle), min = Math.min(...alle), Y = v => 200 - (v - min) / (maks - min || 1) * 180, X = i => 40 + i * 58;
  const linje = (r, s) => h("polyline", { fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-dasharray": s, points: [ma.inngaaendeSaldo, ...r.uker.map(u => u.utgaaende)].map((v, i) => `${X(i)},${Y(v)}`).join(" ") });
  const svg = $("#graf"); svg.innerHTML = "";
  const ns = (t, a) => { const e = document.createElementNS("http://www.w3.org/2000/svg", t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); return e; };
  if (min < 0) svg.append(ns("rect", { x: 40, y: Y(0), width: 13 * 58, height: 200 - Y(0), fill: "rgba(179,38,30,.12)" }));
  svg.append(ns("line", { x1: 40, x2: 40 + 13 * 58, y1: Y(0), y2: Y(0), stroke: "gray" }));
  for (const [r, s] of [[ra, ""], [rb, "6 4"]]) { const l = linje(r, s); svg.append(ns("polyline", Object.fromEntries([...l.attributes].map(a => [a.name, a.value])))); }
  for (let i = 0; i <= 13; i++) { const t = ns("text", { x: X(i) - 4, y: 215 }); t.textContent = i; svg.append(t); }
  tom($("#uker"), h("tr", {}, ["Uke", "Periode", "Inngående", "Inn reg.", "Inn antatt", "Ut reg.", "Ut antatt", "Netto", "Utgående A", "Utgående B"].map(x => h("th", { class: "tall" }, x))),
    ra.uker.map((u, i) => h("tr", { class: u.negativ ? "neg" : "", "data-uke": u.nr }, h("td", {}, u.nr), h("td", {}, `${u.fra.slice(5)}–${u.til.slice(5)}`),
      ...[u.inngaaende, u.innRegistrert].map(v => h("td", { class: "tall" }, kr(v))), h("td", { class: "tall antatt" }, kr(u.innAntatt)),
      h("td", { class: "tall" }, kr(u.utRegistrert)), h("td", { class: "tall antatt" }, kr(u.utAntatt)), h("td", { class: "tall" }, kr(u.netto)),
      h("td", { class: "tall " + (u.negativ ? "feil" : "") }, kr(u.utgaaende)), h("td", { class: "tall " + (rb.uker[i].negativ ? "feil" : "") }, kr(rb.uker[i].utgaaende)))));
  tom($("#poster"), h("tr", {}, ["Id", "Dato", "Uke", "Beløp", "Kategori", "Type", "Flytt"].map(x => h("th", {}, x))),
    [...ma.poster].sort((a, b) => a.dato.localeCompare(b.dato)).map(p => h("tr", { class: p.sikkerhet === "antatt" ? "antatt" : "", "data-post": p.id },
      h("td", {}, p.id), h("td", {}, p.dato), h("td", {}, ukeNr(ma, p.dato) ?? "utenfor"), h("td", { class: "tall" }, kr(p.belop)), h("td", {}, `${p.kategori} – ${p.beskrivelse}`), h("td", {}, p.sikkerhet),
      h("td", {}, h("button", { class: "sekundaer", "data-tilbake": p.id, onclick: () => endre(p.id, -1) }, "← uke"), h("button", { class: "sekundaer", "data-frem": p.id, onclick: () => endre(p.id, 1) }, "uke →")))));
  tom($("#forut"), ma.forutsetninger.map(f => h("li", {}, f)), A !== B && mb.forutsetninger.filter(f => !ma.forutsetninger.includes(f)).map(f => h("li", { class: "svak" }, "B: " + f)));
}
function endre(id, d) { flyttinger[A] = flyttinger[A] || {}; flyttinger[A][id] = (flyttinger[A][id] || 0) + d; lagre(); }
tegn();
