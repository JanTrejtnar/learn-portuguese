import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Loading } from '../components/Loading';
import { Breadcrumb } from '../components/Breadcrumb';
import { AudioButton } from '../components/AudioButton';
import { Flashcard } from '../components/Flashcard';
import { TypingQuestion, type Answer } from '../components/QuizQuestions';
import { hasInfo, WordInfo } from '../components/WordInfo';
import { VoiceWarning } from '../components/VoiceWarning';
import { allWords, getDeck, unlockedWords } from '../content';
import { speak, stopSpeaking } from '../lib/audio';
import { saveCard, saveDay, type DayStats, type Progress } from '../lib/db';
import { typingQuestion } from '../lib/quiz';
import { recallVariant } from '../lib/recall';
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

/** Po kolika zapomenutích se karta považuje za „pijavici“ a ukáže se jí vysvětlení. */
const LEECH_LAPSES = 4;

interface RatingDef { id: Rating; label: string; key: string; tone: string }
const advancedRatings: RatingDef[] = [
  { id: 'again', label: 'Nevěděl jsem', key: '1', tone: 'bg-flag-600 text-white hover:bg-flag-500' },
  { id: 'hard', label: 'Těžce', key: '2', tone: 'bg-gold-400 text-brand-950 hover:bg-gold-300' },
  { id: 'good', label: 'Věděl jsem', key: '3', tone: 'bg-brand-600 text-white hover:bg-brand-500' },
  { id: 'easy', label: 'Hračka', key: '4', tone: 'bg-brand-800 text-white hover:bg-brand-700' },
];
const simpleRatings: RatingDef[] = [
  { id: 'again', label: 'Neznal jsem', key: '1', tone: 'bg-flag-600 text-white hover:bg-flag-500' },
  { id: 'good', label: 'Znal jsem', key: '2', tone: 'bg-brand-600 text-white hover:bg-brand-500' },
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
  const introduced = useRef(new Set<string>()); // nové karty, které už uživatel viděl v „učím se“ kroku
  const [counts, setCounts] = useState<Record<Rating, number>>({ again: 0, hard: 0, good: 0, easy: 0 });
  const total = init.queue.length;
  const current = queue[0];
  // Nová karta se nejdřív jen ukáže (bez hodnocení); po prohlédnutí se vrátí na konec fronty už jako zkouška.
  const learning = srs && !!current && !cards.current.has(current.id) && !introduced.current.has(current.id);
  // Aktivní vybavování: u známých slov se místo otočení karty píše odpověď (nebo diktát).
  const [recallAns, setRecallAns] = useState<Answer | null>(null);
  const [noTyping, setNoTyping] = useState(false);
  const variant = srs && !noTyping && current && !learning ? recallVariant(current, cards.current.get(current.id), settings.recall, dateKey(Date.now())) : null;
  const recallQ = useMemo(() => (variant && current ? typingQuestion(current, allWords(), variant, `r-${current.id}`) : null), [current?.id, variant]);
  const done = useMemo(() => total - new Set(queue.map((w) => w.id)).size, [queue, total]);
  const unseenLeft = words.filter((w) => !cards.current.has(w.id)).length;

  useEffect(() => {
    if (current && !variant && settings.autoplay && (settings.direction === 'pt-cs' || flipped)) speak(current.pt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, flipped, settings.direction, settings.autoplay, !!variant]);
  useEffect(() => stopSpeaking, []);

  // Pojistka proti dvojímu hodnocení téže karty (dva rychlé stisky před překreslením).
  const locked = useRef(false);
  locked.current = false; // při každém překreslení se odemkne
  const rate = (r: Rating, fromRecall = false) => {
    if (!current || (!flipped && !fromRecall) || locked.current) return;
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
    setRecallAns(null);
  };

  const learnNext = () => {
    if (!current) return;
    introduced.current.add(current.id);
    setQueue((q) => [...q.slice(1), q[0]!]);
    setFlipped(false);
  };

  const restart = (bonus = bonusNew) => {
    const next = initialQueue(bonus);
    setInit(next);
    setQueue(next.queue);
    setFlipped(false);
    setCounts({ again: 0, hard: 0, good: 0, easy: 0 });
    setSessionXp(0);
    introduced.current = new Set();
  };

  const learnMore = () => {
    const bonus = bonusNew + 10;
    setBonusNew(bonus);
    restart(bonus);
  };

  useKeydown((e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.metaKey || e.ctrlKey) return;
    if (variant) {
      if (e.key === 'Enter' && !e.repeat && recallAns) {
        e.preventDefault();
        rate(recallAns.correct ? 'good' : 'again', true);
      }
      return;
    }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (learning) { learnNext(); return; }
      setFlipped((f) => (current ? !f : f));
    } else if (['1', '2', '3', '4'].includes(e.key)) {
      if (flipped && !learning) {
        const r = ratings[Number(e.key) - 1];
        if (r) rate(r.id);
      }
    }
    else if (e.key.toLowerCase() === 'p' && current) speak(current.pt);
  });

  const ratings = settings.simpleRating ? simpleRatings : advancedRatings;
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

      {current && variant && recallQ && (
        <div>
          <div class="rounded-3xl border border-line bg-surface p-5 shadow-soft">
            <TypingQuestion key={recallQ.id} q={recallQ} answer={recallAns} onAnswer={setRecallAns} />
            {recallAns && (
              <div class={`mt-4 rounded-xl p-3 text-sm ${recallAns.correct ? 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100' : 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'}`} role="status">
                <p class="font-semibold">{recallAns.correct ? (recallAns.note ?? 'Správně!') : 'Zatím ne.'}</p>
                <p class="mt-1 flex items-center gap-2">Správně: <b lang="pt-PT">{current.pt}</b> <AudioButton text={current.pt} /></p>
              </div>
            )}
          </div>
          {recallAns ? (
            <button type="button" onClick={() => rate(recallAns.correct ? 'good' : 'again', true)} class="mt-4 w-full rounded-xl bg-brand-700 py-3 font-semibold text-white hover:bg-brand-600">
              Další <span class="text-xs opacity-60">(Enter)</span>
            </button>
          ) : (
            <button type="button" onClick={() => setNoTyping(true)} class="mt-3 text-xs text-muted underline">Dnes bez psaní (jen otáčet karty)</button>
          )}
        </div>
      )}

      {current && !variant && (
        <>
          <Flashcard key={current.id + (learning ? '-new' : '')} word={current} flipped={flipped || learning} direction={settings.direction} onFlip={() => setFlipped((f) => !f)} />
          {srs && flipped && (cards.current.get(current.id)?.lapses ?? 0) >= LEECH_LAPSES && (
            <div class="mt-3 rounded-xl border border-gold-400/60 bg-gold-400/10 p-3 text-sm">
              <p><b>Tvrdé slovíčko.</b> Zapomněl(a) ses ho už {cards.current.get(current.id)!.lapses}×. Zkus si ho spojit s obrázkem, vlastní větou nebo podobným českým slovem.</p>
              {hasInfo(current) && <div class="mt-2"><WordInfo word={current} /></div>}
            </div>
          )}
          {learning ? (
            <div class="mt-4">
              <p class="mb-2 rounded-xl border border-gold-400/60 bg-gold-400/10 p-3 text-sm"><b>Nové slovíčko.</b> Prohlédni si ho a poslechni výslovnost. Za chvíli se tě na něj zeptám.</p>
              <button type="button" onClick={learnNext} class="w-full rounded-xl bg-brand-700 py-3 font-semibold text-white hover:bg-brand-600">Rozumím, dál</button>
            </div>
          ) : flipped ? (
            <div class="mt-4">
              {srs && !settings.ratingHelpSeen && (
                <div class="mb-3 rounded-xl border border-gold-400/60 bg-gold-400/10 p-3 text-sm">
                  <p><b>Jak hodnotit?</b> Řekni, jak dobře jsi slovíčko znal. Čím lépe ho znáš, tím později ti ho ukážu znovu. Pod tlačítkem vidíš, kdy to bude.</p>
                  <button type="button" onClick={() => update({ ratingHelpSeen: true })} class="mt-2 rounded-lg bg-brand-700 px-3 py-1 text-xs font-semibold text-white">Rozumím</button>
                </div>
              )}
              <div class={`grid gap-2 ${settings.simpleRating ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
              {ratings.map((r) => (
                <button key={r.id} type="button" onClick={() => rate(r.id)} class={`min-h-14 rounded-xl px-2 py-3 text-sm font-bold shadow-soft ${r.tone}`}>
                  {r.label}
                  <span class="block text-[11px] font-normal opacity-90">{intervals ? intervals[r.id] : `[${r.key}]`}</span>
                </button>
              ))}
              </div>
              {srs && (
                <button type="button" class="mt-2 text-xs text-muted underline" onClick={() => update({ simpleRating: !settings.simpleRating })}>
                  {settings.simpleRating ? 'Chci podrobnější hodnocení (4 tlačítka)' : 'Zpět na jednoduché hodnocení'}
                </button>
              )}
            </div>
          ) : (
            <button type="button" onClick={() => setFlipped(true)} class="mt-4 w-full rounded-xl bg-brand-700 py-3 font-semibold text-white hover:bg-brand-600">
              Otočit
            </button>
          )}
          <p class="mt-3 hidden text-center text-xs text-muted md:block">Mezerník = otočit · 1–{ratings.length} = hodnocení · P = přehrát · I = vysvětlení</p>
        </>
      )}

      {(sessionDone || nothingToDo) && (
        <div class="rounded-3xl border border-line bg-surface p-8 text-center">
          <div class="text-5xl" aria-hidden="true">{sessionDone ? '🎉' : '✅'}</div>
          <h2 class="mt-3 text-xl font-bold">{sessionDone ? 'Hotovo! Muito bem!' : 'Na dnes máš splněno'}</h2>
          {sessionDone ? (
            <p class="mt-2 text-sm text-ink-soft">
              {[['Znovu', counts.again], ['Těžké', counts.hard], ['Dobře', counts.good], ['Snadno', counts.easy]].filter(([, n]) => n).map(([l, n]) => `${l}: ${n}`).join(' · ') || 'Žádné hodnocení'}
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
