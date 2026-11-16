import { useMemo, useState } from 'preact/hooks';
import { Loading } from '../components/Loading';
import { AudioButton } from '../components/AudioButton';
import { Breadcrumb } from '../components/Breadcrumb';
import { VoiceWarning } from '../components/VoiceWarning';
import { minimalPairs } from '../content/pairs';
import { speak } from '../lib/audio';
import { grantXp } from '../lib/award';
import type { Progress } from '../lib/db';
import { makePairRound } from '../lib/pairs';
import { useStudySettings } from '../lib/settings';
import { useKeydown } from '../lib/useKeydown';
import { useProgress } from '../lib/useProgress';
import { href } from '../router';

const ROUND = 10;
const XP_PER_CORRECT = 2;

export const PairsPage = () => {
  const progress = useProgress();
  const [tab, setTab] = useState<'learn' | 'train'>('learn');

  return (
    <div class="mx-auto max-w-xl">
      <Breadcrumb items={[{ label: 'Praxe', to: '/practice' }, { label: 'Minimální páry' }]} />
      <h1 class="text-2xl font-bold">Minimální páry 👂</h1>
      <p class="mt-1 text-ink-soft">Slova, která se liší jediným zvukem. Naučit se je rozlišit je klíč k dobré výslovnosti.</p>
      <VoiceWarning />
      <p class="mb-4 text-xs text-muted">Rozdíly nejlépe uslyšíš na kvalitním hlasu pt-PT. Syntetický hlas nemusí být dokonalý.</p>

      <div class="mb-5 flex gap-2" role="tablist">
        {([['learn', 'Poslechnout si'], ['train', 'Trénink']] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            class={`rounded-xl px-4 py-2 font-semibold ${tab === id ? 'bg-brand-700 text-white' : 'border border-line-strong'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'learn' ? (
        <ul class="space-y-3">
          {minimalPairs.map((p) => (
            <li key={p.id} class="rounded-2xl border border-line bg-surface p-4">
              <div class="grid grid-cols-2 gap-3">
                {[p.a, p.b].map((w) => (
                  <div key={w.pt} class="flex items-center gap-2">
                    <AudioButton text={w.pt} size="md" />
                    <div>
                      <div lang="pt-PT" class="text-lg font-bold text-brand-700 dark:text-brand-100">{w.pt}</div>
                      <div class="text-sm text-muted">{w.cs}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p class="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">💡 {p.tip}</p>
            </li>
          ))}
        </ul>
      ) : progress ? (
        <Train progress={progress} />
      ) : (
        <Loading />
      )}
    </div>
  );
};

const Train = ({ progress }: { progress: Progress }) => {
  const [settings] = useStudySettings();
  const [attempt, setAttempt] = useState(0);
  const round = useMemo(() => makePairRound(minimalPairs, ROUND), [attempt]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<'a' | 'b' | null>(null);
  const [correct, setCorrect] = useState(0);
  const [started, setStarted] = useState(false);
  const [xp, setXp] = useState(0);

  const q = round[index];
  const finished = started && index >= round.length;
  // Pořadí tlačítek se u každé otázky náhodně prohodí.
  const swap = useMemo(() => Math.random() < 0.5, [index, attempt]);
  const order: ('a' | 'b')[] = swap ? ['b', 'a'] : ['a', 'b'];

  const play = () => q && speak(q.pair[q.played].pt);

  const answer = (side: 'a' | 'b') => {
    if (!q || picked) return;
    setPicked(side);
    if (side === q.played) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (!picked) return;
    const nextIndex = index + 1;
    setPicked(null);
    setIndex(nextIndex);
    if (nextIndex >= round.length) setXp(grantXp(progress.days, correct * XP_PER_CORRECT, settings.dailyGoal));
    else speak(round[nextIndex]!.pair[round[nextIndex]!.played].pt);
  };

  const start = () => {
    setStarted(true);
    setIndex(0);
    setCorrect(0);
    setPicked(null);
    setXp(0);
    speak(round[0]!.pair[round[0]!.played].pt);
  };

  const restart = () => {
    setStarted(false);
    setAttempt((a) => a + 1);
  };

  useKeydown((e) => {
    if (!started || finished) return;
    if (!picked && (e.key === '1' || e.key === '2')) answer(order[Number(e.key) - 1]!);
    else if (picked && e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) next();
    else if (e.key.toLowerCase() === 'p') play();
  });

  if (!started) {
    return (
      <div class="rounded-2xl border border-line bg-surface p-6 text-center">
        <div class="text-4xl" aria-hidden="true">🎧</div>
        <h2 class="mt-2 text-lg font-bold">Co jsi slyšel?</h2>
        <p class="mt-1 text-sm text-ink-soft">{ROUND} slov. Poslechni si nahrávku a vyber, které ze dvou slov zaznělo.</p>
        <button type="button" onClick={start} class="mt-5 rounded-xl bg-brand-700 px-6 py-3 font-semibold text-white hover:bg-brand-600">Začít</button>
      </div>
    );
  }

  if (finished) {
    return (
      <div class="rounded-3xl border border-line bg-surface p-6 text-center">
        <div class="text-5xl" aria-hidden="true">{correct >= 8 ? '🎉' : '💪'}</div>
        <h2 class="mt-2 text-3xl font-bold">{correct} / {round.length}</h2>
        <p class="text-ink-soft">{correct >= 8 ? 'Skvělé ucho!' : 'Zkus si pár dvojic ještě poslechnout a zopakuj to.'}</p>
        {xp > 0 && <p class="mt-2 text-sm font-semibold text-brand-700 dark:text-brand-100">+{xp} XP ⭐</p>}
        <div class="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => { restart(); }} class="rounded-xl bg-brand-700 px-4 py-2.5 font-semibold text-white hover:bg-brand-600">Nové kolo</button>
          <a href={href('/practice')} class="rounded-xl border border-line-strong px-4 py-2.5 font-semibold">Zpět na praxi</a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div class="mb-4">
        <div class="h-2 overflow-hidden rounded-full bg-track"><div class="h-full bg-brand-500 transition-all" style={{ width: `${(index / round.length) * 100}%` }} /></div>
        <p class="mt-1 text-right text-xs text-muted">Slovo {index + 1} / {round.length}</p>
      </div>
      <div class="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-6">
        <p class="text-sm text-muted">Které slovo slyšíš?</p>
        <AudioButton text={q!.pair[q!.played].pt} size="md" withSlow />
      </div>
      <div class="mt-4 grid grid-cols-2 gap-3">
        {order.map((side, i) => {
          const w = q!.pair[side];
          const state = !picked ? 'idle' : side === q!.played ? 'right' : side === picked ? 'wrong' : 'dim';
          const cls = { idle: 'border-line bg-surface hover:border-brand-500', right: 'border-green-600 bg-green-50 dark:bg-green-950', wrong: 'border-red-600 bg-red-50 dark:bg-red-950', dim: 'opacity-50 border-line' }[state];
          return (
            <button key={side} type="button" disabled={!!picked} onClick={() => answer(side)} lang="pt-PT" class={`rounded-2xl border-2 px-3 py-4 text-center ${cls}`}>
              <span class="block text-2xl font-bold">{w.pt}</span>
              <span class="block text-sm text-muted">{w.cs}</span>
              <span class="mt-1 block text-[10px] text-muted">[{i + 1}]</span>
            </button>
          );
        })}
      </div>
      {picked && (
        <div role="status" class={`mt-4 rounded-2xl p-4 ${picked === q!.played ? 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100' : 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'}`}>
          <p class="font-bold">{picked === q!.played ? '✅ Správně!' : `❌ Zaznělo „${q!.pair[q!.played].pt}“`}</p>
          <p class="mt-1 text-sm">💡 {q!.pair.tip}</p>
          <div class="mt-2 flex items-center gap-3 text-sm">
            <span class="flex items-center gap-1"><AudioButton text={q!.pair.a.pt} />{q!.pair.a.pt}</span>
            <span class="flex items-center gap-1"><AudioButton text={q!.pair.b.pt} />{q!.pair.b.pt}</span>
          </div>
          <button type="button" onClick={next} class="mt-3 w-full rounded-xl bg-brand-700 py-3 font-semibold text-white hover:bg-brand-600">
            {index + 1 === round.length ? 'Zobrazit výsledek' : 'Další'} <span class="text-xs opacity-60">(Enter)</span>
          </button>
        </div>
      )}
    </div>
  );
};
