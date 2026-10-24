import { h, $, tom, lastNed } from "../felles/web/dom.js";
import { beregn, valider, lagPilot, scenarioCsv } from "./dist/modell.js";
const NOKKEL = "ki-kartlegging.v1";
let K; try { K = JSON.parse(localStorage.getItem(NOKKEL)); } catch {}
if (!K) K = await fetch("data/fiktiv_bedrift.json").then(r => r.json());
let pilotProsess = "P2";
const t2 = x => x.toLocaleString("nb-NO", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
const kr = x => Math.round(x).toLocaleString("nb-NO") + " kr";
function lagre() { try { localStorage.setItem(NOKKEL, JSON.stringify(K)); } catch {} tegn(); }
const tallfelt = (obj, f, attr = {}) => h("input", { type: "number", step: "any", value: obj[f], ...attr, onchange: e => { obj[f] = Number(e.target.value); lagre(); } });

function tegn() {
  const feil = valider(K); let R = null; try { R = beregn(K); } catch {}
  tom($("#app"),
    h("div", { class: "kort" }, h("b", {}, K.bedrift), ` · kartlagt ${K.dato} · `,
      h("label", { style: "display:inline-flex;flex-direction:row;gap:4px" }, h("input", { type: "checkbox", checked: K.malt, onchange: e => { K.malt = e.target.checked; lagre(); } }), "verdiene er målt (ikke anslått)")),
    h("div", { class: "kort wrap" }, h("h3", {}, "Aktiviteter"), h("table", { id: "aktiviteter" },
      h("tr", {}, ["Id", "Aktivitet", "Prosesser", "Volum/mnd", "Min/stk", "Feilrate", "Min/feil", "Datatilgang"].map(x => h("th", {}, x))),
      K.aktiviteter.map(a => h("tr", {}, h("td", {}, a.id), h("td", {}, a.navn), h("td", {}, K.prosesser.filter(p => p.aktiviteter.includes(a.id)).map(p => p.navn).join(" + ")),
        h("td", {}, tallfelt(a, "volumPerMnd", { "data-volum": a.id })), h("td", {}, tallfelt(a, "minutterPerStk")), h("td", {}, tallfelt(a, "feilrate", { min: 0, max: 1 })), h("td", {}, tallfelt(a, "minutterPerFeil")),
        h("td", {}, h("select", { onchange: e => { a.datatilgang = e.target.value; lagre(); } }, ["god", "delvis", "ingen"].map(d => h("option", { selected: a.datatilgang === d }, d))))))),
      h("p", { class: "svak" }, "En aktivitet som inngår i flere prosesser telles én gang i totalen og fordeles likt mellom prosessene.")),
    feil.length > 0 && h("div", { class: "kort feil" }, feil.join("; ")),
    R && h("div", { class: "rutenett", id: "scenarier" }, R.map(s => h("div", { class: "kort", "data-scenario": s.scenario },
      h("div", { class: "rad" }, h("h3", { style: "margin:0" }, `Scenario ${s.scenario}`), h("span", { class: s.status === "målt" ? "merke ok" : "hypotese" }, s.status === "målt" ? "målt" : "HYPOTESE")),
      h("p", {}, h("b", { class: "total-timer" }, t2(s.totalSpartTimer)), ` t/mnd av ${t2(s.totalTimerIDag)} t/mnd i dag ≈ `, h("b", {}, kr(s.totalSpartKr)), " per måned"),
      h("table", {}, s.prosesser.map(p => h("tr", {}, h("td", {}, p.navn), h("td", { class: "tall" }, t2(p.spartTimer) + " t"), h("td", { class: "tall" }, kr(p.spartKr)))))))),
    h("div", { class: "kort" }, h("h3", {}, "Antakelser kunden må bekrefte"), h("ul", { id: "antakelser" }, K.antakelser.map(a => h("li", {},
      h("label", { style: "display:inline-flex;flex-direction:row;gap:6px;color:inherit" }, h("input", { type: "checkbox", checked: a.bekreftet, onchange: e => { a.bekreftet = e.target.checked; lagre(); } }), `${a.tekst} (${a.verdi})`)))),
      h("p", { class: K.antakelser.every(a => a.bekreftet) ? "ok" : "adv" }, `${K.antakelser.filter(a => a.bekreftet).length} av ${K.antakelser.length} bekreftet`)),
    pilot(),
    h("div", { class: "kort rad ikke-print" },
      h("button", { id: "csv", onclick: () => lastNed("scenarioer.csv", scenarioCsv(K), "text/csv") }, "Eksporter scenarioer (CSV)"),
      h("button", { onclick: () => lastNed("kartlegging.json", JSON.stringify(K, null, 2), "application/json") }, "Eksporter kundeark (JSON)"),
      h("button", { onclick: () => window.print() }, "Skriv ut kundeark"),
      h("button", { class: "sekundaer", onclick: async () => { localStorage.removeItem(NOKKEL); K = await fetch("data/fiktiv_bedrift.json").then(r => r.json()); tegn(); } }, "Tilbakestill demo")));
}
function pilot() {
  let p; try { p = lagPilot(K, pilotProsess); } catch (e) { return h("div", { class: "kort feil" }, e.message); }
  const md = `# Måleplan – pilot\n\nProsess: ${K.prosesser.find(x => x.id === p.prosessId).navn}\nVarighet: ${p.varighetUker} uker etter 2 ukers baseline\nBaseline (anslått): ${t2(p.baselineTimerPerMnd)} t/mnd\n\n## Måling\n${p.maling.map(m => "- " + m).join("\n")}\n\n## Forventet output\n${p.forventetOutput}\n\n## Stoppkriterium\n${p.stoppkriterium}\n\n## Hypotese (ikke målt)\nLav ${t2(p.hypoteseSpartTimer.lav)} t/mnd · middels ${t2(p.hypoteseSpartTimer.middels)} · høy ${t2(p.hypoteseSpartTimer.høy)}\n`;
  return h("div", { class: "kort", id: "pilot" }, h("h3", {}, "Pilotgrunnlag"),
    h("label", {}, "Valgt prosess", h("select", { id: "pilotvalg", onchange: e => { pilotProsess = e.target.value; tegn(); } }, K.prosesser.map(x => h("option", { value: x.id, selected: x.id === pilotProsess }, x.navn)))),
    h("pre", {}, md), h("button", { class: "ikke-print", onclick: () => lastNed("maleplan.md", md) }, "Last ned måleplan"));
}
tegn();
