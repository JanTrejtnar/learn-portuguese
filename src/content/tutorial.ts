/**
 * Texty vstupního tutoriálu. Čísla a pravidla se berou z konstant v kódu, aby tutoriál nezastaral
 * (hlídá to tests/tutorial.test.mts). Při změně chování aplikace tento soubor zkontroluj a uprav.
 */
import { COINS_PER_GOAL_DAY, COINS_PER_LEVEL, COINS_PER_SCENARIO, COINS_PER_TEST, COINS_PER_WEEK_STREAK } from '../lib/coins';
import { SPEAKING_ENABLED } from '../lib/config';
import { BACKUP_EVERY_DAYS } from '../lib/backupReminder';
import { LEARN_BATCH } from '../lib/learn';
import { PASS_RATIO } from '../lib/quiz';
import { FREEZE_PRICE, HINT_PRICE, MAX_FREEZES } from '../lib/shop';

export interface TutorialItem {
  emoji: string;
  title: string;
  text: string;
}

export interface TutorialStep {
  id: string;
  emoji: string;
  title: string;
  intro?: string;
  items: TutorialItem[];
}

/** Hranice splnění testu v procentech (např. 80). */
export const passPercent = (): number => Math.round(PASS_RATIO * 100);

/** Počet otázek zařazovacího testu a hranice pro přeskočení. */
export const PLACEMENT_COUNT = 12;

/** Informační obrazovky (denní cíl a výběr úrovně jsou interaktivní a následují po nich). */
export const tutorialSteps = (): TutorialStep[] => [
  {
    id: 'lessons',
    emoji: '🗺️',
    title: 'Bem-vindo! Jak fungují lekce',
    intro: 'Naučíš se evropskou portugalštinu (A1–B1) v češtině, stačí pár minut denně.',
    items: [
      { emoji: '📚', title: 'Jednotky a lekce', text: 'Cesta vede po městech Portugalska. Každá jednotka má několik lekcí: slovíčka s výslovností, gramatiku a dialog.' },
      { emoji: '▶', title: 'Projít lekci', text: `Tlačítko „Projít lekci“ tě provede po ${LEARN_BATCH} nových slovech: nejdřív je uvidíš a uslyšíš, pak je hned procvičíš. Na konci lekce si ještě procvičíš dialog. Hotová slova se objeví v kartičkách k opakování. Na úvodní stránce tě tlačítko „Pokračovat“ vede na další lekci.` },
      { emoji: '🗺️', title: 'Mapa i seznam', text: 'Na úvodní stránce můžeš přepínat mezi mapou a seznamem lekcí.' },
      { emoji: '✅', title: 'Dokončení jednotky', text: `Na konci jednotky je test. Při ${passPercent()} % a více odemkneš další jednotku a získáš pohlednici z daného města.` },
    ],
  },
  {
    id: 'practice',
    emoji: '🃏',
    title: 'Procvičování',
    intro: 'Záložka Procvičit nabízí několik způsobů, jak si slovíčka zapamatovat.',
    items: [
      { emoji: '🃏', title: 'Kartičky', text: 'Slovíčka se vracejí ve chvíli, kdy bys je začal(a) zapomínat. Čím líp je znáš, tím řidčeji se objeví.' },
      { emoji: '🧩', title: 'Kvízy a hry', text: `Kvízy, doplňování vět a přiřazování párů. U kvízů a testů můžeš za ${HINT_PRICE} mince použít nápovědu. Slovíčko s nápovědou se ještě vrátí do opakování.` },
      { emoji: '🗣️', title: 'Výslovnost a pasti', text: 'Krátký přehled, jak se evropská portugalština vyslovuje a čeho se Češi nejčastěji chytí. K tomu najdeš falešné přátele (slova, která znějí povědomě, ale znamenají jinak).' },
      { emoji: '🎭', title: SPEAKING_ENABLED ? 'Scénáře a mluvení' : 'Scénáře', text: SPEAKING_ENABLED ? 'Procvičíš si rozhovory z běžného života a výslovnost přes mikrofon.' : 'Procvičíš si rozhovory z běžného života: vybíráš odpovědi a posloucháš, co říká druhá strana.' },
    ],
  },
  {
    id: 'rewards',
    emoji: '🏆',
    title: 'Odměny',
    intro: 'Za pravidelné učení získáváš XP, mince a pohlednice.',
    items: [
      { emoji: '⭐', title: 'XP a denní cíl', text: 'Za správné odpovědi a hotové lekce dostaneš XP. Splněný denní cíl je základ série dnů v kuse.' },
      { emoji: '🪙', title: 'Mince', text: `Za splněný denní cíl ${COINS_PER_GOAL_DAY}, za nový level ${COINS_PER_LEVEL}, za splněný test ${COINS_PER_TEST}, za scénář ${COINS_PER_SCENARIO} a za každý týden série ${COINS_PER_WEEK_STREAK}. Mince nelze získat klikáním naprázdno.` },
      { emoji: '🛍️', title: 'Obchod', text: `Za mince koupíš věci pro avatara a motivy. Zmrazení série (${FREEZE_PRICE} mincí, nejvýš ${MAX_FREEZES}) zachrání sérii, když jeden den vynecháš.` },
      { emoji: '💾', title: 'Záloha pokroku', text: `Pokrok je uložený jen v tomto prohlížeči. V Nastavení si ho stáhneš jako soubor a po ${BACKUP_EVERY_DAYS} dnech ti to aplikace připomene. Tamtéž si stáhneš i denní připomínku do kalendáře.` },
      { emoji: '💌', title: 'Pohlednice', text: 'Každá dokončená jednotka odemkne pohlednici. Najdeš je ve sbírce na záložce Pokrok.' },
    ],
  },
];

export type LevelChoice = 'zero' | 'a1' | 'a2' | 'look';

export interface LevelOption {
  id: LevelChoice;
  title: string;
  hint: string;
}

export const LEVEL_OPTIONS: LevelOption[] = [
  { id: 'zero', title: 'Začínám od nuly', hint: 'Začneme první lekcí: pozdravy' },
  { id: 'a1', title: 'Už něco umím (A1)', hint: `Krátký test (${PLACEMENT_COUNT} otázek). Při ${passPercent()} % a více přeskočíš A1 a začneš na A2.` },
  { id: 'a2', title: 'Umím docela dost (A2)', hint: `Krátký test (${PLACEMENT_COUNT} otázek). Při ${passPercent()} % a více přeskočíš A1 i A2 a začneš na B1.` },
  { id: 'look', title: 'Jen se porozhlédnout', hint: 'Přejít na hlavní stránku' },
];
