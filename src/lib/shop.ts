/** Obchod: katalog, stav (vlastněné věci, nasazený avatar, zmrazení) a čistá logika nákupů. */
import { useEffect, useState } from 'preact/hooks';
import { loadJson, saveJson } from './storage';

export type Slot = 'bg' | 'top' | 'hat' | 'acc';
export type Category = Slot | 'theme' | 'freeze';

export interface ShopItem {
  id: string;
  kind: 'avatar' | 'theme';
  slot?: Slot;
  name: string;
  desc: string;
  /** 0 = nelze koupit, získá se splněním podmínky (`badge` nebo `level`). */
  price: number;
  minLevel?: number;
  /** Odměna za odznak. */
  badge?: string;
  /** Odměna za dosažení úrovně. */
  level?: number;
}

export const FREEZE_PRICE = 30;
export const MAX_FREEZES = 2;
/** Cena jedné nápovědy v testu. */
export const HINT_PRICE = 3;

export const ITEMS: ShopItem[] = [
  // pozadí
  { id: 'bg-lisboa', kind: 'avatar', slot: 'bg', name: 'Lisabon', desc: 'Střechy, řeka Tejo a žlutá tramvaj.', price: 40 },
  { id: 'bg-porto', kind: 'avatar', slot: 'bg', name: 'Porto', desc: 'Most Dom Luís I. při západu slunce.', price: 60 },
  { id: 'bg-algarve', kind: 'avatar', slot: 'bg', name: 'Algarve', desc: 'Útesy, moře a slunce.', price: 60 },
  { id: 'bg-azulejo', kind: 'avatar', slot: 'bg', name: 'Azulejo', desc: 'Modrobílé kachlíky.', price: 90 },
  { id: 'bg-noite', kind: 'avatar', slot: 'bg', name: 'Noc ve Lisabonu', desc: 'Pro Mestre: dosáhni 10. úrovně.', price: 0, level: 10 },
  // oblečení
  { id: 'top-marinheiro', kind: 'avatar', slot: 'top', name: 'Námořnické tričko', desc: 'Pruhy jako z přístavu.', price: 40 },
  { id: 'top-fado', kind: 'avatar', slot: 'top', name: 'Fadistický šál', desc: 'Černý šál s třásněmi.', price: 70 },
  { id: 'top-sako', kind: 'avatar', slot: 'top', name: 'Elegantní sako', desc: 'Pro večer v Chiado.', price: 90 },
  { id: 'top-azulejo', kind: 'avatar', slot: 'top', name: 'Kachlíkové tričko', desc: 'Azulejo na hrudi.', price: 120 },
  { id: 'top-camisola', kind: 'avatar', slot: 'top', name: 'Camisola', desc: 'Za odznak A1 Completo.', price: 0, badge: 'a1-done' },
  // pokrývky hlavy
  { id: 'hat-bone', kind: 'avatar', slot: 'hat', name: 'Kšiltovka', desc: 'Pro slunné dny.', price: 25 },
  { id: 'hat-boina', kind: 'avatar', slot: 'hat', name: 'Baret', desc: 'Klasika starých uliček.', price: 30 },
  { id: 'hat-gorro', kind: 'avatar', slot: 'hat', name: 'Rybářská čepice', desc: 'Pro Nazaré a vlny.', price: 30 },
  { id: 'hat-barrete', kind: 'avatar', slot: 'hat', name: 'Barrete', desc: 'Tradiční čepice z Minha.', price: 50 },
  { id: 'hat-alentejano', kind: 'avatar', slot: 'hat', name: 'Alentejský klobouk', desc: 'Široká krempa proti slunci.', price: 70 },
  { id: 'hat-coroa', kind: 'avatar', slot: 'hat', name: 'Koruna', desc: 'Za odznak A2 Completo.', price: 0, badge: 'a2-done' },
  // doplňky
  { id: 'acc-bryle', kind: 'avatar', slot: 'acc', name: 'Sluneční brýle', desc: 'Algarve volá.', price: 30 },
  { id: 'acc-bica', kind: 'avatar', slot: 'acc', name: 'Bica', desc: 'Espresso po lisabonsku.', price: 30 },
  { id: 'acc-pastel', kind: 'avatar', slot: 'acc', name: 'Pastel de nata', desc: 'Nejlepší k bice.', price: 40 },
  { id: 'acc-sardinha', kind: 'avatar', slot: 'acc', name: 'Sardinka', desc: 'Symbol Santos Populares.', price: 40 },
  { id: 'acc-galo', kind: 'avatar', slot: 'acc', name: 'Galo de Barcelos', desc: 'Kohout štěstí.', price: 80 },
  { id: 'acc-medalha', kind: 'avatar', slot: 'acc', name: 'Zlatá medaile', desc: 'Za odznak Mês de Ouro (30 dní v řadě).', price: 0, badge: 'streak-30' },
  // motivy aplikace
  { id: 'theme-atlantik', kind: 'theme', name: 'Atlantik', desc: 'Oceánově modrá.', price: 50 },
  { id: 'theme-vinho', kind: 'theme', name: 'Vinho do Porto', desc: 'Sytá vínová.', price: 50 },
  { id: 'theme-algarve', kind: 'theme', name: 'Algarve', desc: 'Teplá terakota.', price: 50 },
  { id: 'theme-azulejo', kind: 'theme', name: 'Azulejo', desc: 'Kobaltová modrá.', price: 50 },
];

