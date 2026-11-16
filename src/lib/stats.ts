import type { DayStats } from './db';
import { DAY, dateKey, dayStart } from './srs';

type Days = Map<string, DayStats>;

/** Den se počítá do série, pokud v něm bylo opakování nebo získané XP (např. test). */
export const isActive = (d: DayStats | undefined): boolean => !!d && (d.reviews > 0 || (d.xp ?? 0) > 0);

/** Po kolika dnech se „odpuštění“ jednoho vynechaného dne obnoví. */
export const FORGIVE_EVERY = 7;

/**
 * Aktuální série dní v řadě. Dnešek bez aktivity sérii nepřerušuje (ještě je čas).
 * Jeden vynechaný den uprostřed série se odpustí (nejvýš jednou za FORGIVE_EVERY dní);
 * odpuštěný den se do čísla série nepočítá.
 */
export const streakOf = (days: Days, now: number, frozen?: ReadonlySet<string>): number => {
  let streak = 0;
  let cursor = dayStart(now);
  if (!isActive(days.get(dateKey(cursor)))) cursor -= DAY;
  let sinceGap = FORGIVE_EVERY; // dní od posledního odpuštění
  for (;;) {
    if (isActive(days.get(dateKey(cursor)))) {
      streak += 1;
      sinceGap += 1;
    } else if (frozen?.has(dateKey(cursor))) {
      sinceGap += 1; // zmrazený den sérii drží, ale nepočítá se
    } else if (streak > 0 && sinceGap >= FORGIVE_EVERY && isActive(days.get(dateKey(dayStart(cursor - 1))))) {
      sinceGap = 0; // vynechaný den se odpustí
    } else {
      break;
    }
    cursor = dayStart(cursor - 1);
  }
  return streak;
};

/** Je série „v ohrožení“? Včera se nic nedělo a dnes zatím také ne. */
export const streakAtRisk = (days: Days, now: number, frozen?: ReadonlySet<string>): boolean => {
  const today = dayStart(now);
  return streakOf(days, now, frozen) > 0 && !isActive(days.get(dateKey(today)));
};

/** Nejdelší série za celou dobu. */
export const bestStreak = (days: Days): number => {
  const keys = [...days.values()].filter(isActive).map((d) => d.date).sort();
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const k of keys) {
    const [y, m, d] = k.split('-').map(Number);
    const ts = new Date(y!, m! - 1, d!).getTime();
    run = prev !== null && Math.round((ts - prev) / DAY) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = ts;
  }
  return best;
};

/**
 * Který včerejší den by zmrazení zachránilo? Vrací jeho datum, pokud dnes už něco proběhlo,
 * včera ne a zmrazení (na rozdíl od běžného odpuštění) sérii prodlouží. Jinak `null`.
 */
export const dayToFreeze = (days: Days, now: number, frozen: ReadonlySet<string>): string | null => {
  const today = dayStart(now);
  if (!isActive(days.get(dateKey(today)))) return null;
  const yesterday = dateKey(today - DAY);
  if (isActive(days.get(yesterday)) || frozen.has(yesterday)) return null;
  const before = streakOf(days, now, frozen);
  const after = streakOf(days, now, new Set([...frozen, yesterday]));
  return after > before ? yesterday : null;
};

export interface WeekSummary {
  activeDays: number;
  reviews: number;
  newCards: number;
  xp: number;
  /** Úspěšnost v % (null, když nebylo žádné hodnocení). */
  retention: number | null;
}

/** Souhrn posledních 7 dní včetně dneška. */
export const weekSummary = (days: Days, now: number): WeekSummary => {
  const out = { activeDays: 0, reviews: 0, newCards: 0, xp: 0, again: 0 };
  for (let i = 0; i < 7; i++) {
    const d = days.get(dateKey(dayStart(now) - i * DAY));
    if (!d) continue;
    if (isActive(d)) out.activeDays += 1;
    out.reviews += d.reviews;
    out.newCards += d.newCards;
    out.xp += d.xp ?? 0;
    out.again += d.again;
  }
  return { activeDays: out.activeDays, reviews: out.reviews, newCards: out.newCards, xp: out.xp, retention: out.reviews > 0 ? Math.round(((out.reviews - out.again) / out.reviews) * 100) : null };
};
