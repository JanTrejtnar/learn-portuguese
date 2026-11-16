import type { Lesson, Unit, Word } from '../types';
import { unit1 } from './a1/unit1';
import { unit2 } from './a1/unit2';
import { unit3 } from './a1/unit3';
import { unit4 } from './a1/unit4';
import { unit5 } from './a1/unit5';
import { unit6 } from './a1/unit6';
import { unit7 } from './a1/unit7';
import { unit8 } from './a1/unit8';
import { unit1 as a2unit1 } from './a2/unit1';
import { unit2 as a2unit2 } from './a2/unit2';
import { unit3 as a2unit3 } from './a2/unit3';
import { unit4 as a2unit4 } from './a2/unit4';
import { unit5 as a2unit5 } from './a2/unit5';
import { unit6 as a2unit6 } from './a2/unit6';
import { unit7 as a2unit7 } from './a2/unit7';
import { unit8 as a2unit8 } from './a2/unit8';
import { unit1 as b1unit1 } from './b1/unit1';
import { unit2 as b1unit2 } from './b1/unit2';
import { unit3 as b1unit3 } from './b1/unit3';
import { unit4 as b1unit4 } from './b1/unit4';
import { unit5 as b1unit5 } from './b1/unit5';
import { unit6 as b1unit6 } from './b1/unit6';
import { unit7 as b1unit7 } from './b1/unit7';
import { unit8 as b1unit8 } from './b1/unit8';
import { isUnitUnlocked } from '../lib/unlock';
import type { TestResult } from '../lib/db';

/** Všechny jednotky seřazené podle úrovně a pořadí. Další jednotky se přidávají sem. */
export const units: Unit[] = [unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8, a2unit1, a2unit2, a2unit3, a2unit4, a2unit5, a2unit6, a2unit7, a2unit8, b1unit1, b1unit2, b1unit3, b1unit4, b1unit5, b1unit6, b1unit7, b1unit8].sort((a, b) => a.level.localeCompare(b.level) || a.order - b.order);

/** Zkrácené označení jednotky, např. „A1.3“. */
export const unitCode = (u: Unit): string => `${u.level}.${u.order}`;

export const getUnit = (id: string): Unit | undefined => units.find((u) => u.id === id);

export const getLesson = (id: string): { unit: Unit; lesson: Lesson } | undefined => {
  for (const unit of units) {
    const lesson = unit.lessons.find((l) => l.id === id);
    if (lesson) return { unit, lesson };
  }
  return undefined;
};

/** Stejné slovíčko (pt + cs), které se objeví ve více lekcích, se v souhrnných balíčcích počítá jen jednou (první výskyt). */
export const dedupeWords = (words: Word[]): Word[] => {
  const seen = new Set<string>();
  return words.filter((w) => {
    const key = `${w.pt.toLowerCase()}|${w.cs.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const allWords = (): Word[] => dedupeWords(units.flatMap((u) => u.lessons.flatMap((l) => l.words)));

export interface Deck {
  id: string;
  title: string;
  words: Word[];
}

/** Balíček karet: 'all' = vše, id jednotky nebo id lekce. */
export const getDeck = (id: string): Deck | undefined => {
  if (id === 'all') return { id, title: 'Všechna slovíčka', words: allWords() };
  const unit = getUnit(id);
  if (unit) return { id, title: `Jednotka ${unitCode(unit)}: ${unit.title}`, words: unit.lessons.flatMap((l) => l.words) };
  const found = getLesson(id);
  if (found) return { id, title: found.lesson.title, words: found.lesson.words };
  return undefined;
};

/** Slovíčka z odemčených jednotek (pro „všechny karty“ a denní frontu). */
export const unlockedWords = (tests: Map<string, TestResult>): Word[] =>
  dedupeWords(units.filter((u) => isUnitUnlocked(units, u.id, tests)).flatMap((u) => u.lessons.flatMap((l) => l.words)));

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
  if (unit) return { id, kind: 'unit', title: `Dokončit jednotku ${unitCode(unit)}: ${unit.title}`, unitId: unit.id, lessons: unit.lessons, words: unit.lessons.flatMap((l) => l.words) };
  const found = getLesson(id);
  if (found) return { id, kind: 'lesson', title: `Test lekce: ${found.lesson.title}`, unitId: found.unit.id, lessons: [found.lesson], words: found.lesson.words };
  return undefined;
};
