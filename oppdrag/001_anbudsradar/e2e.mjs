import { e2e } from "../felles/e2e.mjs";
import { rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
const HER = new URL(".", import.meta.url).pathname;
const db = HER + "resultat/e2e.db";
rmSync(db, { force: true });
execFileSync("python3", ["app.py", "--db", db, "--importer", "data/import_1.csv", "data/import_2.csv"], { cwd: HER });
await e2e("001 Anbudsradar", HER, { server: ["python3", "app.py", "--db", db, "--idag", "2026-10-24", "--port", "8701"], url: "http://127.0.0.1:8701/", port: 8701 },
  async ({ page, sjekk, url }) => {
    await page.goto(url);
    await page.waitForSelector("[data-id]");
    const antall = await page.locator("[data-id]").count();
    sjekk("listen viser 14 ikke-utløpte kunngjøringer", antall === 14, antall);
    const kort = page.locator('[data-id="KG-2026-0101"]');
    sjekk("endret frist vises i kortet", (await kort.innerText()).includes("Endret frist: 2026-11-20 → 2026-11-27"));
    sjekk("ukjent frist vises som eget merke", (await page.locator('[data-id="KG-2026-0113"]').innerText()).includes("frist ukjent"));
    await page.selectOption("#fag", "lading");
    await page.waitForFunction(() => document.querySelectorAll("[data-id]").length === 4);
    sjekk("filter fagområde lading gir 4 treff", true);
    await page.check("#utl");
    await page.selectOption("#fag", "");
    await page.waitForFunction(() => document.querySelectorAll("[data-id]").length === 15);
    sjekk("vis utløpte gir alle 15", true);
    const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#eks")]);
    await dl.saveAs(HER + "resultat/prioritering_fra_ui.csv");
    sjekk("eksport lastes ned fra grensesnittet", dl.suggestedFilename() === "prioritering.csv");
    await page.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: false });
  });
