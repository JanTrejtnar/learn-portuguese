import { unitCode, units, unitUnlocked, unlockedWords } from '../content';
import { useProgress } from '../lib/useProgress';
import { useStudySettings } from '../lib/settings';
import { href } from '../router';

const Row = ({ to, title, meta, emoji }: { to: string; title: string; meta: string; emoji: string }) => (
  <a
    href={href(to)}
    class="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 hover:border-brand-500"
  >
    <span class="text-2xl" aria-hidden="true">{emoji}</span>
    <span class="min-w-0">
      <span class="block font-semibold">{title}</span>
      <span class="block text-sm text-ink-soft">{meta}</span>
    </span>
  </a>
);

export const CardsPage = () => {
  const [settings, update] = useStudySettings();
  const progress = useProgress();
  const open = (id: string) => !progress || unitUnlocked(id, progress.tests);
  return (
  <div>
    <h1 class="text-2xl font-bold">Kartičky</h1>
    <p class="mt-1 text-ink-soft">
      Opakování řídí chytrý plán (SRS): karty se vrací v rostoucích odstupech. Vyber balíček.
    </p>
    <label class="mt-4 flex items-center gap-2 text-sm">
      Nových karet denně:
      <select
        value={settings.newPerDay}
        onChange={(e) => update({ newPerDay: Number(e.currentTarget.value) })}
        class="rounded-lg border border-line-strong bg-surface px-2 py-1"
      >
        {[5, 10, 15, 20, 30].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </label>

    <div class="mt-6">
      <Row to="/cards/all" emoji="🌍" title="Všechna odemčená slovíčka" meta={`${progress ? unlockedWords(progress.tests).length : '…'} karet · denní plán`} />
    </div>

    {units.filter((u) => open(u.id)).map((u) => (
      <section key={u.id} class="mt-8">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Jednotka {unitCode(u)}: {u.title}
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
