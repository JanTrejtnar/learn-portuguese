import { useEffect, useRef } from 'preact/hooks';
import { units } from '../content';
import { BADGES, earnedBadges } from '../lib/badges';
import { loadProgress } from '../lib/db';
import { loadJson, saveJson } from '../lib/storage';
import { onProgressChanged, toast, useToasts } from '../lib/toast';

const SEEN_KEY = 'ap:badges-seen';

/** Hlídá, zda uživatel získal nový odznak, a ukáže oznámení. */
const useBadgeWatcher = (trigger: string) => {
  const busy = useRef(false);
  useEffect(() => {
    const check = async () => {
      if (busy.current) return;
      busy.current = true;
      try {
        const progress = await loadProgress();
        const seen = new Set(loadJson<{ ids: string[] }>(SEEN_KEY, { ids: [] }).ids);
        const fresh = earnedBadges(progress, units).filter((b) => !seen.has(b.id));
        if (fresh.length === 0) return;
        for (const b of fresh.slice(0, 2)) toast({ emoji: b.emoji, title: `Nový odznak: ${b.title}`, text: b.desc });
        if (fresh.length > 2) toast({ emoji: '🎁', title: `…a další odznaky (${fresh.length - 2})`, text: 'Najdeš je v sekci Pokrok.' });
        saveJson(SEEN_KEY, { ids: [...seen, ...fresh.map((b) => b.id)].filter((id) => BADGES.some((b) => b.id === id)) });
      } finally {
        busy.current = false;
      }
    };
    void check();
    let timer: number | undefined;
    const off = onProgressChanged(() => {
      clearTimeout(timer);
      timer = window.setTimeout(check, 700); // uložení do IndexedDB doběhne
    });
    return () => {
      clearTimeout(timer);
      off();
    };
  }, [trigger]);
};

export const ToastHost = ({ path }: { path: string }) => {
  const [toasts, dismiss] = useToasts();
  useBadgeWatcher(path);

  return (
    <div class="pointer-events-none fixed inset-x-0 top-16 z-30 flex flex-col items-center gap-2 px-4 md:top-4" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          class="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-stone-900 px-4 py-3 text-left text-white shadow-lg dark:bg-white dark:text-stone-900"
        >
          <span class="text-2xl" aria-hidden="true">{t.emoji}</span>
          <span>
            <span class="block font-semibold">{t.title}</span>
            {t.text && <span class="block text-sm opacity-80">{t.text}</span>}
          </span>
        </button>
      ))}
    </div>
  );
};
