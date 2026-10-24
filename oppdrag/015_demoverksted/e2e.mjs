import { e2e } from "../felles/e2e.mjs";
const HER = new URL(".", import.meta.url).pathname;
const S = { arbeidskort: "Nordkapp Rør", dokumentkontroll: "Lofoten Ladepark", margin: "Senja Webstudio" };
const FILER = { arbeidskort: ["henvendelse_1.txt"], dokumentkontroll: ["lofoten_avtale.pdf"], margin: [] };
await e2e("015 Demoverksted", HER, { server: ["python3", "../felles/serve.py", "8715"], url: "http://127.0.0.1:8715/015_demoverksted/", port: 8715 },
  async ({ page, ctx, sjekk, url }) => {
    await page.goto(url); await page.evaluate(() => navigator.serviceWorker.ready); await page.waitForSelector("#output");
    for (const id of Object.keys(S)) {
      await page.click(`[data-fane="${id}"]`); await page.waitForSelector("#output");
      const tekst = await page.innerText("#scenario");
      const fremmede = Object.entries(S).filter(([a]) => a !== id).map(([, n]) => n).concat(Object.entries(FILER).filter(([a]) => a !== id).flatMap(([, f]) => f)).filter(n => tekst.includes(n));
      sjekk(`${id}: viser bare egne navn og filer`, tekst.includes(S[id]) && fremmede.length === 0, fremmede.join(", "));
    }
    await page.click('[data-fane="margin"]');
    const inp = JSON.parse(await page.inputValue("#input")); inp.prosjekter[1].timer = 60;
    await page.fill("#input", JSON.stringify(inp)); await page.click("#kjor");
    sjekk("endring kjører behandlingen på nytt (SW-2 500 kr/t)", (await page.innerText("#output")).includes("500"));
    await page.click('[data-fane="arbeidskort"]');
    sjekk("endring i margin påvirker ikke arbeidskort-scenarioet", !(await page.locator("#endret").count()));
    await page.click('[data-fane="margin"]');
    sjekk("margin husker endringen", await page.locator("#endret").count() === 1);
    await page.click("#nullstill");
    sjekk("nullstilling gir originaldemonstrasjonen", (await page.locator("#endret").count()) === 0 && (await page.innerText("#output")).includes("1500"));
    await ctx.setOffline(true);
    const ny = await ctx.newPage(); await ny.goto(url); await ny.waitForSelector("#output");
    await ny.click('[data-fane="arbeidskort"]');
    sjekk("demonstrasjonen fungerer uten nett etter installasjon", (await ny.innerText("#output")).includes("Havnegata 4"));
    await ctx.setOffline(false);
    await ny.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: true });
  });
