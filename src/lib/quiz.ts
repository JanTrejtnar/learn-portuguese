/**
 * Kvízový engine – čistá logika (bez UI a bez importu obsahu), aby šla testovat v Node.
 * Typy otázek: výběr (PT→CZ, CZ→PT, poslech), psaní, diktát, přiřazování párů, skládání věty.
 */
import type { ClozeItem, Lesson, Word } from '../types';

export const PASS_RATIO = 0.8;

export interface Sentence {
  pt: string;
  cs: string;
  /** Slovíčko, ke kterému věta patří (jen u příkladových vět). */
  wordId?: string;
}

interface Base {
  id: string;
  /** Slovíčka, která se při chybě vrátí do SRS. */
  wordIds: string[];
}

export interface ChoiceQ extends Base {
  kind: 'pt-to-cs' | 'cs-to-pt' | 'listen' | 'cloze';
  prompt: string;
  /** Český překlad jako nápověda (cloze). */
  hint?: string;
  /** Text k přečtení nahlas (PT). */
  audio?: string;
  options: string[];
  optionsLang: 'pt' | 'cs';
  answer: number;
}

export interface TypingQ extends Base {
  kind: 'typing' | 'dictation';
  prompt: string;
  audio?: string;
  accepted: string[];
  display: string;
}

export interface MatchQ extends Base {
  kind: 'match';
  pairs: { id: string; pt: string; cs: string }[];
}

/** Slovo bez interpunkce a velikosti písmen: rozdíl jen v čárce či vykřičníku není chyba. */
export const tokenKey = (t: string): string => t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

export interface BuildQ extends Base {
  kind: 'build';
  prompt: string;
  tokens: string[];
  bank: string[];
}

export type Question = ChoiceQ | TypingQ | MatchQ | BuildQ;

export interface QuestionResult {
  question: Question;
  correct: boolean;
  given: string;
  /** ID slovíček, která uživatel zpackal. */
  missed: string[];
  note?: string;
}

/* ───────────── porovnávání napsaných odpovědí ───────────── */

export const normalize = (s: string): string =>
  s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[.,!?…¿¡"„“”;:()]/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const stripMarks = (s: string): string => s.normalize('NFD').replace(/\p{M}/gu, '');

export type TypedVerdict = 'exact' | 'diacritics' | 'wrong';

export const checkTyped = (input: string, accepted: string[]): TypedVerdict => {
  const given = normalize(input);
  if (given === '') return 'wrong';
  const norm = accepted.map(normalize);
  if (norm.includes(given)) return 'exact';
  const loose = stripMarks(given);
  return norm.some((a) => stripMarks(a) === loose) ? 'diacritics' : 'wrong';
};

const ARTICLE = /^(o|a|os|as|um|uma)\s+/i;

/** Všechny přijatelné napsané tvary: varianty oddělené „/“, i bez členu. */
export const answerVariants = (pt: string): string[] => {
  const variants = pt.split(/\s*\/\s*/).map((v) => v.trim()).filter(Boolean);
  const all = new Set<string>([pt, ...variants]);
  for (const v of variants) if (ARTICLE.test(v)) all.add(v.replace(ARTICLE, ''));
  return [...all];
};

/** Krátká slovíčka se hodí na psaní a diktát; dlouhé fráze ne. */
export const isTypeable = (w: Word): boolean =>
  w.pt.split(/\s*\/\s*/).every((v) => v.length <= 26 && v.split(/\s+/).length <= 3);

const isMatchable = (w: Word): boolean => w.pt.length <= 26 && w.cs.length <= 34;

/* ───────────── věty pro skládání ───────────── */

export const collectSentences = (lessons: Lesson[]): Sentence[] => {
  const seen = new Set<string>();
  const out: Sentence[] = [];
  const add = (s: Sentence) => {
    const n = s.pt.split(/\s+/).length;
    if (n < 3 || n > 9 || seen.has(s.pt)) return;
    seen.add(s.pt);
    out.push(s);
  };
  for (const l of lessons) {
    for (const w of l.words) if (w.example) add({ ...w.example, wordId: w.id });
    for (const d of l.dialogue ?? []) add({ pt: d.pt, cs: d.cs });
  }
  return out;
};

/* ───────────── generátor ───────────── */

type Rng = () => number;

const shuffle = <T,>(arr: T[], rng: Rng): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};

