import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Loading } from '../components/Loading';
import { Breadcrumb } from '../components/Breadcrumb';
import { Flashcard } from '../components/Flashcard';
import { VoiceWarning } from '../components/VoiceWarning';
import { getDeck, unlockedWords } from '../content';
import { speak, stopSpeaking } from '../lib/audio';
import { saveCard, saveDay, type DayStats, type Progress } from '../lib/db';
import { buildQueue, newIntroducedToday, shuffled } from '../lib/queue';
import { useStudySettings } from '../lib/settings';
import { dateKey, previewIntervals, schedule, type Rating } from '../lib/srs';
import { useKeydown } from '../lib/useKeydown';
import { notifyProgress, toast } from '../lib/toast';
import { XP_GOAL_BONUS, awardXp, xpForRating } from '../lib/xp';
import { useProgress } from '../lib/useProgress';
import { href } from '../router';
import type { Word } from '../types';
import { NotFoundPage } from './NotFoundPage';

const ratings: { id: Rating; label: string; key: string; tone: string }[] = [
  { id: 'again', label: 'Znovu', key: '1', tone: 'bg-flag-600 text-white hover:bg-flag-500' },
  { id: 'hard', label: 'Těžké', key: '2', tone: 'bg-gold-400 text-brand-950 hover:bg-gold-300' },
  { id: 'good', label: 'Dobře', key: '3', tone: 'bg-brand-600 text-white hover:bg-brand-500' },
  { id: 'easy', label: 'Snadno', key: '4', tone: 'bg-brand-800 text-white hover:bg-brand-700' },
];

