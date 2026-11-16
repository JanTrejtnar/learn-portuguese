import type { Word } from '../types';

type Extra = Omit<Word, 'id' | 'pt' | 'cs'>;

/** Zkratka pro tvorbu slovíčka: w('u1l1-ola', 'Olá', 'Ahoj', { … }) */
export const w = (id: string, pt: string, cs: string, extra: Extra = {}): Word => ({ id, pt, cs, ...extra });
