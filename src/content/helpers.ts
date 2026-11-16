import type { ClozeItem, Word } from '../types';

type Extra = Omit<Word, 'id' | 'pt' | 'cs'>;

/** Zkratka pro tvorbu slovíčka: w('u1l1-ola', 'Olá', 'Ahoj', { … }) */
export const w = (id: string, pt: string, cs: string, extra: Extra = {}): Word => ({ id, pt, cs, ...extra });

/** Zkratka pro doplňovací cvičení: c('Eu ___ cansado.', 'Jsem unavený.', 'estou', ['sou', 'está']) */
export const c = (pt: string, cs: string, answer: string, distractors: string[]): ClozeItem => ({ pt, cs, answer, distractors });
