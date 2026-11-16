import { saveDay, type DayStats } from './db';
import { notifyProgress, toast } from './toast';
import { XP_GOAL_BONUS, awardXp } from './xp';

/** Přidá XP do dnešního dne (uloží, ohlásí splněný cíl a vyhodnotí odznaky). Vrací získané XP včetně bonusu. */
export const grantXp = (days: Map<string, DayStats>, amount: number, goal: number): number => {
  const award = awardXp(days, Date.now(), amount, goal);
  days.set(award.day.date, award.day);
  void saveDay(award.day);
  if (award.goalJustReached) toast({ emoji: '🎯', title: `Denní cíl splněn! +${XP_GOAL_BONUS} XP` });
  notifyProgress();
  return award.gained;
};
