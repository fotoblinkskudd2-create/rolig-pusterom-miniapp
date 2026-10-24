import { h, $, tom, lastNed } from "../felles/web/dom.js";
import { beregn, valider, nyPrisversjon, nyVersjon, sammenlign, linjepriser, kroner, kopi } from "./dist/kalkyle.js";
import { tilbudPdf } from "./dist/tilbudpdf.js";

const NOKKEL = "tilbudskalkulator.v1";
const STEG = ["Kunde", "Mengder", "Materialer", "Arbeid", "Pris", "PDF", "Prisliste", "Sammenlign"];
let S = last() || { prisversjoner: [], tilbud: [], valgt: null, steg: "Kunde" };

function last() { try { return JSON.parse(localStorage.getItem(NOKKEL)); } catch { return null; } }
function lagre() { try { localStorage.setItem(NOKKEL, JSON.stringify(S)); } catch {} tegn(); }
const gjeldendePris = () => S.prisversjoner.at(-1);
const valgt = () => S.tilbud.find(t => nokkel(t) === S.valgt);
const nokkel = t => `${t.id}#${t.versjon}`;

async function lastDemo() {
  const [pris, oppdrag] = await Promise.all([fetch("data/prisliste.json").then(r => r.json()), fetch("data/oppdrag.json").then(r => r.json())]);
  S = { prisversjoner: [pris], tilbud: oppdrag.map(o => ({ ...o, pris: kopi(pris) })), valgt: "T-001#1", steg: "Pris" };
  lagre();
}
function nyttTilbud() {
  if (!gjeldendePris()) return alert("Last demo først for å få en prisliste.");
  const id = "T-" + String(S.tilbud.length + 1).padStart(3, "0");
  S.tilbud.push({ id, versjon: 1, opprettet: new Date().toISOString().slice(0, 10), tittel: "Nytt oppdrag",
    kunde: { navn: "", adresse: "", kontakt: "" }, poster: [], pris: kopi(gjeldendePris()),
    prismodell: { type: "påslag", prosent: 20 }, avgift: { navn: "MVA", prosent: NaN }, gyldigDager: 30 });
  S.valgt = id + "#1"; S.steg = "Kunde"; lagre();
}
const felt = (etikett, verdi, sett, type = "text", ekstra = {}) =>
  h("label", {}, etikett, h("input", { type, value: Number.isNaN(verdi) ? "" : verdi, ...ekstra, onchange: e => { sett(type === "number" ? (e.target.value === "" ? NaN : Number(e.target.value)) : e.target.value); lagre(); } }));

function tegn() {
  tom($("#tilbudsliste"), S.tilbud.map(t => h("button", { class: nokkel(t) === S.valgt ? "aktiv" : "", onclick: () => { S.valgt = nokkel(t); lagre(); } },
    `${t.id} v${t.versjon} · ${t.kunde.navn || "uten kunde"}`, h("div", { class: "svak" }, `prisgrunnlag ${t.pris.id}`))));
  tom($("#prisliste-liste"), S.prisversjoner.map(p => h("div", {}, `${p.id} (${p.dato})`)));
  tom($("#steg"), STEG.map((s, i) => h("button", { class: s === S.steg ? "aktiv" : "", onclick: () => { S.steg = s; lagre(); } }, `${i + 1}. ${s}`)));
  const t = valgt();
  const ut = $("#innhold");
  if (S.steg === "Prisliste") return tom(ut, prisliste());
  if (S.steg === "Sammenlign") return tom(ut, sammenligning());
  if (!t) return tom(ut, h("div", { class: "kort" }, "Velg eller opprett et tilbud."));
  const feil = valider(t);
  tom(ut,
    h("div", { class: "kort rad" }, h("b", {}, `${t.id} versjon ${t.versjon}`), h("span", { class: "svak" }, `prisgrunnlag ${t.pris.id} fra ${t.pris.dato}`),
      gjeldendePris() && gjeldendePris().id !== t.pris.id && h("span", { class: "merke adv" }, `nyere prisliste ${gjeldendePris().id} finnes`),
      h("button", { class: "sekundaer", onclick: () => ny(t, false) }, "Ny versjon (samme priser)"),
      h("button", { class: "sekundaer", onclick: () => ny(t, true) }, "Ny versjon med gjeldende prisliste")),
    feil.length > 0 && h("div", { class: "kort feil" }, "Mangler: ", feil.join("; ")),
    ({ Kunde: kunde, Mengder: mengder, Materialer: materialer, Arbeid: arbeid, Pris: pris, PDF: pdf })[S.steg](t));
}
function ny(t, medNyPris) {
  const n = nyVersjon(t, new Date().toISOString().slice(0, 10), medNyPris ? gjeldendePris() : undefined);
  n.versjon = Math.max(...S.tilbud.filter(x => x.id === t.id).map(x => x.versjon)) + 1;
  S.tilbud.push(n); S.valgt = nokkel(n); lagre();
}
const kunde = t => h("div", { class: "kort rutenett" },
  felt("Tittel", t.tittel, v => t.tittel = v), felt("Kundenavn", t.kunde.navn, v => t.kunde.navn = v),
  felt("Adresse", t.kunde.adresse, v => t.kunde.adresse = v), felt("Kontakt", t.kunde.kontakt, v => t.kunde.kontakt = v),
  felt("Gyldig (dager)", t.gyldigDager, v => t.gyldigDager = v, "number"));
