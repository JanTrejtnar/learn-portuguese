import { useEffect, useMemo, useState } from 'preact/hooks';
import { Breadcrumb } from '../components/Breadcrumb';
import { Flashcard } from '../components/Flashcard';
import { VoiceWarning } from '../components/VoiceWarning';
import { getDeck } from '../content';
import { speak, stopSpeaking } from '../lib/audio';
import { useStudySettings } from '../lib/settings';
import { href } from '../router';
import type { Word } from '../types';
import { NotFoundPage } from './NotFoundPage';

type Rating = 'again' | 'hard' | 'good' | 'easy';

const ratings: { id: Rating; label: string; key: string; tone: string }[] = [
  { id: 'again', label: 'Znovu', key: '1', tone: 'bg-red-600 hover:bg-red-500' },
  { id: 'hard', label: 'Těžké', key: '2', tone: 'bg-amber-600 hover:bg-amber-500' },
  { id: 'good', label: 'Dobře', key: '3', tone: 'bg-brand-600 hover:bg-brand-500' },
  { id: 'easy', label: 'Snadno', key: '4', tone: 'bg-sky-600 hover:bg-sky-500' },
];

const shuffled = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};

const Toggle = ({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) => (
  <label class="flex cursor-pointer items-center gap-2 text-sm">
    <input type="checkbox" checked={on} onChange={(e) => onChange(e.currentTarget.checked)} class="h-4 w-4 accent-teal-700" />
    {label}
  </label>
);

export const StudyPage = ({ deckId }: { deckId: string }) => {
  const deck = getDeck(deckId);
  if (!deck) return <NotFoundPage />;
  return <Session key={deckId} title={deck.title} words={deck.words} />;
};

const Session = ({ title, words }: { title: string; words: Word[] }) => {
  const [settings, update] = useStudySettings();
  const build = () => (settings.shuffle ? shuffled(words) : [...words]);
  const [queue, setQueue] = useState<Word[]>(build);
  const [flipped, setFlipped] = useState(false);
  const [counts, setCounts] = useState<Record<Rating, number>>({ again: 0, hard: 0, good: 0, easy: 0 });
  const total = words.length;
  const current = queue[0];
  const done = useMemo(() => total - new Set(queue.map((w) => w.id)).size, [queue, total]);

  // Autoplay: když se na kartě objeví portugalština
  useEffect(() => {
    if (!current || !settings.autoplay) return;
    if (settings.direction === 'pt-cs' || flipped) speak(current.pt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, flipped, settings.direction, settings.autoplay]);
  useEffect(() => stopSpeaking, []);

  const rate = (r: Rating) => {
    if (!current || !flipped) return;
    setCounts((c) => ({ ...c, [r]: c[r] + 1 }));
    // Krok 3 nahradí SRS; zatím: „Znovu“ vrátí kartu na konec fronty.
    setQueue((q) => (r === 'again' ? [...q.slice(1), q[0]!] : q.slice(1)));
    setFlipped(false);
  };

  const restart = () => {
    setQueue(build());
    setFlipped(false);
    setCounts({ again: 0, hard: 0, good: 0, easy: 0 });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => (current ? !f : f));
      } else if (['1', '2', '3', '4'].includes(e.key)) rate(ratings[Number(e.key) - 1]!.id);
      else if (e.key.toLowerCase() === 'p' && current) speak(current.pt);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div class="mx-auto max-w-xl">
      <Breadcrumb items={[{ label: 'Kartičky', to: '/cards' }, { label: title }]} />
      <VoiceWarning />

      <div class="mb-4 flex flex-wrap gap-x-5 gap-y-2">
        <button
          type="button"
          class="rounded-lg border border-stone-300 px-3 py-1 text-sm hover:border-brand-500 dark:border-stone-700"
          onClick={() => update({ direction: settings.direction === 'pt-cs' ? 'cs-pt' : 'pt-cs' })}
        >
          ⇄ {settings.direction === 'pt-cs' ? 'PT → CZ' : 'CZ → PT'}
        </button>
        <Toggle label="Autoplay" on={settings.autoplay} onChange={(v) => update({ autoplay: v })} />
        <Toggle label="Zamíchat" on={settings.shuffle} onChange={(v) => { update({ shuffle: v }); }} />
      </div>

      <div class="mb-4" aria-label={`Hotovo ${done} z ${total}`}>
        <div class="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
          <div class="h-full bg-brand-500 transition-all" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <p class="mt-1 text-right text-xs text-stone-500">{done} / {total}</p>
      </div>

      {current ? (
        <>
          <Flashcard word={current} flipped={flipped} direction={settings.direction} onFlip={() => setFlipped((f) => !f)} />
          {flipped ? (
            <div class="mt-4 grid grid-cols-4 gap-2">
              {ratings.map((r) => (
                <button key={r.id} type="button" onClick={() => rate(r.id)} class={`rounded-xl px-2 py-3 text-sm font-semibold text-white ${r.tone}`}>
                  {r.label}
                  <span class="block text-[10px] font-normal opacity-70">[{r.key}]</span>
                </button>
              ))}
            </div>
          ) : (
            <button type="button" onClick={() => setFlipped(true)} class="mt-4 w-full rounded-xl bg-brand-700 py-3 font-semibold text-white hover:bg-brand-600">
              Otočit
            </button>
          )}
          <p class="mt-3 hidden text-center text-xs text-stone-400 md:block">Mezerník = otočit · 1–4 = hodnocení · P = přehrát</p>
        </>
      ) : (
        <div class="rounded-3xl border border-stone-200 bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-900">
          <div class="text-5xl" aria-hidden="true">🎉</div>
          <h2 class="mt-3 text-xl font-bold">Hotovo! Muito bem!</h2>
          <p class="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Znovu: {counts.again} · Těžké: {counts.hard} · Dobře: {counts.good} · Snadno: {counts.easy}
          </p>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={restart} class="rounded-xl bg-brand-700 px-4 py-2.5 font-semibold text-white hover:bg-brand-600">Znovu celý balíček</button>
            <a href={href('/cards')} class="rounded-xl border border-stone-300 px-4 py-2.5 font-semibold dark:border-stone-700">Jiný balíček</a>
          </div>
        </div>
      )}
    </div>
  );
};
