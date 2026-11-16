import type { Progress } from '../lib/db';
import { streakOf } from '../lib/stats';
import { levelInfo, totalXp, xpToday } from '../lib/xp';
import { ProgressRing } from './ProgressRing';
import { href } from '../router';

/** Úroveň, XP, série a denní cíl na úvodní stránce. */
export const PlayerStrip = ({ progress, goal }: { progress: Progress; goal: number }) => {
  const now = Date.now();
  const xp = totalXp(progress.days);
  const lvl = levelInfo(xp);
  const today = xpToday(progress.days, now);
  const streak = streakOf(progress.days, now);
  const done = today >= goal;

  return (
    <a href={href('/stats')} class="mt-6 flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 hover:border-brand-500 dark:border-stone-800 dark:bg-stone-900">
      <div class={done ? 'text-green-600' : 'text-brand-600'}>
        <ProgressRing value={today} max={goal}>{done ? '✓' : `${Math.min(today, goal)}`}</ProgressRing>
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-baseline justify-between gap-2">
          <span class="font-semibold">Úroveň {lvl.level} · {lvl.name}</span>
          <span class="shrink-0 text-sm">{streak > 0 ? `🔥 ${streak}` : ''}</span>
        </div>
        <div class="mt-2 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
          <div class="h-full bg-brand-500 transition-all" style={{ width: `${(lvl.into / lvl.span) * 100}%` }} />
        </div>
        <div class="mt-1 text-xs text-stone-500">
          {xp} XP · denní cíl {done ? 'splněn 🎯' : `${today} / ${goal} XP`}
        </div>
      </div>
    </a>
  );
};
