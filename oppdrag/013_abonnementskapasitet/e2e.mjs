import { e2e } from "../felles/e2e.mjs";
const HER = new URL(".", import.meta.url).pathname;
await e2e("013 Abonnementskapasitet", HER, { server: ["python3", "../felles/serve.py", "8713"], url: "http://127.0.0.1:8713/013_abonnementskapasitet/", port: 8713 },
  async ({ page, sjekk, url }) => {
    page.on("dialog", d => d.accept("Mitt scenario"));
    await page.goto(url); await page.waitForSelector('[data-pakke="Premium"]');
    sjekk("Forsiktig: Premium overskrider fra måned 7", (await page.innerText('[data-overskridelse="Premium"]')).includes("måned 7"));
    await page.selectOption("#scenario", "2");
    sjekk("Ingen salg: ARR 0 kr for Basis", (await page.innerText('[data-pakke="Basis"]')).includes("ARR ved slutt (bare abonnement)\t0 kr"));
    await page.selectOption("#scenario", "0");
    await page.click("#lagre");
    await page.fill('[data-felt="kapasitetTimerPerMnd"]', "200"); await page.dispatchEvent('[data-felt="kapasitetTimerPerMnd"]', "change");
    sjekk("mer kapasitet fjerner overskridelse for Premium", (await page.innerText('[data-overskridelse="Premium"]')).includes("innenfor"));
    await page.reload(); await page.waitForSelector('[data-pakke="Premium"]');
    sjekk("lagret scenario finnes etter omlasting", (await page.locator("#scenario option").count()) === 4);
    await page.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: true });
  });
