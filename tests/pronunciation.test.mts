import { test } from 'node:test';
import assert from 'node:assert/strict';
import { falseFriends, pronunciation } from '../src/content/pronunciation.ts';

test('výslovnost: unikátní ID, každé téma má vysvětlení a příklady s přepisem', () => {
  const ids = [...pronunciation.map((t) => t.id), ...falseFriends.map((f) => f.id)];
  assert.equal(new Set(ids).size, ids.length);
  for (const t of pronunciation) {
    assert.ok(t.text.length > 0 && t.examples.length >= 3, t.id);
    for (const e of t.examples) assert.ok(e.pt && e.approx && e.cs, `${t.id}: prázdný příklad`);
  }
  for (const f of falseFriends) assert.ok(f.pt && f.trap && f.meaning && f.example.pt && f.example.cs, f.id);
});

test('výslovnost a falešní přátelé: žádné brazilské tvary', () => {
  const text = JSON.stringify([pronunciation, falseFriends]);
  for (const bad of [/\bônibus\b/i, /\bcelular\b/i, /\btrem\b/i, /\bgeladeira\b/i, /\bestou fazendo\b/i, /\bbrasil/i, /\bgerúndio\b/i]) assert.ok(!bad.test(text), `zakázaný tvar ${bad}`);
});
