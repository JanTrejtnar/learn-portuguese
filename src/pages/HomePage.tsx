import { units } from '../content';
import { href } from '../router';

export const HomePage = () => (
  <div>
    <h1 class="text-2xl font-bold md:text-3xl">Aprender Português</h1>
    <p class="mt-1 text-stone-600 dark:text-stone-400">
      Evropská portugalština (PT-PT), úroveň A1–A2. Vyber si jednotku.
    </p>

    <h2 class="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">A1 — Začátečník</h2>
    <ul class="grid gap-3 sm:grid-cols-2">
      {units.filter((u) => u.level === 'A1').map((u) => (
        <li key={u.id}>
          <a
            href={href(`/unit/${u.id}`)}
            class="flex h-full items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-brand-500 hover:shadow-sm dark:border-stone-800 dark:bg-stone-900"
          >
            <span class="text-3xl" aria-hidden="true">{u.emoji}</span>
            <span class="min-w-0">
              <span class="block text-xs text-stone-500">Jednotka {u.order} · {u.lessons.length} lekce</span>
              <span class="block font-semibold">{u.title}</span>
              <span class="block text-sm text-stone-600 dark:text-stone-400">{u.subtitle}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>

    <p class="mt-8 rounded-xl bg-brand-50 p-4 text-sm text-brand-900 dark:bg-brand-900 dark:text-brand-100">
      🛠️ Aplikace se právě staví. Další jednotky A1, kartičky s audiem a opakování přibývají v následujících krocích.
    </p>
  </div>
);
