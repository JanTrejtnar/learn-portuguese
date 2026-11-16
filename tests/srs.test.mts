import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schedule, DAY, MINUTE, dayStart, previewIntervals, maturity } from '../src/lib/srs.ts';

const t0 = new Date(2026, 10, 16, 14, 0).getTime();

test('good: 1 d → 3 d → interval*ease', () => {
  let s = schedule(undefined, 'x', 'good', t0);
  assert.equal(s.interval, 1);
  assert.equal(s.due, dayStart(t0) + DAY);
  s = schedule(s, 'x', 'good', s.due);
  assert.equal(s.interval, 3);
  s = schedule(s, 'x', 'good', s.due);
  assert.equal(s.interval, 8);
});

test('again: lapse, nižší ease, 10 min', () => {
  let s = schedule(undefined, 'x', 'good', t0);
  s = schedule(s, 'x', 'good', s.due);
  s = schedule(s, 'x', 'again', s.due);
  assert.equal(s.interval, 0);
  assert.equal(s.lapses, 1);
  assert.ok(s.ease < 2.5);
  assert.equal(s.due - s.last, 10 * MINUTE);
  assert.equal(maturity(s), 'learning');
});

test('easy/hard na nové kartě a spodní mez ease', () => {
  assert.equal(schedule(undefined, 'y', 'easy', t0).interval, 4);
  let h = schedule(undefined, 'z', 'hard', t0);
  assert.equal(h.interval, 1);
  for (let i = 0; i < 20; i++) h = schedule(h, 'z', 'again', t0);
  assert.equal(h.ease, 1.3);
});

test('náhled intervalů', () => {
  const p = previewIntervals(undefined, 'n', t0);
  assert.equal(p.again, '10 min');
  assert.equal(maturity(undefined), 'new');
});
