import { buildBackup, backupFilename } from './backup';
import { markBackup } from './backupReminder';
import { loadProgress } from './db';
import { loadShop } from './shop';
import { loadJson } from './storage';

const STUDY_KEY = 'ap:study-settings';
const SEEN_KEY = 'ap:badges-seen';

/** Stáhne zálohu pokroku jako soubor a zapamatuje si, kdy se to stalo. Vrací počet karet. */
export const downloadBackup = async (): Promise<number> => {
  const p = await loadProgress();
  const now = new Date();
  const backup = buildBackup(p, { settings: loadJson<Record<string, unknown>>(STUDY_KEY, {}), badgesSeen: loadJson<{ ids: string[] }>(SEEN_KEY, { ids: [] }).ids, shop: loadShop() }, now);
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = backupFilename(now);
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  markBackup(now.getTime());
  return backup.cards.length;
};
