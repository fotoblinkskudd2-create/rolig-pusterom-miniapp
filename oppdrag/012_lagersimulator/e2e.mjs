import { e2e } from "../felles/e2e.mjs";
const HER = new URL(".", import.meta.url).pathname;
await e2e("012 Lagersimulator", HER, { server: ["python3", "app.py", "--port", "8712"], url: "http://127.0.0.1:8712/", port: 8712 },
  async ({ page, sjekk, url }) => {
    await page.goto(url); await page.waitForSelector('[data-vare="V07"]');
    const rad = await page.innerText('[data-vare="V07"]');
    sjekk("V07 viser utsolgtperiode i A under forsinket levering", rad.includes("2026-08-08–2026-08-10"), rad);
    const h1 = await page.locator("#sumtabell tr").nth(1).innerText();
    await page.click("#kjor"); await page.waitForTimeout(300);
    sjekk("ny avspilling gir identisk resultat og hash", (await page.locator("#sumtabell tr").nth(1).innerText()) === h1);
    await page.fill("#a_sf", "3"); await page.click("#kjor");
    await page.waitForFunction(() => !document.querySelector('[data-vare="V07"]').innerText.includes("2026-08-08–2026-08-10"));
    sjekk("høyere sikkerhetsfaktor fjerner V07-utsolgt i A", true);
    await page.locator('[data-vare="V11"] button').click();
    sjekk("negativ historisk beholdning vises for V11", (await page.innerText("#negativ")).includes("FEIL-REG"));
    const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#forslag")]);
    await dl.saveAs(HER + "resultat/forslag_fra_ui.csv");
    sjekk("bestillingsforslag eksporteres", dl.suggestedFilename() === "bestillingsforslag.csv");
    await page.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: true });
  });
