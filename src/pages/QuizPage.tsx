import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Breadcrumb } from '../components/Breadcrumb';
import { AudioButton } from '../components/AudioButton';
import { BuildQuestion, ChoiceQuestion, MatchQuestion, TypingQuestion, type Answer } from '../components/QuizQuestions';
import { VoiceWarning } from '../components/VoiceWarning';
import { allWords, getTestScope, units, unitUnlocked } from '../content';
import { getVoiceStatus } from '../lib/audio';
import { saveCard, saveTest, type Progress, type TestResult } from '../lib/db';
import { PASS_RATIO, collectCloze, collectSentences, correctText, generateQuiz, promptText, type Question, type QuestionResult } from '../lib/quiz';
import { schedule } from '../lib/srs';
import { useKeydown } from '../lib/useKeydown';
import { useProgress } from '../lib/useProgress';
import { href } from '../router';
import type { Lesson, Word } from '../types';
import { NotFoundPage } from './NotFoundPage';

interface Scope {
  id: string;
  title: string;
  /** Ukládá se výsledek a může odemknout další jednotku. */
  graded: boolean;
  unitId?: string;
  words: Word[];
  lessons: Lesson[];
  count: number;
  back: { label: string; to: string };
}

const allLessons = (): Lesson[] => units.flatMap((u) => u.lessons);

const resolveScope = (id: string, progress: Progress): Scope | 'empty' | undefined => {
  if (id === 'quick') {
    const seen = allWords().filter((w) => progress.cards.has(w.id));
    if (seen.length < 4) return 'empty';
    // Nejslabší karty (nízký ease, hodně chyb) mají přednost.
    const weakest = [...seen].sort((a, b) => progress.cards.get(a.id)!.ease - progress.cards.get(b.id)!.ease + (Math.random() - 0.5)).slice(0, 14);
    return { id, title: 'Rychlý kvíz', graded: false, words: weakest, lessons: allLessons(), count: 10, back: { label: 'Testy', to: '/quiz' } };
  }
  const scope = getTestScope(id);
  if (!scope) return undefined;
  return {
    id,
    title: scope.title,
    graded: scope.kind === 'unit',
    unitId: scope.unitId,
    words: scope.words,
    lessons: scope.lessons,
    count: scope.kind === 'unit' ? 20 : 12,
    back: { label: 'Testy', to: '/quiz' },
  };
};

export const QuizPage = ({ id }: { id: string }) => {
  const progress = useProgress();
  if (!progress) return <p class="py-16 text-center text-stone-500">Načítám…</p>;
  const scope = resolveScope(id, progress);
  if (!scope) return <NotFoundPage />;
  if (scope === 'empty') {
    return (
      <div class="py-12 text-center">
        <div class="text-5xl" aria-hidden="true">🃏</div>
        <h1 class="mt-3 text-xl font-bold">Rychlý kvíz zatím není k dispozici</h1>
        <p class="mt-2 text-stone-600 dark:text-stone-400">Nejdřív si procvič aspoň pár kartiček, pak se kvíz zeptá na ta nejslabší slovíčka.</p>
        <a href={href('/cards/all')} class="mt-5 inline-block rounded-xl bg-brand-700 px-4 py-2.5 font-semibold text-white">Jít na kartičky</a>
      </div>
    );
  }
  if (scope.unitId && !unitUnlocked(scope.unitId, progress.tests)) {
    return (
      <div class="py-12 text-center">
        <div class="text-5xl" aria-hidden="true">🔒</div>
        <h1 class="mt-3 text-xl font-bold">Tato jednotka je zamčená</h1>
        <p class="mt-2 text-stone-600 dark:text-stone-400">Nejdřív splň test předchozí jednotky.</p>
        <a href={href('/quiz')} class="mt-5 inline-block rounded-xl bg-brand-700 px-4 py-2.5 font-semibold text-white">Přehled testů</a>
      </div>
    );
  }
  return <Session key={id} scope={scope} progress={progress} />;
};

