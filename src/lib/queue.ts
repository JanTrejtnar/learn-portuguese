import type { Word } from '../types';
import { dateKey, type CardState } from './srs';
import type { DayStats } from './db';

export const shuffled = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};

export const newIntroducedToday = (days: Map<string, DayStats>, now: number): number => days.get(dateKey(now))?.newCards ?? 0;

export interface BuiltQueue {
  due: Word[];
  fresh: Word[];
}

/** Fronta: nejdřív karty k opakování (nejstarší termín první), pak nové do denního limitu. */
export const buildQueue = (
  words: Word[],
  cards: Map<string, CardState>,
  newAllowance: number,
  now: number,
  shuffle: boolean,
): BuiltQueue => {
  const due = words
    .filter((w) => {
      const s = cards.get(w.id);
      return s !== undefined && s.due <= now;
    })
    .sort((a, b) => cards.get(a.id)!.due - cards.get(b.id)!.due);
  const unseen = words.filter((w) => !cards.has(w.id));
  const fresh = unseen.slice(0, Math.max(0, newAllowance));
  return shuffle ? { due: shuffled(due), fresh: shuffled(fresh) } : { due, fresh };
};
