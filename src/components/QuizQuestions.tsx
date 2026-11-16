import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { speak } from '../lib/audio';
import { useKeydown } from '../lib/useKeydown';
import { checkTyped, tokenKey, type BuildQ, type ChoiceQ, type MatchQ, type QuestionResult, type TypingQ } from '../lib/quiz';
import { AudioButton } from './AudioButton';
import { BottomBar, bigBtn } from './BottomBar';
import { Coin } from './Coin';
import { units } from '../content';
import { coinsEarned } from '../lib/coins';
import { HINT_PRICE, balance, buyHint, loadShop, saveShop, useShop } from '../lib/shop';
import { useProgress } from '../lib/useProgress';

export type Answer = Pick<QuestionResult, 'correct' | 'given' | 'missed' | 'note'>;

interface Props<Q> {
  q: Q;
  /** Už odpovězeno (zamyká vstup a ukazuje správnou odpověď). */
  answer: Answer | null;
  onAnswer: (a: Answer) => void;
  /** Nabídnout nápovědu za mince (jen v kvízech a testech). */
  hints?: boolean;
}

const shuffleOnce = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

/** „kniha“ → „k _ _ _ _“ (první písmeno každého slova a počet ostatních). */
const hintPattern = (text: string): string =>
  text.split(' ').map((w) => [...w].map((ch, i) => (i === 0 || !/\p{L}/u.test(ch) ? ch : '_')).join(' ')).join('   ');

/** Tlačítko nápovědy za mince. Použitá nápověda znamená, že se slovíčko ještě vrátí do opakování. */
const HintButton = ({ label, onUse }: { label: string; onUse: () => void }) => {
  const progress = useProgress();
  const [shop] = useShop();
  if (!progress) return null;
  const bal = balance(coinsEarned(progress, units).total, shop);
  const can = bal >= HINT_PRICE;
  const use = () => {
    const r = buyHint(loadShop(), bal);
    if (!r.ok) return;
    saveShop(r.state);
    onUse();
  };
  return (
    <button type="button" onClick={use} disabled={!can} class="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold hover:border-brand-500 disabled:opacity-50">
      <span aria-hidden="true">💡</span> {label} <span class="inline-flex items-center gap-1 text-muted"><Coin class="h-4 w-4" />{HINT_PRICE}</span>{!can && <span class="text-muted">· málo mincí</span>}
    </button>
  );
};

const HINT_NOTE = 'S nápovědou: slovíčko se ještě vrátí do opakování.';

/** Poslechové otázky se po zobrazení rovnou přehrají. */
const useAutoplay = (text: string | undefined, enabled: boolean) => {
  useEffect(() => {
    if (text && enabled) speak(text);
  }, [text, enabled]);
};

/* ───────── výběr z možností (PT→CZ, CZ→PT, poslech) ───────── */

