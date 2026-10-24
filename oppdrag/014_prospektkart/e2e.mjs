import { e2e } from "../felles/e2e.mjs";
const HER = new URL(".", import.meta.url).pathname;
await e2e("014 Prospektkart", HER, { server: ["python3", "app.py", "--demo", "--db", HER + "resultat/e2e.db", "--port", "8714"], url: "http://127.0.0.1:8714/", port: 8714 },
  async ({ page, sjekk, url }) => {
    const v = []; page.on("dialog", d => { v.push(d.message()); d.accept(); });
    await page.goto(url); await page.waitForSelector("[data-org]");
    sjekk("20 bedrifter og én avvist rad", (await page.locator("[data-org]").count()) === 20 && (await page.innerText("#info")).includes("1 importrad"));
    await page.fill("#min", "10"); await page.fill("#maks", "50");
    await page.waitForFunction(() => document.querySelectorAll("[data-org]").length === 8);
    sjekk("størrelsesfilter utelater ukjent", (await page.locator("td.ukjent").count()) === 0);
    await page.check("#ukjent"); await page.waitForFunction(() => document.querySelectorAll("td.ukjent").length > 0);
    sjekk("ukjent størrelse kan tas med eksplisitt", true);
    await page.locator("[data-org] button").first().click();
    await page.selectOption("#status", "aktuell"); await page.click("#lagre"); await page.waitForTimeout(200);
    sjekk("aktuell uten grunn avvises", v.some(m => m.includes("krever kvalifiseringsgrunn")));
    await page.fill("#grunn", "Riktig bransje og størrelse"); await page.fill("#neste", "Ring sentralbord"); await page.click("#lagre");
    await page.waitForFunction(() => document.body.innerText.includes("aktuell"));
    sjekk("kvalifisering lagres", true);
    await page.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: true });
  });