export interface GenerateOptions {
  /** Slovíčka, ze kterých se ptáme. */
  words: Word[];
  /** Širší zásoba na špatné odpovědi (typicky všechna slovíčka). */
  pool: Word[];
  sentences: Sentence[];
  /** Doplňovací cvičení (volitelné). */
  cloze?: ClozeItem[];
  count: number;
  /** false = zařízení nemá pt-PT hlas → žádné poslechové otázky. */
  audio: boolean;
  rng?: Rng;
}

/** Normalizovaný text bez závorkových vysvětlivek (pro porovnání významu). */
const key = (s: string): string => s.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();

const pickDistractors = (word: Word, text: (w: Word) => string, scope: Word[], pool: Word[], rng: Rng, toPt: boolean): string[] => {
  const correct = text(word);
  // Špatná možnost nesmí být také správná: stejný význam (cs) u PT možností, stejné slovo (pt) u CZ možností.
  const ok = (w: Word) => w.id !== word.id && normalize(text(w)) !== normalize(correct) && (toPt ? key(w.cs) !== key(word.cs) : key(w.pt) !== key(word.pt));
  const rank = (list: Word[]) => shuffle(list.filter(ok), rng).sort((a, b) => Number(b.pos === word.pos) - Number(a.pos === word.pos));
  const out: string[] = [];
  for (const w of [...rank(scope), ...rank(pool)]) {
    const t = text(w);
    if (!out.some((o) => normalize(o) === normalize(t))) out.push(t);
    if (out.length === 3) break;
  }
  return out;
};

const choice = (kind: ChoiceQ['kind'], word: Word, scope: Word[], pool: Word[], rng: Rng, id: string): ChoiceQ => {
  const toPt = kind !== 'pt-to-cs';
  const text = (w: Word) => (toPt ? w.pt : w.cs);
  const options = shuffle([text(word), ...pickDistractors(word, text, scope, pool, rng, toPt)], rng);
  return {
    id,
    kind,
    wordIds: [word.id],
    prompt: kind === 'pt-to-cs' ? word.pt : kind === 'cs-to-pt' ? word.cs : '',
    audio: kind === 'cs-to-pt' ? undefined : word.pt,
    options,
    optionsLang: toPt ? 'pt' : 'cs',
    answer: options.indexOf(text(word)),
  };
};

/** Otázka na psaní nebo diktát jednoho slovíčka. */
export const typingQuestion = (word: Word, pool: Word[], kind: TypingQ['kind'], id: string): TypingQ => ({
  id, kind, wordIds: [word.id],
  prompt: kind === 'typing' ? word.cs : '',
  audio: kind === 'dictation' ? word.pt : undefined,
  // Uznej i jiná slovíčka se stejným překladem (např. dvě různé správné fráze pro „Kolik to stojí?“).
  accepted: [...new Set([word.pt, ...pool.filter((x) => key(x.cs) === key(word.cs)).map((x) => x.pt)].flatMap(answerVariants))],
  display: word.pt,
});

export const collectCloze = (lessons: Lesson[]): ClozeItem[] => lessons.flatMap((l) => l.cloze ?? []);

const WORD_KINDS: (ChoiceQ['kind'] | TypingQ['kind'])[] = ['pt-to-cs', 'cs-to-pt', 'listen', 'typing', 'dictation'];

