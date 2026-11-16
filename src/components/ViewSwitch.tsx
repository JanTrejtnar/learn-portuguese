import { href } from '../router';

/** Přepínač pohledu na jednotky: seznam × mapa (dvě podoby téže věci). */
export const ViewSwitch = ({ current, compact = false }: { current: 'list' | 'map'; compact?: boolean }) => (
  <div class={`${compact ? '' : 'mt-4 '}inline-flex rounded-xl border border-line-strong bg-surface p-1 text-sm font-semibold`} role="group" aria-label="Pohled na jednotky">
    {([['list', '/', '☰ Seznam'], ['map', '/map', '🗺️ Mapa']] as const).map(([id, to, label]) => (
      <a key={id} href={href(to)} aria-current={current === id ? 'page' : undefined}
        class={`rounded-lg px-4 py-1.5 ${current === id ? 'bg-brand-700 text-white' : 'text-ink-soft'}`}>{label}</a>
    ))}
  </div>
);
