/** Roleplay: větvené dialogy z reálných situací (čistá logika bez UI). */
export type Quality = 'good' | 'ok' | 'bad';

export interface Line {
  pt: string;
  cs: string;
}

export interface RoleplayChoice extends Line {
  quality: Quality;
  /** Zpětná vazba česky (proč je to dobře / jak to říct líp). */
  feedback: string;
  /** Další uzel, nebo null = konec scénáře. */
  next: string | null;
}

export interface RoleplayNode {
  npc: Line;
  choices: RoleplayChoice[];
}

export interface Scenario {
  id: string;
  title: string;
  emoji: string;
  /** Scénář je dostupný po odemčení této jednotky. */
  unitId: string;
  npcName: string;
  setting: string;
  goal: string;
  start: string;
  nodes: Record<string, RoleplayNode>;
}

export const POINTS: Record<Quality, number> = { good: 2, ok: 1, bad: 0 };
export const PASS_RATIO_RP = 0.6;

export const starsOf = (ratio: number): 1 | 2 | 3 => (ratio >= 0.85 ? 3 : ratio >= PASS_RATIO_RP ? 2 : 1);

export interface Turn {
  nodeId: string;
  choice: RoleplayChoice;
}

/** Úspěšnost = získané body / maximum za odehrané tahy (zbytečné odbočky snižují skóre). */
export const scoreTurns = (turns: Turn[]): { points: number; max: number; ratio: number; stars: 1 | 2 | 3 } => {
  const points = turns.reduce((a, t) => a + POINTS[t.choice.quality], 0);
  const max = turns.length * POINTS.good;
  const ratio = max === 0 ? 0 : points / max;
  return { points, max, ratio, stars: starsOf(ratio) };
};

/** XP: dobré odpovědi 3, přijatelné 1, plus 10 za dokončení. */
export const xpForTurns = (turns: Turn[]): number =>
  10 + turns.reduce((a, t) => a + (t.choice.quality === 'good' ? 3 : t.choice.quality === 'ok' ? 1 : 0), 0);

/** Kontrola grafu scénáře (pro testy): všechny odkazy existují, žádné cykly, každý uzel má dobrou odpověď. */
export const validateScenario = (s: Scenario): string[] => {
  const errors: string[] = [];
  if (!s.nodes[s.start]) errors.push(`${s.id}: chybí startovní uzel`);
  for (const [id, n] of Object.entries(s.nodes)) {
    if (n.choices.length < 2) errors.push(`${s.id}/${id}: méně než 2 možnosti`);
    if (!n.choices.some((c) => c.quality === 'good')) errors.push(`${s.id}/${id}: žádná dobrá odpověď`);
    for (const c of n.choices) if (c.next !== null && !s.nodes[c.next]) errors.push(`${s.id}/${id}: next „${c.next}“ neexistuje`);
  }
  const state = new Map<string, 1 | 2>(); // 1 = na zásobníku, 2 = hotovo
  const visit = (id: string) => {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) {
      errors.push(`${s.id}: cyklus přes uzel ${id}`);
      return;
    }
    state.set(id, 1);
    for (const c of s.nodes[id]?.choices ?? []) if (c.next) visit(c.next);
    state.set(id, 2);
  };
  if (s.nodes[s.start]) visit(s.start);
  for (const id of Object.keys(s.nodes)) if (!state.has(id)) errors.push(`${s.id}: nedosažitelný uzel ${id}`);
  return errors;
};
