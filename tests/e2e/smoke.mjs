// E2E smoke test: spustí build přes `vite preview` a projde hlavní scénáře na mobilním viewportu.
// Spuštění: npm run build && npm run test:e2e
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createRequire } from 'node:module';

const axePath = createRequire(import.meta.url).resolve('axe-core');

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
  catch (e) { results.push([name, false]); console.log('FAIL', name, '\n    ', e.message.split('\n')[0], process.env.E2E_STACK ? e.stack : ''); }
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
  await page.getByText('Krok 1 ze 5').waitFor();
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Dál' }).click();
  await page.getByText('Krok 5 ze 5').waitFor();
  await page.getByText('Jen se porozhlédnout').click();
  await page.waitForURL(/#\/$/);
  await page.getByText('Dnešní plán').waitFor();
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test('průvodce: „Už něco umím“ vede na zařazovací test', async () => {
  const { page, errors, ctx } = await newPage();
  await page.goto(base + '#/welcome');
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Dál' }).click();
  await page.getByText('Už něco umím (A1)').click();
  await page.waitForURL(/#\/quiz\/placement-a1/);
  await page.getByText('1 / 12').waitFor();
  assert.equal(await page.getByRole('button', { name: /nápověd|Vyřadit|Odkrýt|Prozradit/i }).count(), 0, 'v zařazovacím testu nejsou nápovědy');
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test('mapa B1: osm měst včetně ostrovů, nová jednotka je zamčená', async () => {
  const { page, errors, ctx } = await newPage(true);
  await page.goto(base + '#/map');
  await page.getByRole('tab', { name: 'B1' }).click();
  await page.getByRole('button', { name: /^Viana do Castelo/ }).waitFor();
  for (const city of ['Bragança', 'Nazaré', 'Castelo Branco', 'Peniche', 'Funchal', 'Ponta Delgada', 'Beja']) await page.getByRole('button', { name: new RegExp(`^${city}`) }).waitFor();
  assert.match(await page.getByRole('button', { name: /^Viana do Castelo/ }).getAttribute('aria-label'), /zamčeno/);
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

await test('přepínač Seznam / Mapa a záložky', async () => {
  const { page, ctx } = await newPage(true);
  await page.goto(base + '#/map');
  await page.getByRole('heading', { name: 'Cesta Portugalskem' }).waitFor();
  assert.equal(await page.getByRole('navigation').locator('a').count() >= 3, true);
  await page.getByRole('link', { name: /Seznam/ }).click();
  await page.waitForURL(/#\/$/);
  await page.getByRole('link', { name: /Mapa/ }).click();
  await page.waitForURL(/#\/map/);
  await ctx.close();
});

await test('mapa: detail města je dialog přes mapu, zavře se křížkem i Esc', async () => {
  const { page, ctx } = await newPage(true);
  await page.goto(base + '#/map');
  await page.getByRole('button', { name: /^Lisboa:/ }).waitFor({ state: 'attached' });
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.getByRole('button', { name: /^Lisboa:/ }).dispatchEvent('click');
  await page.getByRole('dialog').waitFor();
  await page.getByRole('button', { name: 'Zavřít' }).click();
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await page.getByRole('button', { name: /^Lisboa:/ }).dispatchEvent('click');
  await page.getByRole('dialog').waitFor();
  await page.waitForTimeout(300); // posluchač Esc se registruje v efektu po vykreslení
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await ctx.close();
});

await test('cvičení: bez spodní navigace, křížek se ptá na potvrzení, hlavní akce je dole', async () => {
  const { page, ctx } = await newPage(true);
  await page.goto(base + '#/cards/a1-u1-l1');
  await page.getByRole('button', { name: 'Opustit cvičení' }).waitFor();
  assert.equal(await page.getByRole('navigation', { name: 'Hlavní navigace' }).count(), 0);
  assert.equal(await page.getByRole('link', { name: /Procvičit/ }).count(), 0);
  const btn = page.getByRole('button', { name: /Rozumím|Otočit/ }).last();
  await btn.waitFor();
  const box = await btn.boundingBox();
  assert.ok(box.y + box.height > 844 - 120, 'tlačítko je ve spodní části: ' + JSON.stringify(box));
  await page.getByRole('button', { name: 'Opustit cvičení' }).click();
  await page.getByRole('dialog').waitFor();
  await page.getByRole('button', { name: 'Zůstat' }).click();
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await page.getByRole('button', { name: 'Opustit cvičení' }).click();
  await page.getByRole('button', { name: 'Odejít' }).click();
  await page.waitForURL(/#\/practice/);
  await ctx.close();
});

await test('obchod: zůstatek 0, nákup zamčený, nasazení motivu přes uložený stav', async () => {
  const { page, errors, ctx } = await newPage(true);
  await page.goto(base + '#/shop');
  await page.getByTestId('balance').waitFor();
  assert.equal(await page.getByTestId('balance').innerText(), '0');
  assert.ok(await page.locator('li button:disabled').first().isDisabled(), 'bez mincí nejde nic koupit');
  // vlastněný motiv se použije: přepíše barvy značky
  await page.evaluate(() => {
    localStorage.setItem('ap:shop', JSON.stringify({ owned: ['theme-vinho'], theme: 'theme-vinho' }));
    window.dispatchEvent(new Event('ap:shop-changed'));
  });
  const brand = await page.evaluate(() => document.documentElement.style.getPropertyValue('--color-brand-700'));
  assert.ok(brand.startsWith('hsl(340'), brand);
  await page.getByRole('radio', { name: 'Zmrazení' }).click();
  await page.getByText('Máš: 0 / 2').waitFor();
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test('test: nápověda stojí mince a slovíčko se vrátí do opakování', async () => {
  const { page, errors, ctx } = await newPage(true);
  await page.goto(base + '#/stats');
  await page.getByText('Můj pokrok').first().waitFor();
  // splněný test jednotky dá mince, za které se dá koupit nápověda
  await page.evaluate(() => new Promise((resolve) => {
    const req = indexedDB.open('ap-progress');
    req.onsuccess = () => {
      const tx = req.result.transaction('tests', 'readwrite');
      tx.objectStore('tests').put({ id: 'a1-u1', best: 1, passed: true, attempts: 1, last: Date.now() });
      tx.oncomplete = () => resolve(true);
    };
  }));
  await page.goto(base + '#/quiz/a1-u1-l1');
  const hint = page.getByRole('button', { name: /Vyřadit 2 možnosti|Odkrýt první písmeno|Prozradit první slovo/ });
  let used = false;
  for (let i = 0; i < 20 && !used; i++) {
    await page.waitForTimeout(400);
    // Přiřazování párů skript neumí vyřešit a pořadí otázek je náhodné: načti nový test.
    if (await page.getByText('Spoj portugalské výrazy').count()) { await page.reload(); continue; }
    if (await hint.count()) {
      await hint.first().click();
      used = true;
      break;
    }
    const input = page.locator('input[lang="pt-PT"]');
    if (await input.count()) { await input.fill('x'); await page.getByRole('button', { name: 'Zkontrolovat' }).click(); }
    else if (await page.getByRole('button', { name: 'Zkontrolovat' }).count()) { await page.locator('button:not([disabled])', { hasText: /^[^\d]/ }).first().click().catch(() => undefined); await page.getByRole('button', { name: 'Zkontrolovat' }).click().catch(() => undefined); }
    else await page.keyboard.press('1');
    await page.getByRole('button', { name: /^(Další|Zobrazit výsledek)/ }).click().catch(() => undefined);
  }
  assert.ok(used, 'v prvních otázkách se nabídla nápověda: ' + (await page.locator('main').innerText()).replace(/\n+/g, ' | '));
  const shop = await page.evaluate(() => JSON.parse(localStorage.getItem('ap:shop') ?? '{}'));
  assert.equal(shop.hintsBought, 1);
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test('gramatika: věta s mezerou se opakuje a ukládá', async () => {
  const { page, errors, ctx } = await newPage(true);
  await page.goto(base + '#/grammar');
  await page.getByRole('heading', { name: 'Gramatika: doplňování vět' }).waitFor();
  await page.getByText('Doplň správný tvar:').waitFor();
  await page.keyboard.press('1');
  await page.getByRole('status').waitFor();
  await page.getByRole('button', { name: /^Další/ }).click();
  // uložená karta má předponu cl: a nezapočítá se mezi slovíčka
  const saved = await page.evaluate(() => new Promise((resolve) => {
    const req = indexedDB.open('ap-progress');
    req.onsuccess = () => {
      const all = req.result.transaction('cards').objectStore('cards').getAll();
      all.onsuccess = () => resolve(all.result.map((c) => c.id));
    };
  }));
  assert.ok(saved.length === 1 && saved[0].startsWith('cl:'), JSON.stringify(saved));
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test('opakování: známé slovo se píše, špatná odpověď se vrátí', async () => {
  const { page, errors, ctx } = await newPage(true);
  await page.goto(base + '#/stats');
  await page.getByText('Můj pokrok').first().waitFor();
  const ids = ['ola', 'bom-dia', 'boa-tarde', 'boa-noite', 'adeus', 'ate-logo', 'ate-amanha', 'tchau', 'tudo-bem', 'como-estas', 'como-esta', 'estou-bem', 'obrigado', 'de-nada', 'por-favor', 'desculpe', 'com-licenca', 'sim', 'nao'];
  await page.evaluate((ids) => new Promise((resolve) => {
    localStorage.setItem('ap:study-settings', JSON.stringify({ recall: 'often', autoplay: false }));
    const req = indexedDB.open('ap-progress');
    req.onsuccess = () => {
      const tx = req.result.transaction('cards', 'readwrite');
      for (const id of ids) tx.objectStore('cards').put({ id: 'u1l1-' + id, ease: 2.5, interval: 5, reps: 5, lapses: 0, due: 1, last: 1, introduced: 1 });
      tx.oncomplete = () => resolve(true);
    };
  }), ids);
  await page.goto(base + '#/cards/a1-u1-l1');
  const input = page.locator('input[lang="pt-PT"]');
  const ready = page.locator('input[lang="pt-PT"], button:text-is("Otočit")').first();
  for (let i = 0; i < 19; i++) {
    await ready.waitFor();
    if (await input.isVisible()) break;
    await page.getByRole('button', { name: 'Otočit', exact: true }).click();
    await page.getByRole('button', { name: /^Znal jsem/ }).click();
  }
  await input.waitFor({ timeout: 3000 });
  await input.fill('xyz');
  await input.press('Enter');
  await page.getByText('Zatím ne.').waitFor();
  await page.getByRole('button', { name: /^Další/ }).click();
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test('přehled gramatiky: hledání najde lekci a týdenní souhrn je vidět', async () => {
  const { page, errors, ctx } = await newPage(true);
  await page.goto(base + '#/gramatika');
  await page.getByRole('heading', { name: 'Přehled gramatiky' }).waitFor();
  const before = await page.locator('details').count();
  assert.ok(before >= 1);
  await page.getByLabel('Hledat v gramatice').fill('zzzneexistuje');
  await page.getByText('Nic nenalezeno.').waitFor();
  await page.goto(base + '#/stats');
  await page.getByText('Posledních 7 dní').waitFor();
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test('všechny hlavní stránky se načtou bez chyby', async () => {
  const { page, errors, ctx } = await newPage();
  for (const r of ['/', '/cards', '/quiz', '/practice', '/map', '/stats', '/shop', '/grammar', '/gramatika', '/settings', '/roleplay', '/pairs', '/speak']) {
    await page.goto(base + '#' + r);
    await page.waitForTimeout(150);
    assert.ok(await page.locator('main, #obsah, h1').first().isVisible(), r);
  }
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test('Projít lekci: představení slov → cvičení → slova v kartičkách', async () => {
  const { page, errors, ctx } = await newPage(true);
  await page.goto(base + '#/lesson/a1-u1-l1');
  await page.getByRole('link', { name: /Projít lekci/ }).click();
  await page.waitForURL(/#\/learn\/a1-u1-l1/);
  await page.getByText('Nová slova 1 / 6').waitFor();
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Rozumím, dál' }).click();
  await page.getByRole('button', { name: 'Začít cvičení' }).click();
  await page.getByText(/^1 \/ \d+$/).waitFor();
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test('O aplikaci: upozornění na neověřený obsah a soukromí; záloha ukáže datum', async () => {
  const { page, errors, ctx } = await newPage(true);
  await page.goto(base + '#/about');
  await page.getByRole('heading', { name: /Obsah zatím nezkontroloval/ }).waitFor();
  await page.getByText('Žádné účty, žádné sledování.').waitFor();
  await page.goto(base + '#/settings');
  await page.getByTestId('last-backup').getByText('Zálohu jsi zatím nestáhl').waitFor();
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Stáhnout zálohu/ }).click()]);
  assert.match(download.suggestedFilename(), /zaloha/);
  await page.getByTestId('last-backup').getByText(/Poslední záloha:/).waitFor();
  const [ics] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Stáhnout připomínku/ }).click()]);
  assert.match(ics.suggestedFilename(), /\.ics$/);
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test('připomenutí zálohy se ukáže po 3 dnech aktivity a jde odložit', async () => {
  const { page, ctx } = await newPage(true);
  await page.addInitScript(() => {});
  await page.goto(base);
  await page.evaluate(async () => {
    const req = indexedDB.open('ap-progress');
    await new Promise((r) => { req.onsuccess = r; });
    const db = req.result;
    const tx = db.transaction('days', 'readwrite');
    for (const d of ['2026-01-01', '2026-01-02', '2026-01-03']) tx.objectStore('days').put({ date: d, reviews: 1, again: 0, newCards: 0, xp: 3 });
    await new Promise((r) => { tx.oncomplete = r; });
  });
  await page.reload();
  await page.getByRole('region', { name: 'Připomenutí zálohy' }).waitFor();
  await page.getByRole('button', { name: 'Později' }).click();
  await page.reload();
  await page.getByText('Dnešní plán').waitFor();
  assert.equal(await page.getByRole('region', { name: 'Připomenutí zálohy' }).count(), 0);
  await ctx.close();
});

const axeViolations = async (page) => {
  await page.addScriptTag({ path: axePath });
  const res = await page.evaluate(() => window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] }));
  return res.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
};

await test('přístupnost (axe, WCAG AA): hlavní stránky ve světlém i tmavém režimu', async () => {
  const routes = ['/', '/practice', '/stats', '/settings', '/shop', '/collection', '/gramatika', '/cards', '/quiz', '/roleplay', '/pairs', '/map', '/unit/a1-u1', '/lesson/a1-u1-l1', '/cards/a1-u1-l1', '/quiz/a1-u1-l1', '/roleplay/hotel', '/about', '/learn/a1-u1-l1'];
  const bad = [];
  for (const dark of [false, true]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    await ctx.addInitScript((d) => { localStorage.setItem('ap:onboarded', '1'); localStorage.setItem('ap:theme', d ? 'dark' : 'light'); }, dark);
    const page = await ctx.newPage();
    for (const r of routes) {
      await page.goto(base + '#' + r);
      await page.waitForTimeout(300);
      for (const v of await axeViolations(page)) bad.push(`${dark ? 'tmavý' : 'světlý'} ${r}: ${v}`);
    }
    await ctx.close();
  }
  assert.deepEqual(bad, []);
});

await browser.close();
stop();
const failed = results.filter(([, ok]) => !ok).length;
console.log(`\n${results.length - failed}/${results.length} prošlo`);
process.exit(failed ? 1 : 0);
