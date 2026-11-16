import { test } from 'node:test';
import assert from 'node:assert/strict';
import { units, allWords } from '../src/content/index.ts';

test('ID slovíček jsou unikátní a ASCII', () => {
  const ids = allWords().map((w) => w.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicitní ID');
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/, `ID „${id}“ není ASCII`);
});

test('ID lekcí a jednotek jsou unikátní', () => {
  const ids = [...units.map((u) => u.id), ...units.flatMap((u) => u.lessons.map((l) => l.id))];
  assert.equal(new Set(ids).size, ids.length);
});

test('každé slovíčko má pt a cs', () => {
  for (const w of allWords()) {
    assert.ok(w.pt.trim() && w.cs.trim(), `prázdné pole u ${w.id}`);
    if (w.example) assert.ok(w.example.pt && w.example.cs, `prázdný příklad u ${w.id}`);
  }
});

test('doplňovací cvičení: jedna mezera, odpověď mimo špatné možnosti, unikátní možnosti', () => {
  for (const l of units.flatMap((u) => u.lessons)) {
    for (const item of l.cloze ?? []) {
      assert.equal(item.pt.split('___').length, 2, `${l.id}: „${item.pt}“ musí mít jednu mezeru`);
      assert.ok(!item.distractors.includes(item.answer), `${l.id}: odpověď je i mezi špatnými: ${item.pt}`);
      const all = [item.answer, ...item.distractors];
      assert.equal(new Set(all).size, all.length, `${l.id}: duplicitní možnosti: ${item.pt}`);
      assert.ok(item.distractors.length >= 2 && item.distractors.length <= 3);
    }
  }
});

test('lekce má dost slovíček na test a gramatika má tabulku se stejným počtem sloupců', () => {
  for (const l of units.flatMap((u) => u.lessons)) {
    assert.ok(l.words.length >= 8, `${l.id}: málo slovíček`);
    const t = l.grammar?.table;
    if (t) for (const row of t.rows) assert.equal(row.length, t.headers.length, `${l.id}: řádek tabulky nesedí`);
  }
});

test('žádné zmínky o brazilské variantě v obsahu (jen PT-PT)', () => {
  const text = JSON.stringify(units).toLowerCase();
  assert.ok(!/brazíli|brazilsk|pt-br|garçom/.test(text.replace(/brasileiro \/ brasileira|brazilský \/ brazilská/g, '')), 'obsah obsahuje zmínku o brazilské variantě');
});

test('stejná věta v cvičení má vždy stejnou odpověď', () => {
  const seen = new Map<string, string>();
  for (const l of units.flatMap((u) => u.lessons)) {
    for (const item of l.cloze ?? []) {
      const prev = seen.get(item.pt);
      if (prev !== undefined) assert.equal(prev, item.answer, `„${item.pt}“ má různé odpovědi`);
      seen.set(item.pt, item.answer);
    }
  }
});

test('každá jednotka má 3–4 lekce a aspoň 12 cvičení', () => {
  for (const u of units) {
    assert.ok(u.lessons.length >= 2, `${u.id}: málo lekcí`);
    const n = u.lessons.reduce((a, l) => a + (l.cloze?.length ?? 0), 0);
    assert.ok(n >= 6, `${u.id}: málo doplňovacích cvičení (${n})`);
  }
});

import { dedupeWords } from '../src/content/index.ts';
test('souhrnné balíčky neobsahují duplicitní slovíčka (stejné pt + cs)', () => {
  const words = allWords();
  const keys = words.map((w) => `${w.pt.toLowerCase()}|${w.cs.toLowerCase()}`);
  assert.equal(new Set(keys).size, keys.length);
  const a = { id: '1', pt: 'ontem', cs: 'včera' };
  const b = { id: '2', pt: 'Ontem', cs: 'Včera' };
  assert.deepEqual(dedupeWords([a, b]).map((w) => w.id), ['1']);
});

test('v jedné lekci se slovíčka neopakují', () => {
  for (const l of units.flatMap((u) => u.lessons)) {
    const keys = l.words.map((w) => `${w.pt.toLowerCase()}|${w.cs.toLowerCase()}`);
    assert.equal(new Set(keys).size, keys.length, `${l.id}: duplicitní slovíčko`);
  }
});

test('vysvětlení (usage) míří na existující slovíčka a nemá brazilismy', async () => {
  const { usage } = await import('../src/content/usage.ts');
  const { allWords } = await import('../src/content/index.ts');
  const ids = new Set(allWords().map((x) => x.id));
  for (const id of Object.keys(usage)) assert.ok(ids.has(id), `usage pro neexistující slovíčko ${id}`);
  for (const [id, u] of Object.entries(usage)) {
    assert.ok(u.usage || u.literal || u.register, `prázdné vysvětlení ${id}`);
    assert.ok(!/\b(você|ônibus|trem|celular)\b/i.test(`${u.usage ?? ''}${u.literal ?? ''}`.replace(/„vocês?“/gi, '')), `brazilismus v ${id}`);
  }
});
