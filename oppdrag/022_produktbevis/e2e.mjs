import { e2e } from "../felles/e2e.mjs";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const HER = new URL(".", import.meta.url).pathname;
await e2e("022 Produktbevis", HER, { server: ["python3", "../felles/serve.py", "8722"], url: "http://127.0.0.1:8722/022_produktbevis/", port: 8722 },
  async ({ page, sjekk, url }) => {
    await page.goto(url); await page.click("#demo"); await page.waitForSelector('[data-status="H1"]');
    sjekk("H1 vises som støttet av prøving, H2 som hypotese", (await page.innerText('[data-status="H1"]')) === "støttet av prøving" && (await page.innerText('[data-status="H2"]')) === "hypotese");
    sjekk("før/etter-bilder vises side om side", (await page.locator(".ff img").count()) === 2);
    await page.selectOption("#nt-rev", "A"); await page.selectOption("#nt-met", "M2"); await page.fill("#nt-v", "2,0; 2,1; 1,9"); await page.click("#nt-lagre");
    await page.waitForSelector('[data-test="T4"]', { state: "attached" });
    sjekk("grunnlinjetest uten fil endrer ikke H2", (await page.innerText('[data-status="H2"]')) === "hypotese");
    writeFileSync(HER + "resultat/T4_revA_trekkraft.csv", "forsok;trekkraft_N\n1;2.0\n2;2.1\n3;1.9\n");
    await page.setInputFiles('[data-test="T4"]', HER + "resultat/T4_revA_trekkraft.csv");
    await page.waitForFunction(() => document.querySelector('[data-status="H2"]').innerText === "støttet av prøving");
    sjekk("med koblet fil blir H2 støttet av prøving (2,0 → 3,0 N)", true);
    await page.reload(); await page.waitForSelector('[data-status="H2"]');
    sjekk("sak og filer bevares lokalt etter omlasting", (await page.innerText('[data-status="H2"]')) === "støttet av prøving");
    const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#eksport")]);
    await dl.saveAs(HER + "resultat/eksport_fra_ui.zip");
    const n = execFileSync("python3", ["-c", "import zipfile,sys,json;z=zipfile.ZipFile(sys.argv[1]);assert z.testzip() is None;m=json.loads(z.read('manifest.json'));print(len(m['filer']))", HER + "resultat/eksport_fra_ui.zip"]).toString().trim();
    sjekk("eksport fra UI inneholder seks bevisfiler", n === "6", n);
    await page.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: true });
  });
