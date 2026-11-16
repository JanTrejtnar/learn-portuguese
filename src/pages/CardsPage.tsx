import { useState } from 'preact/hooks';
import { unitCode, units, unitUnlocked, unlockedWords } from '../content';
import { Breadcrumb } from '../components/Breadcrumb';
import { WordRow } from '../components/WordRow';
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

const norm = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const CardsPage = () => {
  const [q, setQ] = useState('');
  const [settings, update] = useStudySettings();
  const progress = useProgress();
  const open = (id: string) => !progress || unitUnlocked(id, progress.tests);
  const needle = norm(q.trim());
  const hits = needle.length < 2 ? [] : (progress ? unlockedWords(progress.tests) : []).filter(
    (w) => norm(w.pt).includes(needle) || norm(w.cs).includes(needle),
  );
  return (
  <div>
    <Breadcrumb items={[{ label: 'Procvičit', to: '/practice' }, { label: 'Karty' }]} />
    <h1 class="text-2xl font-bold">Kartičky</h1>
    <p class="mt-1 text-ink-soft">
      Opakování řídí chytrý plán (SRS): karty se vrací v rostoucích odstupech. Vyber balíček.
    </p>
    <input
      type="search"
      value={q}
      onInput={(e) => setQ(e.currentTarget.value)}
      placeholder="🔍 Hledat slovíčko (česky i portugalsky)…"
      aria-label="Hledat slovíčko"
      class="mt-4 w-full rounded-xl border border-line-strong bg-surface px-4 py-3"
    />
    {needle.length >= 2 && (
      <div class="mt-3" aria-live="polite">
        <p class="text-sm text-muted">{hits.length ? `Nalezeno: ${hits.length}` : 'Nic nenalezeno (hledá se v odemčených slovíčkách).'}</p>
        <ul class="mt-2 space-y-2">{hits.slice(0, 30).map((w) => <WordRow key={w.pt + w.cs} word={w} />)}</ul>
      </div>
    )}
    <label class="mt-4 flex items-center gap-2 text-sm">
      Nových slovíček v dávce:
      <select
        value={settings.newPerDay}
        onChange={(e) => update({ newPerDay: Number(e.currentTarget.value) })}
        class="rounded-lg border border-line-strong bg-surface px-2 py-1"
      >
        {[5, 10, 15, 20, 30].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </label>

    <div class="mt-6 space-y-2">
      <Row to="/grammar" emoji="🧩" title="Gramatika: doplňování vět" meta="Věty s mezerou z lekcí, opakují se chytrým plánem" />
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
