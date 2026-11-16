import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answerVariants, checkTyped, generateQuiz, isTypeable } from '../src/lib/quiz.ts';
import { isUnitUnlocked } from '../src/lib/unlock.ts';

const W = (id: string, pt: string, cs: string, pos = 'noun') => ({ id, pt, cs, pos }) as any;
const words = [
  W('1', 'o pai', 'otec'), W('2', 'a mãe', 'matka'), W('3', 'o irmão', 'bratr'), W('4', 'a irmã', 'sestra'),
  W('5', 'o avô', 'dědeček'), W('6', 'a avó', 'babička'), W('7', 'Obrigado / Obrigada', 'Děkuji'), W('8', 'Pode repetir, por favor?', 'Můžete to zopakovat?'),
];
const sentences = [
  { pt: 'Este é o meu pai.', cs: 'Tohle je můj otec.', wordId: '1' },
  { pt: 'Esta é a minha mãe.', cs: 'Tohle je moje matka.', wordId: '2' },
];

test('psaní: členy, varianty, diakritika', () => {
  const acc = answerVariants('o primo / a prima');
  assert.equal(checkTyped('primo', acc), 'exact');
  assert.equal(checkTyped('A Prima', acc), 'exact');
  assert.equal(checkTyped('mae', answerVariants('a mãe')), 'diacritics');
  assert.equal(checkTyped('pai', answerVariants('a mãe')), 'wrong');
  assert.equal(checkTyped('chamo me', answerVariants('Chamo-me…')), 'exact');
  assert.equal(checkTyped('', acc), 'wrong');
  assert.equal(isTypeable(W('x', 'Pode repetir, por favor?', '')), false);
});

test('generátor: počet, možnosti, správná odpověď', () => {
  for (let i = 0; i < 50; i++) {
    const qs = generateQuiz({ words, pool: words, sentences, count: 8, audio: true });
    assert.ok(qs.length >= 6 && qs.length <= 8, `počet ${qs.length}`);
    for (const q of qs) {
      if (q.kind === 'pt-to-cs' || q.kind === 'cs-to-pt' || q.kind === 'listen') {
        assert.ok(q.options.length >= 2);
        assert.equal(new Set(q.options).size, q.options.length);
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
      }
      if (q.kind === 'build') assert.deepEqual([...q.bank].sort(), [...q.bank].sort()), assert.ok(q.tokens.every((t) => q.bank.includes(t)));
    }
  }
});

test('bez audia nejsou poslechové otázky', () => {
  for (let i = 0; i < 30; i++) {
    const qs = generateQuiz({ words, pool: words, sentences, count: 8, audio: false });
    assert.ok(qs.every((q) => q.kind !== 'listen' && q.kind !== 'dictation'));
  }
});

test('odemykání jednotek', () => {
  const units = [{ id: 'a' }, { id: 'b' }, { id: 'c' }] as any;
  const tests = new Map<string, any>([['a', { id: 'a', passed: true }]]);
  assert.equal(isUnitUnlocked(units, 'a', tests), true);
  assert.equal(isUnitUnlocked(units, 'b', tests), true);
  assert.equal(isUnitUnlocked(units, 'c', tests), false);
});

test('cloze: otázky vznikají z cvičení a správná odpověď sedí', () => {
  const cloze = [
    { pt: 'Eu ___ cansado.', cs: 'Jsem unavený.', answer: 'estou', distractors: ['sou', 'está'] },
    { pt: 'Ele ___ em casa.', cs: 'Je doma.', answer: 'está', distractors: ['é', 'estou'] },
  ];
  for (let i = 0; i < 30; i++) {
    const qs = generateQuiz({ words, pool: words, sentences, cloze, count: 8, audio: true });
    const c = qs.filter((q) => q.kind === 'cloze');
    assert.ok(c.length >= 1 && c.length <= 2);
    for (const q of c) {
      assert.ok(q.kind === 'cloze' && q.prompt.includes('___'));
      assert.ok(['estou', 'está'].includes(q.options[q.answer]!));
    }
  }
});

test('přiřazování: páry mají unikátní obě strany i při duplicitních překladech', () => {
  const dup = [
    W('a', 'ultimamente', 'v poslední době'), W('b', 'nos últimos tempos', 'v poslední době'),
    W('c', 'amanhã', 'zítra'), W('d', 'depois', 'potom'), W('e', 'ontem', 'včera'), W('f', 'hoje', 'dnes'),
  ];
  for (let i = 0; i < 100; i++) {
    const qs = generateQuiz({ words: dup, pool: dup, sentences: [], count: 6, audio: true });
    for (const q of qs) if (q.kind === 'match') {
      assert.equal(new Set(q.pairs.map((p) => p.cs)).size, q.pairs.length);
      assert.equal(new Set(q.pairs.map((p) => p.pt)).size, q.pairs.length);
    }
  }
});

test('stejný význam: špatná možnost není druhá správná a psaní uzná všechny varianty', () => {
  const ws = [
    W('a', 'Quanto custa?', 'Kolik to stojí?', 'phrase'),
    W('b', 'Quanto custa isto?', 'Kolik to stojí?', 'phrase'),
    W('c', 'Bom dia', 'Dobré ráno', 'phrase'),
    W('d', 'Boa tarde', 'Dobré odpoledne', 'phrase'),
    W('e', 'Boa noite', 'Dobrou noc', 'phrase'),
    W('f', 'Adeus', 'Nashledanou', 'phrase'),
  ];
  for (let i = 0; i < 200; i++) {
    for (const q of generateQuiz({ words: ws, pool: ws, sentences: [], count: 6, audio: true })) {
      if (q.kind === 'cs-to-pt' && (q.prompt === 'Kolik to stojí?')) {
        const wrong = q.options.filter((_, j) => j !== q.answer);
        assert.ok(!wrong.some((o) => o.startsWith('Quanto custa')), 'druhá správná varianta mezi špatnými');
      }
      if (q.kind === 'typing' && q.prompt === 'Kolik to stojí?') {
        assert.equal(checkTyped('Quanto custa?', q.accepted), 'exact');
        assert.equal(checkTyped('quanto custa isto', q.accepted), 'exact');
      }
    }
  }
});
