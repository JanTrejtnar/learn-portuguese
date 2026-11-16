import { useEffect } from 'preact/hooks';
import { playChime } from '../lib/sound';

const COLORS = ['var(--color-gold-400)', 'var(--color-flag-600)', 'var(--color-brand-500)', 'var(--color-brand-700)'];
const PIECES = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 7) * 0.08,
  dur: 1.4 + (i % 5) * 0.25,
  rot: (i * 53) % 360,
  color: COLORS[i % COLORS.length]!,
}));

/** Konfety a krátký zvuk při dokončení (respektuje „omezit pohyb“ i vypnutý zvuk). */
export const Celebrate = () => {
  useEffect(() => {
    playChime();
  }, []);
  return (
    <div class="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
      {PIECES.map((p, i) => (
        <span
          key={i}
          class="confetti"
          style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, '--rot': `${p.rot}deg` } as Record<string, string>}
        />
      ))}
    </div>
  );
};
