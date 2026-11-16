import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recallVariant } from '../src/lib/recall.ts';
import { GRAMMAR_NEW_PER_SESSION, buildGrammarQueue, grammarCards } from '../src/lib/grammar.ts';
import { badgeContext } from '../src/lib/badges.ts';
import { typingQuestion, checkTyped } from '../src/lib/quiz.ts';
import { units } from '../src/content/index.ts';
import { allWords } from '../src/content/index.ts';

const word = (id: string, pt: string, cs: string): any => ({ id, pt, cs });
const card = (id: string, reps: number, due = 0): any => ({ id, ease: 2.5, interval: 3, reps, lapses: 0, due, last: 0, introduced: 0 });

test('psaní: jen u známých a krátkých slov, stabilně v rámci dne', () => {
  const w = word('a', 'obrigado', 'děkuji');
  assert.equal(recallVariant(w, undefined, 'often', '2026-11-16'), null, 'nová karta ne');
  assert.equal(recallVariant(w, card('a', 1), 'often', '2026-11-16'), null, 'ještě málo opakování');
  assert.equal(recallVariant(w, card('a', 5), 'off', '2026-11-16'), null, 'vypnuto');
  assert.equal(recallVariant(word('b', 'Quanto custa esta camisola azul?', 'x'), card('b', 5), 'often', '2026-11-16'), null, 'dlouhá fráze ne');
  const a = recallVariant(w, card('a', 5), 'often', '2026-11-16');
  assert.equal(a, recallVariant(w, card('a', 5), 'often', '2026-11-16'), 'stejný den = stejná varianta');
});

test('psaní: podíl odpovídá režimu', () => {
  const ids = Array.from({ length: 600 }, (_, i) => word(`w${i}`, 'casa', 'dům'));
  const share = (mode: 'sometimes' | 'often') => ids.filter((w) => recallVariant(w, card(w.id, 4), mode, '2026-11-16')).length / ids.length;
  assert.ok(share('sometimes') > 0.2 && share('sometimes') < 0.45, String(share('sometimes')));
  assert.ok(share('often') > 0.6 && share('often') < 0.8, String(share('often')));
  const variants = new Set(ids.map((w) => recallVariant(w, card(w.id, 4), 'often', '2026-11-16')).filter(Boolean));
  assert.deepEqual([...variants].sort(), ['dictation', 'typing']);
});

test('otázka na psaní přijímá variantu bez členu i bez diakritiky', () => {
  const q = typingQuestion(word('x', 'o café', 'káva'), [], 'typing', 'r-x');
  assert.equal(checkTyped('o café', q.accepted), 'exact');
  assert.equal(checkTyped('cafe', q.accepted), 'diacritics');
  assert.equal(checkTyped('chá', q.accepted), 'wrong');
});

test('gramatické karty: id, fronta, limit nových', () => {
  const cards = grammarCards(units);
  assert.ok(cards.length > 200);
  assert.equal(new Set(cards.map((c) => c.id)).size, cards.length, 'id musí být unikátní');
  assert.ok(cards.every((c) => c.id.startsWith('cl:') && c.item.pt.includes('___') && c.item.distractors.length >= 2));
  const states = new Map([[cards[0]!.id, card(cards[0]!.id, 2, 10)], [cards[1]!.id, card(cards[1]!.id, 2, 9999)]]);
  const q = buildGrammarQueue(cards, states, 100);
  assert.deepEqual(q.due.map((c) => c.id), [cards[0]!.id]);
  assert.equal(q.fresh.length, GRAMMAR_NEW_PER_SESSION);
  assert.ok(q.fresh.every((c) => !states.has(c.id)));
});

test('gramatické karty se nepočítají mezi slovíčka (odznaky)', () => {
  const p: any = {
    cards: new Map([['a', card('a', 3)], ['cl:a1-u1-l1:0', card('cl:a1-u1-l1:0', 3)]]),
    days: new Map(),
    tests: new Map(),
  };
  assert.equal(badgeContext(p, []).seen, 1);
  assert.ok(allWords().length > 700);
});
