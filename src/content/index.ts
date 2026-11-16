import type { Lesson, Unit, Word } from '../types';
import { unit1 } from './a1/unit1';
import { unit2 } from './a1/unit2';

/** Všechny jednotky seřazené podle úrovně a pořadí. Další jednotky se přidávají sem. */
export const units: Unit[] = [unit1, unit2].sort((a, b) => a.level.localeCompare(b.level) || a.order - b.order);

export const getUnit = (id: string): Unit | undefined => units.find((u) => u.id === id);

export const getLesson = (id: string): { unit: Unit; lesson: Lesson } | undefined => {
  for (const unit of units) {
    const lesson = unit.lessons.find((l) => l.id === id);
    if (lesson) return { unit, lesson };
  }
  return undefined;
};

export const allWords = (): Word[] => units.flatMap((u) => u.lessons.flatMap((l) => l.words));

export interface Deck {
  id: string;
  title: string;
  words: Word[];
}

/** Balíček karet: 'all' = vše, id jednotky nebo id lekce. */
export const getDeck = (id: string): Deck | undefined => {
  if (id === 'all') return { id, title: 'Všechna slovíčka', words: allWords() };
  const unit = getUnit(id);
  if (unit) return { id, title: `Jednotka ${unit.order}: ${unit.title}`, words: unit.lessons.flatMap((l) => l.words) };
  const found = getLesson(id);
  if (found) return { id, title: found.lesson.title, words: found.lesson.words };
  return undefined;
};
