import { useState } from 'preact/hooks';
import { unitCode, units, unitUnlocked } from '../content';
import { Breadcrumb } from '../components/Breadcrumb';
import { GrammarBlockView } from '../components/GrammarBlockView';
import { Loading } from '../components/Loading';
import { useProgress } from '../lib/useProgress';
import { href } from '../router';

const norm = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Přehled gramatiky ze všech odemčených lekcí s hledáním. */
export const GrammarRefPage = () => {
  const progress = useProgress();
  const [q, setQ] = useState('');
  if (!progress) return <Loading />;
  const needle = norm(q.trim());
  const entries = units
    .filter((u) => unitUnlocked(u.id, progress.tests))
    .flatMap((u) => u.lessons.filter((l) => l.grammar).map((l) => ({ unit: u, lesson: l, block: l.grammar! })))
    .filter((e) => needle.length < 2 || norm([e.block.title, ...e.block.body, ...(e.block.table ? [...e.block.table.headers, ...e.block.table.rows.flat()] : [])].join(' ')).includes(needle));
  return (
    <div>
      <Breadcrumb items={[{ label: 'Procvičit', to: '/practice' }, { label: 'Gramatika' }]} />
      <h1 class="text-2xl font-bold">Přehled gramatiky</h1>
      <p class="mt-1 text-ink-soft">Gramatika ze všech odemčených lekcí na jednom místě.</p>
      <input type="search" value={q} onInput={(e) => setQ(e.currentTarget.value)} placeholder="🔍 Hledat (např. estar, člen, minulý čas)…" aria-label="Hledat v gramatice"
        class="mt-4 w-full rounded-xl border border-line-strong bg-surface px-4 py-3" />
      <p class="mt-3 text-sm text-muted" aria-live="polite">{entries.length ? `Nalezeno: ${entries.length}` : 'Nic nenalezeno.'}</p>
      <div class="mt-3 space-y-3">
        {entries.map((e) => (
          <details key={e.lesson.id} class="rounded-2xl border border-line bg-surface-2 p-3" open={needle.length >= 2}>
            <summary class="cursor-pointer font-semibold">{e.block.title} <span class="text-xs font-normal text-muted">· jednotka {unitCode(e.unit)}</span></summary>
            <div class="mt-3">
              <GrammarBlockView block={e.block} />
              <a href={href(`/lesson/${e.lesson.id}`)} class="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline dark:text-brand-200">Otevřít lekci „{e.lesson.title}“ →</a>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};
