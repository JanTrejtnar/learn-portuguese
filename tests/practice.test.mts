import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scenarios } from '../src/content/roleplay.ts';
import { minimalPairs } from '../src/content/pairs.ts';
import { units } from '../src/content/index.ts';
import { scoreTurns, validateScenario, xpForTurns } from '../src/lib/roleplay.ts';
import { makePairRound } from '../src/lib/pairs.ts';
import { bestAlternative, compareSpeech, normalizeSpeech } from '../src/lib/speech.ts';

test('scénáře: graf je platný (odkazy, cykly, dobré odpovědi)', () => {
  for (const s of scenarios) assert.deepEqual(validateScenario(s), []);
  assert.equal(new Set(scenarios.map((s) => s.id)).size, scenarios.length);
});

test('scénáře: odkazují na existující jednotky a dosažitelný konec', () => {
  const unitIds = new Set(units.map((u) => u.id));
  for (const s of scenarios) {
    assert.ok(unitIds.has(s.unitId), `${s.id}: neznámá jednotka`);
    const ends = Object.values(s.nodes).some((n) => n.choices.some((c) => c.next === null && c.quality === 'good'));
    assert.ok(ends, `${s.id}: chybí dobrý konec`);
  }
});

test('scénáře: žádné brazilské tvary a gerundium', () => {
  const text = JSON.stringify(scenarios).toLowerCase();
  assert.ok(!/você|brazil|pt-br/.test(text.replace(/vocês/g, '')));
  assert.ok(!/estou\s+\w+ndo\b|está\s+\w+ndo\b|estás\s+\w+ndo\b/.test(text), 'gerundium po estar');
});

test('skóre: dokonalá cesta = 3 hvězdy, samé špatné = 1', () => {
  const s = scenarios.find((x) => x.id === 'pastelaria')!;
  const good = (id: string) => ({ nodeId: id, choice: s.nodes[id]!.choices.find((c) => c.quality === 'good')! });
  const perfect = [good('n0'), good('n1'), good('n2'), good('n3')];
  assert.equal(scoreTurns(perfect).stars, 3);
  assert.equal(scoreTurns(perfect).ratio, 1);
  assert.equal(xpForTurns(perfect), 10 + 4 * 3);
  const bad = [{ nodeId: 'n0', choice: s.nodes.n0!.choices.find((c) => c.quality === 'bad')! }];
  assert.equal(scoreTurns(bad).stars, 1);
  assert.equal(scoreTurns([]).ratio, 0);
});

test('minimální páry: unikátní a různá slova', () => {
  assert.equal(new Set(minimalPairs.map((p) => p.id)).size, minimalPairs.length);
  for (const p of minimalPairs) assert.notEqual(p.a.pt, p.b.pt);
  const round = makePairRound(minimalPairs, 10);
  assert.equal(round.length, 10);
  assert.equal(new Set(round.map((q) => q.pair.id)).size, 10);
});

test('mluvení: normalizace a porovnání', () => {
  assert.equal(normalizeSpeech('Chamo-me Tomás!'), 'chamo me tomas');
  let r = compareSpeech('Chamo-me Tomás.', 'chamo me tomas');
  assert.equal(r.score, 1);
  assert.ok(r.words.every((w) => w.matched));
  r = compareSpeech('Olá! Como estás?', 'ola como');
  assert.ok(Math.abs(r.score - 2 / 3) < 1e-9);
  assert.deepEqual(r.words.map((w) => w.matched), [true, true, false]);
  r = compareSpeech('Eu sou de Praga', 'praga de sou eu');
  assert.ok(r.score < 0.5, 'špatné pořadí se nepočítá');
  assert.equal(compareSpeech('Olá', '').score, 0);
  const best = bestAlternative('Bom dia', ['bondia', 'bom dia', 'bom']);
  assert.equal(best.heard, 'bom dia');
});
