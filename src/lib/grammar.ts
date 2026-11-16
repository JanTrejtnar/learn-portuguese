/** Gramatické karty: věty s mezerou (cloze) z lekcí se opakují stejným plánem jako slovíčka. */
import type { ClozeItem, Unit } from '../types';
import { shuffled } from './queue';
import type { CardState } from './srs';

export const GRAMMAR_PREFIX = 'cl:';
/** Kolik nových vět se přidá do jednoho sezení. */
export const GRAMMAR_NEW_PER_SESSION = 6;

export interface GrammarCard {
  id: string;
  lessonId: string;
  lessonTitle: string;
  item: ClozeItem;
}

/** Všechny věty z lekcí v zadaných jednotkách; id = cl:<id lekce>:<pořadí>. */
export const grammarCards = (units: Unit[]): GrammarCard[] =>
  units.flatMap((u) => u.lessons.flatMap((l) => (l.cloze ?? []).map((item, i) => ({ id: `${GRAMMAR_PREFIX}${l.id}:${i}`, lessonId: l.id, lessonTitle: l.title, item }))));

export interface GrammarQueue {
  due: GrammarCard[];
  fresh: GrammarCard[];
}

export const buildGrammarQueue = (cards: GrammarCard[], states: Map<string, CardState>, now: number, newLimit = GRAMMAR_NEW_PER_SESSION): GrammarQueue => {
  const due = cards.filter((c) => (states.get(c.id)?.due ?? Infinity) <= now).sort((a, b) => states.get(a.id)!.due - states.get(b.id)!.due);
  const fresh = shuffled(cards.filter((c) => !states.has(c.id))).slice(0, Math.max(0, newLimit));
  return { due, fresh };
};
