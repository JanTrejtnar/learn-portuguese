import type { Lesson, Unit, Word } from '../types';
import { unit1 } from './a1/unit1';
import { unit2 } from './a1/unit2';
import { unit3 } from './a1/unit3';
import { unit4 } from './a1/unit4';
import { unit5 } from './a1/unit5';
import { isUnitUnlocked } from '../lib/unlock';
import type { TestResult } from '../lib/db';

/** Všechny jednotky seřazené podle úrovně a pořadí. Další jednotky se přidávají sem. */
export const units: Unit[] = [unit1, unit2, unit3, unit4, unit5].sort((a, b) => a.level.localeCompare(b.level) || a.order - b.order);

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

/** Slovíčka z odemčených jednotek (pro „všechny karty“ a denní frontu). */
export const unlockedWords = (tests: Map<string, TestResult>): Word[] =>
  units.filter((u) => isUnitUnlocked(units, u.id, tests)).flatMap((u) => u.lessons.flatMap((l) => l.words));

export const unitUnlocked = (unitId: string, tests: Map<string, TestResult>): boolean => isUnitUnlocked(units, unitId, tests);

export interface TestScope {
  id: string;
  kind: 'lesson' | 'unit';
  title: string;
  unitId: string;
  lessons: Lesson[];
  words: Word[];
}

export const getTestScope = (id: string): TestScope | undefined => {
  const unit = getUnit(id);
  if (unit) return { id, kind: 'unit', title: `Test jednotky ${unit.order}: ${unit.title}`, unitId: unit.id, lessons: unit.lessons, words: unit.lessons.flatMap((l) => l.words) };
  const found = getLesson(id);
  if (found) return { id, kind: 'lesson', title: `Test lekce: ${found.lesson.title}`, unitId: found.unit.id, lessons: [found.lesson], words: found.lesson.words };
  return undefined;
};
