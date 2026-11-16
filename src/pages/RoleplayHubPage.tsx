import { Breadcrumb } from '../components/Breadcrumb';
import { getUnit, unitUnlocked } from '../content';
import { scenarios } from '../content/roleplay';
import { starsOf } from '../lib/roleplay';
import { useProgress } from '../lib/useProgress';
import { href } from '../router';

export const RoleplayHubPage = () => {
  const progress = useProgress();
  if (!progress) return <p class="py-16 text-center text-stone-500">Načítám…</p>;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Praxe', to: '/practice' }, { label: 'Scénáře' }]} />
      <h1 class="text-2xl font-bold">Scénáře 🎭</h1>
      <p class="mt-1 text-stone-600 dark:text-stone-400">Rozhovory se rozvětvují podle tvých odpovědí. Za každý tah dostaneš zpětnou vazbu.</p>
      <ul class="mt-6 space-y-3">
        {scenarios.map((s) => {
          const open = unitUnlocked(s.unitId, progress.tests);
          const best = progress.tests.get(`rp:${s.id}`);
          const unit = getUnit(s.unitId);
          const stars = best?.passed ? starsOf(best.best) : 0;
          const body = (
            <>
              <span class="text-4xl" aria-hidden="true">{open ? s.emoji : '🔒'}</span>
              <span class="min-w-0 flex-1">
                <span class="block font-semibold">{s.title}</span>
                <span class="block text-sm text-stone-600 dark:text-stone-400">{open ? s.goal : `Odemkne se v jednotce „${unit?.title}“.`}</span>
              </span>
              {stars > 0 && <span class="shrink-0 text-sm" aria-label={`${stars} hvězdy`}>{'⭐'.repeat(stars)}</span>}
            </>
          );
          return (
            <li key={s.id}>
              {open ? (
                <a href={href(`/roleplay/${s.id}`)} class="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 hover:border-brand-500 dark:border-stone-800 dark:bg-stone-900">{body}</a>
              ) : (
                <div class="flex items-center gap-4 rounded-2xl border border-dashed border-stone-300 p-4 opacity-70 dark:border-stone-700">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
