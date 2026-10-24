import { e2e } from "../felles/e2e.mjs";
import { readFileSync, rmSync } from "node:fs";
const HER = new URL(".", import.meta.url).pathname;
rmSync(HER + "resultat/e2e_arbeid", { recursive: true, force: true });
await e2e("011 PDF-bestilling", HER, { server: ["python3", "app.py", "--arbeid", HER + "resultat/e2e_arbeid", "--port", "8711"], url: "http://127.0.0.1:8711/", port: 8711 },
  async ({ page, sjekk, url }) => {
    await page.goto(url); await page.waitForSelector('[data-linje="L4"]');
    sjekk("B1 viser 4 linjer og sideoverlegg", (await page.locator(".bb").count()) === 16);
    await page.fill('[data-felt="L2.antall"]', "14"); await page.dispatchEvent('[data-felt="L2.antall"]', "change");
    await page.waitForSelector('[data-felt="L2.antall"].rettet');
    await page.click('[data-bekreft="L1"]'); await page.waitForSelector('[data-linje="L1"].bekreftet');
    await page.click('[data-bekreft="L2"]'); await page.waitForSelector('[data-linje="L2"].bekreftet');
    const r = await page.request.get(url + "api/dok/B1_enkel.pdf/eksport.csv");
    const t = await r.text();
    sjekk("eksport fra UI har to bekreftede linjer med rettet antall", t.trim().split("\n").length === 3 && t.includes("Koblingsboks IP55,14.0"), t.split("\n")[2]);
    await page.selectOption("#dok", "S4_skannet.pdf");
    await page.waitForSelector('[data-ocr="1"]');
    sjekk("skannet side viser «krever OCR»", (await page.innerText('[data-ocr="1"]')).includes("krever OCR"));
    await page.click("#ocr");
    await page.waitForSelector('[data-linje="L3"]', { timeout: 30000 });
    sjekk("OCR gir tre usikre linjer med kilde ocr", (await page.locator('td.adv:has-text("ocr")').count()) === 3);
    await page.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: true });
  });
