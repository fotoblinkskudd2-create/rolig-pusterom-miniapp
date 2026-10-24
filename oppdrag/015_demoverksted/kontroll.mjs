import { readFileSync } from "node:fs";
import { kjor } from "../felles/kontroll.mjs";
import { behandle } from "./src/behandling.js";
const HER = new URL(".", import.meta.url).pathname;
const idx = JSON.parse(readFileSync(HER + "scenarier/index.json", "utf8"));
const S = Object.fromEntries(idx.scenarier.map(id => [id, JSON.parse(readFileSync(`${HER}scenarier/${idx.versjon}/${id}.json`, "utf8"))]));
await kjor("015 Demoverksted", HER, async (k) => {
  k.sjekk("alle scenarioer har versjon og id som stemmer med filnavn", Object.entries(S).every(([id, s]) => s.id === id && /^\d+\.\d+\.\d+$/.test(s.versjon)));
  k.sjekk("hvert scenario merker hver funksjon som implementert eller simulert", Object.values(S).every(s => s.funksjoner.every(f => ["implementert", "simulert"].includes(f.type)) && s.funksjoner.some(f => f.type === "simulert")));
  // Isolasjon: ingen navn eller filnavn deles mellom scenarioer
  const ord = s => new Set([s.kunde.navn, ...JSON.stringify(s.input).match(/[\wæøå_-]+\.(txt|pdf|png|csv|docx|jpg)/gi) || []]);
  const sett = Object.fromEntries(Object.entries(S).map(([id, s]) => [id, ord(s)]));
  const delt = [];
  for (const a in sett) for (const b in sett) if (a < b) for (const x of sett[a]) if (sett[b].has(x)) delt.push(`${x} (${a}/${b})`);
  k.lik("ingen kundenavn eller filnavn gjenbrukes mellom scenarioer", delt, []);
  for (const [id, s] of Object.entries(S)) k.sjekk(`${id}: andre scenarioers kundenavn finnes ikke i input`, Object.values(S).filter(x => x.id !== id).every(x => !JSON.stringify(s.input).includes(x.kunde.navn.split(" (")[0])));
  const a = behandle(S.arbeidskort, S.arbeidskort.input);
  k.lik("arbeidskort: sted og frist fra henvendelse 1", [a.kort[0].felt.sted.verdi, a.kort[0].felt.frist.verdi], ["Havnegata 4, 9750 Honningsvåg", "2026-11-13"]);
  k.sjekk("arbeidskort: sitert gammel adresse brukes ikke i henvendelse 2", !a.kort[1].felt.sted && a.kort[1].mangler.includes("sted/adresse"));
  k.lik("arbeidskort: «innen fredag» fra onsdag 21.10 = 23.10 (tvetydig)", [a.kort[1].felt.frist.verdi, a.kort[1].felt.frist.sikkerhet], ["2026-10-23", "tvetydig"]);
  const d = behandle(S.dokumentkontroll, S.dokumentkontroll.input);
  k.lik("dokumentkontroll: blokkerer D2 (filtype) og D3 (størrelse)", d.blokkerer, ["D2 Plantegning: avvist", "D3 Effektmåling: avvist"]);
  k.sjekk("dokumentkontroll: valgfritt D4 blokkerer ikke", !d.blokkerer.some(b => b.startsWith("D4")));
  const m = behandle(S.margin, S.margin.input).prosjekter;
  k.lik("margin: SW-1 effektiv timeinntekt (60 000 − 2 400)/72 = 800", m[0].eff, 800);
  k.lik("margin: refusjon 1 800 holdt utenfor DB", [m[0].refusjon, m[0].db], [1800, 57600]);
  k.lik("margin: SW-1 20 % over estimat varsles", m[0].varsler, ["20 % over timeestimat"]);
  k.lik("margin: SW-2 1 500 kr/t uten varsler", [m[1].eff, m[1].varsler], [1500, []]);
});
