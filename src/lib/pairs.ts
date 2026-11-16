import type { MinimalPair } from '../content/pairs';

export interface PairQuestion {
  id: string;
  pair: MinimalPair;
  /** Které slovo se přehraje (a = první, b = druhé). */
  played: 'a' | 'b';
}

const shuffle = <T,>(arr: T[], rng: () => number): T[] => {
  const x = [...arr];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [x[i], x[j]] = [x[j]!, x[i]!];
  }
  return x;
};

/** Kolo poslechu: n různých párů, u každého se náhodně přehraje jedno z dvojice. */
export const makePairRound = (pairs: MinimalPair[], n = 10, rng: () => number = Math.random): PairQuestion[] =>
  shuffle(pairs, rng)
    .slice(0, n)
    .map((pair, i) => ({ id: `p${i}`, pair, played: rng() < 0.5 ? 'a' : 'b' }));
