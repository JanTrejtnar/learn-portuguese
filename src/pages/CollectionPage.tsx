import { useEffect, useRef, useState } from 'preact/hooks';
import { units, unitCode } from '../content';
import { postcards } from '../content/postcards';
import { Breadcrumb } from '../components/Breadcrumb';
import { Loading } from '../components/Loading';
import { PostcardCard } from '../components/PostcardScreen';
import { useProgress } from '../lib/useProgress';
import { href } from '../router';

/** Barevné „fotografie“ měst: každé město má vlastní přechod. */
const TONES: [string, string][] = [
  ['#f59e0b', '#dc2626'], ['#0ea5e9', '#6366f1'], ['#10b981', '#0f766e'], ['#ec4899', '#9333ea'],
  ['#f97316', '#be123c'], ['#22c55e', '#0369a1'], ['#eab308', '#ea580c'], ['#06b6d4', '#2563eb'],
];

export const CollectionPage = () => {
  const progress = useProgress();
  const [open, setOpen] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const owned = progress ? units.filter((u) => u.city && postcards[u.id] && progress.tests.get(u.id)?.passed) : [];
  const idx = owned.findIndex((u) => u.id === open);
  const go = (d: number) => { const n = owned[idx + d]; if (n) setOpen(n.id); };
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  if (!progress) return <Loading />;
  const rows = units.filter((u) => u.city && postcards[u.id]);
  const got = owned.length;
  const levels = ['A1', 'A2'] as const;
  const cur = idx >= 0 ? owned[idx] : undefined;
  const tone = (id: string) => TONES[units.findIndex((u) => u.id === id) % TONES.length]!;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Pokrok', to: '/stats' }, { label: 'Sbírka' }]} />
      <h1 class="text-3xl font-bold">Sbírka pohlednic</h1>
      <p class="mt-1 text-muted">Za splněnou jednotku dostaneš pohlednici z jednoho města.</p>
      <div class="mt-3 flex items-center gap-3">
        <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-track" role="progressbar" aria-valuemin={0} aria-valuemax={rows.length} aria-valuenow={got} aria-label="Získané pohlednice">
          <div class="h-full rounded-full bg-gradient-to-r from-brand-700 to-flag-600" style={{ width: `${(got / Math.max(1, rows.length)) * 100}%` }} />
        </div>
        <span class="text-sm font-bold">{got} / {rows.length}</span>
      </div>

      {levels.map((level) => (
        <section key={level}>
          <h2 class="mt-7 mb-3 text-sm font-bold uppercase tracking-wider text-muted">{level === 'A1' ? 'A1 — Začátečník' : 'A2 — Základní'}</h2>
          <ul class="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">
            {rows.filter((u) => u.level === level).map((u) => {
              const has = progress.tests.get(u.id)?.passed === true;
              const [c1, c2] = tone(u.id);
              return (
                <li key={u.id}>
                  {has ? (
                    <button type="button" onClick={() => setOpen(u.id)} aria-haspopup="dialog" class="group block w-full text-left">
                      <span class="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl shadow-soft transition group-hover:shadow-lift group-active:scale-[0.98]" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                        <span class="absolute -bottom-4 -right-3 text-[6.5rem] leading-none opacity-25" aria-hidden="true">{u.city!.icon ?? '📮'}</span>
                        <span class="relative text-5xl drop-shadow" aria-hidden="true">{u.city!.icon ?? '📮'}</span>
                        <span class="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-[#14221a]">{unitCode(u)}</span>
                        <span class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-xs font-black text-brand-950" aria-hidden="true">✓</span>
                      </span>
                      <span class="mt-2 block font-bold leading-tight" lang="pt-PT">{u.city!.name}</span>
                      <span class="block text-sm text-muted">{u.title}</span>
                    </button>
                  ) : (
                    <div>
                      <span class="relative flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface-2">
                        <span class="text-3xl" aria-hidden="true">🔒</span>
                        <span class="absolute left-2 top-2 rounded-full bg-surface px-2 py-0.5 text-xs font-bold text-muted">{unitCode(u)}</span>
                      </span>
                      <span class="mt-2 block font-semibold leading-tight text-ink-soft">Neznámé město</span>
                      <span class="block text-sm text-muted">Splň jednotku {unitCode(u)}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {cur && (
        <div role="dialog" aria-modal="true" aria-label={`Pohlednice: ${cur.city!.name}`} class="fixed inset-0 z-50 overflow-y-auto" style={{ background: `linear-gradient(160deg, ${tone(cur.id)[0]}, ${tone(cur.id)[1]})` }}>
          <div class="mx-auto flex min-h-full max-w-md flex-col px-4 py-4 text-white">
            <div class="flex items-center justify-between">
              <button ref={closeRef} type="button" aria-label="Zavřít" onClick={() => setOpen(null)} class="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-[#14221a] shadow-soft">×</button>
              <span class="rounded-full bg-black/25 px-3 py-1 text-sm font-bold">{idx + 1} / {owned.length}</span>
            </div>
            <div class="flex flex-1 flex-col justify-center">
              <div key={cur.id}><PostcardCard unitId={cur.id} /></div>
              <a href={href(`/unit/${cur.id}`)} class="mx-auto mt-6 inline-flex min-h-11 items-center rounded-xl bg-white/90 px-5 py-2.5 font-bold text-[#14221a] shadow-soft">Otevřít jednotku {unitCode(cur)} →</a>
            </div>
            <div class="mt-4 flex items-center justify-between gap-3">
              <button type="button" onClick={() => go(-1)} disabled={idx === 0} aria-label="Předchozí pohlednice" class="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-2xl font-bold text-[#14221a] shadow-soft disabled:opacity-30">‹</button>
              <button type="button" onClick={() => go(1)} disabled={idx === owned.length - 1} aria-label="Další pohlednice" class="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-2xl font-bold text-[#14221a] shadow-soft disabled:opacity-30">›</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
