import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COINS_PER_GOAL_DAY, COINS_PER_LEVEL, COINS_PER_SCENARIO, COINS_PER_TEST, COINS_PER_WEEK_STREAK } from '../src/lib/coins.ts';
import { FREEZE_PRICE, HINT_PRICE, MAX_FREEZES } from '../src/lib/shop.ts';
import { LEVEL_OPTIONS, PLACEMENT_COUNT, passPercent, tutorialSteps } from '../src/content/tutorial.ts';
import { PASS_RATIO } from '../src/lib/quiz.ts';

const text = () => tutorialSteps().flatMap((s) => [s.title, s.intro ?? '', ...s.items.map((i) => i.text)]).join(' ');

test('tutoriál zmiňuje aktuální hodnoty z konstant v kódu', () => {
  const t = text();
  assert.equal(passPercent(), Math.round(PASS_RATIO * 100));
  for (const n of [passPercent(), COINS_PER_GOAL_DAY, COINS_PER_LEVEL, COINS_PER_TEST, COINS_PER_SCENARIO, COINS_PER_WEEK_STREAK, HINT_PRICE, FREEZE_PRICE, MAX_FREEZES]) {
    assert.ok(new RegExp(`(^|\\D)${n}(\\D|$)`).test(t), `chybí hodnota ${n}`);
  }
});

test('tutoriál má pohlednice, nápovědy, zmrazení série a výběr úrovně', () => {
  const t = text();
  assert.match(t, /pohlednic/i);
  assert.match(t, /nápověd/i);
  assert.match(t, /Zmrazení série/);
  assert.deepEqual(LEVEL_OPTIONS.map((o) => o.id), ['zero', 'a1', 'a2', 'look']);
  assert.ok(LEVEL_OPTIONS.some((o) => o.hint.includes(String(PLACEMENT_COUNT))));
});
