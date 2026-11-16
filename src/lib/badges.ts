import type { Progress } from './db';
import { maturity } from './srs';
import { bestStreak } from './stats';
import { levelInfo, totalXp } from './xp';

export interface BadgeContext {
  seen: number;
  mature: number;
  bestStreak: number;
  testsPassed: number;
  perfectTests: number;
  unitTestsPassed: number;
  a1Total: number;
  a1Passed: number;
  a2Passed: number;
  b1Passed: number;
  goalDays: number;
  level: number;
  scenariosDone: number;
}

export interface BadgeDef {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  earned: (c: BadgeContext) => boolean;
}

export const BADGES: BadgeDef[] = [
  { id: 'first-card', emoji: '☕', title: 'Primeiro Café', desc: 'Naučil ses první slovíčko.', earned: (c) => c.seen >= 1 },
  { id: 'words-10', emoji: '🌱', title: 'Primeiras Palavras', desc: '10 slovíček v opakování.', earned: (c) => c.seen >= 10 },
  { id: 'words-50', emoji: '📗', title: 'Cinquenta', desc: '50 slovíček v opakování.', earned: (c) => c.seen >= 50 },
  { id: 'words-100', emoji: '📘', title: 'Cem Palavras', desc: '100 slovíček v opakování.', earned: (c) => c.seen >= 100 },
  { id: 'words-250', emoji: '📚', title: 'Biblioteca', desc: '250 slovíček v opakování.', earned: (c) => c.seen >= 250 },
  { id: 'mature-25', emoji: '🧠', title: 'Memória de Elefante', desc: '25 slovíček zvládnutých na dlouhý interval (≥ 21 dní).', earned: (c) => c.mature >= 25 },
  { id: 'streak-3', emoji: '🔥', title: 'Em Chamas', desc: '3 dny v řadě.', earned: (c) => c.bestStreak >= 3 },
  { id: 'streak-7', emoji: '🌟', title: 'Semana Perfeita', desc: '7 dní v řadě.', earned: (c) => c.bestStreak >= 7 },
  { id: 'streak-30', emoji: '🏅', title: 'Mês de Ouro', desc: '30 dní v řadě.', earned: (c) => c.bestStreak >= 30 },
  { id: 'goal-1', emoji: '🎯', title: 'Objetivo Cumprido', desc: 'Poprvé splněný denní cíl.', earned: (c) => c.goalDays >= 1 },
  { id: 'goal-7', emoji: '🏹', title: 'Atirador', desc: 'Denní cíl splněn 7×.', earned: (c) => c.goalDays >= 7 },
  { id: 'first-test', emoji: '🏆', title: 'Primeiro Teste', desc: 'Splnil jsi první test (≥ 80 %).', earned: (c) => c.testsPassed >= 1 },
  { id: 'perfect', emoji: '💯', title: 'Perfeito!', desc: 'Test na 100 %.', earned: (c) => c.perfectTests >= 1 },
  { id: 'units-4', emoji: '🚋', title: 'A Meio Caminho', desc: 'Splněné testy 4 jednotek.', earned: (c) => c.unitTestsPassed >= 4 },
  { id: 'a1-done', emoji: '🎓', title: 'A1 Completo', desc: 'Splněné testy všech jednotek A1.', earned: (c) => c.a1Total > 0 && c.a1Passed >= c.a1Total },
  { id: 'a2-done', emoji: '🏰', title: 'A2 Completo', desc: 'Splněné testy všech 8 jednotek A2.', earned: (c) => c.a2Passed >= A2_PLANNED_UNITS },
  { id: 'b1-done', emoji: '🏔️', title: 'B1 Completo', desc: 'Splněné testy všech 8 jednotek B1.', earned: (c) => c.b1Passed >= B1_PLANNED_UNITS },
  { id: 'actor', emoji: '🎭', title: 'Ator', desc: 'Dokončil jsi první roleplay scénář.', earned: (c) => c.scenariosDone >= 1 },
  { id: 'actor-5', emoji: '🎬', title: 'Elenco Completo', desc: 'Dokončil jsi všech 5 roleplay scénářů.', earned: (c) => c.scenariosDone >= 5 },
  { id: 'level-5', emoji: '⭐', title: 'Conversador', desc: 'Dosáhl jsi 5. úrovně.', earned: (c) => c.level >= 5 },
];

/** Plánovaný počet jednotek A2 (odznak A2 Completo vyžaduje všechny). */
export const A2_PLANNED_UNITS = 8;
/** Plánovaný počet jednotek B1 (odznak B1 Completo vyžaduje všechny). */
export const B1_PLANNED_UNITS = 8;

export interface UnitRef {
  id: string;
  level: string;
}

export const badgeContext = (p: Progress, unitList: UnitRef[]): BadgeContext => {
  const passedAll = [...p.tests.values()].filter((t) => t.passed && !t.skipped);
  // Výsledky scénářů se ukládají s předponou „rp:“ a nepočítají se jako testy lekcí.
  const tests = passedAll.filter((t) => !t.id.startsWith('rp:'));
  const a1 = new Set(unitList.filter((u) => u.level === 'A1').map((u) => u.id));
  const a2 = new Set(unitList.filter((u) => u.level === 'A2').map((u) => u.id));
  const b1 = new Set(unitList.filter((u) => u.level === 'B1').map((u) => u.id));
  const unitSet = new Set(unitList.map((u) => u.id));
  // gramatické karty (předpona „cl:“) se do počtu slovíček nepočítají
  const wordCards = [...p.cards.values()].filter((c) => !c.id.startsWith('cl:'));
  return {
    seen: wordCards.length,
    mature: wordCards.filter((s) => maturity(s) === 'mature').length,
    bestStreak: bestStreak(p.days),
    testsPassed: tests.length,
    perfectTests: tests.filter((t) => t.best >= 1).length,
    unitTestsPassed: tests.filter((t) => unitSet.has(t.id)).length,
    a1Total: a1.size,
    a1Passed: tests.filter((t) => a1.has(t.id)).length,
    a2Passed: tests.filter((t) => a2.has(t.id)).length,
    b1Passed: tests.filter((t) => b1.has(t.id)).length,
    goalDays: [...p.days.values()].filter((d) => d.goalReached).length,
    level: levelInfo(totalXp(p.days)).level,
    scenariosDone: passedAll.filter((t) => t.id.startsWith('rp:')).length,
  };
};

export const earnedBadges = (p: Progress, unitList: UnitRef[]): BadgeDef[] => {
  const ctx = badgeContext(p, unitList);
  return BADGES.filter((b) => b.earned(ctx));
};
