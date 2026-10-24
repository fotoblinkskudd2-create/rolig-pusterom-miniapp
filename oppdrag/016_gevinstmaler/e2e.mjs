import { e2e } from "../felles/e2e.mjs";
const HER = new URL(".", import.meta.url).pathname;
await e2e("016 Gevinstmåler", HER, { server: ["python3", "app.py", "--port", "8716"], url: "http://127.0.0.1:8716/", port: 8716 },
  async ({ page, sjekk, url }) => {
    const v = []; page.on("dialog", d => { v.push(d.message()); d.accept(); });
    await page.goto(url); await page.waitForSelector('[data-gruppe="Fakturakontroll"]');
    sjekk("to separate grupper", (await page.locator("[data-gruppe]").count()) === 2);
    sjekk("ekstremverdi og lite utvalg vises", (await page.innerText("#grupper")).includes("ekstremverdi etter: 240") && (await page.innerText("#grupper")).includes("lite utvalg"));
    const k = page.locator('[data-gruppe="Fakturakontroll"]');
    await k.locator("button").click(); await page.waitForTimeout(200);
    sjekk("økonomi uten timesats avvises", v.some(m => m.includes("timesats og volum")));
    await k.locator(".sats").fill("600"); await k.locator(".volum").fill("10"); await k.locator("button").click();
    await page.waitForFunction(() => document.querySelector('[data-gruppe="Fakturakontroll"] .okonomi').innerText.includes("13 800 kr/år"));
    sjekk("økonomisk scenario 13 800 kr/år med forbehold", (await k.locator(".okonomi").innerText()).includes("ikke dokumentert årsak"));
    await page.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: true });
  });
