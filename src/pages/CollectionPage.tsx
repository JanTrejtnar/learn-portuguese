import { units, unitCode } from '../content';
import { postcards } from '../content/postcards';
import { AudioButton } from '../components/AudioButton';
import { Breadcrumb } from '../components/Breadcrumb';
import { Loading } from '../components/Loading';
import { useProgress } from '../lib/useProgress';

export const CollectionPage = () => {
  const progress = useProgress();
  if (!progress) return <Loading />;
  const rows = units.filter((u) => u.city && postcards[u.id]);
  const got = rows.filter((u) => progress.tests.get(u.id)?.passed).length;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Pokrok', to: '/stats' }, { label: 'Sbírka' }]} />
      <h1 class="text-3xl font-bold">Sbírka pohlednic</h1>
      <p class="mt-1 text-muted">Za splněný test každé jednotky dostaneš pohlednici z jednoho města. Máš {got} z {rows.length}.</p>
      <ul class="mt-5 grid gap-3 sm:grid-cols-2">
        {rows.map((u) => {
          const card = postcards[u.id]!;
          const has = progress.tests.get(u.id)?.passed === true;
          return has ? (
            <li key={u.id} class="rounded-2xl border border-brand-500 bg-surface p-4 shadow-soft">
              <div class="flex items-center gap-3">
                <span class="text-4xl" aria-hidden="true">{u.city!.icon ?? '📮'}</span>
                <div>
                  <div class="text-lg font-bold">{u.city!.name}</div>
                  <div class="text-xs text-muted">Jednotka {unitCode(u)}: {u.title}</div>
                </div>
              </div>
              <p class="mt-3 text-sm">{card.fact}</p>
              <p class="mt-3 flex items-center gap-2 text-sm">
                <AudioButton text={card.pt} />
                <span>
                  <span lang="pt-PT" class="italic">{card.pt}</span>
                  <span class="block text-muted">{card.cs}</span>
                </span>
              </p>
            </li>
          ) : (
            <li key={u.id} class="flex items-center gap-3 rounded-2xl border border-dashed border-line-strong p-4">
              <span class="text-3xl" aria-hidden="true">🔒</span>
              <div>
                <div class="font-semibold">Pohlednice z neznámého města</div>
                <div class="text-sm text-muted">Splň test jednotky {unitCode(u)}.</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
