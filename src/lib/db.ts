import type { CardState } from './srs';

/** Denní souhrn aktivity (klíč = lokální datum). */
export interface DayStats {
  date: string;
  reviews: number;
  again: number;
  newCards: number;
}

type StoreName = 'cards' | 'days';
const DB_NAME = 'ap-progress';

// Záloha v paměti, kdyby IndexedDB nebyla k dispozici (soukromý režim apod.).
const memory: Record<StoreName, Map<string, unknown>> = { cards: new Map(), days: new Map() };
const keyOf = (store: StoreName, v: CardState | DayStats): string => (store === 'cards' ? (v as CardState).id : (v as DayStats).date);

let dbPromise: Promise<IDBDatabase | null> | null = null;
const open = (): Promise<IDBDatabase | null> =>
  (dbPromise ??= new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('cards', { keyPath: 'id' });
        req.result.createObjectStore('days', { keyPath: 'date' });
      };
      req.onsuccess = () => {
        navigator.storage?.persist?.().catch(() => {});
        resolve(req.result);
      };
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  }));

const getAll = async <T>(store: StoreName): Promise<T[]> => {
  const db = await open();
  if (!db) return [...memory[store].values()] as T[];
  return new Promise((resolve) => {
    const req = db.transaction(store).objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => resolve([]);
  });
};

const put = async <T extends CardState | DayStats>(store: StoreName, value: T): Promise<void> => {
  const db = await open();
  if (!db) {
    memory[store].set(keyOf(store, value), value);
    return;
  }
  return new Promise((resolve) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
};

export interface Progress {
  cards: Map<string, CardState>;
  days: Map<string, DayStats>;
}

export const loadProgress = async (): Promise<Progress> => {
  const [cards, days] = await Promise.all([getAll<CardState>('cards'), getAll<DayStats>('days')]);
  return { cards: new Map(cards.map((c) => [c.id, c])), days: new Map(days.map((d) => [d.date, d])) };
};

export const saveCard = (state: CardState): Promise<void> => put('cards', state);
export const saveDay = (day: DayStats): Promise<void> => put('days', day);
