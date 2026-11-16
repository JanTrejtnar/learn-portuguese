import { units, unitUnlocked, unlockedWords } from '../content';
import type { Progress } from '../lib/db';
import { newIntroducedToday } from '../lib/queue';
import { useStudySettings } from '../lib/settings';
import { useProgress } from '../lib/useProgress';
import { streakOf } from './StatsPage';
import { href } from '../router';

const TodayCard = ({ progress }: { progress: Progress }) => {
  const [settings] = useStudySettings();
  const now = Date.now();
  const words = unlockedWords(progress.tests);
  const due = words.filter((w) => (progress.cards.get(w.id)?.due ?? Infinity) <= now).length;
  const unseen = words.filter((w) => !progress.cards.has(w.id)).length;
  const fresh = Math.min(unseen, Math.max(0, settings.newPerDay - newIntroducedToday(progress.days, now)));
  const streak = streakOf(progress.days, now);
  const todo = due + fresh;
  return (
    <div class="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand-700 p-5 text-white">
      <div>
        <div class="text-sm opacity-80">Dnes{streak > 0 ? ` · série ${streak} 🔥` : ''}</div>
        <div class="text-xl font-bold">{todo > 0 ? `${due} k opakování · ${fresh} nových` : 'Na dnes hotovo 🎉'}</div>
      </div>
      {todo > 0 && (
        <a href={href('/cards/all')} class="rounded-xl bg-white px-4 py-2.5 font-semibold text-brand-700 hover:bg-brand-50">Začít</a>
      )}
    </div>
  );
};

export const HomePage = () => {
  const progress = useProgress();
  return (
  <div>
    <h1 class="text-2xl font-bold md:text-3xl">Aprender Português</h1>
    <p class="mt-1 text-stone-600 dark:text-stone-400">
      Evropská portugalština (PT-PT), úroveň A1–A2. Vyber si jednotku.
    </p>

    {progress && <TodayCard progress={progress} />}

    <h2 class="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">A1 — Začátečník</h2>
    <ul class="grid gap-3 sm:grid-cols-2">
      {units.filter((u) => u.level === 'A1').map((u) => {
        const locked = progress ? !unitUnlocked(u.id, progress.tests) : false;
        const t = progress?.tests.get(u.id);
        return (
        <li key={u.id}>
          <a
            href={href(`/unit/${u.id}`)}
            class="flex h-full items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-brand-500 hover:shadow-sm dark:border-stone-800 dark:bg-stone-900"
          >
            <span class="text-3xl" aria-hidden="true">{locked ? '🔒' : u.emoji}</span>
            <span class="min-w-0">
              <span class="block text-xs text-stone-500">Jednotka {u.order} · {u.lessons.length} lekce</span>
              <span class="block font-semibold">{u.title}</span>
              <span class="block text-sm text-stone-600 dark:text-stone-400">{u.subtitle}</span>
            </span>
            {t?.passed && <span class="ml-auto shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">✓ splněno</span>}
            {locked && <span class="ml-auto shrink-0 text-xs text-stone-500">zamčeno</span>}
          </a>
        </li>
        );
      })}
    </ul>

    <p class="mt-8 rounded-xl bg-brand-50 p-4 text-sm text-brand-900 dark:bg-brand-900 dark:text-brand-100">
      🛠️ Aplikace se právě staví. Další jednotky A1, další cvičení přibývají v následujících krocích.
    </p>
  </div>  );
};
