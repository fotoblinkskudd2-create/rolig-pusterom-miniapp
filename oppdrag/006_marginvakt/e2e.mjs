import { e2e } from "../felles/e2e.mjs";
const HER = new URL(".", import.meta.url).pathname;
await e2e("006 Marginvakt", HER, { server: ["python3", "app.py", "--db", HER + "resultat/e2e.db", "--demo", "--port", "8706"], url: "http://127.0.0.1:8706/", port: 8706 },
  async ({ page, sjekk, url }) => {
    await page.goto(url);
    await page.waitForSelector('[data-p="P1"]');
    sjekk("P1 viser 776 kr/t", (await page.locator('[data-p="P1"] .eff').innerText()) === "776");
    await page.click('[data-p="P1"]');
    await page.click("#rapport");
    await page.waitForSelector("#rapporter li");
    await page.fill("#t-akt", "test"); await page.fill("#t-dato", "2026-09-21"); await page.fill("#t-timer", "50"); await page.click("#t-lagre");
    await page.waitForFunction(() => document.querySelector('[data-p="P1"] .eff').innerText === "388");
    sjekk("50 ekstra timer halverer til 388 kr/t", true);
    sjekk("frossen rapport viser fortsatt 776", (await page.innerText("#rapporter")).includes("eff 776 kr/t"));
    await page.fill('[data-grense="min_effektiv_timeinntekt"]', "400"); await page.dispatchEvent('[data-grense="min_effektiv_timeinntekt"]', "change");
    await page.waitForFunction(() => document.querySelector('[data-p="P1"]').innerText.includes("under grensen 400"));
    sjekk("ny grense gir internt varsel", true);
    await page.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: true });
  });
