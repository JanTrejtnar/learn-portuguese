import type { TestResult } from './db';
import type { Unit } from '../types';

/** První jednotka je odemčená vždy; každá další po splnění testu předchozí (nebo ručním odemčení). */
export const isUnitUnlocked = (units: Unit[], unitId: string, tests: Map<string, TestResult>): boolean => {
  const i = units.findIndex((u) => u.id === unitId);
  if (i <= 0) return i === 0;
  return tests.get(units[i - 1]!.id)?.passed === true;
};