const Toggle = ({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) => (
  <label class="flex cursor-pointer items-center gap-2 text-sm">
    <input type="checkbox" checked={on} onChange={(e) => onChange(e.currentTarget.checked)} class="h-4 w-4 accent-teal-700" />
    {label}
  </label>
);

export const StudyPage = ({ deckId, mode }: { deckId: string; mode: 'srs' | 'free' }) => {
  const deck = getDeck(deckId);
  const progress = useProgress();
  if (!deck) return <NotFoundPage />;
  if (!progress) return <Loading />;
  return <Session key={`${mode}-${deckId}`} title={deck.title} deckId={deckId} words={deckId === 'all' ? unlockedWords(progress.tests) : deck.words} mode={mode} progress={progress} />;
};

interface SessionProps {
  title: string;
  deckId: string;
  words: Word[];
  mode: 'srs' | 'free';
  progress: Progress;
}

const Session = ({ title, deckId, words, mode, progress }: SessionProps) => {
  const [settings, update] = useStudySettings();
  const srs = mode === 'srs';
  const cards = useRef(progress.cards); // průběžně aktualizovaný stav karet
  const days = useRef(progress.days);
  const [bonusNew, setBonusNew] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);

  const initialQueue = (bonus: number): { queue: Word[]; dueCount: number; newCount: number } => {
    const now = Date.now();
    if (!srs) return { queue: settings.shuffle ? shuffled(words) : [...words], dueCount: 0, newCount: 0 };
    const allowance = Math.max(0, settings.newPerDay - newIntroducedToday(days.current, now)) + bonus;
    const { due, fresh } = buildQueue(words, cards.current, allowance, now, settings.shuffle);
    return { queue: [...due, ...fresh], dueCount: due.length, newCount: fresh.length };
  };

  const [init, setInit] = useState(() => initialQueue(0));
  const [queue, setQueue] = useState<Word[]>(init.queue);
  const [flipped, setFlipped] = useState(false);
  const [counts, setCounts] = useState<Record<Rating, number>>({ again: 0, hard: 0, good: 0, easy: 0 });
  const total = init.queue.length;
  const current = queue[0];
  const done = useMemo(() => total - new Set(queue.map((w) => w.id)).size, [queue, total]);
  const unseenLeft = words.filter((w) => !cards.current.has(w.id)).length;

  useEffect(() => {
    if (current && settings.autoplay && (settings.direction === 'pt-cs' || flipped)) speak(current.pt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, flipped, settings.direction, settings.autoplay]);
  useEffect(() => stopSpeaking, []);

  // Pojistka proti dvojímu hodnocení téže karty (dva rychlé stisky před překreslením).
  const locked = useRef(false);
  locked.current = false; // při každém překreslení se odemkne
  const rate = (r: Rating) => {
    if (!current || !flipped || locked.current) return;
    locked.current = true;
    const now = Date.now();
    if (srs) {
      const prev = cards.current.get(current.id);
      const next = schedule(prev, current.id, r, now);
      cards.current.set(current.id, next);
      void saveCard(next);
      const key = dateKey(now);
      const day: DayStats = { ...(days.current.get(key) ?? { date: key, reviews: 0, again: 0, newCards: 0 }) };
      day.reviews += 1;
      if (r === 'again') day.again += 1;
      if (!prev) day.newCards += 1;
      days.current.set(key, day);
      const award = awardXp(days.current, now, xpForRating[r], settings.dailyGoal);
      days.current.set(key, award.day);
      void saveDay(award.day);
      setSessionXp((x) => x + award.gained);
      if (award.goalJustReached) toast({ emoji: '🎯', title: 'Denní cíl splněn!', text: `Bonus +${XP_GOAL_BONUS} XP` });
      notifyProgress();
    }
    setCounts((c) => ({ ...c, [r]: c[r] + 1 }));
    // „Znovu“ vrátí kartu na konec dnešní fronty (do SRS se zapíše i termín za 10 min).
    setQueue((q) => (r === 'again' ? [...q.slice(1), q[0]!] : q.slice(1)));
    setFlipped(false);
  };

  const restart = (bonus = bonusNew) => {
    const next = initialQueue(bonus);
    setInit(next);
    setQueue(next.queue);
    setFlipped(false);
    setCounts({ again: 0, hard: 0, good: 0, easy: 0 });
    setSessionXp(0);
  };

  const learnMore = () => {
    const bonus = bonusNew + 10;
    setBonusNew(bonus);
    restart(bonus);
  };

  useKeydown((e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.metaKey || e.ctrlKey) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setFlipped((f) => (current ? !f : f));
    } else if (['1', '2', '3', '4'].includes(e.key)) rate(ratings[Number(e.key) - 1]!.id);
    else if (e.key.toLowerCase() === 'p' && current) speak(current.pt);
  });

  const intervals = current && srs && flipped ? previewIntervals(cards.current.get(current.id), current.id, Date.now()) : null;
  const sessionDone = total > 0 && !current;
  const nothingToDo = total === 0;

  return (
    <div class="mx-auto max-w-xl">
      <Breadcrumb items={[{ label: 'Kartičky', to: '/cards' }, { label: title }]} />
      <VoiceWarning />

      {!srs && <p class="mb-3 rounded-lg bg-surface-2 px-3 py-2 text-xs text-ink-soft">Volné procvičování: pokrok se neukládá.</p>}

      <div class="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button
          type="button"
          class="rounded-lg border border-line-strong px-3 py-1 text-sm hover:border-brand-500"
          onClick={() => update({ direction: settings.direction === 'pt-cs' ? 'cs-pt' : 'pt-cs' })}
        >
          ⇄ {settings.direction === 'pt-cs' ? 'PT → CZ' : 'CZ → PT'}
        </button>
        <Toggle label="Autoplay" on={settings.autoplay} onChange={(v) => update({ autoplay: v })} />
        {!srs && <Toggle label="Zamíchat" on={settings.shuffle} onChange={(v) => update({ shuffle: v })} />}
      </div>

      {srs && total > 0 && (
        <p class="mb-3 text-sm text-ink-soft">
          K opakování: <b>{init.dueCount}</b> · nové: <b>{init.newCount}</b>
        </p>
      )}

      {total > 0 && (
        <div class="mb-4" aria-label={`Hotovo ${done} z ${total}`}>
          <div class="h-2 overflow-hidden rounded-full bg-track">
            <div class="h-full bg-brand-500 transition-all" style={{ width: `${(done / total) * 100}%` }} />
          </div>
          <p class="mt-1 text-right text-xs text-muted">{done} / {total}</p>
        </div>
      )}

      {current && (
        <>
          <Flashcard word={current} flipped={flipped} direction={settings.direction} onFlip={() => setFlipped((f) => !f)} />
          {flipped ? (
            <div class="mt-4 grid grid-cols-4 gap-2">
              {ratings.map((r) => (
                <button key={r.id} type="button" onClick={() => rate(r.id)} class={`min-h-14 rounded-xl px-2 py-3 text-sm font-bold shadow-soft ${r.tone}`}>
                  {r.label}
                  <span class="block text-[10px] font-normal opacity-80">{intervals ? intervals[r.id] : `[${r.key}]`}</span>
                </button>
              ))}
            </div>
          ) : (
            <button type="button" onClick={() => setFlipped(true)} class="mt-4 w-full rounded-xl bg-brand-700 py-3 font-semibold text-white hover:bg-brand-600">
              Otočit
            </button>
          )}
          <p class="mt-3 hidden text-center text-xs text-muted md:block">Mezerník = otočit · 1–4 = hodnocení · P = přehrát</p>
        </>
      )}

      {(sessionDone || nothingToDo) && (
        <div class="rounded-3xl border border-line bg-surface p-8 text-center">
          <div class="text-5xl" aria-hidden="true">{sessionDone ? '🎉' : '✅'}</div>
          <h2 class="mt-3 text-xl font-bold">{sessionDone ? 'Hotovo! Muito bem!' : 'Na dnes máš splněno'}</h2>
          {sessionDone ? (
            <p class="mt-2 text-sm text-ink-soft">
              Znovu: {counts.again} · Těžké: {counts.hard} · Dobře: {counts.good} · Snadno: {counts.easy}
            </p>
          ) : (
            <p class="mt-2 text-sm text-ink-soft">V tomto balíčku není nic k opakování a denní limit nových karet je vyčerpán.</p>
          )}
          {srs && sessionXp > 0 && <p class="mt-2 text-sm font-semibold text-brand-700 dark:text-brand-100">+{sessionXp} XP ⭐</p>}
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            {srs && unseenLeft > 0 && (
              <button type="button" onClick={learnMore} class="rounded-xl bg-brand-700 px-4 py-2.5 font-semibold text-white hover:bg-brand-600">
                Učit dalších {Math.min(10, unseenLeft)} nových
              </button>
            )}
            {!srs && (
              <button type="button" onClick={() => restart()} class="rounded-xl bg-brand-700 px-4 py-2.5 font-semibold text-white hover:bg-brand-600">Znovu celý balíček</button>
            )}
            {srs && (
              <a href={href(`/free/${deckId}`)} class="rounded-xl border border-line-strong px-4 py-2.5 font-semibold">Volně procvičit</a>
            )}
            <a href={href('/stats')} class="rounded-xl border border-line-strong px-4 py-2.5 font-semibold">Můj pokrok</a>
          </div>
        </div>
      )}
    </div>
  );
};
