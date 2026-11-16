import { allWords } from '../content';
import { DAY, dateKey, dayStart, maturity, type Maturity } from '../lib/srs';
import { useProgress } from '../lib/useProgress';
import { Breadcrumb } from '../components/Breadcrumb';
import { units } from '../content';
import { BADGES, badgeContext } from '../lib/badges';
import { useStudySettings } from '../lib/settings';
import { streakOf } from '../lib/stats';
import { GOAL_OPTIONS, levelInfo, totalXp, xpToday } from '../lib/xp';

const Tile = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
  <div class="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
    <div class="text-2xl font-bold text-brand-700 dark:text-brand-100">{value}</div>
    <div class="text-sm">{label}</div>
    {hint && <div class="text-xs text-stone-500">{hint}</div>}
  </div>
);

const labels: Record<Maturity, string> = { new: 'Nové', learning: 'Učím se', young: 'Mladé (< 21 d)', mature: 'Zvládnuté (≥ 21 d)' };
const bar: Record<Maturity, string> = { new: 'bg-stone-300 dark:bg-stone-700', learning: 'bg-amber-500', young: 'bg-sky-500', mature: 'bg-brand-600' };

export const StatsPage = () => {
  const progress = useProgress();
  const [settings, update] = useStudySettings();
  if (!progress) return <p class="py-16 text-center text-stone-500">Načítám…</p>;

  const now = Date.now();
  const words = allWords();
  const xp = totalXp(progress.days);
  const lvl = levelInfo(xp);
  const ctx = badgeContext(progress, units.map((u) => u.id));
  const earned = new Set(BADGES.filter((b) => b.earned(ctx)).map((b) => b.id));
  const counts: Record<Maturity, number> = { new: 0, learning: 0, young: 0, mature: 0 };
  for (const w of words) counts[maturity(progress.cards.get(w.id))] += 1;

  const today = progress.days.get(dateKey(now));
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const key = dateKey(dayStart(now) - (29 - i) * DAY);
    return { key, reviews: progress.days.get(key)?.reviews ?? 0 };
  });
  const maxReviews = Math.max(1, ...last30.map((d) => d.reviews));
  const total30 = [...progress.days.values()].filter((d) => d.date >= last30[0]!.key);
  const rev30 = total30.reduce((a, d) => a + d.reviews, 0);
  const again30 = total30.reduce((a, d) => a + d.again, 0);
  const retention = rev30 > 0 ? Math.round(((rev30 - again30) / rev30) * 100) : null;

  const dueNow = words.filter((w) => (progress.cards.get(w.id)?.due ?? Infinity) <= now).length;
  const forecast = Array.from({ length: 7 }, (_, i) => {
    const from = dayStart(now) + i * DAY;
    return words.filter((w) => {
      const due = progress.cards.get(w.id)?.due;
      return due !== undefined && (i === 0 ? due < from + DAY : due >= from && due < from + DAY);
    }).length;
  });
  const hardest = words
    .map((w) => ({ w, lapses: progress.cards.get(w.id)?.lapses ?? 0 }))
    .filter((x) => x.lapses > 0)
    .sort((a, b) => b.lapses - a.lapses)
    .slice(0, 5);
  const wd = ['Dnes', 'Zítra', ...Array.from({ length: 5 }, (_, i) => new Date(dayStart(now) + (i + 2) * DAY).toLocaleDateString('cs-CZ', { weekday: 'short' }))];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Pokrok' }]} />
      <h1 class="text-2xl font-bold">Můj pokrok</h1>

      <div class="mt-5 rounded-2xl bg-brand-700 p-5 text-white">
        <div class="flex items-baseline justify-between">
          <div class="text-xl font-bold">Úroveň {lvl.level} · {lvl.name}</div>
          <div class="text-sm opacity-80">{xp} XP</div>
        </div>
        <div class="mt-3 h-2.5 overflow-hidden rounded-full bg-white/25"><div class="h-full bg-white" style={{ width: `${(lvl.into / lvl.span) * 100}%` }} /></div>
        <div class="mt-1 text-xs opacity-80">{lvl.span - lvl.into} XP do další úrovně</div>
      </div>

      <div class="mt-4 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
        <div class="font-semibold">Denní cíl: {xpToday(progress.days, now)} / {settings.dailyGoal} XP</div>
        <div class="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Denní cíl">
          {GOAL_OPTIONS.map((g) => (
            <button key={g.xp} type="button" role="radio" aria-checked={settings.dailyGoal === g.xp} onClick={() => update({ dailyGoal: g.xp })}
              class={`rounded-xl border-2 px-3 py-2 text-left text-sm ${settings.dailyGoal === g.xp ? 'border-brand-600 bg-brand-50 dark:bg-brand-900' : 'border-stone-200 dark:border-stone-700'}`}>
              <b>{g.label}</b> · {g.xp} XP<span class="block text-xs text-stone-500">{g.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Série dní 🔥" value={streakOf(progress.days, now)} />
        <Tile label="Dnes opakováno" value={today?.reviews ?? 0} hint={`nových: ${today?.newCards ?? 0}`} />
        <Tile label="K opakování teď" value={dueNow} />
        <Tile label="Úspěšnost (30 d)" value={retention === null ? '–' : `${retention} %`} hint={`${rev30} hodnocení`} />
      </div>

      <h2 class="mt-8 mb-3 text-lg font-semibold">Slovní zásoba ({words.length} karet)</h2>
      <div class="flex h-4 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800" role="img" aria-label="Rozložení karet podle zralosti">
        {(Object.keys(counts) as Maturity[]).map((m) => <div key={m} class={bar[m]} style={{ width: `${(counts[m] / words.length) * 100}%` }} />)}
      </div>
      <ul class="mt-3 grid grid-cols-2 gap-2 text-sm">
        {(Object.keys(counts) as Maturity[]).map((m) => (
          <li key={m} class="flex items-center gap-2">
            <span class={`h-3 w-3 rounded-sm ${bar[m]}`} />
            {labels[m]}: <b>{counts[m]}</b>
          </li>
        ))}
      </ul>

      <h2 class="mt-8 mb-3 text-lg font-semibold">Posledních 30 dní</h2>
      <div class="flex h-28 items-end gap-0.5 rounded-2xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900" role="img" aria-label="Počet hodnocení za den">
        {last30.map((d) => (
          <div key={d.key} class="flex-1 rounded-t bg-brand-500" title={`${d.key}: ${d.reviews}`} style={{ height: `${d.reviews === 0 ? 2 : Math.max(6, (d.reviews / maxReviews) * 100)}%`, opacity: d.reviews === 0 ? 0.25 : 1 }} />
        ))}
      </div>

      <h2 class="mt-8 mb-3 text-lg font-semibold">Předpověď na týden</h2>
      <div class="grid grid-cols-7 gap-1 text-center text-xs">
        {forecast.map((n, i) => (
          <div key={i} class="rounded-lg border border-stone-200 bg-white p-2 dark:border-stone-800 dark:bg-stone-900">
            <div class="text-base font-bold">{n}</div>
            <div class="text-stone-500">{wd[i]}</div>
          </div>
        ))}
      </div>

      <h2 class="mt-8 mb-3 text-lg font-semibold">Odznaky ({earned.size} / {BADGES.length})</h2>
      <ul class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {BADGES.map((b) => {
          const got = earned.has(b.id);
          return (
            <li key={b.id} class={`rounded-2xl border p-3 text-center ${got ? 'border-brand-500 bg-white dark:bg-stone-900' : 'border-stone-200 opacity-50 dark:border-stone-800'}`} title={b.desc}>
              <div class={`text-3xl ${got ? '' : 'grayscale'}`} aria-hidden="true">{got ? b.emoji : '🔒'}</div>
              <div class="mt-1 text-sm font-semibold">{b.title}</div>
              <div class="text-xs text-stone-500">{b.desc}</div>
            </li>
          );
        })}
      </ul>

      {hardest.length > 0 && (
        <>
          <h2 class="mt-8 mb-3 text-lg font-semibold">Nejtěžší slovíčka</h2>
          <ul class="space-y-1 text-sm">
            {hardest.map(({ w, lapses }) => (
              <li key={w.id} class="flex justify-between rounded-lg bg-white px-3 py-2 dark:bg-stone-900">
                <span lang="pt-PT" class="font-medium">{w.pt}</span>
                <span class="text-stone-500">{w.cs} · zapomenuto {lapses}×</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
