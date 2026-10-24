import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { kjor } from "../felles/kontroll.mjs";
import { lesDesimal, settMaal, exifOrientering, bildeMeta, hindringer, ferdigstill, lagPdf, eksportPakke, sha256 } from "./dist/befaring.js";
const HER = new URL(".", import.meta.url).pathname;
const B = JSON.parse(readFileSync(HER + "data/demo.json", "utf8"));
const bilder = new Map(B.bilder.map(b => [b.id, new Uint8Array(readFileSync(HER + "data/bilder/" + b.filnavn))]));
await kjor("010 Befaring til arbeidsordre", HER, async (k) => {
  mkdirSync(HER + "resultat", { recursive: true });
  k.lik("«2,45» → 2.45", lesDesimal("2,45").verdi, 2.45);
  k.lik("«2.40» → 2.4", lesDesimal("2.40").verdi, 2.4);
  k.lik("«3,125» beholder tre desimaler", lesDesimal("3,125").verdi, 3.125);
  k.sjekk("«2.450,5» avvises som tvetydig", lesDesimal("2.450,5").verdi === null && lesDesimal("2.450,5").feil.includes("både komma og punktum"));
  k.sjekk("«abc» og tomt avvises", lesDesimal("abc").verdi === null && lesDesimal(" ").verdi === null);
  k.lik("EXIF-orientering leses (1, 6, 1)", B.bilder.map(b => exifOrientering(bilder.get(b.id))), [1, 6, 1]);
  const m2 = bildeMeta("B2", "kjokken_stikk.jpg", bilder.get("B2"), "R2");
  k.lik("rotert bilde (EXIF 6) får byttet bredde/høyde i visning", [m2.bredde, m2.hoyde], [480, 640]);
  // Ferdigstilling
  const h0 = hindringer(B);
  k.sjekk("ferdigstilling blokkeres av ukontrollerte mål og ugyldig mål", h0.some(x => x.includes("Bredde")) && h0.some(x => x.includes("mangler gyldig verdi")), h0.length + " hindringer");
  k.kaster("ferdigstill kaster med hindringer", () => ferdigstill(B, "2026-10-24T10:00:00Z"));
  // Brukeren retter og kontrollerer alle mål
  const rettet = structuredClone(B);
  rettet.rom[1].maal[1] = { ...settMaal(rettet.rom[1].maal[1], "2450,5") };
  k.lik("rettet mål leses og må kontrolleres på nytt", [rettet.rom[1].maal[1].verdi, rettet.rom[1].maal[1].kontrollert], [2450.5, false]);
  for (const r of rettet.rom) for (const m of r.maal) m.kontrollert = true;
  rettet.endret = "2026-10-24T10:05:00Z";
  const f = ferdigstill(rettet, "2026-10-24T10:05:00Z");
  k.lik("ferdigstilling lykkes når alle mål er kontrollert", f.arbeidsordre.status, "ferdigstilt");
  const brutt = structuredClone(rettet); brutt.funn[0].bildeId = "B99";
  k.sjekk("brutt bildekobling oppdages", hindringer(brutt).some(x => x.includes("B99")));
  // JSON-rundtur (gjenåpning) bevarer koblinger
  const rundtur = JSON.parse(JSON.stringify(f));
  k.lik("bildekoblinger og markeringer bevares etter lagring/gjenåpning", rundtur.funn.map(x => [x.id, x.bildeId ?? null, x.oppgaveId ?? null, x.markering?.x ?? null]),
    f.funn.map(x => [x.id, x.bildeId ?? null, x.oppgaveId ?? null, x.markering?.x ?? null]));
  // Eksportpakke
  const zip = await eksportPakke(f, bilder);
  writeFileSync(HER + "resultat/befaring_BEF-2026-031.zip", zip);
  const py = execFileSync("python3", ["-c", `
import zipfile, hashlib, json, sys
z = zipfile.ZipFile(sys.argv[1]); print(json.dumps({"navn": z.namelist(), "test": z.testzip(),
 "hash": {n: hashlib.sha256(z.read(n)).hexdigest() for n in z.namelist() if n.startswith("bilder/")},
 "manifest": json.loads(z.read("manifest.json"))}))`, HER + "resultat/befaring_BEF-2026-031.zip"]).toString();
  const z = JSON.parse(py);
  k.lik("ZIP er gyldig (Python zipfile.testzip)", z.test, null);
  k.lik("pakken inneholder JSON, PDF, 3 originalbilder og manifest", z.navn.length, 6);
  for (const b of f.bilder) k.lik(`originalbilde ${b.filnavn} er byte-identisk`, z.hash[`bilder/original/${b.id}_${b.filnavn}`], await sha256(bilder.get(b.id)));
  writeFileSync(HER + "resultat/arbeidsordre.pdf", lagPdf(f, bilder));
  const tekst = execFileSync("python3", ["-c", "import sys,pypdf;r=pypdf.PdfReader(sys.argv[1]);print(len(r.pages));print(''.join(p.extract_text() for p in r.pages))", HER + "resultat/arbeidsordre.pdf"]).toString();
  k.sjekk("PDF viser desimaler med komma og alle 5 funn", tekst.includes("Lengde: 2,45 m") && tekst.includes("3,125") && ["F1", "F2", "F3", "F4", "F5"].every(x => tekst.includes("Funn " + x)));
  execFileSync("pdftoppm", ["-png", "-r", "60", HER + "resultat/arbeidsordre.pdf", HER + "resultat/arbeidsordre_side"]);
  k.notat("PDF rendret med pdftoppm til resultat/arbeidsordre_side-*.png for visuell kontroll av rotasjon");
});
