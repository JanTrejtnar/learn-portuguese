import { Breadcrumb } from '../components/Breadcrumb';
import { useState } from 'preact/hooks';
import { getUnit, units, unitUnlocked } from '../content';
import { saveTest } from '../lib/db';
import { useProgress } from '../lib/useProgress';
import { href } from '../router';
import { NotFoundPage } from './NotFoundPage';

export const UnitPage = ({ id }: { id: string }) => {
  const unit = getUnit(id);
  const progress = useProgress();
  const [, force] = useState(0);
  if (!unit) return <NotFoundPage />;

  const idx = units.findIndex((u) => u.id === unit.id);
  const prev = idx > 0 ? units[idx - 1] : undefined;
  const locked = !!progress && !unitUnlocked(unit.id, progress.tests);

  if (locked && prev && progress) {
    const unlock = () => {
      const old = progress.tests.get(prev.id);
      const result = { id: prev.id, best: old?.best ?? 0, passed: true, attempts: old?.attempts ?? 0, last: Date.now(), skipped: true };
      progress.tests.set(prev.id, result);
      void saveTest(result);
      force((n) => n + 1);
    };
    return (
      <div>
        <Breadcrumb items={[{ label: 'Lekce', to: '/' }, { label: unit.title }]} />
        <div class="py-10 text-center">
          <div class="text-5xl" aria-hidden="true">🔒</div>
          <h1 class="mt-3 text-xl font-bold">{unit.title} je zamčená</h1>
          <p class="mx-auto mt-2 max-w-sm text-ink-soft">
            Odemkneš ji splněním testu jednotky „{prev.title}“ (aspoň 80 %).
          </p>
          <div class="mt-6 flex flex-wrap justify-center gap-3">
            <a href={href(`/quiz/${prev.id}`)} class="rounded-xl bg-brand-700 px-4 py-2.5 font-semibold text-white hover:bg-brand-600">Spustit test</a>
            <button type="button" onClick={unlock} class="rounded-xl border border-line-strong px-4 py-2.5 font-semibold">Už to umím, odemknout</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Lekce', to: '/' }, { label: unit.title }]} />
      <div class="flex items-center gap-3">
        <span class="text-4xl" aria-hidden="true">{unit.emoji}</span>
        <div>
          <h1 class="text-2xl font-bold">{unit.title}</h1>
          <p class="text-ink-soft">{unit.subtitle}</p>
        </div>
      </div>

      <a href={href(`/cards/${unit.id}`)} class="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 font-semibold text-white hover:bg-brand-600">
        🃏 Procvičit celou jednotku
      </a>

      <a href={href(`/quiz/${unit.id}`)} class="mt-3 ml-2 inline-flex items-center gap-2 rounded-xl border border-brand-700 px-4 py-2.5 font-semibold text-brand-700 hover:bg-brand-50 dark:text-brand-100">
        🏆 Test jednotky
      </a>

      <ol class="mt-6 space-y-3">
        {unit.lessons.map((l, i) => (
          <li key={l.id}>
            <a
              href={href(`/lesson/${l.id}`)}
              class="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 hover:border-brand-500"
            >
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">{i + 1}</span>
              <span class="min-w-0">
                <span class="block font-semibold">{l.title}</span>
                <span class="block text-sm text-ink-soft">{l.subtitle} · {l.words.length} slov</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
};
