import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { kjor } from "../felles/kontroll.mjs";
import { vurder, valider, eksport } from "./dist/bevis.js";
const HER = new URL(".", import.meta.url).pathname;
const S = JSON.parse(readFileSync(HER + "data/sak.json", "utf8"));
const data = new Map(S.filer.map(f => [f.id, new Uint8Array(readFileSync(HER + "data/filer/" + f.navn))]));
await kjor("022 Produktfeil med før–etter-bevis", HER, async (k) => {
  k.lik("demosaken er gyldig", valider(S), []);
  const v = Object.fromEntries(vurder(S).map(x => [x.hypotese, x]));
  k.lik("H1 (bredere fot) støttet av prøving: median 12 → 21 grader", [v.H1.status, v.H1.grunnlinje, v.H1.ny], ["støttet av prøving", 12, 21]);
  k.lik("H2 (gummiknotter) forblir hypotese uten grunnlinjetest", [v.H2.status, v.H2.grunn], ["hypotese", "mangler grunnlinjetest med filbevis"]);
  const utenFil = structuredClone(S); utenFil.tester.find(t => t.id === "T2").filIder = [];
  k.lik("test uten koblet fil teller ikke: H1 blir hypotese", vurder(utenFil)[0].status, "hypotese");
  const svak = structuredClone(S); svak.tester.find(t => t.id === "T2").verdier = [14, 15, 13];
  k.lik("endring under terskel gir «ikke støttet av prøving»", vurder(svak)[0].status, "ikke støttet av prøving");
  const brutt = structuredClone(S); brutt.tester[0].filIder.push("F99");
  k.sjekk("brutt filkobling oppdages", valider(brutt).some(f => f.includes("F99")));
  k.sjekk("ingen status heter «bekreftet» eller «bevist»", !JSON.stringify(vurder(S)).match(/bekreftet|bevist/));
  k.lik("patentnyhet og etterspørsel står som uavklart", Object.values(S.uavklart).every(x => x.startsWith("uavklart")), true);
  const zip = await eksport(S, data);
  mkdirSync(HER + "resultat", { recursive: true });
  writeFileSync(HER + "resultat/testpakke_SAK-022-01.zip", zip);
  const py = JSON.parse(execFileSync("python3", ["-c", `
import zipfile, json, hashlib, sys
z = zipfile.ZipFile(sys.argv[1]); m = json.loads(z.read("manifest.json")); s = json.loads(z.read("sak.json"))
ok = all(hashlib.sha256(z.read(f["sti"])).hexdigest() == f["sha256"] for f in m["filer"])
ider = {f["id"] for f in m["filer"]}
koblet = all(i in ider for t in s["tester"] for i in t["filIder"]) and s["originalfoto"] in ider
print(json.dumps({"test": z.testzip(), "hash_ok": ok, "koblinger_ok": koblet, "antall": len(z.namelist())}))`, HER + "resultat/testpakke_SAK-022-01.zip"]).toString());
  k.lik("eksportert pakke: gyldig ZIP, sha256 stemmer, alle bevislenker peker på filer i pakken", [py.test, py.hash_ok, py.koblinger_ok, py.antall], [null, true, true, 8]);
  const endret = new Map(data); endret.set("F3", new TextEncoder().encode("forsok;vippevinkel\n1;99\n"));
  let feil = null; try { await eksport(S, endret); } catch (e) { feil = e.message; }
  k.sjekk("endret bevisfil etter registrering stopper eksport", feil && feil.includes("sha256 avviker"), feil);
  writeFileSync(HER + "resultat/vurdering.json", JSON.stringify(vurder(S), null, 2));
});
