import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { kjor } from "../felles/kontroll.mjs";
import { beregn, nyPrisversjon, nyVersjon, sammenlign, linjepriser, kroner } from "./dist/kalkyle.js";
import { tilbudPdf } from "./dist/tilbudpdf.js";
const HER = new URL(".", import.meta.url).pathname;
const pris = JSON.parse(readFileSync(HER + "data/prisliste.json", "utf8"));
const [a, b] = JSON.parse(readFileSync(HER + "data/oppdrag.json", "utf8")).map(o => ({ ...o, pris: structuredClone(pris) }));
const pdfTekst = (fil) => execFileSync("python3", ["-c", "import sys,pypdf;print(''.join(p.extract_text() for p in pypdf.PdfReader(sys.argv[1]).pages))", fil]).toString();

await kjor("002 Tilbudskalkulator", HER, async (k) => {
  mkdirSync(HER + "resultat", { recursive: true });
  // Håndregnet referanse (se README): bad, påslag 25 %, mva 25 %
  const ra = beregn(a);
  k.lik("A: materialer (øre)", ra.materialOre, 352290 + 1056870 + 189000);
  k.lik("A: arbeid 36,6 t × 650 kr", ra.arbeidOre, 2379000);
  k.lik("A: timer", ra.timer, 36.6, 1e-9);
  k.lik("A: salg eks. mva = kost × 1,25", ra.salgEksAvgiftOre, 4971450);
  k.lik("A: påslag 25 % gir margin 20 %", ra.marginProsent, 20, 1e-9);
  k.lik("A: mva 25 % avrundet til øre", ra.avgiftOre, 1242863);
  k.lik("A: total", kroner(ra.totalOre), "62 143,13");
  // Terrasse, margin 30 %
  const rb = beregn(b);
  k.lik("B: kost", rb.kostOre, 2037350);
  k.lik("B: salg = kost / (1 − 0,30)", rb.salgEksAvgiftOre, 2910500);
  k.lik("B: margin 30 % tilsvarer påslag 42,857 %", rb.paaslagProsent, 42.857142857, 1e-6);
  k.lik("B: total", kroner(rb.totalOre), "36 381,25");
  k.sjekk("margin og påslag gir ulik salgspris ved samme prosent",
    beregn({ ...b, prismodell: { type: "påslag", prosent: 30 } }).salgEksAvgiftOre !== rb.salgEksAvgiftOre);
  k.lik("linjepriser summerer eksakt til salg eks. avgift (A)", linjepriser(ra).reduce((s, x) => s + x, 0), ra.salgEksAvgiftOre);
  k.lik("linjepriser summerer eksakt (B)", linjepriser(rb).reduce((s, x) => s + x, 0), rb.salgEksAvgiftOre);

  // Prisendring: flis 450 → 495 kr
  const p2 = nyPrisversjon(pris, "P2026-02", "2026-10-15", { FLIS: 49500 });
  k.lik("ny prisversjon endrer ikke gammel prisliste", pris.materialer.FLIS.prisOre, 45000);
  const a2 = nyVersjon(a, "2026-10-16", p2);
  const ra2 = beregn(a2);
  k.lik("A v2: materialer øker med 26,4 m² × 45 kr", ra2.materialOre - ra.materialOre, 118800);
  k.lik("A v2: total med ny flispris", kroner(ra2.totalOre), "63 999,38");
  k.lik("A v1 beholder opprinnelig prisversjon", beregn(a).prisversjon, "P2026-01");
  k.lik("A v1 beholder opprinnelig total etter prisendring", kroner(beregn(a).totalOre), "62 143,13");
  k.lik("A v2 bruker ny prisversjon", ra2.prisversjon, "P2026-02");
  const a2uten = nyVersjon(a, "2026-10-16");
  k.lik("ny versjon uten nytt prisgrunnlag beholder gammel pris", beregn(a2uten).totalOre, ra.totalOre);

  const s = sammenlign(a, a2);
  k.lik("sammenligning: totaldifferanse", s.totaler.find(x => x.felt === "Total").diff, 6399938 - 6214313);
  k.lik("sammenligning: viser endret materialpris", s.prisendringer, [{ kode: "FLIS", a: 45000, b: 49500 }]);

  // PDF
  const pdfA = tilbudPdf(a), pdfA2 = tilbudPdf(a2), pdfB = tilbudPdf(b);
  writeFileSync(HER + "resultat/T-001_v1.pdf", pdfA); writeFileSync(HER + "resultat/T-001_v2.pdf", pdfA2); writeFileSync(HER + "resultat/T-002_v1.pdf", pdfB);
  const tA = pdfTekst(HER + "resultat/T-001_v1.pdf"), tA2 = pdfTekst(HER + "resultat/T-001_v2.pdf"), tB = pdfTekst(HER + "resultat/T-002_v1.pdf");
  k.sjekk("PDF v1 (lest med pypdf) viser total 62 143,13", tA.includes("62 143,13"));
  k.sjekk("PDF v2 viser ny total 63 999,38 og prisgrunnlag P2026-02", tA2.includes("63 999,38") && tA2.includes("P2026-02"));
  k.sjekk("PDF v2 viser ikke gammel total", !tA2.includes("62 143,13"));
  k.sjekk("PDF B viser total 36 381,25 og norske tegn", tB.includes("36 381,25") && tB.includes("å betale"));
  k.kaster("manglende avgiftssats avvises", () => beregn({ ...a, avgift: { navn: "MVA" } }));
  k.kaster("margin 100 % avvises", () => beregn({ ...b, prismodell: { type: "margin", prosent: 100 } }));
  k.kaster("ukjent materialkode avvises", () => beregn({ ...a, poster: [{ ...a.poster[0], materialer: [{ kode: "XX", perEnhet: 1 }] }] }));
  k.lik("avgift 0 % er gyldig og eksplisitt", beregn({ ...a, avgift: { navn: "Ingen avgift", prosent: 0 } }).avgiftOre, 0);
});
