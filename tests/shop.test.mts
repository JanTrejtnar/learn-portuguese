import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COINS_PER_GOAL_DAY, COINS_PER_LEVEL, coinsEarned } from '../src/lib/coins.ts';
import { DEFAULT_SHOP, FREEZE_PRICE, ITEMS, MAX_FREEZES, balance, buyFreeze, buyItem, coinsSpent, consumeFreeze, equipItem, freezesLeft, isOwned, itemById, sanitizeShop, validEquipped } from '../src/lib/shop.ts';
import { accentVars, ACCENTS } from '../src/lib/accent.ts';
import { buildBackup, parseBackup } from '../src/lib/backup.ts';
import { dayToFreeze, streakOf } from '../src/lib/stats.ts';
import { DAY, dateKey } from '../src/lib/srs.ts';

const now = new Date(2026, 10, 16, 12, 0).getTime();
const day = (offset: number, extra: object = {}) => {
  const date = dateKey(now - offset * DAY);
  return [date, { date, reviews: 5, again: 0, newCards: 0, ...extra }] as const;
};
const emptyProgress: any = { cards: new Map(), days: new Map(), tests: new Map() };
const none = { level: 1, badges: new Set<string>() };

test('mince: zisk se odvozuje z pokroku a nedá se nafouknout opakováním', () => {
  assert.equal(coinsEarned(emptyProgress, []).total, 0);
  const p: any = { ...emptyProgress, days: new Map([day(0, { goalReached: true, xp: 60 }), day(1, { goalReached: true, xp: 60 })]) };
  const e = coinsEarned(p, []);
  assert.equal(e.goalDays, 2 * COINS_PER_GOAL_DAY);
  assert.equal(e.levels, COINS_PER_LEVEL); // 120 XP = úroveň 2
  assert.equal(e.badges, 10); // jen „Objetivo Cumprido“ (goal-1)
});

test('obchod: koupě, nedostatek mincí, duplicita, úroveň', () => {
  const bg = itemById('bg-lisboa')!;
  assert.equal(buyItem(DEFAULT_SHOP, bg.id, bg.price - 1, none).ok, false);
  const ok = buyItem(DEFAULT_SHOP, bg.id, bg.price, none);
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.equal(coinsSpent(ok.state), bg.price);
    assert.equal(balance(100, ok.state), 100 - bg.price);
    assert.equal(buyItem(ok.state, bg.id, 999, none).ok, false, 'dvakrát nejde');
  }
  assert.equal(buyItem(DEFAULT_SHOP, 'top-camisola', 999, none).ok, false, 'odměnu nelze koupit');
  assert.equal(buyItem(DEFAULT_SHOP, 'neexistuje', 999, none).ok, false);
});

test('odměny: odemknou se podmínkou, nasazení neodemčené věci se ignoruje', () => {
  const cam = itemById('top-camisola')!;
  const night = itemById('bg-noite')!;
  assert.equal(isOwned(cam, DEFAULT_SHOP, none), false);
  assert.equal(isOwned(cam, DEFAULT_SHOP, { level: 1, badges: new Set(['a1-done']) }), true);
  assert.equal(isOwned(night, DEFAULT_SHOP, { level: 10, badges: new Set() }), true);
  assert.equal(isOwned(night, DEFAULT_SHOP, { level: 9, badges: new Set() }), false);
  const s = { ...DEFAULT_SHOP, equipped: { top: 'top-camisola' } };
  assert.deepEqual(validEquipped(s, none), {});
  assert.deepEqual(validEquipped(s, { level: 1, badges: new Set(['a1-done']) }), { top: 'top-camisola' });
});

test('nasazení a sundání; motiv', () => {
  const hat = itemById('hat-bone')!;
  const theme = itemById('theme-vinho')!;
  let s = equipItem(DEFAULT_SHOP, hat, true);
  assert.equal(s.equipped.hat, 'hat-bone');
  s = equipItem(s, hat, false);
  assert.equal(s.equipped.hat, undefined);
  assert.equal(equipItem(s, theme, true).theme, 'theme-vinho');
});

