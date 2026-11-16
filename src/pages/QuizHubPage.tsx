import { units, unitUnlocked } from '../content';
import { PASS_RATIO } from '../lib/quiz';
import { useProgress } from '../lib/useProgress';
import { href } from '../router';

const Score = ({ best, passed }: { best?: number; passed?: boolean }) =>
  best === undefined ? null : (
    <span class={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${passed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
      {Math.round(best * 100)} %
    </span>
  );

export const QuizHubPage = () => {
  const progress = useProgress();
  if (!progress) return <p class="py-16 text-center text-stone-500">Načítám…</p>;

  return (
    <div>
      <h1 class="text-2xl font-bold">Testy a kvízy</h1>
      <p class="mt-1 text-stone-600 dark:text-stone-400">
        Test jednotky odemyká další jednotku (minimum {Math.round(PASS_RATIO * 100)} %). Chybná slovíčka se vrací do opakování.
      </p>

      <a href={href('/quiz/quick')} class="mt-6 flex items-center gap-4 rounded-2xl bg-brand-700 p-5 text-white hover:bg-brand-600">
        <span class="text-3xl" aria-hidden="true">⚡</span>
        <span>
          <span class="block font-bold">Rychlý kvíz</span>
          <span class="block text-sm opacity-90">10 otázek na tvoje nejslabší slovíčka</span>
        </span>
      </a>

      {units.map((u) => {
        const unlocked = unitUnlocked(u.id, progress.tests);
        const t = progress.tests.get(u.id);
        return (
          <section key={u.id} class="mt-8">
            <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
              {!unlocked && <span aria-hidden="true">🔒</span>} {u.level} · Jednotka {u.order}: {u.title}
            </h2>
            {unlocked ? (
              <div class="space-y-2">
                <a href={href(`/quiz/${u.id}`)} class="flex items-center gap-3 rounded-2xl border-2 border-brand-500 bg-white p-4 dark:bg-stone-900">
                  <span class="text-2xl" aria-hidden="true">🏆</span>
                  <span>
                    <span class="block font-semibold">Test jednotky</span>
                    <span class="block text-sm text-stone-600 dark:text-stone-400">20 otázek · odemyká další jednotku</span>
                  </span>
                  <Score best={t?.skipped && !t.best ? undefined : t?.best} passed={t?.passed} />
                </a>
                {u.lessons.map((l) => {
                  const lt = progress.tests.get(l.id);
                  return (
                    <a key={l.id} href={href(`/quiz/${l.id}`)} class="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 hover:border-brand-500 dark:border-stone-800 dark:bg-stone-900">
                      <span class="text-xl" aria-hidden="true">✅</span>
                      <span>
                        <span class="block font-medium">{l.title}</span>
                        <span class="block text-sm text-stone-600 dark:text-stone-400">Test lekce · 12 otázek</span>
                      </span>
                      <Score best={lt?.best} passed={lt?.passed} />
                    </a>
                  );
                })}
              </div>
            ) : (
              <p class="rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-500 dark:border-stone-700">
                Zamčeno. Splň test předchozí jednotky.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
};
