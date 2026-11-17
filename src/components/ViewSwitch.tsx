import { href } from '../router';
import { Icon } from './Icon';

/** Přepínač pohledu na jednotky: seznam × mapa (dvě podoby téže věci). */
export const ViewSwitch = ({ current, compact = false }: { current: 'list' | 'map'; compact?: boolean }) => (
  <div class={`${compact ? '' : 'mt-4 '}inline-flex rounded-xl border border-line-strong bg-surface p-1 text-sm font-semibold`} role="group" aria-label="Pohled na jednotky">
    {([['list', '/', 'Seznam'], ['map', '/map', 'Mapa']] as const).map(([id, to, label]) => (
      <a key={id} href={href(to)} aria-current={current === id ? 'page' : undefined}
        class={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 ${current === id ? 'bg-brand-700 text-white' : 'text-ink-soft'}`}><Icon name={id === 'list' ? 'list' : 'map'} class="h-4 w-4" />{label}</a>
    ))}
  </div>
);
