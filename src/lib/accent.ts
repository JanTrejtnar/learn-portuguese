/** Barevné motivy aplikace: přepíšou paletu `brand` (zelená) odvozenou ze zadaného odstínu. */
import { loadShop } from './shop';

/** Odstín (0–360) a sytost (%) motivu; výchozí motiv (zelená z vlajky) nic nepřepisuje. */
export const ACCENTS: Record<string, { hue: number; sat: number; swatch: string }> = {
  'theme-atlantik': { hue: 203, sat: 85, swatch: '#0b5d8f' },
  'theme-vinho': { hue: 340, sat: 62, swatch: '#8a1f48' },
  'theme-algarve': { hue: 18, sat: 78, swatch: '#a8461b' },
  'theme-azulejo': { hue: 226, sat: 72, swatch: '#2a4bb0' },
};

const STEPS: [string, number, number][] = [
  ['50', 96, 0.6], ['100', 91, 0.62], ['200', 82, 0.62], ['300', 69, 0.7], ['400', 53, 0.8], ['500', 41, 0.9],
  ['600', 31, 1], ['700', 23, 1], ['800', 18, 1], ['900', 14, 1], ['950', 9, 1],
];

export const accentVars = (hue: number, sat: number): Record<string, string> =>
  Object.fromEntries(STEPS.map(([k, l, f]) => [`--color-brand-${k}`, `hsl(${hue} ${Math.round(sat * f)}% ${l}%)`]));

export const applyAccent = (themeId: string): void => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const [k] of STEPS) root.style.removeProperty(`--color-brand-${k}`);
  const a = ACCENTS[themeId];
  if (!a) return;
  for (const [k, v] of Object.entries(accentVars(a.hue, a.sat))) root.style.setProperty(k, v);
};

export const initAccent = (): void => {
  applyAccent(loadShop().theme);
  window.addEventListener('ap:shop-changed', () => applyAccent(loadShop().theme));
};
