import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { kjor } from "../felles/kontroll.mjs";
import { lesEml } from "./dist/eml.js";
import { lagKort, rett, godkjenn, eksport } from "./dist/uttrekk.js";
const HER = new URL(".", import.meta.url).pathname;

export function lesMelding(fil) {
  const raa = readFileSync(HER + "data/" + fil, "utf8");
  return fil.endsWith(".eml") ? lagKort(fil, { type: "eml", navn: fil }, lesEml(raa)) : lagKort(fil, { type: "tekst", navn: fil }, { tekst: raa });
}

await kjor("004 Henvendelse til arbeidskort", HER, async (k) => {
  // Overvåk alt som kunne vært en sideeffekt mens meldingene behandles
  const kall = [];
  const ekteFetch = globalThis.fetch;
  globalThis.fetch = (...a) => { kall.push(["fetch", a[0]]); return Promise.reject(new Error("blokkert")); };
  const filer = readdirSync(HER + "data").filter(f => /\.(eml|txt)$/.test(f)).sort();
  k.lik("åtte syntetiske meldinger", filer.length, 8);
  const K = Object.fromEntries(filer.map(f => [f.slice(0, 2), lesMelding(f)]));
  globalThis.fetch = ekteFetch;
  const v = (id, f) => K[id].felt[f]?.verdi;

  k.lik("m1: ny adresse brukes, ikke den siterte", v("m1", "sted"), "Nyveien 12, 9010 Tromsø");
  k.lik("m1: ny frist brukes, ikke sitert 01.09.2026", v("m1", "frist"), "2026-11-15");
  k.sjekk("m1: sitert historikk er skilt ut", K.m1.tekst.slice(K.m1.nyDelSlutt).startsWith("Den 2. sep."), K.m1.nyDelSlutt);
  k.lik("m1: telefon", v("m1", "telefon"), "41234567");
  k.lik("m1: navn fra signatur", v("m1", "navn"), "Kari Testesen");
  k.sjekk("m1: vedlegg kjokken.jpg fra MIME-del", K.m1.vedlegg.some(x => x.filnavn.startsWith("kjokken.jpg (image/jpeg")), K.m1.vedlegg);
  k.sjekk("m1: hvert tekstfelt peker til riktig kildetekst",
    Object.values(K.m1.felt).filter(f => f.span).every(f => K.m1.tekst.slice(...f.span).replace(/\s/g, "").includes(f.verdi.replace(/\s/g, "").slice(0, 8)) || f.kilde !== "tekst" || /^\d{4}-/.test(f.verdi)));
  k.lik("m2: quoted-printable dekodet (æøå)", K.m2.tekst.includes("Prøvesen") && K.m2.tekst.includes("–"), true);
  k.lik("m2: 03/04 er tvetydig", K.m2.felt.frist.sikkerhet, "tvetydig");
  k.lik("m2: sitert Outlook-adresse ignoreres", v("m2", "sted"), "Fjellgata 7, 9008 Tromsø");
  k.sjekk("m3: instruksjonstekst gir advarsel", K.m3.advarsler.some(a => a.includes("instruksjonslignende")));
  k.lik("m3: ingen verktøy- eller nettverkskall under behandling av alle meldinger", kall, []);
  k.lik("m3: jobben trekkes likevel ut som data", v("m3", "jobb"), "Kan dere montere en taklampe i gangen?");
  k.sjekk("m3: kortet har ingen handlingsfelt", !("handlinger" in K.m3) && !("kommando" in K.m3));
  k.lik("m4: «innen fredag» fra onsdag 21.10 → 2026-10-23", v("m4", "frist"), "2026-10-23");
  k.lik("m4: relativ dato merkes tvetydig", K.m4.felt.frist.sikkerhet, "tvetydig");
  k.lik("m5: navn i kodet From-felt (fra hode, usikker)", [v("m5", "navn"), K.m5.felt.navn.kilde], ["Børge Østerl", "hode"]);
  k.sjekk("m5: PDF-vedlegg med RFC 2231-navn", K.m5.vedlegg.some(x => x.filnavn.startsWith("planløsning.pdf (application/pdf")), K.m5.vedlegg);
  k.sjekk("m5: mangler sted og frist", K.m5.mangler.includes("sted/adresse") && K.m5.mangler.includes("frist/ønsket tidspunkt"), K.m5.mangler);
  k.lik("t6: videresendt gammel melding brukes ikke (adresse mangler)", v("t6", "sted"), undefined);
  k.lik("t6: «15. november» uten år og uten dato i tekst er usikker", [v("t6", "frist"), K.t6.felt.frist.sikkerhet], ["", "usikker"]);
  k.lik("t7: minimal melding har fire mangler", K.t7.mangler.length, 4);
  k.lik("t8: 31.11.2026 er ugyldig og gir ingen dato", [v("t8", "frist"), K.t8.felt.frist.sikkerhet], ["", "usikker"]);
  k.sjekk("t8: filnavn nevnt i tekst blir vedleggsreferanse", K.t8.vedlegg.some(x => x.filnavn.startsWith("bilde_bereder.png")));

  // Rett og godkjenn
  k.kaster("t7 kan ikke godkjennes uten kontaktvei", () => godkjenn(K.t7));
  let t7 = rett(K.t7, "telefon", "99999999", "2026-10-24T10:00:00Z");
  k.lik("rettelse logges med fra/til", t7.rettelser[0], { felt: "telefon", fra: null, til: "99999999", tid: "2026-10-24T10:00:00Z" });
  k.kaster("utkast kan ikke eksporteres", () => eksport(t7));
  const g = godkjenn(rett(K.m1, "frist", "2026-11-14", "2026-10-24T10:01:00Z"));
  const ut = eksport(g);
  k.lik("eksport har brukerens rettede frist og kilde=bruker", [ut.felt.frist.verdi, ut.felt.frist.kilde], ["2026-11-14", "bruker"]);
  k.lik("eksport viser kildetekst for uttrukket felt", ut.felt.sted.kildetekst, "Nyveien 12, 9010 Tromsø");
  mkdirSync(HER + "resultat", { recursive: true });
  writeFileSync(HER + "resultat/arbeidskort_m1.json", JSON.stringify(ut, null, 2));
  writeFileSync(HER + "resultat/alle_utkast.json", JSON.stringify(Object.values(K).map(c => ({ id: c.id, felt: Object.fromEntries(Object.entries(c.felt).map(([n, f]) => [n, f.verdi])), mangler: c.mangler, advarsler: c.advarsler })), null, 2));
});
