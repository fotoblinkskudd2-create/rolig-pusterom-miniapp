import { h, $, tom } from "../felles/web/dom.js";
import { behandle } from "./src/behandling.js";
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
const vis = () => $("#nett").textContent = navigator.onLine ? "på nett" : "uten nett"; addEventListener("online", vis); addEventListener("offline", vis); vis();
const idx = await fetch("scenarier/index.json").then(r => r.json());
const ORIG = {};
for (const id of idx.scenarier) ORIG[id] = await fetch(`scenarier/${idx.versjon}/${id}.json`).then(r => r.json());
// Hvert scenario har sitt eget lagringsrom: demoverksted.<versjon>.<scenario>
const nokkel = s => `demoverksted.${idx.versjon}.${s.id}@${s.versjon}`;
const hentInput = s => { try { const v = localStorage.getItem(nokkel(s)); return v ? JSON.parse(v) : structuredClone(s.input); } catch { return structuredClone(s.input); } };
let aktiv = (() => { try { return localStorage.getItem("demoverksted.aktiv") || idx.scenarier[0]; } catch { return idx.scenarier[0]; } })();

function tegn() {
  const s = ORIG[aktiv], input = hentInput(s);
  const endret = JSON.stringify(input) !== JSON.stringify(s.input);
  tom($("#faner"), idx.scenarier.map(id => h("button", { class: id === aktiv ? "aktiv" : "", "data-fane": id, onclick: () => { aktiv = id; try { localStorage.setItem("demoverksted.aktiv", id); } catch {} tegn(); } }, ORIG[id].tittel)));
  let ut, feil = null; try { ut = behandle(s, input); } catch (e) { feil = e.message; }
  tom($("#scenario"), h("div", { class: "kort rad" }, h("b", {}, s.kunde.navn), h("span", { class: "svak" }, `scenario ${s.id} v${s.versjon}`),
      endret ? h("span", { class: "merke adv", id: "endret" }, "endret fra originaldemonstrasjonen") : h("span", { class: "merke ok" }, "original"),
      h("button", { id: "nullstill", class: "sekundaer", onclick: () => { try { localStorage.removeItem(nokkel(s)); } catch {} tegn(); } }, "Nullstill til original")),
    h("div", { class: "tre" },
      h("div", { class: "kort" }, h("h3", {}, "1 · Input"), h("textarea", { id: "input", spellcheck: "false" }, JSON.stringify(input, null, 2)),
        h("button", { id: "kjor", onclick: () => { try { const ny = JSON.parse($("#input").value); localStorage.setItem(nokkel(s), JSON.stringify(ny)); tegn(); } catch (e) { alert("Ugyldig JSON: " + e.message); } } }, "Lagre og kjør behandling")),
      h("div", { class: "kort" }, h("h3", {}, "2 · Behandling"), h("ul", {}, s.funksjoner.map(f => h("li", {}, h("span", { class: "merke " + (f.type === "implementert" ? "impl" : "sim") }, f.type), " ", f.navn,
        h("div", { class: "svak", style: "font-size:12px" }, f.kilde ? "kode: " + f.kilde : f.merknad))))),
      h("div", { class: "kort", id: "output" }, h("h3", {}, "3 · Output"), feil ? h("p", { class: "feil" }, feil) : visOutput(ut))));
}
function visOutput(o) {
  if (o.type === "arbeidskort") return o.kort.map(k => h("div", { class: "kort" }, h("b", {}, k.kilde), h("table", {}, Object.entries(k.felt).map(([n, f]) => h("tr", {}, h("td", {}, n), h("td", {}, f.verdi || "–"), h("td", { class: "svak" }, f.sikkerhet)))),
    k.mangler.length > 0 && h("div", { class: "adv" }, "Mangler: " + k.mangler.join(", ")), k.advarsler.length > 0 && h("div", { class: "svak", style: "font-size:12px" }, k.advarsler.join(" · "))));
  if (o.type === "dokumentkontroll") return [h("table", {}, o.resultat.map(r => h("tr", {}, h("td", {}, `${r.id} ${r.navn}`), h("td", {}, r.fil || "–"), h("td", { class: { oppfylt: "ok", mangler: "feil", avvist: "feil", "til kontroll": "adv" }[r.status] }, r.status, r.feil.length > 0 && ` (${r.feil.join("; ")})`)))),
    h("p", { class: o.kanFerdigstilles ? "ok" : "feil" }, o.kanFerdigstilles ? "Kan ferdigstilles" : "Blokkert: " + o.blokkerer.join("; "))];
  return h("table", {}, h("tr", {}, ["Prosjekt", "DB", "Refusjon (utenfor)", "kr/t", "Varsler"].map(x => h("th", {}, x))),
    o.prosjekter.map(p => h("tr", {}, h("td", {}, `${p.id} ${p.navn}`), h("td", { class: "tall" }, p.db.toLocaleString("nb-NO")), h("td", { class: "tall" }, p.refusjon.toLocaleString("nb-NO")),
      h("td", { class: "tall" }, p.eff === null ? "ukjent" : Math.round(p.eff)), h("td", { class: p.varsler.length ? "adv" : "ok" }, p.varsler.join("; ") || "ingen"))));
}
tegn();
