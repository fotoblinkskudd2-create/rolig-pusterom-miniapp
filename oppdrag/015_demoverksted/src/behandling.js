// Kjører den faktiske behandlingen for hvert scenario. Arbeidskort bruker motoren fra oppdrag 4 uendret.
import { lagKort } from "../../004_arbeidskort/dist/uttrekk.js";
import { kontroller } from "./dokumentkontroll.js";
import { beregn } from "./margin.js";

export function behandle(s, input) {
  if (s.id === "arbeidskort") {
    return { type: "arbeidskort", kort: input.meldinger.map(m => {
      const k = lagKort(m.navn, { type: "tekst", navn: m.navn }, { tekst: m.tekst, dato: m.dato });
      return { kilde: m.navn, felt: Object.fromEntries(Object.entries(k.felt).map(([n, f]) => [n, { verdi: f.verdi, sikkerhet: f.sikkerhet }])), mangler: k.mangler, advarsler: k.advarsler };
    }) };
  }
  if (s.id === "dokumentkontroll") return { type: "dokumentkontroll", ...kontroller(input) };
  if (s.id === "margin") return { type: "margin", prosjekter: beregn(input) };
  throw new Error("ukjent scenario " + s.id);
}
