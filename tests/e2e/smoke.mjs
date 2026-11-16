// E2E smoke test: spustí build přes `vite preview` a projde hlavní scénáře na mobilním viewportu.
// Spuštění: npm run build && npm run test:e2e
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const PORT = 4179;
const base = `http://localhost:${PORT}/`;
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
const stop = () => server.kill();
process.on('exit', stop);

const waitForServer = async () => {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(base)).ok) return; } catch { /* ještě neběží */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Server nenaběhl');
};

const results = [];
const test = async (name, fn) => {
  try { await fn(); results.push([name, true]); console.log('ok  ', name); }
  catch (e) { results.push([name, false]); console.log('FAIL', name, '\n    ', e.message.split('\n')[0]); }
};

await waitForServer();
const browser = await chromium.launch();
const newPage = async (onboarded = false) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  if (onboarded) await ctx.addInitScript(() => localStorage.setItem('ap:onboarded', '1'));
  const page = await ctx.newPage();
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return { page, errors, ctx };
};

await test('nový uživatel: onboarding → hlavní stránka', async () => {
  const { page, errors, ctx } = await newPage();
  await page.goto(base);
  await page.waitForURL(/#\/welcome/);
  await page.getByRole('button', { name: 'Dál' }).click();
  await page.getByRole('button', { name: 'Dál' }).click();
  await page.getByText('Jen se porozhlédnout').click();
  await page.waitForURL(/#\/$/);
  await page.getByText('Dnešní plán').waitFor();
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test('karty: nové slovíčko → zkouška → hodnocení', async () => {
  const { page, errors, ctx } = await newPage();
  await page.goto(base + '#/cards/a1-u1-l1');
  await page.getByText('Nové slovíčko.').waitFor();
  for (let i = 0; i < 12; i++) await page.getByRole('button', { name: 'Rozumím, dál' }).click({ timeout: 800 }).catch(() => {});
  await page.getByRole('button', { name: 'Otočit', exact: true }).click();
  await page.getByRole('button', { name: /^Znal jsem/ }).click();
  await page.getByText('1 / 10').waitFor();
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test('lekce: vysvětlení slovíčka se rozbalí po klepnutí na ⓘ', async () => {
  const { page, ctx } = await newPage();
  await page.goto(base + '#/lesson/a1-u1-l1');
  assert.equal(await page.getByRole('region', { name: 'Vysvětlení slovíčka' }).count(), 0);
  await page.getByRole('button', { name: 'Jak se to používá?' }).first().click();
  assert.equal(await page.getByRole('region', { name: 'Vysvětlení slovíčka' }).count(), 1);
  await ctx.close();
});

await test('zamčená jednotka a odemčení tlačítkem', async () => {
  const { page, ctx } = await newPage();
  await page.goto(base + '#/unit/a1-u2');
  await page.getByText('je zamčená').waitFor();
  await page.getByRole('button', { name: /odemknout/ }).click();
  await page.getByRole('heading', { name: 'Quem sou eu' }).waitFor();
  await ctx.close();
});

await test('nastavení: změna cíle se uloží', async () => {
  const { page, ctx } = await newPage();
  await page.goto(base + '#/settings');
  await page.getByRole('radio', { name: /Intenzivní/ }).click();
  await page.reload();
  assert.equal(await page.getByRole('radio', { name: /Intenzivní/ }).getAttribute('aria-checked'), 'true');
  await ctx.close();
});

await test('hledání v kartách najde slovo bez diakritiky', async () => {
  const { page, ctx } = await newPage();
  await page.goto(base + '#/cards');
  await page.getByLabel('Hledat slovíčko').fill('obrigado');
  await page.getByText(/Nalezeno/).waitFor();
  await ctx.close();
});

await test('přepínač Seznam / Mapa a pět záložek', async () => {
  const { page, ctx } = await newPage(true);
  await page.goto(base + '#/map');
  await page.getByRole('heading', { name: 'Cesta Portugalskem' }).waitFor();
  assert.equal(await page.getByRole('navigation').locator('a').count() >= 5, true);
  await page.getByRole('link', { name: /Seznam/ }).click();
  await page.waitForURL(/#\/$/);
  await page.getByRole('link', { name: /Mapa/ }).click();
  await page.waitForURL(/#\/map/);
  await ctx.close();
});

await test('všechny hlavní stránky se načtou bez chyby', async () => {
  const { page, errors, ctx } = await newPage();
  for (const r of ['/', '/cards', '/quiz', '/practice', '/map', '/stats', '/settings', '/roleplay', '/pairs', '/speak']) {
    await page.goto(base + '#' + r);
    await page.waitForTimeout(150);
    assert.ok(await page.locator('main, #obsah, h1').first().isVisible(), r);
  }
  assert.deepEqual(errors, []);
  await ctx.close();
});

await browser.close();
stop();
const failed = results.filter(([, ok]) => !ok).length;
console.log(`\n${results.length - failed}/${results.length} prošlo`);
process.exit(failed ? 1 : 0);
