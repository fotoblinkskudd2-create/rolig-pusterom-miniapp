// Ende-til-ende-test av de viktigste flytene, i ekte Chromium mot den bygde filen (dist/index.html).
// Kjør: npm run build && npm run e2e   (CHROMIUM_PATH=/sti/til/chrome hvis Playwright ikke har egen nettleser)
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const url = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'index.html')
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
const page = await (await browser.newContext({ viewport: { width: 393, height: 852 } })).newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

let pass = 0, fail = 0
async function test(name, fn) {
  try { await fn(); pass++; console.log('  ✓', name) } catch (e) { fail++; console.log('  ✗', name, '\n    ', e.message.split('\n')[0]) }
}
const open = async (id) => { await page.goto(url + '#/' + id); await page.waitForTimeout(150) }
const field = (label) => page.locator('label.row', { hasText: label }).locator('input')
const sheet = () => page.locator('.sheet')
const expectText = async (t) => { await page.getByText(t, { exact: false }).first().waitFor({ timeout: 2000 }) }
const tab = (label) => page.locator('.tab', { hasText: label }).click()

await page.goto(url); await page.evaluate(() => localStorage.clear())

await test('Gjeldsknuser: legg til, betal, plan og lagring', async () => {
  await open('gjeldsknuser')
  await page.getByText('Legg til første gjeld').click()
  await field('Navn').fill('Klarna')
  await field('Saldo').fill('10000'); await field('Rente').fill('25'); await field('Minimum').fill('500')
  await sheet().getByText('Lagre').click()
  await expectText('Renter siden du åpnet appen')
  await page.getByRole('button', { name: 'Betal' }).first().click()
  await sheet().getByRole('button', { name: 'Betal', exact: true }).click()
  await expectText('500 kr')
  await tab('Plan'); await expectText('Gjeldfri')
  await page.reload(); await page.waitForTimeout(150); await tab('Oversikt'); await expectText('Klarna')
})

await test('Impulsbrems: pris blir arbeidstimer etter skatt', async () => {
  await open('impulsbrems')
  await page.getByText('Frys et ønske').first().click()
  await field('Hva').fill('Robotstøvsuger'); await field('Pris').fill('2800')
  await expectText('14,7 timer') // 2800 / (280 × 0,68)
  await sheet().getByRole('button', { name: 'Frys', exact: true }).click()
  await expectText('14,7 arbeidstimer')
})

await test('Feberlogg: dose etter vekt og nedtelling', async () => {
  await open('feberlogg')
  await page.locator('.btn', { hasText: 'Legg til barn' }).click()
  await field('Navn').fill('Ola')
  for (let i = 0; i < 10; i++) await sheet().getByLabel('Mer').click() // 15 → 20 kg
  await sheet().getByText('Lagre').click()
  await tab('Dose'); await expectText('300 mg'); await expectText('12,5 ml')
  await tab('Nå'); await page.getByText('Gi medisin').click(); await sheet().getByText('Logg').click()
  await expectText('Tidligst')
})

await test('Samvær: utgift deles og saldo stemmer', async () => {
  await open('samvaer'); await tab('Utgifter')
  await page.getByRole('button', { name: '＋' }).click()
  await field('Hva').fill('Fotballsko'); await field('Beløp').fill('1000')
  await sheet().getByText('Lagre').click()
  await expectText('Forelder B skylder Forelder A'); await expectText('500 kr')
})

await test('Hyttebygger: forlater du fanen, knekker planken', async () => {
  await open('hyttebygger')
  await page.getByRole('button', { name: 'Start' }).click()
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')) })
  await expectText('Planken knakk')
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }) })
})

await test('Snekkerkalk: kappliste pakkes riktig', async () => {
  await open('snekkerkalk'); await expectText('4 lengder'); await expectText('6,3 % svinn')
})

await test('Humørvær: hjørnet oppe til venstre er «Rasende»', async () => {
  await open('humorvaer')
  const pad = page.locator('[style*="touch-action: none"]').first(); const b = await pad.boundingBox()
  await page.mouse.click(b.x + 8, b.y + 8)
  await expectText('Rasende')
  await page.getByRole('button', { name: 'Lagre' }).click(); await tab('Uka'); await expectText('Rasende')
})

await test('Tankefelle: hele skjemaet til ferdig', async () => {
  await open('tankefelle')
  await page.locator('textarea').fill('Ingen svarte i gruppechatten'); await page.getByText('Neste').click()
  await page.getByRole('button', { name: 'Angst' }).click(); await page.getByText('Neste').click()
  await page.locator('textarea').fill('Alle hater meg'); await page.getByText('Neste').click()
  await page.getByText('Tankelesing').click(); await page.getByText('Neste').click()
  await page.getByText('Neste').click(); await page.getByText('Neste').click()
  await page.locator('textarea').fill('De er sikkert opptatt'); await page.getByRole('button', { name: 'Ferdig' }).click()
  await expectText('Alle hater meg'); await tab('Mønstre'); await expectText('Tankelesing')
})

await test('Delene: del registreres og front logges', async () => {
  await open('delene'); await tab('Deler')
  await page.getByRole('button', { name: 'Legg til' }).click()
  await field('Navn').fill('Lille'); await sheet().getByText('Lagre').click()
  await tab('Fremme'); await page.getByText('Logg hvem som er fremme').click()
  await sheet().getByText('Lille').click(); await sheet().getByRole('button', { name: 'Logg' }).click()
  await expectText('siden')
})

await test('Besluttet: matrise kårer en vinner', async () => {
  await open('besluttet'); await page.getByText('Ny beslutning').click(); await expectText('🏆')
})

await test('Ingen JS-feil i konsollen', async () => { if (errors.length) throw new Error(errors.join(' | ')) })

await browser.close()
console.log(`\n${pass} bestått, ${fail} feilet`)
process.exit(fail ? 1 : 0)
