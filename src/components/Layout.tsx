import type { ComponentChildren } from 'preact';
import { href } from '../router';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { ToastHost } from './ToastHost';

interface NavItem {
  label: string;
  icon: Parameters<typeof Icon>[0]['name'];
  to: string;
  active: (path: string) => boolean;
}

const nav: NavItem[] = [
  { label: 'Lekce', icon: 'book', to: '/', active: (p) => p === '/' || p.startsWith('/unit') || p.startsWith('/lesson') },
  { label: 'Karty', icon: 'cards', to: '/cards', active: (p) => p.startsWith('/cards') || p.startsWith('/free') },
  { label: 'Testy', icon: 'check', to: '/quiz', active: (p) => p.startsWith('/quiz') },
  { label: 'Praxe', icon: 'chat', to: '/practice', active: (p) => ['/practice', '/roleplay', '/pairs', '/speak'].some((x) => p.startsWith(x)) },
  { label: 'Mapa', icon: 'map', to: '/map', active: (p) => p.startsWith('/map') },
  { label: 'Pokrok', icon: 'chart', to: '/stats', active: (p) => p.startsWith('/stats') },
];

const SideLink = ({ item, path }: { item: NavItem; path: string }) => {
  const on = item.active(path);
  return (
    <a
      href={href(item.to)}
      aria-current={on ? 'page' : undefined}
      class={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${on ? 'bg-brand-700 text-white shadow-soft' : 'text-ink-soft hover:bg-surface-2'}`}
    >
      <Icon name={item.icon} class="h-5 w-5" />
      {item.label}
    </a>
  );
};

const TabLink = ({ item, path }: { item: NavItem; path: string }) => {
  const on = item.active(path);
  return (
    <a href={href(item.to)} aria-current={on ? 'page' : undefined} class="flex flex-1 flex-col items-center gap-0.5 pt-2 pb-1.5 text-[11px] font-semibold">
      <span class={`flex h-8 w-14 items-center justify-center rounded-full ${on ? 'bg-brand-700 text-white' : 'text-muted'}`}>
        <Icon name={item.icon} class="h-5 w-5" />
      </span>
      <span class={on ? 'text-brand-700 dark:text-brand-200' : 'text-muted'}>{item.label}</span>
    </a>
  );
};

export const Layout = ({ path, children }: { path: string; children: ComponentChildren }) => (
  <div class="min-h-full">
    <a href="#obsah" class="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('obsah')?.focus(); }}>Přeskočit na obsah</a>
    <div class="flag-stripe fixed inset-x-0 top-0 z-40 h-1" aria-hidden="true" />

    <div class="mx-auto flex min-h-full max-w-5xl flex-col md:flex-row md:gap-8 md:px-6">
      {/* Desktop: boční panel */}
      <aside class="hidden w-56 shrink-0 md:block">
        <div class="sticky top-0 flex h-screen flex-col py-8">
          <a href={href('/')} class="mb-8 flex items-center gap-3">
            <Logo class="h-10 w-10 shrink-0" />
            <span>
              <span class="block text-lg font-extrabold leading-tight">Aprender</span>
              <span class="block text-xs text-muted">Português europeu · A1/A2</span>
            </span>
          </a>
          <nav class="flex flex-col gap-1" aria-label="Hlavní navigace">
            {nav.map((item) => <SideLink key={item.to} item={item} path={path} />)}
          </nav>
          <div class="mt-auto flex items-center gap-1">
            <ThemeToggle />
            <a href={href('/settings')} aria-label="Nastavení" aria-current={path === '/settings' ? 'page' : undefined}
              class={`flex h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold ${path === '/settings' ? 'bg-brand-700 text-white' : 'text-ink-soft hover:bg-surface-2'}`}>
              <Icon name="sliders" class="h-5 w-5" />Nastavení
            </a>
          </div>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        {/* Mobil: horní lišta */}
        <header class="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-app/85 px-4 pt-1 backdrop-blur-md md:hidden">
          <a href={href('/')} class="flex min-h-12 items-center gap-2.5">
            <Logo class="h-8 w-8" />
            <span class="text-lg font-extrabold">Aprender</span>
          </a>
          <div class="flex items-center">
            <ThemeToggle />
            <a href={href('/settings')} aria-label="Nastavení" class="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2">
              <Icon name="sliders" class="h-5 w-5" />
            </a>
          </div>
        </header>

        <main id="obsah" tabIndex={-1} class="flex-1 px-4 py-6 pb-32 outline-none md:px-0 md:py-10 md:pb-10">
          <div key={path} class="page-in">{children}</div>
        </main>
      </div>
    </div>

    <ToastHost path={path} />

    {/* Mobil: spodní navigace */}
    <nav class="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden" aria-label="Hlavní navigace">
      {nav.map((item) => <TabLink key={item.to} item={item} path={path} />)}
    </nav>
  </div>
);
