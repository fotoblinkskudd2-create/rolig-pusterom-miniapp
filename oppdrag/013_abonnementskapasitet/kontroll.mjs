import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { kjor } from "../felles/kontroll.mjs";
import { beregn, beregnPakke, sensitivitet } from "./dist/modell.js";
const HER = new URL(".", import.meta.url).pathname;
const S = JSON.parse(readFileSync(HER + "data/scenarioer.json", "utf8"));
await kjor("013 Kapasitet til abonnementsinntekt", HER, async (k) => {
  const [forsiktig, vekst, ingen] = S;
  const rb = beregnPakke(forsiktig, forsiktig.pakker[0]);
  const a12 = 2 * 0.98 * (1 - 0.98 ** 11) / 0.02; // lukket form: a_n = (a_{n-1} + 2) × 0,98, a_1 = 0
  k.lik("Forsiktig/Basis: aktive kunder mnd 12 = lukket form", rb.maneder[11].aktive, a12, 1e-9);
  k.lik("Forsiktig/Basis: ARR mnd 12 = aktive × 1 500 × 12", rb.arrSlutt, a12 * 1500 * 12, 1e-6);
  k.lik("Forsiktig/Basis: oppstartsinntekt 12 × 2 × 5 000 (holdes utenfor ARR)", rb.sumOppstart, 120000);
  k.sjekk("ARR inneholder ikke oppstartsinntekt (mnd 1: ARR 0, oppstart 10 000)", rb.maneder[0].arr === 0 && rb.maneder[0].oppstartsinntekt === 10000);
  const pr = beregnPakke(forsiktig, { ...forsiktig.pakker[0], oppstartspris: 99999 });
  k.lik("endret oppstartspris endrer ikke ARR", pr.arrSlutt, rb.arrSlutt);
  for (const r of beregn(ingen)) k.sjekk(`null kunder gir null abonnementsinntekt (${r.pakke})`, r.sumAbonnement === 0 && r.arrSlutt === 0 && r.sumOppstart === 0);
  // Felles timebudsjett
  const rv = beregn(vekst);
  k.sjekk("support + oppstart bruker samme timebudsjett (aldri over kapasitet)", rv.every(r => r.maneder.every(m => m.brukteTimer <= m.kapasitet + 1e-9)));
  const prem = rv[2];
  k.lik("Vekst/Premium: salgsmål overskrider kapasitet fra måned 2", prem.forsteOverskridelse, 2);
  const m2 = prem.maneder[1];
  k.sjekk("ved overskridelse starter bare det som får plass, resten i kø", m2.startetNye < m2.onsketNye + 0 && m2.ko > 0, `ønsket ${m2.onsketNye}, startet ${m2.startetNye.toFixed(2)}, kø ${m2.ko.toFixed(2)}`);
  k.lik("Vekst/Premium mnd 2: timer brukt = kapasitet", m2.brukteTimer, 100, 1e-9);
  k.lik("Vekst/Premium mnd 2: håndregnet startet = (100 − ((4×0,97 + 3)×0,97)×4)/20", m2.startetNye, (100 - (4 * 0.97 + 3) * 0.97 * 4) / 20, 1e-9);
  k.sjekk("tre pakker sammenlignes med samme kapasitetsgrunnlag", new Set(rv.map(r => r.maneder[0].kapasitet)).size === 1);
  const sens = sensitivitet(forsiktig, "Basis", [0.01, 0.02, 0.05], [0.8, 1, 1.2]);
  k.lik("sensitivitet: midtcelle = basisresultat", sens[1].arr[1], rb.arrSlutt, 1e-6);
  k.sjekk("sensitivitet: høyere frafall gir lavere ARR", sens[0].arr[1] > sens[1].arr[1] && sens[1].arr[1] > sens[2].arr[1]);
  k.kaster("frafall over 100 % avvises", () => beregn({ ...forsiktig, frafallPerMnd: 1.5 }));
  mkdirSync(HER + "resultat", { recursive: true });
  writeFileSync(HER + "resultat/referansetall.json", JSON.stringify(S.map(s => ({ scenario: s.navn, pakker: beregn(s).map(r => ({ pakke: r.pakke, arr_mnd12: Math.round(r.arrSlutt), oppstart_sum: Math.round(r.sumOppstart), forste_overskridelse: r.forsteOverskridelse })) })), null, 1));
});