export const itemById = (id: string): ShopItem | undefined => ITEMS.find((i) => i.id === id);

export const SKINS = ['#f7d8bd', '#ecc09a', '#cf9a70', '#a36f48', '#6f4a2f'];
export const HAIR_COLORS = ['#2a1b12', '#5b3a22', '#b45f22', '#d9b45f', '#8d8f98'];
export const HAIR_STYLES = [
  { id: 'none', name: 'Bez vlasů' },
  { id: 'short', name: 'Krátké' },
  { id: 'long', name: 'Dlouhé' },
  { id: 'curly', name: 'Kudrnaté' },
  { id: 'bun', name: 'Drdol' },
] as const;
export type HairStyle = (typeof HAIR_STYLES)[number]['id'];

export interface Look {
  skin: number;
  hairColor: number;
  hair: HairStyle;
}

export interface ShopState {
  /** Koupené věci (odměny za odznak se sem nezapisují, platí automaticky). */
  owned: string[];
  /** Nasazené věci podle slotu. */
  equipped: Partial<Record<Slot, string>>;
  look: Look;
  /** Aktivní motiv (id položky), nebo prázdné = výchozí. */
  theme: string;
  freezesBought: number;
  /** Počet použitých nápověd v testech (každá stojí HINT_PRICE). */
  hintsBought: number;
  /** Data zmrazených dnů (RRRR-MM-DD). */
  frozen: string[];
}

export const DEFAULT_SHOP: ShopState = { owned: [], equipped: {}, look: { skin: 1, hairColor: 1, hair: 'short' }, theme: '', freezesBought: 0, hintsBought: 0, frozen: [] };

const KEY = 'ap:shop';
const EVENT = 'ap:shop-changed';

const sanitize = (raw: Partial<ShopState>): ShopState => {
  const ids = new Set(ITEMS.map((i) => i.id));
  const look = { ...DEFAULT_SHOP.look, ...(raw.look ?? {}) };
  return {
    owned: Array.isArray(raw.owned) ? [...new Set(raw.owned.filter((x) => typeof x === 'string' && ids.has(x)))] : [],
    equipped: Object.fromEntries(Object.entries(raw.equipped ?? {}).filter(([, v]) => typeof v === 'string' && ids.has(v))) as ShopState['equipped'],
    look: {
      skin: Number.isInteger(look.skin) && look.skin >= 0 && look.skin < SKINS.length ? look.skin : 1,
      hairColor: Number.isInteger(look.hairColor) && look.hairColor >= 0 && look.hairColor < HAIR_COLORS.length ? look.hairColor : 1,
      hair: HAIR_STYLES.some((h) => h.id === look.hair) ? look.hair : 'short',
    },
    theme: typeof raw.theme === 'string' && ids.has(raw.theme) ? raw.theme : '',
    freezesBought: Number.isInteger(raw.freezesBought) && raw.freezesBought! >= 0 && raw.freezesBought! < 1000 ? raw.freezesBought! : 0,
    hintsBought: Number.isInteger(raw.hintsBought) && raw.hintsBought! >= 0 && raw.hintsBought! < 100000 ? raw.hintsBought! : 0,
    frozen: Array.isArray(raw.frozen) ? raw.frozen.filter((d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) : [],
  };
};

/** Ošetří data z úložiště nebo ze zálohy (neznámé hodnoty zahodí). */
export const sanitizeShop = (raw: unknown): ShopState => sanitize(typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? (raw as Partial<ShopState>) : {});

export const loadShop = (): ShopState => sanitizeShop(loadJson<Partial<ShopState>>(KEY, {}));

export const saveShop = (s: ShopState): void => {
  saveJson(KEY, s);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT));
};

