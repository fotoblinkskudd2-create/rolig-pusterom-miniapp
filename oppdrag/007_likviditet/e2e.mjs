import { e2e } from "../felles/e2e.mjs";
const HER = new URL(".", import.meta.url).pathname;
await e2e("007 Likviditetslab", HER, { server: ["python3", "../felles/serve.py", "8707"], url: "http://127.0.0.1:8707/007_likviditet/", port: 8707 },
  async ({ page, sjekk, url }) => {
    await page.goto(url);
    await page.waitForSelector("#avstemt");
    sjekk("basis er avstemt", (await page.innerText("#avstemt")).includes("avstemt"));
    const slutt = async () => (await page.locator('[data-uke="13"] td').nth(8).innerText());
    const s0 = await slutt();
    await page.click('[data-frem="K3"]'); await page.click('[data-frem="K3"]');
    sjekk("flytting av K3 to uker endrer ikke sluttsaldo", (await slutt()) === s0, s0);
    sjekk("K3 står nå i uke 6", (await page.locator('[data-post="K3"] td').nth(2).innerText()) === "6");
    await page.selectOption("#sa", "forsinket");
    sjekk("forsinket scenario viser negative uker", (await page.locator("tr.neg").count()) >= 1);
    await page.reload(); await page.selectOption("#sa", "basis");
    sjekk("flytting huskes etter omlasting", (await page.locator('[data-post="K3"] td').nth(2).innerText()) === "6");
    await page.click("#nullstill");
    sjekk("nullstilling gir K3 tilbake i uke 4", (await page.locator('[data-post="K3"] td').nth(2).innerText()) === "4");
    await page.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: true });
  });
