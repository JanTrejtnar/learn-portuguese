import { useTheme } from '../lib/theme';
import { Icon } from './Icon';

/** Rychlé přepnutí světlý ↔ tmavý režim (volba se pamatuje). */
export const ThemeToggle = ({ class: cls = '' }: { class?: string }) => {
  const [theme, setTheme] = useTheme();
  const dark = theme === 'dark' || (theme === 'auto' && typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches);
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
      title={dark ? 'Světlý režim' : 'Tmavý režim'}
      class={`flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2 ${cls}`}
    >
      <Icon name={dark ? 'sun' : 'moon'} class="h-5 w-5" />
    </button>
  );
};
