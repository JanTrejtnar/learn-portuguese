import { Breadcrumb } from '../components/Breadcrumb';
import { getUnit } from '../content';
import { href } from '../router';
import { NotFoundPage } from './NotFoundPage';

export const UnitPage = ({ id }: { id: string }) => {
  const unit = getUnit(id);
  if (!unit) return <NotFoundPage />;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Lekce', to: '/' }, { label: unit.title }]} />
      <div class="flex items-center gap-3">
        <span class="text-4xl" aria-hidden="true">{unit.emoji}</span>
        <div>
          <h1 class="text-2xl font-bold">{unit.title}</h1>
          <p class="text-stone-600 dark:text-stone-400">{unit.subtitle}</p>
        </div>
      </div>

      <ol class="mt-6 space-y-3">
        {unit.lessons.map((l, i) => (
          <li key={l.id}>
            <a
              href={href(`/lesson/${l.id}`)}
              class="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 hover:border-brand-500 dark:border-stone-800 dark:bg-stone-900"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">{i + 1}</span>
              <span class="min-w-0">
                <span class="block font-semibold">{l.title}</span>
                <span class="block text-sm text-stone-600 dark:text-stone-400">{l.subtitle} · {l.words.length} slov</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
};
