import { useState } from 'preact/hooks';
import { loadJson, saveJson } from './storage';

export type Theme = 'auto' | 'light' | 'dark';
const KEY = 'ap:theme';

export const getTheme = (): Theme => loadJson<{ theme: Theme }>(KEY, { theme: 'auto' }).theme;

const prefersDark = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;

export const applyTheme = (theme: Theme): void => {
  const dark = theme === 'dark' || (theme === 'auto' && prefersDark());
  document.documentElement.classList.toggle('dark', dark);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0a120e' : '#046a38');
};

/** Při režimu „auto“ sleduje změnu nastavení systému. */
export const watchSystemTheme = (): void => {
  if (typeof matchMedia !== 'function') return;
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getTheme() === 'auto') applyTheme('auto');
  });
};

export const useTheme = (): [Theme, (t: Theme) => void] => {
  const [theme, setTheme] = useState<Theme>(getTheme);
  const set = (t: Theme) => {
    saveJson(KEY, { theme: t });
    applyTheme(t);
    setTheme(t);
  };
  return [theme, set];
};
