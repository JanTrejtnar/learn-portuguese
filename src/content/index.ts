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
