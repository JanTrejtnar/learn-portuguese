import type { Progress } from '../lib/db';
import { streakAtRisk, streakOf } from '../lib/stats';
import { coinsEarned } from '../lib/coins';
import { balance, loadShop, validEquipped } from '../lib/shop';
import { BADGES, badgeContext } from '../lib/badges';
import { units } from '../content';
import { Avatar } from './Avatar';
import { Coin } from './Coin';
import { levelInfo, totalXp, xpToday } from '../lib/xp';
import { href } from '../router';
import { Icon } from './Icon';
import { ProgressRing } from './ProgressRing';

/** Úroveň, XP, série a denní cíl na úvodní stránce. */
export const PlayerStrip = ({ progress, goal }: { progress: Progress; goal: number }) => {
  const now = Date.now();
  const xp = totalXp(progress.days);
  const lvl = levelInfo(xp);
  const today = xpToday(progress.days, now);
  const shop = loadShop();
  const frozen = new Set(shop.frozen);
  const streak = streakOf(progress.days, now, frozen);
  const done = today >= goal;
  const ctx = badgeContext(progress, units);
  const standing = { level: ctx.level, badges: new Set(BADGES.filter((b) => b.earned(ctx)).map((b) => b.id)) };
  const coins = balance(coinsEarned(progress, units).total, shop);
  const risk = streakAtRisk(progress.days, now, frozen);

  return (
    <a href={href('/stats')} class="flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 shadow-soft hover:shadow-lift">
      <div class={done ? 'text-brand-600' : 'text-gold-600 dark:text-gold-400'}>
        <ProgressRing value={today} max={goal} size={68}>
          <span class="text-ink">{done ? '✓' : Math.min(today, goal)}</span>
        </ProgressRing>
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-2">
          <span class="flex min-w-0 items-center gap-2 font-bold">
            <Avatar look={shop.look} equipped={validEquipped(shop, standing)} size={32} mood={risk ? 'worried' : done ? 'happy' : 'neutral'} />
            <span class="truncate">Úroveň {lvl.level} · {lvl.name}</span>
          </span>
          {streak > 0 && (
            <span class="flex shrink-0 items-center gap-1 rounded-full bg-flag-50 px-2.5 py-1 text-sm font-bold text-flag-700 dark:bg-flag-900/50 dark:text-flag-100" title={`Série ${streak} dní`}>
              <Icon name="flame" class="h-4 w-4" filled />{streak}
            </span>
          )}
        </div>
        <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-track">
          <div class="h-full rounded-full bg-gold-400 transition-all" style={{ width: `${(lvl.into / lvl.span) * 100}%` }} />
        </div>
        <div class="mt-1.5 text-xs text-muted">
          {xp} XP · <span title="Mince"><Coin class="h-3.5 w-3.5" /> {coins}</span> · denní cíl {done ? 'splněn 🎯' : `${today} / ${goal} XP`}
        </div>
        {risk && <div class="mt-1 text-xs font-semibold text-flag-700 dark:text-flag-100">Série je v ohrožení: dnes ještě něco procvič.</div>}
      </div>
    </a>
  );
};