export const ChoiceQuestion = ({ q, answer, onAnswer, hints }: Props<ChoiceQ>) => {
  useAutoplay(q.kind === 'listen' ? q.audio : undefined, true);

  // Nápověda 50:50: vyřadí dvě špatné možnosti.
  const [hidden, setHidden] = useState<number[]>([]);
  const hinted = hidden.length > 0;
  const hide = () => {
    const wrong = q.options.map((_, i) => i).filter((i) => i !== q.answer);
    setHidden(shuffleOnce(wrong).slice(0, 2));
  };

  useKeydown((e) => {
    const i = Number(e.key) - 1;
    if (!answer && i >= 0 && i < q.options.length && !hidden.includes(i)) pick(i);
  });

  const pick = (i: number) => onAnswer({ correct: i === q.answer, given: q.options[i]!, missed: i === q.answer && !hinted ? [] : q.wordIds, note: i === q.answer && hinted ? HINT_NOTE : undefined });

  return (
    <div>
      <p class="mb-1 text-sm text-muted">
        {q.kind === 'pt-to-cs' ? 'Co to znamená česky?' : q.kind === 'cs-to-pt' ? 'Jak se to řekne portugalsky (PT-PT)?' : q.kind === 'cloze' ? 'Doplň správný tvar:' : 'Co slyšíš?'}
      </p>
      <div class="mb-5 flex items-center gap-3">
        {q.kind === 'listen' ? (
          <AudioButton text={q.audio!} size="md" withSlow />
        ) : q.kind === 'cloze' ? (
          <div>
            <span lang="pt-PT" class="text-2xl font-bold text-brand-700 dark:text-brand-100">{q.prompt.replace('___', answer ? q.options[q.answer]! : '＿＿＿')}</span>
            {q.hint && <span class="mt-1 block text-sm text-muted">{q.hint}</span>}
          </div>
        ) : (
          <>
            <span lang={q.kind === 'pt-to-cs' ? 'pt-PT' : 'cs'} class="text-3xl font-bold text-brand-700 dark:text-brand-100">{q.prompt}</span>
            {q.kind === 'pt-to-cs' && <AudioButton text={q.audio!} size="md" />}
          </>
        )}
      </div>
      {answer && q.kind === 'listen' && q.cs && (
        <p class="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-base">
          <b lang="pt-PT">{q.options[q.answer]}</b>
          <AudioButton text={q.audio!} />
          <span class="text-muted">= {q.cs}</span>
        </p>
      )}
      <ul class="grid gap-2">
        {q.options.map((opt, i) => {
          const state = !answer ? 'idle' : i === q.answer ? 'right' : opt === answer.given ? 'wrong' : 'dim';
          const tone = {
            idle: 'border-line bg-surface hover:border-brand-500',
            right: 'border-green-600 bg-green-50 dark:bg-green-950',
            wrong: 'border-red-600 bg-red-50 dark:bg-red-950',
            dim: 'border-line bg-surface opacity-50',
          }[hidden.includes(i) && state === 'idle' ? 'dim' : state];
          return (
            <li key={opt}>
              <button type="button" disabled={!!answer || hidden.includes(i)} onClick={() => pick(i)} lang={q.optionsLang === 'pt' ? 'pt-PT' : 'cs'} class={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left font-medium ${tone}`}>
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs text-ink-soft">{i + 1}</span>
                {opt}
              </button>
            </li>
          );
        })}
      </ul>
      {hints && !answer && q.options.length > 3 && !hinted && <HintButton label="Vyřadit 2 možnosti" onUse={hide} />}
    </div>
  );
};

/* ───────── psaní a diktát ───────── */

export const TypingQuestion = ({ q, answer, onAnswer, hints }: Props<TypingQ>) => {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const [hinted, setHinted] = useState(false);
  useAutoplay(q.kind === 'dictation' ? q.audio : undefined, true);
  // Pole se hned zaktivní (i po překreslení a na mobilech, kde focus někdy zabere až o chvíli později).
  useEffect(() => {
    ref.current?.focus();
    const t = setTimeout(() => ref.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  const submit = () => {
    // Čteme přímo z inputu: stav se po rychlém vložení + Enter nemusí stihnout překreslit.
    const typed = (ref.current?.value ?? value).trim();
    if (answer || typed === '') return;
    const verdict = checkTyped(typed, q.accepted);
    onAnswer({
      correct: verdict !== 'wrong',
      given: typed,
      missed: verdict === 'wrong' || hinted ? q.wordIds : [],
      note: verdict === 'diacritics' ? `Pozor na diakritiku: správně je „${q.display}“.` : verdict !== 'wrong' && hinted ? HINT_NOTE : undefined,
    });
  };

  return (
    <div>
      <p class="mb-1 text-sm text-muted">{q.kind === 'typing' ? 'Napiš portugalsky (PT-PT):' : 'Napiš, co slyšíš:'}</p>
      <div class="mb-5 flex items-center gap-3">
        {q.kind === 'typing' ? <span class="text-3xl font-bold">{q.prompt}</span> : <AudioButton text={q.audio!} size="md" withSlow />}
      </div>
      <form id="typing-form" onSubmit={(e) => { e.preventDefault(); submit(); }} class="flex gap-2">
        <input
          ref={ref}
          autoFocus
          value={value}
          onInput={(e) => setValue(e.currentTarget.value)}
          disabled={!!answer}
          lang="pt-PT"
          autocomplete="off"
          autocapitalize="off"
          spellcheck={false}
          placeholder="Tvoje odpověď…"
          class="min-w-0 flex-1 rounded-xl border-2 border-line bg-surface px-4 py-3 text-lg disabled:opacity-60"
        />
      </form>
      {!answer && hinted && (
        <p class="mt-3 font-mono text-xl tracking-widest" lang="pt-PT" aria-label="Nápověda: začátek a délka slova">{hintPattern(q.display)}</p>
      )}
      {hints && !answer && !hinted && <HintButton label="Odkrýt první písmeno" onUse={() => setHinted(true)} />}
      {!answer && (
        <BottomBar><button type="submit" form="typing-form" class={bigBtn}>Zkontrolovat</button></BottomBar>
      )}
      {answer && (
        <p class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-base">
          <b lang="pt-PT">{q.display}</b>
          <AudioButton text={q.audio ?? q.display} />
          <span class="text-muted">= {q.cs}</span>
        </p>
      )}
    </div>
  );
};

/* ───────── přiřazování párů ───────── */

export const MatchQuestion = ({ q, answer, onAnswer }: Props<MatchQ>) => {
  const right = useMemo(() => shuffleOnce(q.pairs), [q.id]);
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<{ l: string; r: string } | null>(null);
  const [mistakes, setMistakes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (matched.size === q.pairs.length && !answer) {
      onAnswer({ correct: mistakes.size === 0, given: '', missed: [...mistakes] });
    }
  }, [matched]);

  const clickRight = (id: string) => {
    if (!selected || matched.has(id) || answer) return;
    if (selected === id) {
      setMatched(new Set([...matched, id]));
    } else {
      setMistakes(new Set([...mistakes, selected, id]));
      setFlash({ l: selected, r: id });
      setTimeout(() => setFlash(null), 600);
    }
    setSelected(null);
  };

  const cell = (id: string, active: boolean, bad: boolean) =>
    `w-full rounded-xl border-2 px-3 py-3 text-left text-sm font-medium transition ${
      matched.has(id) ? 'border-green-600 bg-green-50 opacity-60 dark:bg-green-950'
      : bad ? 'border-red-600 bg-red-50 dark:bg-red-950'
      : active ? 'border-brand-600 bg-brand-50 dark:bg-brand-900'
      : 'border-line bg-surface hover:border-brand-500'}`;

  return (
    <div>
      <p class="mb-4 text-sm text-muted">Spoj portugalské výrazy s českými významy.</p>
      <div class="grid grid-cols-2 gap-3">
        <ul class="space-y-2">
          {q.pairs.map((p) => (
            <li key={p.id}>
              <button type="button" lang="pt-PT" disabled={matched.has(p.id) || !!answer} class={cell(p.id, selected === p.id, flash?.l === p.id)} onClick={() => { setSelected(p.id); speak(p.pt); }}>
                {p.pt}
              </button>
            </li>
          ))}
        </ul>
        <ul class="space-y-2">
          {right.map((p) => (
            <li key={p.id}>
              <button type="button" disabled={matched.has(p.id) || !!answer} class={cell(p.id, false, flash?.r === p.id)} onClick={() => clickRight(p.id)}>
                {p.cs}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/* ───────── skládání věty ───────── */

export const BuildQuestion = ({ q, answer, onAnswer, hints }: Props<BuildQ>) => {
  const [picked, setPicked] = useState<number[]>([]);
  const [hinted, setHinted] = useState(false);
  const toggle = (i: number) => {
    if (answer) return;
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  };
  const built = picked.map((i) => q.bank[i]!);
  const check = () => {
    if (answer || picked.length === 0) return;
    const correct = built.map(tokenKey).join(' ') === q.tokens.map(tokenKey).join(' ');
    onAnswer({ correct, given: built.join(' '), missed: correct && !hinted ? [] : q.wordIds, note: correct && hinted ? HINT_NOTE : undefined });
  };

  return (
    <div>
      <p class="mb-1 text-sm text-muted">Poskládej větu portugalsky (PT-PT):</p>
      <p class="mb-4 text-2xl font-bold">{q.prompt}</p>
      <div lang="pt-PT" class="mb-4 flex min-h-16 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-line-strong p-3">
        {picked.length === 0 && <span class="text-sm text-muted">Klepej na slova níže…</span>}
        {picked.map((i) => (
          <button key={i} type="button" disabled={!!answer} onClick={() => toggle(i)} class="rounded-lg bg-brand-100 px-3 py-1.5 font-medium text-brand-900">{q.bank[i]}</button>
        ))}
      </div>
      <div lang="pt-PT" class="flex flex-wrap gap-2">
        {q.bank.map((t, i) => (
          <button key={i} type="button" disabled={!!answer || picked.includes(i)} onClick={() => toggle(i)} class="rounded-lg border border-line-strong bg-surface px-3 py-1.5 font-medium disabled:opacity-30">{t}</button>
        ))}
      </div>
      {!answer && hinted && <p class="mt-3 text-sm">Věta začíná slovem: <b lang="pt-PT">{q.tokens[0]}</b></p>}
      {hints && !answer && !hinted && <HintButton label="Prozradit první slovo" onUse={() => setHinted(true)} />}
      {!answer && (
        <BottomBar><button type="button" onClick={check} disabled={picked.length === 0} class={bigBtn}>Zkontrolovat</button></BottomBar>
      )}
    </div>
  );
};
