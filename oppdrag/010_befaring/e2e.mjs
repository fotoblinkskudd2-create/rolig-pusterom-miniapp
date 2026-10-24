import { e2e } from "../felles/e2e.mjs";
import { execFileSync } from "node:child_process";
const HER = new URL(".", import.meta.url).pathname;
await e2e("010 Befaring PWA", HER, { server: ["python3", "../felles/serve.py", "8710"], url: "http://127.0.0.1:8710/010_befaring/", port: 8710 },
  async ({ page, ctx, sjekk, url }) => {
    await page.goto(url);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.click("#demo");
    await page.waitForSelector('[data-funn="F3"] img');
    // Rotert bilde vises stående (EXIF 6 → 480×640)
    const dim = await page.evaluate(() => { const i = document.querySelector('[data-funn="F3"] img'); return [i.naturalWidth, i.naturalHeight]; });
    sjekk("EXIF-rotert bilde vises stående i nettleseren", dim[0] < dim[1], dim.join("×"));
    // Gå offline og fortsett å jobbe
    await ctx.setOffline(true);
    await page.fill('[data-maal="M5"]', "2450,5"); await page.dispatchEvent('[data-maal="M5"]', "change");
    await page.waitForFunction(() => document.querySelector("#lagret").textContent.includes("lagret"));
    sjekk("mål rettes uten nett og lagres lokalt", true);
    sjekk("ferdigstilling er sperret før alle mål er kontrollert", await page.isDisabled("#ferdigstill"));
    // Lukk og gjenåpne uten nett
    const ny = await ctx.newPage(); await page.close();
    await ny.goto(url + "#BEF-2026-031");
    await ny.waitForSelector('[data-maal="M5"]');
    sjekk("appen åpnes uten nett (service worker) og utkastet er bevart", (await ny.inputValue('[data-maal="M5"]')) === "2450,5");
    sjekk("bildekobling bevart etter gjenåpning", await ny.locator('[data-funn="F3"] img').count() === 1);
    for (const m of ["M2", "M3", "M4", "M5", "M6"]) { await ny.check(`[data-kontroller="${m}"]`); await ny.waitForTimeout(50); }
    await ny.waitForSelector("#ferdigstill:not([disabled])");
    await ny.click("#ferdigstill");
    await ny.waitForFunction(() => document.querySelector("#aostatus").textContent === "ferdigstilt");
    sjekk("arbeidsordre ferdigstilles etter kontroll av alle mål", true);
    const [dl] = await Promise.all([ny.waitForEvent("download"), ny.click("#eksport")]);
    await dl.saveAs(HER + "resultat/eksport_fra_ui.zip");
    const navn = execFileSync("python3", ["-c", "import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);assert z.testzip() is None;print(len(z.namelist()))", HER + "resultat/eksport_fra_ui.zip"]).toString().trim();
    sjekk("eksportpakke laget uten nett er gyldig ZIP med 6 filer", navn === "6", navn);
    await ctx.setOffline(false);
    await ny.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: true });
  });
