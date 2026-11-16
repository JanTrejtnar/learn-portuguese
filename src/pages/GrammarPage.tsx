import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { units, unitUnlocked } from '../content';
import { AudioButton } from '../components/AudioButton';
import { Breadcrumb } from '../components/Breadcrumb';
import { Loading } from '../components/Loading';
import { playCorrect, playWrong } from '../lib/sound';
import { ChoiceQuestion, type Answer } from '../components/QuizQuestions';
import { VoiceWarning } from '../components/VoiceWarning';
import { saveCard, saveDay, type DayStats, type Progress } from '../lib/db';
import { GRAMMAR_NEW_PER_SESSION, buildGrammarQueue, grammarCards, type GrammarCard } from '../lib/grammar';
import type { ChoiceQ } from '../lib/quiz';
import { shuffled } from '../lib/queue';
import { useStudySettings } from '../lib/settings';
import { dateKey, schedule } from '../lib/srs';
import { notifyProgress, toast } from '../lib/toast';
import { useKeydown } from '../lib/useKeydown';
import { useProgress } from '../lib/useProgress';
import { XP_GOAL_BONUS, awardXp, xpForRating } from '../lib/xp';
import { href } from '../router';

const toQuestion = (c: GrammarCard): ChoiceQ => {
  const options = shuffled([c.item.answer, ...c.item.distractors]);
  return { id: c.id, kind: 'cloze', wordIds: [], prompt: c.item.pt, hint: c.item.cs, options, optionsLang: 'pt', answer: options.indexOf(c.item.answer) };
};

export const GrammarPage = () => {
  const progress = useProgress();
  if (!progress) return <Loading />;
  return <Session progress={progress} />;
};

const Session = ({ progress }: { progress: Progress }) => {
  const [settings] = useStudySettings();
  const all = useMemo(() => grammarCards(units.filter((u) => unitUnlocked(u.id, progress.tests))), []);
  const cards = useRef(progress.cards);
  const days = useRef(progress.days);
  const build = () => {
    const { due, fresh } = buildGrammarQueue(all, cards.current, Date.now());
    return { queue: [...due, ...fresh], dueCount: due.length, newCount: fresh.length };
  };
  const [init, setInit] = useState(build);
  const [queue, setQueue] = useState<GrammarCard[]>(init.queue);
  const [answer, setAnswer] = useState<Answer | null>(null);
  useEffect(() => {
    if (answer) (answer.correct ? playCorrect : playWrong)();
  }, [answer]);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [xp, setXp] = useState(0);
  const current = queue[0];
  const question = useMemo(() => (current ? toQuestion(current) : null), [current?.id, queue.length]);
  const total = init.queue.length;
  const unseenLeft = all.filter((c) => !cards.current.has(c.id)).length;
  const closing = useRef(false);
  closing.current = false;

  const next = () => {
    if (!current || !answer || closing.current) return;
    closing.current = true;
    const now = Date.now();
    const rating = answer.correct ? 'good' : 'again';
    const nextState = schedule(cards.current.get(current.id), current.id, rating, now);
    cards.current.set(current.id, nextState);
    void saveCard(nextState);
    const key = dateKey(now);
    const day: DayStats = { ...(days.current.get(key) ?? { date: key, reviews: 0, again: 0, newCards: 0 }) };
    day.reviews += 1;
    if (!answer.correct) day.again += 1;
    days.current.set(key, day);
    const award = awardXp(days.current, now, xpForRating[rating], settings.dailyGoal);
    days.current.set(key, award.day);
    void saveDay(award.day);
    setXp((x) => x + award.gained);
    if (award.goalJustReached) toast({ emoji: '🎯', title: `Denní cíl splněn! +${XP_GOAL_BONUS} XP` });
    notifyProgress();
    answer.correct ? setRight((n) => n + 1) : setWrong((n) => n + 1);
    setQueue((q) => (answer.correct ? q.slice(1) : [...q.slice(1), q[0]!]));
    setAnswer(null);
  };

  useKeydown((e) => {
    if (e.key === 'Enter' && !e.repeat && answer) {
      e.preventDefault();
      next();
    }
  });

  const more = () => {
    const b = build();
    setInit(b);
    setQueue(b.queue);
    setRight(0);
    setWrong(0);
    setXp(0);
  };

  const filled = current && answer ? current.item.pt.replace('___', current.item.answer) : '';
  const done = total > 0 && !current;

  return (
    <div class="mx-auto max-w-xl">
      <Breadcrumb items={[{ label: 'Procvičit', to: '/practice' }, { label: 'Gramatika' }]} />
      <VoiceWarning />
      <h1 class="text-2xl font-bold">Gramatika: doplňování vět</h1>
      <p class="mt-1 text-sm text-ink-soft">Věty s mezerou z lekcí se opakují stejným plánem jako slovíčka. K opakování: <b>{init.dueCount}</b> · nové: <b>{init.newCount}</b></p>

      {total > 0 && (
        <div class="mt-4" aria-label={`Hotovo ${right} z ${total}`}>
          <div class="h-2 overflow-hidden rounded-full bg-track"><div class="h-full bg-brand-500 transition-all" style={{ width: `${Math.min(100, (right / total) * 100)}%` }} /></div>
          <p class="mt-1 text-right text-xs text-muted">{right} / {total}</p>
        </div>
      )}

      {current && question && (
        <div class="mt-4">
          <p class="mb-2 text-xs text-muted">Z lekce: {current.lessonTitle}</p>
          <ChoiceQuestion key={`${question.id}-${queue.length}`} q={question} answer={answer} onAnswer={setAnswer} />
          {answer && (
            <div class={`mt-4 rounded-xl p-3 text-sm ${answer.correct ? 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100' : 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'}`} role="status">
              <p class="font-semibold">{answer.correct ? 'Správně!' : 'Zatím ne. Vrátí se na konec sady.'}</p>
              <p class="mt-1 flex items-center gap-2"><span lang="pt-PT">{filled}</span> <AudioButton text={filled} /></p>
            </div>
          )}
          {answer && (
            <button type="button" onClick={next} class="mt-3 w-full rounded-xl bg-brand-700 py-3 font-semibold text-white hover:bg-brand-600">
              Další
            </button>
          )}
        </div>
      )}

      {(done || total === 0) && (
        <div class="mt-6 rounded-3xl border border-line bg-surface p-8 text-center">
          <div class="text-5xl" aria-hidden="true">{done ? '🎉' : '✅'}</div>
          <h2 class="mt-3 text-xl font-bold">{done ? 'Hotovo!' : 'Na dnes nic nezbývá'}</h2>
          <p class="mt-2 text-sm text-ink-soft">
            {done ? `Správně ${right} · špatně ${wrong}` : all.length === 0 ? 'Zatím nejsou odemčené žádné věty.' : 'Nic není k opakování.'}
          </p>
          {done && xp > 0 && <p class="mt-2 text-sm font-semibold text-brand-700 dark:text-brand-100">+{xp} XP ⭐</p>}
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            {unseenLeft > 0 && (
              <button type="button" onClick={more} class="rounded-xl bg-brand-700 px-4 py-2.5 font-semibold text-white hover:bg-brand-600">
                Dalších {Math.min(GRAMMAR_NEW_PER_SESSION, unseenLeft)} nových vět
              </button>
            )}
            <a href={href('/cards')} class="rounded-xl border border-line-strong px-4 py-2.5 font-semibold">Zpět na karty</a>
          </div>
        </div>
      )}
    </div>
  );
};
