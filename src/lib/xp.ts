import type { DayStats } from './db';
import { dateKey, type Rating } from './srs';

/** XP za jedno hodnocení karty. */
export const xpForRating: Record<Rating, number> = { again: 1, hard: 2, good: 3, easy: 4 };

export const XP_PER_CORRECT_ANSWER = 3;
export const XP_TEST_FIRST_PASS = 20;
export const XP_TEST_REPASS = 10;
export const XP_TEST_PERFECT = 10;
export const XP_GOAL_BONUS = 20;

export const GOAL_OPTIONS = [
  { xp: 20, label: 'Pohoda', hint: '≈ 7 karet' },
  { xp: 40, label: 'Normální', hint: '≈ 13 karet' },
  { xp: 80, label: 'Intenzivní', hint: '≈ 27 karet' },
] as const;
export const DEFAULT_GOAL = 40;

export const LEVEL_NAMES = ['Turista', 'Curioso', 'Aprendiz', 'Viajante', 'Conversador', 'Lisboeta', 'Portuense', 'Alentejano', 'Algarvio', 'Mestre'];

/** Kolik XP je potřeba na dosažení úrovně n (n ≥ 1): 0, 50, 150, 300, 500, … */
export const xpForLevel = (n: number): number => (25 * n * (n - 1));

export interface LevelInfo {
  level: number;
  name: string;
  /** XP v rámci aktuální úrovně. */
  into: number;
  /** Kolik XP je na celou aktuální úroveň. */
  span: number;
}

export const levelInfo = (xp: number): LevelInfo => {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level += 1;
  const from = xpForLevel(level);
  return { level, name: LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length) - 1]!, into: xp - from, span: xpForLevel(level + 1) - from };
};

export const totalXp = (days: Map<string, DayStats>): number => {
  let sum = 0;
  for (const d of days.values()) sum += d.xp ?? 0;
  return sum;
};

export const xpToday = (days: Map<string, DayStats>, now: number): number => days.get(dateKey(now))?.xp ?? 0;

export interface Award {
  day: DayStats;
  gained: number;
  /** Při tomto přidání byl poprvé dnes splněn denní cíl. */
  goalJustReached: boolean;
}

/** Přičte XP do dnešního dne (a případně bonus za denní cíl). Nemění vstupní objekt. */
export const awardXp = (days: Map<string, DayStats>, now: number, amount: number, goal: number): Award => {
  const key = dateKey(now);
  const day: DayStats = { ...(days.get(key) ?? { date: key, reviews: 0, again: 0, newCards: 0 }) };
  const before = day.xp ?? 0;
  day.xp = before + amount;
  let gained = amount;
  let goalJustReached = false;
  if (!day.goalReached && day.xp >= goal) {
    day.goalReached = true;
    day.xp += XP_GOAL_BONUS;
    gained += XP_GOAL_BONUS;
    goalJustReached = true;
  }
  return { day, gained, goalJustReached };
};
