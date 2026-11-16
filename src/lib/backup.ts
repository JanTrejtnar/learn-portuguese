/** Záloha pokroku do souboru (JSON). Čistá logika včetně validace, aby šla testovat v Node. */
import type { DayStats, TestResult } from './db';
import type { CardState } from './srs';
import { sanitizeShop, type ShopState } from './shop';

export const BACKUP_APP = 'aprender-portugues';
export const BACKUP_VERSION = 1;
const MAX_BYTES = 8 * 1024 * 1024;

export interface Backup {
  app: typeof BACKUP_APP;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  cards: CardState[];
  days: DayStats[];
  tests: TestResult[];
  /** Nastavení učení (localStorage). */
  settings: Record<string, unknown>;
  /** ID už ohlášených odznaků (aby se po obnově znovu neoslavovaly). */
  badgesSeen: string[];
  /** Obchod: koupené věci, avatar, zmrazení (volitelné, starší zálohy ho nemají). */
  shop?: ShopState;
}

export interface BackupSource {
  cards: Map<string, CardState>;
  days: Map<string, DayStats>;
  tests: Map<string, TestResult>;
}

export const buildBackup = (p: BackupSource, local: { settings: Record<string, unknown>; badgesSeen: string[]; shop?: ShopState }, now: Date): Backup => ({
  app: BACKUP_APP,
  version: BACKUP_VERSION,
  exportedAt: now.toISOString(),
  cards: [...p.cards.values()],
  days: [...p.days.values()],
  tests: [...p.tests.values()],
  settings: local.settings,
  badgesSeen: local.badgesSeen,
  ...(local.shop ? { shop: local.shop } : {}),
});

export type ParseResult = { ok: true; backup: Backup } | { ok: false; error: string };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const parseBackup = (text: string): ParseResult => {
  if (text.length > MAX_BYTES) return { ok: false, error: 'Soubor je příliš velký.' };
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Soubor není platný JSON.' };
  }
  if (!isObj(data) || data.app !== BACKUP_APP) return { ok: false, error: 'To není záloha z aplikace Aprender Português.' };
  if (data.version !== BACKUP_VERSION) return { ok: false, error: `Nepodporovaná verze zálohy (${String(data.version)}).` };
  const { cards, days, tests, settings, badgesSeen } = data;
  if (!Array.isArray(cards) || !Array.isArray(days) || !Array.isArray(tests)) return { ok: false, error: 'Záloha je poškozená (chybí data).' };

  for (const [i, c] of cards.entries()) {
    if (!isObj(c) || typeof c.id !== 'string' || ![c.ease, c.interval, c.reps, c.lapses, c.due, c.last, c.introduced].every(num))
      return { ok: false, error: `Záloha je poškozená (karta č. ${i + 1}).` };
  }
  for (const [i, d] of days.entries()) {
    if (!isObj(d) || typeof d.date !== 'string' || !DATE_RE.test(d.date) || ![d.reviews, d.again, d.newCards].every(num) || (d.xp !== undefined && !num(d.xp)) || (d.goalReached !== undefined && typeof d.goalReached !== 'boolean'))
      return { ok: false, error: `Záloha je poškozená (den č. ${i + 1}).` };
  }
  for (const [i, t] of tests.entries()) {
    if (!isObj(t) || typeof t.id !== 'string' || !num(t.best) || t.best < 0 || t.best > 1 || typeof t.passed !== 'boolean' || !num(t.attempts) || !num(t.last))
      return { ok: false, error: `Záloha je poškozená (test č. ${i + 1}).` };
  }
  if (settings !== undefined && !isObj(settings)) return { ok: false, error: 'Záloha je poškozená (nastavení).' };
  if (badgesSeen !== undefined && (!Array.isArray(badgesSeen) || !badgesSeen.every((x) => typeof x === 'string')))
    return { ok: false, error: 'Záloha je poškozená (odznaky).' };

  return {
    ok: true,
    backup: {
      app: BACKUP_APP,
      version: BACKUP_VERSION,
      exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : '',
      cards: cards as CardState[],
      days: days as DayStats[],
      tests: tests as TestResult[],
      settings: (settings as Record<string, unknown>) ?? {},
      badgesSeen: (badgesSeen as string[]) ?? [],
      ...(data.shop !== undefined ? { shop: sanitizeShop(data.shop) } : {}),
    },
  };
};

export const summarizeBackup = (b: Backup): { cards: number; days: number; tests: number; xp: number } => ({
  cards: b.cards.length,
  days: b.days.length,
  tests: b.tests.length,
  xp: b.days.reduce((a, d) => a + (d.xp ?? 0), 0),
});

export const backupFilename = (now: Date): string => `aprender-portugues-zaloha-${now.toISOString().slice(0, 10)}.json`;

/** Z importovaného nastavení vezme jen známé klíče se správným typem (nic jiného se do úložiště nedostane). */
export const sanitizeSettings = (raw: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  if (raw.direction === 'pt-cs' || raw.direction === 'cs-pt') out.direction = raw.direction;
  if (raw.recall === 'off' || raw.recall === 'sometimes' || raw.recall === 'often') out.recall = raw.recall;
  for (const k of ['autoplay', 'shuffle', 'showTranslations', 'simpleRating', 'ratingHelpSeen'] as const) if (typeof raw[k] === 'boolean') out[k] = raw[k];
  for (const k of ['newPerDay', 'dailyGoal'] as const) {
    const v = raw[k];
    if (typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 500) out[k] = v;
  }
  return out;
};
