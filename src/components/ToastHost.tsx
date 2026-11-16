import { useEffect, useRef } from 'preact/hooks';
import { units } from '../content';
import { BADGES, earnedBadges } from '../lib/badges';
import { coinsEarned } from '../lib/coins';
import { loadProgress } from '../lib/db';
import { consumeFreeze, loadShop, saveShop } from '../lib/shop';
import { dayToFreeze } from '../lib/stats';
import { loadJson, saveJson } from '../lib/storage';
import { onProgressChanged, toast, useToasts } from '../lib/toast';

const SEEN_KEY = 'ap:badges-seen';
const COINS_SEEN_KEY = 'ap:coins-seen';

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
        if (fresh.length > 0) {
          toast({ emoji: fresh[0]!.emoji, title: fresh.length === 1 ? `Nový odznak: ${fresh[0]!.title}` : `Nové odznaky: ${fresh.length}` });
          saveJson(SEEN_KEY, { ids: [...seen, ...fresh.map((b) => b.id)].filter((id) => BADGES.some((b) => b.id === id)) });
        }
        // mince: ohlásí přírůstek od posledně
        const total = coinsEarned(progress, units).total;
        const lastCoins = loadJson<{ earned?: number }>(COINS_SEEN_KEY, {}).earned;
        if (lastCoins !== total) {
          saveJson(COINS_SEEN_KEY, { earned: total });
        }
        // zmrazení: zachrání sérii, pokud by jinak přerušení vyhrálo
        const shop = loadShop();
        const date = dayToFreeze(progress.days, Date.now(), new Set(shop.frozen));
        if (date && shop.freezesBought - shop.frozen.length > 0) {
          saveShop(consumeFreeze(shop, date));
          toast({ emoji: '❄️', title: 'Zmrazení zachránilo tvou sérii' });
        }
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
    <div class="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:pr-6" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          class="pointer-events-auto flex max-w-sm items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-left text-sm font-semibold text-ink shadow-soft"
        >
          <span aria-hidden="true">{t.emoji}</span>
          <span>{t.title}</span>
        </button>
      ))}
    </div>
  );
};
