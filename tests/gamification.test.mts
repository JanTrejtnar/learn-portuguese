import { test } from 'node:test';
import assert from 'node:assert/strict';
import { awardXp, levelInfo, totalXp, xpForLevel, XP_GOAL_BONUS } from '../src/lib/xp.ts';
import { bestStreak, streakOf } from '../src/lib/stats.ts';
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

test('série: dnešek bez aktivity nepřeruší, mezera ano', () => {
  const days = new Map<string, any>([day(1), day(2), day(3), day(5)]);
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