export const resetShop = (): void => saveShop(DEFAULT_SHOP);

export const useShop = (): [ShopState, (patch: (s: ShopState) => ShopState) => void] => {
  const [state, setState] = useState<ShopState>(loadShop);
  useEffect(() => {
    const on = () => setState(loadShop());
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return [state, (patch) => saveShop(patch(loadShop()))];
};

export const freezesLeft = (s: ShopState): number => s.freezesBought - s.frozen.length;

/** Kontext potřebný pro podmínky odměn. */
export interface Standing {
  level: number;
  badges: ReadonlySet<string>;
}

/** Má hráč odměnu (zdarma získanou věc)? */
export const rewardMet = (item: ShopItem, st: Standing): boolean =>
  item.price === 0 && ((item.badge !== undefined && st.badges.has(item.badge)) || (item.level !== undefined && st.level >= item.level));

export const isOwned = (item: ShopItem, shop: ShopState, st: Standing): boolean => shop.owned.includes(item.id) || rewardMet(item, st);

/** Kolik mincí už je utraceno. */
export const coinsSpent = (s: ShopState): number =>
  s.owned.reduce((a, id) => a + (itemById(id)?.price ?? 0), 0) + s.freezesBought * FREEZE_PRICE + s.hintsBought * HINT_PRICE;

export const balance = (earned: number, s: ShopState): number => Math.max(0, earned - coinsSpent(s));

export type BuyResult = { ok: true; state: ShopState } | { ok: false; reason: string };

export const buyItem = (s: ShopState, id: string, bal: number, st: Standing): BuyResult => {
  const item = itemById(id);
  if (!item) return { ok: false, reason: 'Neznámá věc.' };
  if (item.price === 0) return { ok: false, reason: 'Tuto věc nelze koupit, získá se splněním podmínky.' };
  if (s.owned.includes(id)) return { ok: false, reason: 'Už to máš.' };
  if (item.minLevel && st.level < item.minLevel) return { ok: false, reason: `Odemkne se na úrovni ${item.minLevel}.` };
  if (bal < item.price) return { ok: false, reason: 'Nemáš dost mincí.' };
  return { ok: true, state: { ...s, owned: [...s.owned, id] } };
};

export const buyFreeze = (s: ShopState, bal: number): BuyResult => {
  if (freezesLeft(s) >= MAX_FREEZES) return { ok: false, reason: `Najednou můžeš mít nejvýš ${MAX_FREEZES} zmrazení.` };
  if (bal < FREEZE_PRICE) return { ok: false, reason: 'Nemáš dost mincí.' };
  return { ok: true, state: { ...s, freezesBought: s.freezesBought + 1 } };
};

/** Koupí jednu nápovědu v testu (stojí mince; zůstatek nikdy nejde do záporu). */
export const buyHint = (s: ShopState, bal: number): BuyResult =>
  bal < HINT_PRICE ? { ok: false, reason: 'Nemáš dost mincí.' } : { ok: true, state: { ...s, hintsBought: s.hintsBought + 1 } };

/** Nasadí věc (musí být vlastněná); `null` = sundat. */
export const equipItem = (s: ShopState, item: ShopItem, on: boolean): ShopState => {
  if (item.kind === 'theme') return { ...s, theme: on ? item.id : '' };
  const equipped = { ...s.equipped };
  if (on) equipped[item.slot!] = item.id;
  else delete equipped[item.slot!];
  return { ...s, equipped };
};

/** Zmrazí den (spotřebuje jedno zmrazení). */
export const consumeFreeze = (s: ShopState, date: string): ShopState => (freezesLeft(s) > 0 && !s.frozen.includes(date) ? { ...s, frozen: [...s.frozen, date] } : s);

/** Neodemčené věci (odměna dosud nesplněna) se z nasazení vyřadí. */
export const validEquipped = (s: ShopState, st: Standing): ShopState['equipped'] =>
  Object.fromEntries(Object.entries(s.equipped).filter(([, id]) => {
    const it = itemById(id!);
    return it && isOwned(it, s, st);
  })) as ShopState['equipped'];
