import { useMemo, useRef, useState } from 'preact/hooks';
import { Loading } from '../components/Loading';
import { AudioButton } from '../components/AudioButton';
import { SessionBar } from '../components/SessionBar';
import { VoiceWarning } from '../components/VoiceWarning';
import { units, unitUnlocked } from '../content';
import { grantXp } from '../lib/award';
import type { Progress } from '../lib/db';
import { collectSentences, type Sentence } from '../lib/quiz';
import { useStudySettings } from '../lib/settings';
import { bestAlternative, type SpeechComparison } from '../lib/speech';
import { useSpeechRecognition } from '../lib/useSpeechRecognition';
import { useProgress } from '../lib/useProgress';
import { href } from '../router';

const ROUND = 8;

const shuffled = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

export const SpeakPage = () => {
  const progress = useProgress();
  return (
    <div class="mx-auto max-w-xl">
      <SessionBar exitTo="/practice" confirm={false} />
      <h1 class="text-2xl font-bold">Mluvení 🎤</h1>
      <p class="mt-1 text-ink-soft">Poslechni si větu, zopakuj ji nahlas a uvidíš, která slova zazněla.</p>
      <VoiceWarning />
      {progress ? <Session progress={progress} /> : <Loading />}
    </div>
  );
};

const Session = ({ progress }: { progress: Progress }) => {
  const [settings] = useStudySettings();
  const { supported, listening, error, start, stop } = useSpeechRecognition();
  const [attempt, setAttempt] = useState(0);

  const phrases = useMemo<Sentence[]>(() => {
    const lessons = units.filter((u) => unitUnlocked(u.id, progress.tests)).flatMap((u) => u.lessons);
    return shuffled(collectSentences(lessons).filter((s) => s.pt.split(/\s+/).length <= 7)).slice(0, ROUND);
  }, [attempt]);

  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<{ heard: string; cmp: SpeechComparison } | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const rewarded = useRef(new Set<number>());

  const phrase = phrases[index];
  const finished = index >= phrases.length;

  const record = () => {
    if (!phrase) return;
    start((alternatives) => {
      const best = bestAlternative(phrase.pt, alternatives);
      setResult({ heard: best.heard, cmp: best.result });
      if (!rewarded.current.has(index)) {
        rewarded.current.add(index);
        const s = best.result.score;
        setScores((x) => [...x, s]);
        const gain = s >= 0.8 ? 4 : s >= 0.5 ? 2 : 0;
        if (gain > 0) setTotalXp((t) => t + grantXp(progress.days, gain, settings.dailyGoal));
      }
    });
  };

  const next = () => {
    setResult(null);
    setIndex((i) => i + 1);
  };

  const restart = () => {
    rewarded.current = new Set();
    setIndex(0);
    setResult(null);
    setTotalXp(0);
    setScores([]);
    setAttempt((a) => a + 1);
  };

  if (phrases.length === 0) return <p class="mt-6 text-muted">Zatím není k dispozici žádná věta.</p>;

  return (
    <div class="mt-4">
      {!supported && (
        <p role="alert" class="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          🎤 Tento prohlížeč neumí rozpoznávat řeč. Zkus Chrome nebo Edge (počítač, Android). Větu si můžeš aspoň poslechnout a opakovat bez vyhodnocení.
        </p>
      )}
      {supported && (
        <p class="mb-4 text-xs text-muted">
          ℹ️ Rozpoznávání řeči v prohlížeči Chrome posílá nahrávku k vyhodnocení na servery výrobce prohlížeče. Funguje jen na zabezpečeném připojení (https).
        </p>
      )}

      {!finished && phrase && (
        <>
          <p class="mb-2 text-right text-xs text-muted">Věta {index + 1} / {phrases.length}</p>
          <div class="rounded-3xl border border-line bg-surface p-6 text-center">
            <p lang="pt-PT" class="text-2xl font-bold text-brand-700 dark:text-brand-100">{phrase.pt}</p>
            <p class="mt-1 text-sm text-muted">{phrase.cs}</p>
            <div class="mt-4 flex items-center justify-center gap-3">
              <AudioButton text={phrase.pt} size="md" withSlow />
              <button
                type="button"
                onClick={listening ? stop : record}
                disabled={!supported}
                class={`flex h-12 items-center gap-2 rounded-full px-5 font-semibold text-white disabled:opacity-40 ${listening ? 'animate-pulse bg-red-600' : 'bg-brand-700 hover:bg-brand-600'}`}
              >
                🎤 {listening ? 'Poslouchám…' : 'Mluvit'}
              </button>
            </div>
          </div>

          {error && <p role="alert" class="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">{error}</p>}

          {result && (
            <div role="status" class="mt-4 rounded-2xl border border-line bg-surface p-4">
              <p class="text-lg font-bold">{Math.round(result.cmp.score * 100)} % {result.cmp.score >= 0.8 ? '🎉' : result.cmp.score >= 0.5 ? '👍' : '💪'}</p>
              <p lang="pt-PT" class="mt-2 flex flex-wrap gap-x-2 text-lg">
                {result.cmp.words.map((w, i) => <span key={i} class={w.matched ? 'text-green-700 dark:text-green-400' : 'text-red-600 underline decoration-wavy'}>{w.word}</span>)}
              </p>
              <p class="mt-2 text-sm text-muted">Rozpoznáno: „{result.heard}“</p>
              <div class="mt-3 flex gap-3">
                <button type="button" onClick={record} class="rounded-xl border border-line-strong px-4 py-2 font-semibold">Zkusit znovu</button>
                <button type="button" onClick={next} class="flex-1 rounded-xl bg-brand-700 py-2 font-semibold text-white hover:bg-brand-600">{index + 1 === phrases.length ? 'Dokončit' : 'Další věta'}</button>
              </div>
            </div>
          )}

          {!result && (
            <div class="mt-4 flex flex-col items-center gap-2 text-sm text-muted">
              <button type="button" onClick={next} class="underline">Přeskočit větu</button>
              <a href={href('/practice')} class="underline">Teď nemohu mluvit, skončit</a>
            </div>
          )}
        </>
      )}

      {finished && (
        <div class="rounded-3xl border border-line bg-surface p-6 text-center">
          <div class="text-5xl" aria-hidden="true">🗣️</div>
          <h2 class="mt-2 text-xl font-bold">Hotovo!</h2>
          <p class="text-ink-soft">
            {scores.length > 0 ? `Průměrná shoda: ${Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100)} %` : 'Žádná věta nebyla vyhodnocena.'}
          </p>
          {totalXp > 0 && <p class="mt-2 text-sm font-semibold text-brand-700 dark:text-brand-100">+{totalXp} XP ⭐</p>}
          <div class="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={restart} class="rounded-xl bg-brand-700 px-4 py-2.5 font-semibold text-white hover:bg-brand-600">Další kolo</button>
            <a href={href('/practice')} class="rounded-xl border border-line-strong px-4 py-2.5 font-semibold">Zpět na praxi</a>
          </div>
        </div>
      )}
    </div>
  );
};
