import { e2e } from "../felles/e2e.mjs";
import { readFileSync } from "node:fs";
const HER = new URL(".", import.meta.url).pathname;
await e2e("009 Serviceavtaler", HER, { server: ["python3", "app.py", "--demo", "--db", HER + "resultat/e2e.db", "--idag", "2026-10-24", "--port", "8709"], url: "http://127.0.0.1:8709/", port: 8709 },
  async ({ page, sjekk, url }) => {
    page.on("dialog", d => d.accept("Testbruker"));
    await page.goto(url); await page.waitForSelector("[data-ko]");
    sjekk("arbeidskø har 6 elementer (avsluttet og ok utelatt)", (await page.locator("[data-ko]").count()) === 6);
    sjekk("ukjent frist øverst", (await page.locator("[data-ko]").first().getAttribute("data-ko")) === "SA-04");
    await page.click("#alle a:has-text(\"SA-07\")");
    await page.click("#bekreft");
    await page.waitForFunction(() => document.querySelector("#detalj").innerText.includes("bekreftet av Testbruker"));
    sjekk("bekreftelse vises", true);
    await page.fill('[data-endre="slutt"]', "2026-12-15"); await page.click("#lagre-endring");
    await page.waitForFunction(() => document.querySelector("#hist").innerText.includes("2026-11-15 → 2026-12-15"));
    sjekk("endring vises i historikk med gammel og ny dato", true);
    sjekk("ny dato krever ny bekreftelse", (await page.innerText("#detalj")).includes("ikke bekreftet"));
    const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#ics")]);
    await dl.saveAs(HER + "resultat/fra_ui.ics");
    const ics = readFileSync(HER + "resultat/fra_ui.ics", "utf8");
    sjekk("kalenderfil fra UI har 17 hendelser (9 aktive, SA-04 bare sluttdato)", (ics.match(/BEGIN:VEVENT/g) || []).length === 17);
    await page.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: true });
  });
