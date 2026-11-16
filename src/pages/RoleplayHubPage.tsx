import { Breadcrumb } from '../components/Breadcrumb';
import { Loading } from '../components/Loading';
import { getUnit, unitUnlocked } from '../content';
import { scenarios } from '../content/roleplay';
import { starsOf } from '../lib/roleplay';
import { useProgress } from '../lib/useProgress';
import { href } from '../router';

export const RoleplayHubPage = () => {
  const progress = useProgress();
  if (!progress) return <Loading />;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Procvičit', to: '/practice' }, { label: 'Scénáře' }]} />
      <h1 class="text-2xl font-bold">Scénáře 🎭</h1>
      <p class="mt-1 text-ink-soft">Rozhovory se rozvětvují podle tvých odpovědí. Za každý tah dostaneš zpětnou vazbu.</p>
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
                <span class="block text-sm text-ink-soft">{open ? s.goal : `Odemkne se v jednotce „${unit?.title}“.`}</span>
              </span>
              {stars > 0 && <span class="shrink-0 text-sm" aria-label={`${stars} hvězdy`}>{'⭐'.repeat(stars)}</span>}
            </>
          );
          return (
            <li key={s.id}>
              {open ? (
                <a href={href(`/roleplay/${s.id}`)} class="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 hover:border-brand-500">{body}</a>
              ) : (
                <div class="flex items-center gap-4 rounded-2xl border border-dashed border-line-strong p-4 opacity-70">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
