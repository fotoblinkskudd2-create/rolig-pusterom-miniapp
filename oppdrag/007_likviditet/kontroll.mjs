import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { kjor } from "../felles/kontroll.mjs";
import { beregn, flytt, scenario, sammenlign, csv, ukeNr } from "./dist/likviditet.js";
const HER = new URL(".", import.meta.url).pathname;
const les = f => JSON.parse(readFileSync(HER + "data/" + f, "utf8"));
const M = les("basis.json");
await kjor("007 Likviditetslab 13 uker", HER, async (k) => {
  const r = beregn(M);
  // Uavhengig avstemming: summer per uke via dagindeks
  const start = Date.parse(M.startdato);
  const perUke = Array(13).fill(0);
  for (const p of M.poster) { const d = Math.floor((Date.parse(p.dato) - start) / 864e5); if (d >= 0 && d < 91) perUke[Math.floor(d / 7)] += p.belop; }
  let s = M.inngaaendeSaldo; const forventet = perUke.map(n => (s += n));
  k.lik("uke-for-uke-saldo stemmer med uavhengig beregning", r.uker.map(u => u.utgaaende), forventet);
  k.sjekk("intern avstemming: inngående = forrige utgående og sluttsaldo = start + sum", r.avstemt);
  k.lik("sluttsaldo", r.sluttsaldo, M.inngaaendeSaldo + perUke.reduce((a, b) => a + b, 0));
  k.lik("post utenfor horisonten listes separat", r.utenforHorisont.map(p => p.id), ["UTENFOR"]);
  k.sjekk("registrert og antatt holdes adskilt (uke 7 har bare antatt inn)", r.uker[6].innAntatt === 70000 && r.uker[6].innRegistrert === 0, r.uker[6]);
  // Flytting bevarer total
  const flyttet = flytt(M, "K2", 3);
  const sum = m => m.poster.reduce((a, p) => a + p.belop, 0);
  k.lik("flytting bevarer totalbeløpet i modellen", sum(flyttet), sum(M));
  k.lik("K2 flyttet fra uke 2 til uke 5", [ukeNr(M, M.poster.find(p => p.id === "K2").dato), ukeNr(flyttet, flyttet.poster.find(p => p.id === "K2").dato)], [2, 5]);
  k.lik("flytting innen horisonten endrer ikke sluttsaldo", beregn(flyttet).sluttsaldo, r.sluttsaldo);
  k.sjekk("original modell er uendret etter flytting", M.poster.find(p => p.id === "K2").dato === "2026-11-05");
  // Forsinkede innbetalinger
  const fs = scenario(M, "Forsinket", les("scenario_forsinket.json"));
  const rf = beregn(fs);
  k.sjekk("forsinkelser senker laveste saldo", rf.laveste.saldo < r.laveste.saldo, `${r.laveste.saldo} → ${rf.laveste.saldo} (uke ${rf.laveste.uke})`);
  k.sjekk("negative saldoer flagges per uke", rf.uker.some(u => u.negativ) && rf.uker.filter(u => u.negativ).every(u => u.utgaaende < 0),
    "negative uker: " + rf.uker.filter(u => u.negativ).map(u => u.nr).join(","));
  k.sjekk("negativ saldo videreføres korrekt til neste uke", rf.uker.every((u, i) => i === 0 || u.inngaaende === rf.uker[i - 1].utgaaende));
  k.lik("forsinket scenario: samme sluttsaldo (alle flytt innen horisont)", rf.sluttsaldo, r.sluttsaldo);
  const an = scenario(M, "Ansettelse", les("scenario_ansettelse.json"));
  const s2 = sammenlign(M, an);
  k.lik("ansettelse: siste ukes differanse = lønn + AGA + utstyr", s2.at(-1).diff, -38000 - 10700 - 25000);
  k.lik("ansettelse: differansen starter i uka utstyret betales (uke 6)", s2.findIndex(x => x.diff !== 0) + 1, 6);
  k.kaster("startdato som ikke er mandag avvises", () => beregn({ ...M, startdato: "2026-10-27" }));
  k.kaster("desimalbeløp avvises", () => beregn({ ...M, poster: [{ ...M.poster[0], belop: 10.5 }] }));
  mkdirSync(HER + "resultat", { recursive: true });
  writeFileSync(HER + "resultat/basis.csv", csv(M)); writeFileSync(HER + "resultat/forsinket.csv", csv(fs)); writeFileSync(HER + "resultat/ansettelse.csv", csv(an));
  k.notat(`Laveste saldo basis: ${r.laveste.saldo} (uke ${r.laveste.uke}); forsinket: ${rf.laveste.saldo} (uke ${rf.laveste.uke})`);
});
