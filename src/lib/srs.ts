/**
 * Zjednodušený SM-2 (čistá logika bez závislostí – snadno testovatelná).
 * Karta je buď „nová“ (bez stavu), nebo má CardState s termínem `due`.
 */
export type Rating = 'again' | 'hard' | 'good' | 'easy';

export interface CardState {
  /** ID slovíčka (Word.id). */
  id: string;
  /** Faktor snadnosti (min. 1.3). */
  ease: number;
  /** Aktuální interval ve dnech; 0 = karta se (znovu) učí. */
  interval: number;
  /** Počet úspěšných opakování v řadě. */
  reps: number;
  /** Kolikrát jsem kartu po zvládnutí zapomněl. */
  lapses: number;
  /** Kdy má být karta příště (ms, epoch). */
  due: number;
  /** Poslední hodnocení (ms). */
  last: number;
  /** Kdy byla poprvé zobrazena (ms). */
  introduced: number;
}

export const MINUTE = 60_000;
export const DAY = 86_400_000;
export const LEARN_STEP = 10 * MINUTE;
const MIN_EASE = 1.3;

export const dayStart = (ts: number): number => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Lokální datum jako klíč 'YYYY-MM-DD'. */
export const dateKey = (ts: number): string => {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/** Termín po `days` dnech = začátek toho dne (karta je k dispozici hned ráno). */
const dueInDays = (now: number, days: number): number => {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.getTime();
};

export const newState = (id: string, now: number): CardState => ({
  id, ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now, last: now, introduced: now,
});

export const schedule = (prev: CardState | undefined, id: string, rating: Rating, now: number): CardState => {
  const s: CardState = { ...(prev ?? newState(id, now)), last: now };

  switch (rating) {
    case 'again':
      if (s.reps > 0) s.lapses += 1;
      s.ease = Math.max(MIN_EASE, s.ease - 0.2);
      s.reps = 0;
      s.interval = 0;
      s.due = now + LEARN_STEP;
      return s;
    case 'hard':
      s.ease = Math.max(MIN_EASE, s.ease - 0.15);
      s.interval = s.reps === 0 ? 1 : Math.max(1, Math.round(Math.max(s.interval, 1) * 1.2));
      break;
    case 'good':
      s.interval = s.reps === 0 ? 1 : s.reps === 1 ? 3 : Math.max(s.interval + 1, Math.round(s.interval * s.ease));
      break;
    case 'easy':
      s.ease += 0.15;
      s.interval = s.reps === 0 ? 4 : Math.max(s.interval + 2, Math.round(s.interval * s.ease * 1.3));
      break;
  }
  s.reps += 1;
  s.due = dueInDays(now, s.interval);
  return s;
};

export const formatInterval = (from: number, to: number): string => {
  const ms = to - from;
  if (ms < DAY) return `${Math.max(1, Math.round(ms / MINUTE))} min`;
  const days = Math.round(ms / DAY);
  if (days < 30) return `${days} d`;
  return `${Math.round(days / 30)} měs.`;
};

/** Popisky „za jak dlouho“ pro všechna čtyři tlačítka. */
export const previewIntervals = (prev: CardState | undefined, id: string, now: number): Record<Rating, string> => {
  const out = {} as Record<Rating, string>;
  for (const r of ['again', 'hard', 'good', 'easy'] as const) out[r] = formatInterval(now, schedule(prev, id, r, now).due);
  return out;
};

export type Maturity = 'new' | 'learning' | 'young' | 'mature';
export const maturity = (s: CardState | undefined): Maturity => {
  if (!s) return 'new';
  if (s.interval === 0) return 'learning';
  return s.interval >= 21 ? 'mature' : 'young';
};
