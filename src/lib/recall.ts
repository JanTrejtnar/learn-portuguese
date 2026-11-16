/** Aktivní vybavování: u dostatečně známých slovíček se při opakování místo otočení karty píše odpověď. */
import type { Word } from '../types';
import { isTypeable } from './quiz';
import type { CardState } from './srs';

export type RecallMode = 'off' | 'sometimes' | 'often';
export type RecallVariant = 'typing' | 'dictation';

/** Kolik opakování musí karta mít, aby se po ní chtělo psaní (nejdřív musí slovo poznat). */
export const RECALL_MIN_REPS = 2;
const SHARE: Record<RecallMode, number> = { off: 0, sometimes: 0.33, often: 0.7 };

/** Stabilní hash (stejná karta ve stejný den má vždy stejnou variantu). */
const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
};

export const recallVariant = (word: Word, state: CardState | undefined, mode: RecallMode, day: string): RecallVariant | null => {
  if (!state || state.reps < RECALL_MIN_REPS || mode === 'off' || !isTypeable(word)) return null;
  const r = hash(`${word.id}|${day}`);
  if (r >= SHARE[mode]) return null;
  return hash(`${day}|${word.id}`) < 0.5 ? 'typing' : 'dictation';
};
