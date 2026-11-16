import { test } from 'node:test';
import assert from 'node:assert/strict';
import { backupFilename, buildBackup, parseBackup, summarizeBackup } from '../src/lib/backup.ts';

const card = { id: 'u1l1-ola', ease: 2.5, interval: 3, reps: 2, lapses: 0, due: 1, last: 1, introduced: 1 };
const day = { date: '2026-11-16', reviews: 5, again: 1, newCards: 2, xp: 30, goalReached: false };
const test1 = { id: 'a1-u1', best: 0.9, passed: true, attempts: 1, last: 5 };
const src = { cards: new Map([[card.id, card]]), days: new Map([[day.date, day]]), tests: new Map([[test1.id, test1]]) };

test('záloha → text → načtení vrátí totéž', () => {
  const b = buildBackup(src, { settings: { dailyGoal: 40 }, badgesSeen: ['first-card'] }, new Date('2026-11-16T10:00:00Z'));
  const r = parseBackup(JSON.stringify(b));
  assert.ok(r.ok);
  if (r.ok) {
    assert.deepEqual(r.backup.cards, [card]);
    assert.deepEqual(r.backup.days, [day]);
    assert.deepEqual(r.backup.tests, [test1]);
    assert.deepEqual(r.backup.settings, { dailyGoal: 40 });
    assert.deepEqual(summarizeBackup(r.backup), { cards: 1, days: 1, tests: 1, xp: 30 });
  }
  assert.equal(backupFilename(new Date('2026-11-16T10:00:00Z')), 'aprender-portugues-zaloha-2026-11-16.json');
});

test('záloha: odmítne cizí, poškozené a nesmyslná data', () => {
  const good = buildBackup(src, { settings: {}, badgesSeen: [] }, new Date());
  const bad = (mut: (b: any) => void) => {
    const b = JSON.parse(JSON.stringify(good));
    mut(b);
    return parseBackup(JSON.stringify(b));
  };
  assert.equal(parseBackup('not json').ok, false);
  assert.equal(parseBackup('{"app":"jina"}').ok, false);
  assert.equal(bad((b) => (b.version = 99)).ok, false);
  assert.equal(bad((b) => (b.cards[0].ease = 'x')).ok, false);
  assert.equal(bad((b) => (b.cards[0].id = 5)).ok, false);
  assert.equal(bad((b) => (b.days[0].date = '16.11.2026')).ok, false);
  assert.equal(bad((b) => (b.tests[0].best = 7)).ok, false);
  assert.equal(bad((b) => (b.badgesSeen = [1])).ok, false);
  assert.equal(bad((b) => delete b.cards).ok, false);
  assert.equal(bad(() => {}).ok, true);
  // prototype pollution / neobvyklé klíče nejsou problém, protože se kopírují jen známá pole
  const r = parseBackup(JSON.stringify({ ...good, settings: { __proto__: { evil: 1 } } }));
  assert.ok(r.ok);
});

import { sanitizeSettings } from '../src/lib/backup.ts';
test('nastavení: propustí jen známé klíče se správným typem', () => {
  const out = sanitizeSettings({ direction: 'cs-pt', autoplay: false, dailyGoal: 80, newPerDay: -3, shuffle: 'ano', evil: '<script>', showTranslations: true });
  assert.deepEqual(out, { direction: 'cs-pt', autoplay: false, dailyGoal: 80, showTranslations: true });
});
