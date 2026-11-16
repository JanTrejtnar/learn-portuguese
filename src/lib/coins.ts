/**
 * Mince: zisk se vždy odvozuje z pokroku (odznaky, denní cíle, úrovně, testy, scénáře, týdenní série),
 * nic se nepočítá z kliknutí, takže se nedá „farmit“. Zůstatek = zisk − utraceno (viz shop.ts).
 */
import { BADGES, badgeContext, type UnitRef } from './badges';
import type { Progress } from './db';

export type CoinTier = 10 | 25 | 50;

/** Odměna za odznak (výchozí 10). */
export const BADGE_COINS: Record<string, CoinTier> = {
  'words-50': 25, 'words-100': 25, 'mature-25': 25, 'streak-7': 25, 'goal-7': 25, perfect: 25, 'units-4': 25, 'actor-5': 25, 'level-5': 25,
  'words-250': 50, 'streak-30': 50, 'a1-done': 50, 'a2-done': 50,
};
export const COINS_PER_GOAL_DAY = 5;
export const COINS_PER_LEVEL = 20;
export const COINS_PER_TEST = 15;
export const COINS_PER_SCENARIO = 10;
export const COINS_PER_WEEK_STREAK = 15;

export interface CoinBreakdown {
  badges: number;
  goalDays: number;
  levels: number;
  tests: number;
  scenarios: number;
  weeks: number;
  total: number;
}

export const coinsEarned = (p: Progress, unitList: UnitRef[]): CoinBreakdown => {
  const c = badgeContext(p, unitList);
  const badges = BADGES.filter((b) => b.earned(c)).reduce((a, b) => a + (BADGE_COINS[b.id] ?? 10), 0);
  const parts = {
    badges,
    goalDays: c.goalDays * COINS_PER_GOAL_DAY,
    levels: (c.level - 1) * COINS_PER_LEVEL,
    tests: c.testsPassed * COINS_PER_TEST,
    scenarios: c.scenariosDone * COINS_PER_SCENARIO,
    weeks: Math.floor(c.bestStreak / 7) * COINS_PER_WEEK_STREAK,
  };
  return { ...parts, total: Object.values(parts).reduce((a, b) => a + b, 0) };
};