const Session = ({ scope, progress }: { scope: Scope; progress: Progress }) => {
  const [attempt, setAttempt] = useState(0);
  const questions = useMemo<Question[]>(() => {
    const audio = getVoiceStatus();
    const sentences = collectSentences(scope.lessons).filter((s) => scope.id !== 'quick' || (s.wordId && scope.words.some((w) => w.id === s.wordId)));
    return generateQuiz({ words: scope.words, pool: allWords(), sentences, cloze: scope.id === 'quick' ? [] : collectCloze(scope.lessons), count: scope.count, audio: audio !== 'unsupported' && audio !== 'no-pt-pt' });
  }, [attempt]);

  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const saved = useRef(false);
  const [outcome, setOutcome] = useState<{ passed: boolean; newlyUnlocked: string | null } | null>(null);

  const q = questions[index];
  const finished = index >= questions.length;
  const correctCount = results.filter((r) => r.correct).length;
  const ratio = results.length ? correctCount / questions.length : 0;

  // Pojistka: každá otázka se uzavře nejvýš jednou, i když doběhne zastaralá obsluha klávesy.
  const closed = useRef<string | null>(null);
  const next = () => {
    if (!answer || !q || closed.current === q.id) return;
    closed.current = q.id;
    setResults((r) => [...r, { question: q, ...answer }]);
    setAnswer(null);
    setIndex((i) => i + 1);
  };

  // Enter = další otázka
  useKeydown((e) => {
    if (e.key === 'Enter' && !e.repeat && answer && q && closed.current !== q.id && !(e.target instanceof HTMLButtonElement)) {
      e.preventDefault();
      next();
    }
  });

  // Po dokončení: uložit výsledek a vrátit chyby do SRS
  useEffect(() => {
    if (!finished || saved.current || results.length === 0) return;
    saved.current = true;
    const now = Date.now();
    const missed = new Set(results.flatMap((r) => r.missed));
    for (const wid of missed) {
      const next = schedule(progress.cards.get(wid), wid, 'again', now);
      progress.cards.set(wid, next);
      void saveCard(next);
    }
    let passed = ratio >= PASS_RATIO;
    let newlyUnlocked: string | null = null;
    if (scope.graded) {
      const old = progress.tests.get(scope.id);
      const result: TestResult = {
        id: scope.id,
        best: Math.max(old?.best ?? 0, ratio),
        passed: (old?.passed ?? false) || passed,
        attempts: (old?.attempts ?? 0) + 1,
        last: now,
        skipped: old?.skipped && !passed ? true : undefined,
      };
      const wasUnlocked = (i: number) => (units[i] ? unitUnlocked(units[i]!.id, progress.tests) : false);
      const idx = units.findIndex((u) => u.id === scope.id);
      const before = wasUnlocked(idx + 1);
      progress.tests.set(scope.id, result);
      void saveTest(result);
      if (!before && wasUnlocked(idx + 1)) newlyUnlocked = units[idx + 1]!.title;
      passed = result.passed && ratio >= PASS_RATIO;
    }
    setOutcome({ passed, newlyUnlocked });
  }, [finished]);

  const retry = () => {
    saved.current = false;
    closed.current = null;
    setOutcome(null);
    setResults([]);
    setIndex(0);
    setAnswer(null);
    setAttempt((a) => a + 1);
  };

  const q2 = q;
  return (
    <div class="mx-auto max-w-xl">
      <Breadcrumb items={[{ label: scope.back.label, to: scope.back.to }, { label: scope.title }]} />
      <VoiceWarning />

      {!finished && q2 && (
        <>
          <div class="mb-5">
            <div class="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
              <div class="h-full bg-brand-500 transition-all" style={{ width: `${(index / questions.length) * 100}%` }} />
            </div>
            <p class="mt-1 text-right text-xs text-stone-500">Otázka {index + 1} / {questions.length}</p>
          </div>

          <div key={q2.id}>
            {(q2.kind === 'pt-to-cs' || q2.kind === 'cs-to-pt' || q2.kind === 'listen' || q2.kind === 'cloze') && <ChoiceQuestion q={q2} answer={answer} onAnswer={setAnswer} />}
            {(q2.kind === 'typing' || q2.kind === 'dictation') && <TypingQuestion q={q2} answer={answer} onAnswer={setAnswer} />}
            {q2.kind === 'match' && <MatchQuestion q={q2} answer={answer} onAnswer={setAnswer} />}
            {q2.kind === 'build' && <BuildQuestion q={q2} answer={answer} onAnswer={setAnswer} />}
          </div>

          {answer && (
            <div role="status" class={`mt-5 rounded-2xl p-4 ${answer.correct ? 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100' : 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'}`}>
              <p class="font-bold">{answer.correct ? '✅ Správně!' : '❌ Chyba'}</p>
              {answer.note && <p class="mt-1 text-sm">{answer.note}</p>}
              {!answer.correct && correctText(q2, answer.missed) && (
                <p class="mt-1 flex items-center gap-2 text-sm">
                  Správně:
                  <b lang={q2.kind === 'pt-to-cs' ? 'cs' : 'pt-PT'}>{correctText(q2, answer.missed)}</b>
                  {q2.kind !== 'match' && q2.kind !== 'pt-to-cs' && q2.kind !== 'cloze' && <AudioButton text={correctText(q2)} />}
                </p>
              )}
              <button type="button" onClick={next} class="mt-3 w-full rounded-xl bg-stone-900 py-2.5 font-semibold text-white dark:bg-white dark:text-stone-900">
                {index + 1 === questions.length ? 'Zobrazit výsledek' : 'Další'} <span class="text-xs opacity-60">(Enter)</span>
              </button>
            </div>
          )}
        </>
      )}

      {finished && (
        <div>
          <div class="rounded-3xl border border-stone-200 bg-white p-6 text-center dark:border-stone-800 dark:bg-stone-900">
            <div class="text-5xl" aria-hidden="true">{ratio >= PASS_RATIO ? '🎉' : '💪'}</div>
            <h1 class="mt-2 text-3xl font-bold">{Math.round(ratio * 100)} %</h1>
            <p class="text-stone-600 dark:text-stone-400">{correctCount} z {questions.length} správně</p>
            {scope.graded ? (
              ratio >= PASS_RATIO ? (
                <p class="mt-3 font-semibold text-green-700 dark:text-green-400">
                  Test splněn!{outcome?.newlyUnlocked ? ` Odemčena jednotka „${outcome.newlyUnlocked}“ 🔓` : ''}
                </p>
              ) : (
                <p class="mt-3 font-semibold text-amber-700 dark:text-amber-400">Na splnění je potřeba aspoň {Math.round(PASS_RATIO * 100)} %. Zkus to znovu!</p>
              )
            ) : (
              <p class="mt-3 text-sm text-stone-500">{ratio >= PASS_RATIO ? 'Skvělé!' : 'Chybná slovíčka se vrátí do opakování.'}</p>
            )}
            <div class="mt-5 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={retry} class="rounded-xl bg-brand-700 px-4 py-2.5 font-semibold text-white hover:bg-brand-600">Nový pokus</button>
              <a href={href('/quiz')} class="rounded-xl border border-stone-300 px-4 py-2.5 font-semibold dark:border-stone-700">Přehled testů</a>
            </div>
          </div>

          {results.some((r) => !r.correct) && (
            <section class="mt-8">
              <h2 class="mb-3 text-lg font-semibold">Co zlepšit</h2>
              <ul class="space-y-2 text-sm">
                {results.filter((r) => !r.correct).map((r) => (
                  <li key={r.question.id} class="rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900">
                    <div class="text-stone-500">{promptText(r.question)}</div>
                    <div>
                      {r.given && <span class="text-red-600 line-through">{r.given}</span>}{' '}
                      <b class="text-green-700 dark:text-green-400">{correctText(r.question, r.missed)}</b>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

