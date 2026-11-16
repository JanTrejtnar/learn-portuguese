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
  /** Aktivní vybavování: jak často se při opakování místo otočení karty píše odpověď. */
  recall: 'off' | 'sometimes' | 'often';
  /** Uživatel už viděl vysvětlení hodnocení. */
  ratingHelpSeen: boolean;
  /** Krátký zvuk po dokončení lekce nebo cvičení. */
  sounds: boolean;
}

const KEY = 'ap:study-settings';
const defaults: StudySettings = { direction: 'pt-cs', autoplay: true, shuffle: true, newPerDay: 10, dailyGoal: 40, showTranslations: true, simpleRating: true, recall: 'sometimes', ratingHelpSeen: false, sounds: true };

export const useStudySettings = (): [StudySettings, (patch: Partial<StudySettings>) => void] => {
  const [settings, setSettings] = useState<StudySettings>(() => ({ ...defaults, ...loadJson<Partial<StudySettings>>(KEY, {}) }));
  const update = (patch: Partial<StudySettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveJson(KEY, next);
  };
  return [settings, update];
};
