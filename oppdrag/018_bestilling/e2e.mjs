import { e2e } from "../felles/e2e.mjs";
import { rmSync } from "node:fs";
const HER = new URL(".", import.meta.url).pathname;
for (const s of ["", "-wal", "-shm"]) rmSync(HER + "resultat/e2e.db" + s, { force: true });
await e2e("018 Bestilling", HER, { server: ["python3", "app.py", "--demo", "--db", HER + "resultat/e2e.db", "--port", "8718"], url: "http://127.0.0.1:8718/", port: 8718 },
  async ({ page, sjekk, url }) => {
    page.on("dialog", d => d.accept());
    await page.goto(url); await page.waitForSelector('[data-tid="08:00"]');
    await page.selectOption("#tj", "befaring"); await page.waitForTimeout(200);
    const for_ = await page.locator("[data-tid]").count();
    await page.click('[data-tid="09:00"]'); await page.waitForSelector("#bekreft");
    sjekk("reservasjon fjerner overlappende starttider (08:30, 09:00, 09:30)", (await page.locator("[data-tid]").count()) === for_ - 3);
    await page.click("#bekreft");
    await page.waitForFunction(() => document.querySelector("#liste").innerText.includes("bekreftet"));
    sjekk("lokal bekreftelse vises", true);
    await page.fill("#dag", "2026-11-03"); await page.dispatchEvent("#dag", "change");
    await page.waitForSelector("#ingen");
    sjekk("fullbooket uke viser ingen ledige tider", true);
    await page.fill("#dag", "2026-10-27"); await page.dispatchEvent("#dag", "change");
    await page.waitForSelector('[data-tid="08:00"]');
    await page.locator("#liste button").first().click();
    await page.waitForFunction(n => document.querySelectorAll("[data-tid]").length === n, for_);
    sjekk("avbestilling gir tidene tilbake", true);
    await page.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: true });
  });
for (const s of ["", "-wal", "-shm"]) rmSync(HER + "resultat/e2e.db" + s, { force: true });
