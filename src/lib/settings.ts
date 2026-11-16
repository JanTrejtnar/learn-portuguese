import { useState } from 'preact/hooks';
import { loadJson, saveJson } from './storage';

export interface StudySettings {
  /** 'pt-cs': vpředu portugalsky, 'cs-pt': vpředu česky. */
  direction: 'pt-cs' | 'cs-pt';
  /** Automaticky přehrát portugalštinu, když se zobrazí. */
  autoplay: boolean;
  shuffle: boolean;
  /** Maximum nových karet za den. */
  newPerDay: number;
  /** Denní cíl v XP. */
  dailyGoal: number;
  /** Ukazovat české překlady v roleplayi. */
  showTranslations: boolean;
  /** Jednoduché hodnocení: jen „Neznal jsem“ / „Znal jsem“. */
  simpleRating: boolean;
  /** Uživatel už viděl vysvětlení hodnocení. */
  ratingHelpSeen: boolean;
}

const KEY = 'ap:study-settings';
const defaults: StudySettings = { direction: 'pt-cs', autoplay: true, shuffle: true, newPerDay: 10, dailyGoal: 40, showTranslations: true, simpleRating: true, ratingHelpSeen: false };

export const useStudySettings = (): [StudySettings, (patch: Partial<StudySettings>) => void] => {
  const [settings, setSettings] = useState<StudySettings>(() => loadJson(KEY, defaults));
  const update = (patch: Partial<StudySettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveJson(KEY, next);
  };
  return [settings, update];
};
