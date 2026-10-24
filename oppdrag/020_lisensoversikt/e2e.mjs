import { e2e } from "../felles/e2e.mjs";
const HER = new URL(".", import.meta.url).pathname;
await e2e("020 Lisensoversikt", HER, { server: ["python3", "app.py", "--demo", "--db", HER + "resultat/e2e.db", "--port", "8720"], url: "http://127.0.0.1:8720/", port: 8720 },
  async ({ page, sjekk, url }) => {
    await page.goto(url); await page.waitForSelector("#status");
    sjekk("rev 2 er åpen og hjelpefunk står i arbeidskø", (await page.innerText("#status")) === "åpen" && await page.locator('[data-ko="hjelpefunk"]').count() === 1);
    await page.selectOption("#ov", { index: 0 }); await page.waitForFunction(() => document.querySelector("#status").innerText.startsWith("låst"));
    sjekk("rev 1 er låst og kan ikke redigeres", (await page.innerText("#ny")).includes("kan ikke endres"));
    await page.selectOption("#ov", { index: 1 }); await page.waitForSelector('[data-f="navn"]');
    await page.fill('[data-f="navn"]', "hjelpefunk"); await page.fill('[data-f="versjon"]', "1.0.4"); await page.fill('[data-f="lisens"]', "ISC");
    await page.fill('[data-f="lisens_kilde"]', "LICENSE i pakken"); await page.fill('[data-f="attribusjon"]', "Copyright (c) 2021 Fiktiv"); await page.locator("#ny button").click();
    await page.waitForFunction(() => !document.querySelector('[data-ko="hjelpefunk"]'));
    sjekk("registrert lisens og attribusjon fjerner punktet fra køen", true);
    await page.selectOption("#mot", { index: 1 });
    await page.waitForFunction(() => document.querySelector("#diff").innerText.includes("fjernet"));
    sjekk("sammenligning viser fjernet rapportgen", (await page.innerText("#diff")).includes("rapportgen"));
    await page.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: true });
  });
