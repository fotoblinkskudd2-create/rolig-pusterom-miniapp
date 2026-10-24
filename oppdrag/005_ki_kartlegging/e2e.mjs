import { e2e } from "../felles/e2e.mjs";
const HER = new URL(".", import.meta.url).pathname;
await e2e("005 KI-kartlegging", HER, { server: ["python3", "../felles/serve.py", "8705"], url: "http://127.0.0.1:8705/005_ki_kartlegging/", port: 8705 },
  async ({ page, sjekk, url }) => {
    await page.goto(url);
    const mid = () => page.locator('[data-scenario="middels"] .total-timer').innerText();
    sjekk("middels scenario viser 11,95 t", (await mid()) === "11,95", await mid());
    sjekk("scenarioene er merket HYPOTESE", (await page.locator(".hypotese").count()) === 3);
    await page.fill('[data-volum="A1"]', "0"); await page.dispatchEvent('[data-volum="A1"]', "change");
    sjekk("A1 volum 0 trekker 1,95 t fra middels", (await mid()) === "10,00", await mid());
    for (const id of ["A1", "A2", "A3", "A4", "A5", "A6"]) { await page.fill(`[data-volum="${id}"]`, "0"); await page.dispatchEvent(`[data-volum="${id}"]`, "change"); }
    sjekk("null volum overalt gir 0,00 t", (await mid()) === "0,00");
    await page.click("text=Tilbakestill demo");
    await page.selectOption("#pilotvalg", "P1");
    sjekk("pilot for Tilbud viser stoppkriterium", (await page.innerText("#pilot")).includes("Stoppkriterium"));
    const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#csv")]);
    await dl.saveAs(HER + "resultat/scenarioer_fra_ui.csv");
    sjekk("CSV lastes ned", dl.suggestedFilename() === "scenarioer.csv");
    await page.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: true });
  });