const mengder = t => h("div", { class: "kort" }, h("table", {}, h("tr", {}, h("th", {}, "Post"), h("th", {}, "Beskrivelse"), h("th", {}, "Mengde"), h("th", {}, "Enhet"), h("th")),
  t.poster.map((p, i) => h("tr", {}, h("td", {}, p.id), h("td", {}, felt("", p.beskrivelse, v => p.beskrivelse = v)),
    h("td", {}, felt("", p.mengde, v => p.mengde = v, "number", { class: "kort-tall", step: "any", "data-mengde": p.id })), h("td", {}, felt("", p.enhet, v => p.enhet = v)),
    h("td", {}, h("button", { class: "sekundaer", onclick: () => { t.poster.splice(i, 1); lagre(); } }, "Fjern"))))),
  h("button", { onclick: () => { t.poster.push({ id: "P" + (t.poster.length + 1), beskrivelse: "Ny post", mengde: 1, enhet: "stk", timerPerEnhet: 0, materialer: [] }); lagre(); } }, "Legg til post"));
const materialer = t => h("div", {}, t.poster.map(p => h("div", { class: "kort" }, h("b", {}, `${p.id} ${p.beskrivelse} (${p.mengde} ${p.enhet})`),
  h("table", {}, h("tr", {}, h("th", {}, "Materiale"), h("th", {}, "Per enhet"), h("th", { class: "tall" }, "Antall"), h("th", { class: "tall" }, "Pris"), h("th")),
    p.materialer.map((m, i) => { const mat = t.pris.materialer[m.kode]; return h("tr", {}, h("td", {}, h("select", { onchange: e => { m.kode = e.target.value; lagre(); } }, Object.values(t.pris.materialer).map(x => h("option", { value: x.kode, selected: x.kode === m.kode }, `${x.kode} – ${x.navn}`)))),
      h("td", {}, felt("", m.perEnhet, v => m.perEnhet = v, "number", { class: "kort-tall", step: "any" })), h("td", { class: "tall" }, `${+(p.mengde * m.perEnhet).toFixed(4)} ${mat ? mat.enhet : "?"}`),
      h("td", { class: "tall" }, mat ? kroner(mat.prisOre) : "ukjent"), h("td", {}, h("button", { class: "sekundaer", onclick: () => { p.materialer.splice(i, 1); lagre(); } }, "Fjern"))); })),
  h("button", { class: "sekundaer", onclick: () => { p.materialer.push({ kode: Object.keys(t.pris.materialer)[0], perEnhet: 1 }); lagre(); } }, "Legg til materiale"))));
const arbeid = t => h("div", { class: "kort" }, h("p", {}, `Timesats i prisgrunnlag ${t.pris.id}: ${kroner(t.pris.timesatsOre)} kr`),
  h("table", {}, h("tr", {}, h("th", {}, "Post"), h("th", {}, "Timer per enhet"), h("th", { class: "tall" }, "Timer totalt")),
    t.poster.map(p => h("tr", {}, h("td", {}, `${p.id} ${p.beskrivelse}`), h("td", {}, felt("", p.timerPerEnhet, v => p.timerPerEnhet = v, "number", { class: "kort-tall", step: "any" })), h("td", { class: "tall" }, +(p.mengde * p.timerPerEnhet).toFixed(4))))));
