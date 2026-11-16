export type Level = 'A1' | 'A2';
export type Gender = 'm' | 'f' | 'm/f';
export type PartOfSpeech = 'noun' | 'verb' | 'adj' | 'adv' | 'prep' | 'pron' | 'phrase' | 'num' | 'interj';

/** Jedna slovíčko-kartička. `pt` je vždy evropská portugalština (PT-PT). */
export interface Word {
  /** Stabilní ID (klíč pro SRS v Kroku 3) – nikdy neměnit po vydání. */
  id: string;
  pt: string;
  cs: string;
  pos?: PartOfSpeech;
  gender?: Gender;
  example?: { pt: string; cs: string };
  /** Poznámka k PT-PT (výslovnost, rozdíl proti brazilštině…). */
  note?: string;
}

export interface GrammarTable {
  headers: string[];
  rows: string[][];
}

export interface GrammarBlock {
  title: string;
  body: string[];
  table?: GrammarTable;
}

export interface DialogueLine {
  speaker: string;
  pt: string;
  cs: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  words: Word[];
  grammar?: GrammarBlock;
  dialogue?: DialogueLine[];
  /** Obsah zkontroloval rodilý mluvčí PT-PT. */
  reviewed: boolean;
}

export interface Unit {
  id: string;
  level: Level;
  order: number;
  emoji: string;
  title: string;
  subtitle: string;
  lessons: Lesson[];
}
