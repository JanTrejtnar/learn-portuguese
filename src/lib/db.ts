import type { CardState } from './srs';

/** Denní souhrn aktivity (klíč = lokální datum). */
export interface DayStats {
  date: string;
  reviews: number;
  again: number;
  newCards: number;
}

/** Výsledek testu lekce / jednotky (klíč = id lekce nebo jednotky). */
export interface TestResult {
  id: string;
  /** Nejlepší skóre 0–1. */
  best: number;
  passed: boolean;
  attempts: number;
  last: number;
  /** Jednotka odemčena ručně bez testu. */
  skipped?: boolean;
}

type StoreName = 'cards' | 'days' | 'tests';
const DB_NAME = 'ap-progress';

// Záloha v paměti, kdyby IndexedDB nebyla k dispozici (soukromý režim apod.).
const memory: Record<StoreName, Map<string, unknown>> = { cards: new Map(), days: new Map(), tests: new Map() };
const keyOf = (store: StoreName, v: CardState | DayStats | TestResult): string => (store === 'days' ? (v as DayStats).date : (v as CardState | TestResult).id);

let dbPromise: Promise<IDBDatabase | null> | null = null;
const open = (): Promise<IDBDatabase | null> =>
  (dbPromise ??= new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 2);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('cards')) db.createObjectStore('cards', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('days')) db.createObjectStore('days', { keyPath: 'date' });
        if (!db.objectStoreNames.contains('tests')) db.createObjectStore('tests', { keyPath: 'id' });
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

const put = async <T extends CardState | DayStats | TestResult>(store: StoreName, value: T): Promise<void> => {
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
  tests: Map<string, TestResult>;
}

export const loadProgress = async (): Promise<Progress> => {
  const [cards, days, tests] = await Promise.all([getAll<CardState>('cards'), getAll<DayStats>('days'), getAll<TestResult>('tests')]);
  return {
    cards: new Map(cards.map((c) => [c.id, c])),
    days: new Map(days.map((d) => [d.date, d])),
    tests: new Map(tests.map((t) => [t.id, t])),
  };
};

export const saveCard = (state: CardState): Promise<void> => put('cards', state);
export const saveDay = (day: DayStats): Promise<void> => put('days', day);
export const saveTest = (result: TestResult): Promise<void> => put('tests', result);
