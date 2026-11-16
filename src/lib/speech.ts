/** Porovnání vyslovené věty s cílovou (pro cvičení mluvení). Čistá logika. */

/** Bez velkých písmen, diakritiky a interpunkce. Pomlčka rozděluje slova (chamo-me → chamo me). */
export const normalizeSpeech = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/-/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

export interface WordResult {
  word: string;
  matched: boolean;
}

export interface SpeechComparison {
  /** 0–1: podíl cílových slov, která zazněla ve správném pořadí. */
  score: number;
  words: WordResult[];
}

const lcsMatches = (a: string[], b: string[]): Set<number> => {
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) dp[i]![j] = a[i - 1] === b[j - 1] ? dp[i - 1]![j - 1]! + 1 : Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
  const matched = new Set<number>();
  let i = a.length;
  let j = b.length;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      matched.add(i - 1);
      i--;
      j--;
    } else if (dp[i - 1]![j]! >= dp[i]![j - 1]!) i--;
    else j--;
  }
  return matched;
};

export const compareSpeech = (target: string, heard: string): SpeechComparison => {
  const original = target.split(/\s+/).filter(Boolean);
  // Každé cílové slovo může mít víc podtokenů (chamo-me → chamo, me).
  const sub: { word: number; token: string }[] = [];
  original.forEach((w, wi) => {
    for (const t of normalizeSpeech(w).split(' ').filter(Boolean)) sub.push({ word: wi, token: t });
  });
  const heardTokens = normalizeSpeech(heard).split(' ').filter(Boolean);
  const matchedSub = lcsMatches(sub.map((s) => s.token), heardTokens);

  const total = sub.length;
  const words = original.map((word, wi) => {
    const parts = sub.map((s, si) => ({ s, si })).filter((x) => x.s.word === wi);
    return { word, matched: parts.length > 0 && parts.every((x) => matchedSub.has(x.si)) };
  });
  return { score: total === 0 ? 0 : matchedSub.size / total, words };
};

/** Z několika alternativ rozpoznávače vybere tu, která nejlépe sedí k cíli. */
export const bestAlternative = (target: string, alternatives: string[]): { heard: string; result: SpeechComparison } => {
  let best = { heard: alternatives[0] ?? '', result: compareSpeech(target, alternatives[0] ?? '') };
  for (const alt of alternatives.slice(1)) {
    const r = compareSpeech(target, alt);
    if (r.score > best.result.score) best = { heard: alt, result: r };
  }
  return best;
};
