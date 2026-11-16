import { test } from 'node:test';
import assert from 'node:assert/strict';
import { awardXp, levelInfo, totalXp, xpForLevel, XP_GOAL_BONUS } from '../src/lib/xp.ts';
import { bestStreak, streakOf, weekSummary } from '../src/lib/stats.ts';
import { BADGES, badgeContext } from '../src/lib/badges.ts';
import { dateKey, DAY } from '../src/lib/srs.ts';

const now = new Date(2026, 10, 16, 12, 0).getTime();
const day = (offset: number, extra: object = {}) => {
  const date = dateKey(now - offset * DAY);
  return [date, { date, reviews: 5, again: 0, newCards: 0, ...extra }] as const;
};

test('úrovně: 0, 50, 150, 300 XP', () => {
  assert.equal(xpForLevel(1), 0);
  assert.equal(xpForLevel(2), 50);
  assert.equal(xpForLevel(3), 150);
  assert.equal(levelInfo(0).level, 1);
  assert.equal(levelInfo(49).level, 1);
  assert.equal(levelInfo(50).level, 2);
  assert.equal(levelInfo(299).level, 3);
  const l = levelInfo(75);
  assert.equal(l.into, 25);
  assert.equal(l.span, 100);
});

test('XP: denní cíl dá bonus právě jednou', () => {
  const days = new Map<string, any>();
  let a = awardXp(days, now, 30, 40);
  assert.equal(a.goalJustReached, false);
  days.set(a.day.date, a.day);
  a = awardXp(days, now, 15, 40);
  assert.equal(a.goalJustReached, true);
  assert.equal(a.gained, 15 + XP_GOAL_BONUS);
  days.set(a.day.date, a.day);
  a = awardXp(days, now, 10, 40);
  assert.equal(a.goalJustReached, false);
  days.set(a.day.date, a.day);
  assert.equal(totalXp(days), 30 + 15 + XP_GOAL_BONUS + 10);
});

test('série: jeden vynechaný den se odpustí, dva ne', () => {
  const one = new Map<string, any>([day(1), day(2), day(4), day(5)]);
  assert.equal(streakOf(one, now), 4);
  const two = new Map<string, any>([day(1), day(2), day(5), day(6)]);
  assert.equal(streakOf(two, now), 2);
  // druhé odpuštění do týdne už ne
  const again = new Map<string, any>([day(1), day(3), day(5)]);
  assert.equal(streakOf(again, now), 2);
});

test('série: dnešek bez aktivity nepřeruší, mezera ano', () => {
  const days = new Map<string, any>([day(1), day(2), day(3), day(6)]);
  assert.equal(streakOf(days, now), 3);
  days.set(...day(0));
  assert.equal(streakOf(days, now), 4);
  assert.equal(bestStreak(days), 4);
  // den jen s XP z testu (bez opakování) se počítá
  const d2 = new Map<string, any>([day(0, { reviews: 0, xp: 12 }), day(1, { reviews: 0, xp: 5 })]);
  assert.equal(streakOf(d2, now), 2);
});

test('odznaky se odvozují z pokroku', () => {
  const p: any = {
    cards: new Map([['a', { id: 'a', interval: 30, ease: 2.5 }], ['b', { id: 'b', interval: 1, ease: 2.5 }]]),
    days: new Map<string, any>([day(0, { goalReached: true, xp: 50 })]),
    tests: new Map([['u1', { id: 'u1', passed: true, best: 1 }], ['u2', { id: 'u2', passed: true, best: 0.9, skipped: true }]]),
  };
  const ctx = badgeContext(p, [{ id: 'u1', level: 'A1' }, { id: 'u2', level: 'A1' }]);
  assert.equal(ctx.seen, 2);
  assert.equal(ctx.mature, 1);
  assert.equal(ctx.unitTestsPassed, 1, 'ručně odemčená jednotka se nepočítá');
  const earned = BADGES.filter((b) => b.earned(ctx)).map((b) => b.id);
  assert.ok(earned.includes('first-card') && earned.includes('goal-1') && earned.includes('perfect'));
  assert.ok(!earned.includes('a1-done') && !earned.includes('words-10'));
  assert.equal(new Set(BADGES.map((b) => b.id)).size, BADGES.length);
});

test('A2 Completo vyžaduje všech 8 jednotek A2, A1 Completo jen A1', () => {
  const a1 = Array.from({ length: 8 }, (_, i) => ({ id: `a1-u${i + 1}`, level: 'A1' }));
  const a2 = Array.from({ length: 8 }, (_, i) => ({ id: `a2-u${i + 1}`, level: 'A2' }));
  const passed = (ids: string[]) => new Map(ids.map((id) => [id, { id, passed: true, best: 0.9, attempts: 1, last: 1 }]));
  const prog = (ids: string[]): any => ({ cards: new Map(), days: new Map(), tests: passed(ids) });
  const earned = (ids: string[]) => BADGES.filter((b) => b.earned(badgeContext(prog(ids), [...a1, ...a2]))).map((b) => b.id);
  assert.ok(earned(a1.map((u) => u.id)).includes('a1-done'));
  assert.ok(!earned(a1.map((u) => u.id)).includes('a2-done'));
  assert.ok(!earned([...a1, ...a2.slice(0, 7)].map((u) => u.id)).includes('a2-done'));
  assert.ok(earned([...a1, ...a2].map((u) => u.id)).includes('a2-done'));
  assert.ok(!earned(a2.map((u) => u.id)).includes('a1-done'));
});

test('týdenní souhrn počítá jen posledních 7 dní', () => {
  const days = new Map<string, any>([
    day(0, { reviews: 10, again: 2, newCards: 3, xp: 30 }),
    day(3, { reviews: 10, again: 3, newCards: 2, xp: 20 }),
    day(7, { reviews: 99, again: 99, newCards: 99, xp: 99 }), // mimo týden
  ]);
  const w = weekSummary(days, now);
  assert.deepEqual(w, { activeDays: 2, reviews: 20, newCards: 5, xp: 50, retention: 75 });
  assert.equal(weekSummary(new Map(), now).retention, null);
});

test('B1 Completo vyžaduje všech 8 jednotek B1', () => {
  const b1 = Array.from({ length: 8 }, (_, i) => ({ id: `b1-u${i + 1}`, level: 'B1' }));
  const passed = (ids: string[]) => new Map(ids.map((id) => [id, { id, passed: true, best: 0.9, attempts: 1, last: 1 }]));
  const earned = (ids: string[]) => BADGES.filter((b) => b.earned(badgeContext({ cards: new Map(), days: new Map(), tests: passed(ids) } as any, b1))).map((b) => b.id);
  assert.ok(!earned(b1.slice(0, 7).map((u) => u.id)).includes('b1-done'));
  assert.ok(earned(b1.map((u) => u.id)).includes('b1-done'));
});
