import { useState } from 'preact/hooks';
import { units } from '../content';
import { Avatar } from '../components/Avatar';
import { Breadcrumb } from '../components/Breadcrumb';
import { Coin } from '../components/Coin';
import { Loading } from '../components/Loading';
import { ACCENTS } from '../lib/accent';
import { BADGES, badgeContext } from '../lib/badges';
import {
  COINS_PER_GOAL_DAY, COINS_PER_LEVEL, COINS_PER_SCENARIO, COINS_PER_TEST, COINS_PER_WEEK_STREAK, coinsEarned,
} from '../lib/coins';
import {
  FREEZE_PRICE, HAIR_COLORS, HAIR_STYLES, ITEMS, MAX_FREEZES, SKINS, balance, buyFreeze, buyItem, coinsSpent, equipItem,
  freezesLeft, isOwned, validEquipped, useShop, type Category, type ShopItem, type Standing,
} from '../lib/shop';
import { toast } from '../lib/toast';
import { useProgress } from '../lib/useProgress';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'bg', label: 'Pozadí' },
  { id: 'top', label: 'Oblečení' },
  { id: 'hat', label: 'Hlava' },
  { id: 'acc', label: 'Doplňky' },
  { id: 'theme', label: 'Motivy' },
  { id: 'freeze', label: 'Zmrazení' },
];

const btn = 'w-full rounded-xl border-2 px-3 py-2 text-sm font-semibold';

