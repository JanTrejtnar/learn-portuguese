import type { ClozeItem, Word } from '../types';
import { withExample } from './examples';
import { withUsage } from './usage';

type Extra = Omit<Word, 'id' | 'pt' | 'cs'>;

/** Zkratka pro tvorbu slovíčka: w('u1l1-ola', 'Olá', 'Ahoj', { … }) */
export const w = (id: string, pt: string, cs: string, extra: Extra = {}): Word => withExample(withUsage({ id, pt, cs, ...extra }));

/** Zkratka pro doplňovací cvičení: c('Eu ___ cansado.', 'Jsem unavený.', 'estou', ['sou', 'está']) */
export const c = (pt: string, cs: string, answer: string, distractors: string[]): ClozeItem => ({ pt, cs, answer, distractors });

/** Slovíčko s příkladem: wx('b1u1l1-aldeia', 'a aldeia', 'vesnice', 'noun', 'Vivia numa aldeia.', 'Bydlel(a) jsem ve vesnici.', { gender: 'f' }) */
export const wx = (id: string, pt: string, cs: string, pos: NonNullable<Word['pos']>, ptEx: string, csEx: string, extra: Extra = {}): Word =>
  w(id, pt, cs, { pos, example: { pt: ptEx, cs: csEx }, ...extra });