export const generateQuiz = (opts: GenerateOptions): Question[] => {
  const rng = opts.rng ?? Math.random;
  const { words, pool, sentences, count, audio } = opts;
  const questions: Question[] = [];
  let n = 0;
  const nextId = () => `q${n++}`;

  // 1× přiřazování párů
  // Páry musí být jednoznačné: žádné dvě stejné portugalské ani české strany.
  const matchWords: Word[] = [];
  const usedPt = new Set<string>();
  const usedCs = new Set<string>();
  for (const word of shuffle(words.filter(isMatchable), rng)) {
    const pt = word.pt.toLowerCase();
    const cs = word.cs.toLowerCase();
    if (usedPt.has(pt) || usedCs.has(cs)) continue;
    usedPt.add(pt);
    usedCs.add(cs);
    matchWords.push(word);
    if (matchWords.length === 5) break;
  }
  if (matchWords.length >= 4) {
    questions.push({ id: nextId(), kind: 'match', wordIds: matchWords.map((w) => w.id), pairs: matchWords.map((w) => ({ id: w.id, pt: w.pt, cs: w.cs })) });
  }

  // Skládání vět
  const nBuild = Math.min(sentences.length, Math.ceil(count / 5));
  for (const s of shuffle(sentences, rng).slice(0, nBuild)) {
    const tokens = s.pt.split(/\s+/);
    const others = sentences.filter((o) => o.pt !== s.pt).flatMap((o) => o.pt.split(/\s+/));
    const used = new Set(tokens.map(tokenKey));
    const seenKeys = new Set<string>();
    const extras = shuffle([...new Set(others)], rng)
      .filter((t) => {
        const k = tokenKey(t);
        if (!k || used.has(k) || seenKeys.has(k)) return false; // „Olá!“ × „Olá,“ nesmí být past
        seenKeys.add(k);
        return true;
      })
      .slice(0, 2);
    questions.push({ id: nextId(), kind: 'build', wordIds: s.wordId ? [s.wordId] : [], prompt: s.cs, tokens, bank: shuffle([...tokens, ...extras], rng) });
  }

  // Doplňování vět (gramatika)
  const nCloze = Math.min(opts.cloze?.length ?? 0, Math.ceil(count / 4));
  for (const item of shuffle(opts.cloze ?? [], rng).slice(0, nCloze)) {
    const options = shuffle([item.answer, ...item.distractors], rng);
    questions.push({ id: nextId(), kind: 'cloze', wordIds: [], prompt: item.pt, hint: item.cs, audio: undefined, options, optionsLang: 'pt', answer: options.indexOf(item.answer) });
  }

  // Otázky na jednotlivá slovíčka (střídají se druhy)
  const usedInMatch = new Set(matchWords.map((w) => w.id));
  const free = words.filter((w) => !usedInMatch.has(w.id));
  const source = free.length >= count - questions.length ? free : words;
  const picked = shuffle(source, rng).slice(0, Math.max(0, count - questions.length));
  const offset = Math.floor(rng() * WORD_KINDS.length);
  picked.forEach((word, i) => {
    let kind = WORD_KINDS[(i + offset) % WORD_KINDS.length]!;
    const typeable = isTypeable(word);
    if (!audio) kind = kind === 'listen' ? 'cs-to-pt' : kind === 'dictation' ? 'typing' : kind;
    if (!typeable) kind = kind === 'typing' ? 'cs-to-pt' : kind === 'dictation' ? 'listen' : kind;
    if (!audio && kind === 'listen') kind = 'cs-to-pt';
    if (kind === 'typing' || kind === 'dictation') {
      questions.push(typingQuestion(word, pool, kind, nextId()));
    } else {
      questions.push(choice(kind, word, words, pool, rng, nextId()));
    }
  });

  return shuffle(questions, rng);
};

/* ───────────── pomocné texty pro souhrn ───────────── */

export const promptText = (q: Question): string => {
  switch (q.kind) {
    case 'pt-to-cs': return q.prompt;
    case 'cs-to-pt': return q.prompt;
    case 'listen': return `🔊 ${q.options[q.answer]}`;
    case 'cloze': return q.prompt;
    case 'typing': return q.prompt;
    case 'dictation': return `🔊 ${q.display}`;
    case 'build': return q.prompt;
    case 'match': return 'Přiřazování párů';
  }
};

export const correctText = (q: Question, missed: string[] = []): string => {
  switch (q.kind) {
    case 'pt-to-cs':
    case 'cs-to-pt':
    case 'listen':
    case 'cloze': return q.options[q.answer]!;
    case 'typing':
    case 'dictation': return q.display;
    case 'build': return q.tokens.join(' ');
    case 'match': return q.pairs.filter((p) => missed.includes(p.id)).map((p) => `${p.pt} = ${p.cs}`).join(' · ');
  }
};
