import { unitCode, units, unitUnlocked, unlockedWords } from '../content';
import type { Progress } from '../lib/db';
import { newIntroducedToday } from '../lib/queue';
import { useStudySettings } from '../lib/settings';
import { useProgress } from '../lib/useProgress';
import { xpToday } from '../lib/xp';
import { Icon } from '../components/Icon';
import { PlayerStrip } from '../components/PlayerStrip';
import { href } from '../router';

const LEVELS = [
  { level: 'A1', title: 'A1 — Začátečník' },
  { level: 'A2', title: 'A2 — Základní' },
] as const;

const PlayerStripWithSettings = ({ progress }: { progress: Progress }) => {
  const [settings] = useStudySettings();
  return <PlayerStrip progress={progress} goal={settings.dailyGoal} />;
};

const TodayCard = ({ progress }: { progress: Progress }) => {
  const [settings] = useStudySettings();
  const now = Date.now();
  const words = unlockedWords(progress.tests);
  const due = words.filter((w) => (progress.cards.get(w.id)?.due ?? Infinity) <= now).length;
  const unseen = words.filter((w) => !progress.cards.has(w.id)).length;
  const fresh = Math.min(unseen, Math.max(0, settings.newPerDay - newIntroducedToday(progress.days, now)));
  const todo = due + fresh;
  const goalMissing = xpToday(progress.days, now) < settings.dailyGoal;
  const btn = 'inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold-400 px-5 py-2.5 font-bold text-brand-950 shadow-soft hover:bg-gold-300';
  return (
    <div class="relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white shadow-lift">
      <div class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border-[18px] border-gold-400/25" aria-hidden="true" />
      <div class="pointer-events-none absolute -bottom-9 -right-3 h-24 w-24 rounded-full border-[10px] border-flag-600/55" aria-hidden="true" />
      <div class="relative">
        <div class="text-sm font-semibold uppercase tracking-wide text-brand-100">Dnešní plán</div>
        <div class="mt-1 text-2xl font-extrabold">{todo > 0 ? `${due} k opakování · ${fresh} nových` : 'Na dnes hotovo 🎉'}</div>
        <div class="mt-4 flex flex-wrap gap-3">
          {todo > 0 && <a href={href('/cards/all')} class={btn}>Začít<Icon name="arrow" class="h-5 w-5" /></a>}
          {todo === 0 && goalMissing && <a href={href('/quiz/quick')} class={btn}>⚡ Rychlý kvíz za XP</a>}
          {todo === 0 && !goalMissing && <a href={href('/roleplay')} class={btn}>🎭 Zkus scénář<Icon name="arrow" class="h-5 w-5" /></a>}
        </div>
      </div>
    </div>
  );
};

const greeting = (): { pt: string; cs: string } => {
  const h = new Date().getHours();
  return h < 12 ? { pt: 'Bom dia!', cs: 'Dobré ráno' } : h < 19 ? { pt: 'Boa tarde!', cs: 'Dobré odpoledne' } : { pt: 'Boa noite!', cs: 'Dobrý večer' };
};

const quick = [
  { to: '/cards/all', emoji: '🃏', label: 'Karty' },
  { to: '/quiz/quick', emoji: '⚡', label: 'Rychlý kvíz' },
  { to: '/roleplay', emoji: '🎭', label: 'Scénáře' },
  { to: '/speak', emoji: '🎤', label: 'Mluvení' },
];

export const HomePage = () => {
  const progress = useProgress();
  const g = greeting();
  // První odemčená a nesplněná jednotka = „další krok“
  const current = progress ? units.find((u) => unitUnlocked(u.id, progress.tests) && !progress.tests.get(u.id)?.passed) : undefined;
  return (
  <div>
    <p class="text-sm font-semibold text-muted">{g.cs}</p>
    <h1 class="text-3xl font-extrabold md:text-4xl">{g.pt}</h1>

    <div class="mt-5">{progress ? <PlayerStripWithSettings progress={progress} /> : <div class="skeleton h-24" />}</div>
    {progress && <TodayCard progress={progress} />}

    <ul class="mt-4 grid grid-cols-4 gap-2" aria-label="Rychlé akce">
      {quick.map((q) => (
        <li key={q.to}>
          <a href={href(q.to)} class="flex flex-col items-center gap-1 rounded-2xl border border-line bg-surface px-1 py-3 text-center text-xs font-semibold shadow-soft hover:border-brand-500">
            <span class="text-2xl" aria-hidden="true">{q.emoji}</span>
            {q.label}
          </a>
        </li>
      ))}
    </ul>

    {LEVELS.map(({ level, title }) => (
      <section key={level}>
        <h2 class="mt-9 mb-3 text-sm font-bold uppercase tracking-wider text-muted">{title}</h2>
        <ul class="grid gap-3 sm:grid-cols-2">
          {units.filter((u) => u.level === level).map((u) => {
            const locked = progress ? !unitUnlocked(u.id, progress.tests) : false;
            const t = progress?.tests.get(u.id);
            return (
              <li key={u.id}>
                <a
                  href={href(`/unit/${u.id}`)}
                  class={`flex h-full items-center gap-4 rounded-2xl border bg-surface p-4 shadow-soft hover:shadow-lift ${current?.id === u.id ? 'border-brand-600 ring-2 ring-brand-600/30' : 'border-line hover:border-brand-500'} ${locked ? 'opacity-70' : ''}`}
                >
                  <span class={`text-3xl ${locked ? 'opacity-40 grayscale' : ''}`} aria-hidden="true">{u.emoji}</span>
                  <span class="min-w-0">
                    <span class="block text-xs text-muted">Jednotka {unitCode(u)} · {u.lessons.length} lekce</span>
                    <span class="block font-semibold">{u.title}</span>
                    <span class="block text-sm text-ink-soft">{u.subtitle}</span>
                  </span>
                  {t?.passed && <span class="ml-auto shrink-0 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-100">✓ splněno</span>}
                  {current?.id === u.id && <span class="ml-auto shrink-0 rounded-full bg-flag-600 px-2.5 py-1 text-xs font-bold text-white">další krok</span>}
                  {locked && <span class="ml-auto shrink-0 text-muted"><Icon name="lock" class="h-5 w-5" /></span>}
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    ))}

    <p class="mt-8 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900 dark:bg-brand-900/50 dark:text-brand-100">
      🛠️ Úroveň A2 se postupně doplňuje, další jednotky přibývají.
    </p>
  </div>
  );
};