export const ShopPage = () => {
  const progress = useProgress();
  const [shop, update] = useShop();
  const [cat, setCat] = useState<Category>('bg');
  if (!progress) return <Loading />;

  const ctx = badgeContext(progress, units);
  const standing: Standing = { level: ctx.level, badges: new Set(BADGES.filter((b) => b.earned(ctx)).map((b) => b.id)) };
  const earned = coinsEarned(progress, units);
  const bal = balance(earned.total, shop);
  const equipped = validEquipped(shop, standing);

  const buy = (item: ShopItem) => {
    const r = buyItem(shop, item.id, bal, standing);
    if (!r.ok) return toast({ emoji: '🪙', title: 'Nelze koupit', text: r.reason });
    update(() => equipItem(r.state, item, true));
    toast({ emoji: '🛍️', title: `Koupeno: ${item.name}`, text: 'Rovnou nasazeno.' });
  };
  const wear = (item: ShopItem, on: boolean) => update((s) => equipItem(s, item, on));

  const visible = ITEMS.filter((i) => (cat === 'theme' ? i.kind === 'theme' : i.slot === cat));

  return (
    <div>
      <Breadcrumb items={[{ label: 'Pokrok', to: '/stats' }, { label: 'Obchod' }]} />
      <h1 class="text-2xl font-bold">Obchod a avatar</h1>

      <section class="mt-5 flex flex-col items-center gap-4 rounded-3xl border border-line bg-surface p-5 shadow-soft sm:flex-row">
        <Avatar look={shop.look} equipped={equipped} size={148} mood="happy" />
        <div class="w-full min-w-0 flex-1">
          <div class="flex items-baseline gap-2 text-3xl font-bold">
            <Coin class="h-7 w-7" /> <span data-testid="balance">{bal}</span>
            <span class="text-sm font-normal text-muted">mincí</span>
          </div>
          <p class="mt-1 text-sm text-muted">Získáno {earned.total} · utraceno {coinsSpent(shop)}</p>
          <details class="mt-3 rounded-xl border border-line bg-surface-2 p-3">
            <summary class="cursor-pointer text-sm font-semibold">Upravit postavu (zdarma)</summary>
            <div class="mt-3 space-y-3 text-sm">
              <div>
                <div class="mb-1 font-semibold">Pleť</div>
                <div class="flex gap-2" role="radiogroup" aria-label="Pleť">
                  {SKINS.map((c, i) => (
                    <button key={c} type="button" role="radio" aria-checked={shop.look.skin === i} aria-label={`Pleť ${i + 1}`} onClick={() => update((s) => ({ ...s, look: { ...s.look, skin: i } }))}
                      class={`h-9 w-9 rounded-full border-4 ${shop.look.skin === i ? 'border-brand-600' : 'border-line'}`} style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div>
                <div class="mb-1 font-semibold">Vlasy</div>
                <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Účes">
                  {HAIR_STYLES.map((h) => (
                    <button key={h.id} type="button" role="radio" aria-checked={shop.look.hair === h.id} onClick={() => update((s) => ({ ...s, look: { ...s.look, hair: h.id } }))}
                      class={`rounded-xl border-2 px-3 py-1.5 font-semibold ${shop.look.hair === h.id ? 'border-brand-600 bg-brand-50 dark:bg-brand-900' : 'border-line'}`}>{h.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <div class="mb-1 font-semibold">Barva vlasů</div>
                <div class="flex gap-2" role="radiogroup" aria-label="Barva vlasů">
                  {HAIR_COLORS.map((c, i) => (
                    <button key={c} type="button" role="radio" aria-checked={shop.look.hairColor === i} aria-label={`Barva vlasů ${i + 1}`} onClick={() => update((s) => ({ ...s, look: { ...s.look, hairColor: i } }))}
                      class={`h-9 w-9 rounded-full border-4 ${shop.look.hairColor === i ? 'border-brand-600' : 'border-line'}`} style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          </details>
        </div>
      </section>

      <div class="mt-6 flex flex-wrap gap-2" role="radiogroup" aria-label="Kategorie">
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" role="radio" aria-checked={cat === c.id} onClick={() => setCat(c.id)}
            class={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold ${cat === c.id ? 'border-brand-600 bg-brand-700 text-white' : 'border-line bg-surface'}`}>{c.label}</button>
        ))}
      </div>

      {cat === 'freeze' ? (
        <section class="mt-4 rounded-2xl border border-line bg-surface p-4">
          <h2 class="text-lg font-semibold">Zmrazení série ❄️</h2>
          <p class="mt-1 text-sm text-ink-soft">
            Když vynecháš den a běžné odpuštění (jednou za týden) už nestačí, zmrazení sérii zachrání. Použije se samo hned, jak se dnes něco naučíš.
            Můžeš mít nejvýš {MAX_FREEZES}.
          </p>
          <p class="mt-3 font-semibold">Máš: {freezesLeft(shop)} / {MAX_FREEZES}</p>
          <button type="button" class={`${btn} mt-3 max-w-xs border-brand-600 bg-brand-700 text-white disabled:opacity-50`}
            disabled={freezesLeft(shop) >= MAX_FREEZES || bal < FREEZE_PRICE}
            onClick={() => {
              const r = buyFreeze(shop, bal);
              if (!r.ok) return toast({ emoji: '🪙', title: 'Nelze koupit', text: r.reason });
              update(() => r.state);
              toast({ emoji: '❄️', title: 'Zmrazení koupeno', text: 'Zachrání sérii, až bude potřeba.' });
            }}>
            Koupit za {FREEZE_PRICE} <Coin class="h-4 w-4" />
          </button>
        </section>
      ) : (
        <ul class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visible.map((item) => {
            const owned = isOwned(item, shop, standing);
            const on = item.kind === 'theme' ? shop.theme === item.id : equipped[item.slot!] === item.id;
            const locked = !owned && item.price === 0;
            const preview = item.kind === 'theme' ? null : { ...equipped, [item.slot!]: item.id };
            return (
              <li key={item.id} class={`flex flex-col items-center rounded-2xl border bg-surface p-3 text-center ${on ? 'border-brand-600' : 'border-line'}`}>
                {preview ? <Avatar look={shop.look} equipped={preview} size={84} label={item.name} /> : (
                  <div class="flex h-[84px] w-[84px] items-center justify-center rounded-full" style={{ background: ACCENTS[item.id]?.swatch }} aria-hidden="true">
                    <span class="text-2xl text-white">Aa</span>
                  </div>
                )}
                <div class="mt-2 text-sm font-semibold">{item.name}</div>
                <div class="mb-2 text-xs text-muted">{item.desc}</div>
                <div class="mt-auto w-full">
                  {owned ? (
                    <button type="button" aria-pressed={on} class={`${btn} ${on ? 'border-brand-600 bg-brand-50 dark:bg-brand-900' : 'border-line-strong'}`} onClick={() => wear(item, !on)}>
                      {on ? 'Nasazeno ✓' : item.kind === 'theme' ? 'Použít' : 'Nasadit'}
                    </button>
                  ) : locked ? (
                    <div class={`${btn} border-line text-muted`}>🔒 Odměna</div>
                  ) : (
                    <button type="button" class={`${btn} border-brand-600 bg-brand-700 text-white disabled:opacity-50`} disabled={bal < item.price} onClick={() => buy(item)}>
                      {item.price} <Coin class="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <section class="mt-8 rounded-2xl border border-line bg-surface p-4 text-sm">
        <h2 class="mb-2 text-lg font-semibold">Odkud mince jsou</h2>
        <ul class="space-y-1">
          <li class="flex justify-between"><span>Odznaky (10 / 25 / 50 podle vzácnosti)</span><b>{earned.badges}</b></li>
          <li class="flex justify-between"><span>Splněné denní cíle (po {COINS_PER_GOAL_DAY})</span><b>{earned.goalDays}</b></li>
          <li class="flex justify-between"><span>Nové úrovně (po {COINS_PER_LEVEL})</span><b>{earned.levels}</b></li>
          <li class="flex justify-between"><span>Splněné testy (po {COINS_PER_TEST})</span><b>{earned.tests}</b></li>
          <li class="flex justify-between"><span>Dokončené scénáře (po {COINS_PER_SCENARIO})</span><b>{earned.scenarios}</b></li>
          <li class="flex justify-between"><span>Týdny v sérii (po {COINS_PER_WEEK_STREAK})</span><b>{earned.weeks}</b></li>
        </ul>
        <p class="mt-3 text-xs text-muted">Mince se počítají z opravdového pokroku, ne z počtu kliknutí. Opakované procvičování stejného nic navíc nepřidá.</p>
      </section>
    </div>
  );
};