test('zmrazení: cena, strop, spotřeba', () => {
  assert.equal(buyFreeze(DEFAULT_SHOP, FREEZE_PRICE - 1).ok, false);
  let s = DEFAULT_SHOP;
  for (let i = 0; i < MAX_FREEZES; i++) {
    const r = buyFreeze(s, 999);
    assert.ok(r.ok);
    if (r.ok) s = r.state;
  }
  assert.equal(freezesLeft(s), MAX_FREEZES);
  assert.equal(buyFreeze(s, 999).ok, false, 'víc než strop ne');
  s = consumeFreeze(s, '2026-11-15');
  assert.equal(freezesLeft(s), MAX_FREEZES - 1);
  assert.equal(consumeFreeze(DEFAULT_SHOP, '2026-11-15'), DEFAULT_SHOP, 'bez zmrazení se nic nespotřebuje');
});

test('série: zmrazený den sérii drží, ale nepočítá se; zmrazí se jen když to pomůže', () => {
  const yesterday = dateKey(now - DAY);
  // jeden vynechaný den za týden pokryje běžné odpuštění, zmrazení se neplýtvá
  assert.equal(dayToFreeze(new Map<string, any>([day(0), day(2), day(3)]), now, new Set()), null);
  // odpuštění už spotřebované (dřívější mezera): zmrazení sérii prodlouží
  const days = new Map<string, any>([day(0), day(2), day(4)]);
  assert.equal(streakOf(days, now), 2);
  assert.equal(dayToFreeze(days, now, new Set()), yesterday);
  assert.equal(streakOf(days, now, new Set([yesterday])), 3, 'zmrazený den se nepočítá');
  // dnes nic: zmrazení se nepoužije
  assert.equal(dayToFreeze(new Map<string, any>([day(2), day(3)]), now, new Set()), null);
  // včera aktivní: není co zmrazit
  assert.equal(dayToFreeze(new Map<string, any>([day(0), day(1)]), now, new Set()), null);
  // dlouhá pauza: jedno zmrazení nepomůže
  assert.equal(dayToFreeze(new Map<string, any>([day(0), day(6), day(7)]), now, new Set()), null);
});

test('stav obchodu se čistí: neznámé hodnoty zmizí', () => {
  const s = sanitizeShop({ owned: ['bg-lisboa', 'x', 5], equipped: { hat: 'hat-bone', top: 'x' }, look: { skin: 99, hair: 'blbost', hairColor: 2 }, theme: 'x', freezesBought: -3, frozen: ['2026-11-15', 'x'] });
  assert.deepEqual(s.owned, ['bg-lisboa']);
  assert.deepEqual(s.equipped, { hat: 'hat-bone' });
  assert.equal(s.look.skin, 1);
  assert.equal(s.look.hair, 'short');
  assert.equal(s.look.hairColor, 2);
  assert.equal(s.theme, '');
  assert.equal(s.freezesBought, 0);
  assert.deepEqual(s.frozen, ['2026-11-15']);
  assert.deepEqual(sanitizeShop(null), DEFAULT_SHOP);
});

test('katalog: unikátní id, odměny bez ceny, motivy mají barvy', () => {
  assert.equal(new Set(ITEMS.map((i) => i.id)).size, ITEMS.length);
  for (const i of ITEMS) {
    if (i.price === 0) assert.ok(i.badge || i.level, `odměna ${i.id} musí mít podmínku`);
    if (i.kind === 'theme') assert.ok(ACCENTS[i.id], `motiv ${i.id} nemá barvy`);
    if (i.kind === 'avatar') assert.ok(i.slot);
  }
  assert.equal(Object.keys(accentVars(200, 80)).length, 11);
});

test('záloha obsahuje obchod a ošetří ho při načtení', () => {
  const src = { cards: new Map(), days: new Map(), tests: new Map() };
  const shop = { ...DEFAULT_SHOP, owned: ['bg-lisboa'], freezesBought: 1 };
  const r = parseBackup(JSON.stringify(buildBackup(src, { settings: {}, badgesSeen: [], shop }, new Date())));
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.backup.shop?.owned, ['bg-lisboa']);
  const old = parseBackup(JSON.stringify(buildBackup(src, { settings: {}, badgesSeen: [] }, new Date())));
  assert.ok(old.ok);
  if (old.ok) assert.equal(old.backup.shop, undefined);
});
