import { units } from '../content';
import { useStudySettings } from '../lib/settings';
import { href } from '../router';

const Row = ({ to, title, meta, emoji }: { to: string; title: string; meta: string; emoji: string }) => (
  <a
    href={href(to)}
    class="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 hover:border-brand-500 dark:border-stone-800 dark:bg-stone-900"
  >
    <span class="text-2xl" aria-hidden="true">{emoji}</span>
    <span class="min-w-0">
      <span class="block font-semibold">{title}</span>
      <span class="block text-sm text-stone-600 dark:text-stone-400">{meta}</span>
    </span>
  </a>
);

export const CardsPage = () => {
  const [settings, update] = useStudySettings();
  return (
  <div>
    <h1 class="text-2xl font-bold">Kartičky</h1>
    <p class="mt-1 text-stone-600 dark:text-stone-400">
      Opakování řídí chytrý plán (SRS): karty se vrací v rostoucích odstupech. Vyber balíček.
    </p>
    <label class="mt-4 flex items-center gap-2 text-sm">
      Nových karet denně:
      <select
        value={settings.newPerDay}
        onChange={(e) => update({ newPerDay: Number(e.currentTarget.value) })}
        class="rounded-lg border border-stone-300 bg-white px-2 py-1 dark:border-stone-700 dark:bg-stone-900"
      >
        {[5, 10, 15, 20, 30].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </label>

    <div class="mt-6">
      <Row to="/cards/all" emoji="🌍" title="Všechna slovíčka" meta={`${units.flatMap((u) => u.lessons.flatMap((l) => l.words)).length} karet`} />
    </div>

    {units.map((u) => (
      <section key={u.id} class="mt-8">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
          {u.level} · Jednotka {u.order}: {u.title}
        </h2>
        <div class="space-y-2">
          <Row to={`/cards/${u.id}`} emoji={u.emoji} title="Celá jednotka" meta={`${u.lessons.flatMap((l) => l.words).length} karet`} />
          {u.lessons.map((l) => (
            <Row key={l.id} to={`/cards/${l.id}`} emoji="🃏" title={l.title} meta={`${l.words.length} karet`} />
          ))}
        </div>
      </section>
    ))}
  </div>
  );
};
