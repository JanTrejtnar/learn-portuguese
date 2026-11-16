/** Vedená relace „Projít lekci“: po dávkách se představí nová slova a hned se procvičí. */
import type { Word } from '../types';
import type { CardState } from './srs';

/** Kolik nových slov se probere v jedné relaci. */
export const LEARN_BATCH = 6;
/** Počet cvičení v jedné relaci. */
export const LEARN_QUESTIONS = 12;

/** Další dávka: slova z lekce, která ještě nemají kartu (v pořadí lekce). */
export const pickLearnBatch = (lessonWords: Word[], cards: Map<string, CardState>, size: number = LEARN_BATCH): Word[] =>
  lessonWords.filter((w) => !cards.has(w.id)).slice(0, size);

export const learnRemaining = (lessonWords: Word[], cards: Map<string, CardState>): number =>
  lessonWords.filter((w) => !cards.has(w.id)).length;
