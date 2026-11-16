/** Kdy připomenout zálohu pokroku. Čistá logika (bez prohlížeče), aby šla testovat. */
import { DAY } from './srs';

export const BACKUP_EVERY_DAYS = 14;
export const SNOOZE_DAYS = 7;
/** Do této hranice (aktivních dnů) nemá smysl zálohu připomínat. */
export const MIN_ACTIVE_DAYS = 3;

export interface BackupReminderInput {
  /** Počet dnů, kdy uživatel něco udělal. */
  activeDays: number;
  /** Kdy naposledy stáhl zálohu (ms), nebo `undefined`. */
  lastBackup?: number;
  /** Do kdy je připomínka odložená (ms). */
  snoozedUntil?: number;
  now: number;
}

export const backupReminderDue = ({ activeDays, lastBackup, snoozedUntil, now }: BackupReminderInput): boolean => {
  if (activeDays < MIN_ACTIVE_DAYS) return false;
  if (snoozedUntil !== undefined && snoozedUntil > now) return false;
  return lastBackup === undefined || now - lastBackup >= BACKUP_EVERY_DAYS * DAY;
};

const LAST_KEY = 'ap:last-backup';
const SNOOZE_KEY = 'ap:backup-snooze';

const readNum = (key: string): number | undefined => {
  try {
    const n = Number(window.localStorage.getItem(key));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  } catch {
    return undefined;
  }
};
const writeNum = (key: string, n: number): void => {
  try { window.localStorage.setItem(key, String(n)); } catch { /* bez úložiště se připomínka prostě ukáže znovu */ }
};

export const getLastBackup = (): number | undefined => readNum(LAST_KEY);
export const markBackup = (now: number): void => writeNum(LAST_KEY, now);
export const snoozeBackupReminder = (now: number): void => writeNum(SNOOZE_KEY, now + SNOOZE_DAYS * DAY);
export const getBackupSnooze = (): number | undefined => readNum(SNOOZE_KEY);