function pris(t) {
  let r = null, feil = null;
  try { r = beregn(t); } catch (e) { feil = e.message; }
  return h("div", {},
    h("div", { class: "kort rad" },
      h("label", {}, "Prismodell", h("select", { id: "modell", onchange: e => { t.prismodell.type = e.target.value; lagre(); } }, ["påslag", "margin"].map(m => h("option", { selected: t.prismodell.type === m }, m)))),
      felt(t.prismodell.type === "påslag" ? "Påslag % (på kost)" : "Margin % (av salgspris)", t.prismodell.prosent, v => t.prismodell.prosent = v, "number", { id: "prosent" }),
      felt("Avgiftsnavn", t.avgift.navn, v => t.avgift.navn = v), felt("Avgift % (må fylles ut)", t.avgift.prosent, v => t.avgift.prosent = v, "number", { id: "avgift" })),
    feil ? h("div", { class: "kort feil" }, feil) : h("div", { class: "kort" }, h("table", {},
      h("tr", {}, h("th", {}, "Post"), h("th", { class: "tall" }, "Materialer"), h("th", { class: "tall" }, "Timer"), h("th", { class: "tall" }, "Arbeid"), h("th", { class: "tall" }, "Kost"), h("th", { class: "tall" }, "Linjepris")),
      r.linjer.map((l, i) => h("tr", {}, h("td", {}, l.beskrivelse), h("td", { class: "tall" }, kroner(l.materialOre)), h("td", { class: "tall" }, l.timer), h("td", { class: "tall" }, kroner(l.arbeidOre)), h("td", { class: "tall" }, kroner(l.kostOre)), h("td", { class: "tall" }, kroner(linjepriser(r)[i]))))),
      h("table", { id: "summer", style: "max-width:420px;margin-top:10px" },
        [["Kost (materialer + arbeid)", r.kostOre], ["Dekningsbidrag", r.dekningOre], ["Salg eks. " + t.avgift.navn, r.salgEksAvgiftOre], [`${t.avgift.navn} ${t.avgift.prosent} %`, r.avgiftOre], ["Totalt", r.totalOre]]
          .map(([n, v]) => h("tr", {}, h("td", {}, n), h("td", { class: "tall", "data-sum": n }, kroner(v))))),
      h("p", { class: "svak" }, `Margin ${r.marginProsent.toFixed(2)} % av salgspris = påslag ${r.paaslagProsent.toFixed(2)} % på kost.`)));
}
function pdf(t) {
  let bytes = null; try { bytes = tilbudPdf(t); } catch (e) { return h("div", { class: "kort feil" }, e.message); }
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  return h("div", { class: "kort" }, h("button", { id: "lastned", onclick: () => lastNed(`${t.id}_v${t.versjon}.pdf`, bytes, "application/pdf") }, "Last ned PDF"),
    h("iframe", { src: url, style: "width:100%;height:600px;border:1px solid var(--linje);margin-top:8px" }));
}
function prisliste() {
  const p = gjeldendePris(); if (!p) return h("div", { class: "kort" }, "Ingen prisliste. Last demo.");
  const endr = {};
  return h("div", { class: "kort" }, h("p", {}, `Gjeldende: ${p.id} (${p.dato}). Endringer lagres som ny prisversjon; eksisterende tilbud beholder sitt prisgrunnlag.`),
    h("table", {}, h("tr", {}, h("th", {}, "Kode"), h("th", {}, "Navn"), h("th", {}, "Enhet"), h("th", {}, "Pris (kr)")),
      Object.values(p.materialer).map(m => h("tr", {}, h("td", {}, m.kode), h("td", {}, m.navn), h("td", {}, m.enhet),
        h("td", {}, h("input", { type: "number", step: "0.01", value: m.prisOre / 100, "data-pris": m.kode, onchange: e => endr[m.kode] = Math.round(Number(e.target.value) * 100) }))))),
    h("button", { id: "lagre-pris", onclick: () => { if (!Object.keys(endr).length) return; S.prisversjoner.push(nyPrisversjon(p, `P${new Date().getFullYear()}-${String(S.prisversjoner.length + 1).padStart(2, "0")}`, new Date().toISOString().slice(0, 10), endr)); lagre(); } }, "Lagre som ny prisversjon"));
}
let sa = null, sb = null;
function sammenligning() {
  const valg = (v, sett, id) => h("select", { id, onchange: e => { sett(e.target.value); tegn(); } }, h("option", { value: "" }, "velg"), S.tilbud.map(t => h("option", { value: nokkel(t), selected: v === nokkel(t) }, `${t.id} v${t.versjon}`)));
  const A = S.tilbud.find(t => nokkel(t) === sa), B = S.tilbud.find(t => nokkel(t) === sb);
  let s = null; try { if (A && B) s = sammenlign(A, B); } catch (e) { s = { feil: e.message }; }
  return h("div", { class: "kort" }, h("div", { class: "rad" }, "A:", valg(sa, v => sa = v, "sa"), "B:", valg(sb, v => sb = v, "sb")),
    s && s.feil && h("p", { class: "feil" }, s.feil),
    s && !s.feil && [h("p", {}, `Prisgrunnlag A: ${s.prisversjonA} · B: ${s.prisversjonB}`),
      h("table", { id: "sammenligning" }, h("tr", {}, h("th", {}, ""), h("th", { class: "tall" }, "A"), h("th", { class: "tall" }, "B"), h("th", { class: "tall" }, "B − A")),
        s.totaler.map(x => h("tr", {}, h("td", {}, x.felt), ...[x.a, x.b, x.diff].map(v => h("td", { class: "tall" }, x.felt === "Timer" ? v : kroner(v)))))),
      s.prisendringer.length > 0 && h("p", { class: "adv" }, "Endrede materialpriser: ", s.prisendringer.map(p => `${p.kode} ${kroner(p.a)} → ${kroner(p.b)}`).join(", "))]);
}
$("#demo").onclick = lastDemo; $("#nytt").onclick = nyttTilbud;
tegn();
