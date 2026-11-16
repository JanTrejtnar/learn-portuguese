import type { ComponentChildren } from 'preact';
import { href } from '../router';
import { ToastHost } from './ToastHost';

interface NavItem {
  label: string;
  icon: string;
  to: string;
  /** Ještě neimplementováno (další kroky plánu). */
  soon?: boolean;
  active: (path: string) => boolean;
}

const nav: NavItem[] = [
  { label: 'Lekce', icon: '📚', to: '/', active: (p) => p === '/' || p.startsWith('/unit') || p.startsWith('/lesson') },
  { label: 'Karty', icon: '🃏', to: '/cards', active: (p) => p.startsWith('/cards') || p.startsWith('/free') },
  { label: 'Testy', icon: '✅', to: '/quiz', active: (p) => p.startsWith('/quiz') },
  { label: 'Mapa', icon: '🗺️', to: '/map', active: (p) => p.startsWith('/map') },
  { label: 'Pokrok', icon: '📈', to: '/stats', active: (p) => p.startsWith('/stats') },
];

const NavLink = ({ item, path, vertical }: { item: NavItem; path: string; vertical: boolean }) => {
  const active = item.active(path);
  const base = vertical
    ? 'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium'
    : 'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium';
  const tone = item.soon
    ? 'cursor-not-allowed text-stone-400 dark:text-stone-600'
    : active
      ? 'text-brand-700 dark:text-brand-100 ' + (vertical ? 'bg-brand-50 dark:bg-brand-900' : '')
      : 'text-stone-600 hover:text-brand-700 dark:text-stone-400';
  const content = (
    <>
      <span class="text-xl leading-none" aria-hidden="true">{item.icon}</span>
      <span>{item.label}</span>
      {item.soon && vertical && <span class="ml-auto rounded bg-stone-200 px-1.5 text-[10px] uppercase dark:bg-stone-800">brzy</span>}
    </>
  );
  return item.soon ? (
    <span class={`${base} ${tone}`} aria-disabled="true" title="Připravujeme v dalších krocích">{content}</span>
  ) : (
    <a href={href(item.to)} class={`${base} ${tone}`} aria-current={active ? 'page' : undefined}>{content}</a>
  );
};

export const Layout = ({ path, children }: { path: string; children: ComponentChildren }) => (
  <div class="mx-auto flex min-h-full max-w-5xl flex-col md:flex-row md:gap-6 md:px-6">
    {/* Desktop: boční panel */}
    <aside class="hidden w-56 shrink-0 py-8 md:block">
      <a href={href('/')} class="mb-8 block">
        <div class="text-2xl font-bold text-brand-700 dark:text-brand-100">Aprender 🇵🇹</div>
        <div class="text-xs text-stone-500">Evropská portugalština · A1/A2</div>
      </a>
      <nav class="flex flex-col gap-1" aria-label="Hlavní navigace">
        {nav.map((item) => <NavLink key={item.to} item={item} path={path} vertical />)}
      </nav>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      {/* Mobil: horní lišta */}
      <header class="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/90 px-4 py-3 backdrop-blur md:hidden dark:border-stone-800 dark:bg-stone-950/90">
        <a href={href('/')} class="text-lg font-bold text-brand-700 dark:text-brand-100">Aprender 🇵🇹</a>
      </header>

      <main class="flex-1 px-4 py-6 pb-28 md:py-8 md:pb-8">{children}</main>
    </div>

    <ToastHost path={path} />

    {/* Mobil: spodní navigace */}
    <nav
      class="fixed inset-x-0 bottom-0 z-10 flex border-t border-stone-200 bg-stone-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden dark:border-stone-800 dark:bg-stone-950/95"
      aria-label="Hlavní navigace"
    >
      {nav.map((item) => <NavLink key={item.to} item={item} path={path} vertical={false} />)}
    </nav>
  </div>
);
