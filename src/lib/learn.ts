/** Vedená relace „Projít lekci“: po dávkách se představí nová slova a hned se procvičí. */
import type { Word } from '../types';
import type { CardState } from './srs';

/** Kolik nových slov se probere v jedné relaci. */
export const LEARN_BATCH = 6;
/** Počet cvičení v jedné relaci. */
export const LEARN_QUESTIONS = 12;
/** Cvičení nad dialogem na konci poslední dávky lekce (jen když lekce dialog má). */
export const DIALOGUE_QUESTIONS = 4;

/** Další dávka: slova z lekce, která ještě nemají kartu (v pořadí lekce). */
export const pickLearnBatch = (lessonWords: Word[], cards: Map<string, CardState>, size: number = LEARN_BATCH): Word[] =>
  lessonWords.filter((w) => !cards.has(w.id)).slice(0, size);

export const learnRemaining = (lessonWords: Word[], cards: Map<string, CardState>): number =>
  lessonWords.filter((w) => !cards.has(w.id)).length;

export type LearnTarget =
  | { kind: 'learn'; unitId: string; lessonId: string; lessonTitle: string }
  | { kind: 'test'; unitId: string; unitTitle: string };

/**
 * „Další krok“ na úvodní stránce: v první odemčené a nesplněné jednotce první lekce s ještě nenaučenými slovy;
 * když jsou všechna slova probrána, další krok je dokončení jednotky. `null` = nic dalšího (vše splněno).
 */
export const nextLearnTarget = (
  units: { id: string; title: string; lessons: { id: string; title: string; words: Word[] }[] }[],
  cards: Map<string, CardState>,
  isOpen: (unitId: string) => boolean,
  isDone: (unitId: string) => boolean,
): LearnTarget | null => {
  const unit = units.find((u) => isOpen(u.id) && !isDone(u.id));
  if (!unit) return null;
  const lesson = unit.lessons.find((l) => learnRemaining(l.words, cards) > 0);
  return lesson
    ? { kind: 'learn', unitId: unit.id, lessonId: lesson.id, lessonTitle: lesson.title }
    : { kind: 'test', unitId: unit.id, unitTitle: unit.title };
};
