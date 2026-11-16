import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEARN_BATCH, learnRemaining, pickLearnBatch } from '../src/lib/learn.ts';
import { BACKUP_EVERY_DAYS, SNOOZE_DAYS, backupReminderDue } from '../src/lib/backupReminder.ts';
import { buildReminderIcs, isValidTime } from '../src/lib/reminder.ts';
import { DAY, newState } from '../src/lib/srs.ts';
import { units } from '../src/content/index.ts';

const words = units[0]!.lessons[0]!.words;

test('dávka: jen slova bez karty, v pořadí lekce, nejvýš LEARN_BATCH', () => {
  const cards = new Map([[words[0]!.id, newState(words[0]!.id, 0)]]);
  const batch = pickLearnBatch(words, cards);
  assert.equal(batch.length, Math.min(LEARN_BATCH, words.length - 1));
  assert.equal(batch[0]!.id, words[1]!.id);
  assert.ok(batch.every((w) => !cards.has(w.id)));
});

test('zbývající slova se počítají podle karet; po probrání je 0', () => {
  const cards = new Map(words.map((w) => [w.id, newState(w.id, 0)] as const));
  assert.equal(learnRemaining(words, new Map()), words.length);
  assert.equal(learnRemaining(words, cards), 0);
  assert.deepEqual(pickLearnBatch(words, cards), []);
});

test('připomenutí zálohy: málo aktivity ne, bez zálohy ano, po 14 dnech ano, odložení platí', () => {
  const now = 100 * DAY;
  assert.equal(backupReminderDue({ activeDays: 2, now }), false);
  assert.equal(backupReminderDue({ activeDays: 5, now }), true);
  assert.equal(backupReminderDue({ activeDays: 5, lastBackup: now - (BACKUP_EVERY_DAYS - 1) * DAY, now }), false);
  assert.equal(backupReminderDue({ activeDays: 5, lastBackup: now - BACKUP_EVERY_DAYS * DAY, now }), true);
  assert.equal(backupReminderDue({ activeDays: 5, snoozedUntil: now + SNOOZE_DAYS * DAY, now }), false);
  assert.equal(backupReminderDue({ activeDays: 5, snoozedUntil: now - 1, now }), true);
});

test('připomínka .ics: platná struktura, denní opakování, zadaný čas, CRLF', () => {
  assert.ok(isValidTime('07:30') && !isValidTime('24:00') && !isValidTime('7:30'));
  const ics = buildReminderIcs('07:30', 'https://example.com/app/', new Date(2026, 10, 16, 12, 0));
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /DTSTART:20261116T073000\r\n/);
  assert.match(ics, /DTEND:20261116T074500\r\n/);
  assert.match(ics, /RRULE:FREQ=DAILY\r\n/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
  assert.match(buildReminderIcs('nesmysl', 'https://example.com/', new Date()), /T190000/);
});

import { nextLearnTarget } from '../src/lib/learn.ts';
import { generateDialogueQuestions } from '../src/lib/quiz.ts';

test('další krok: první lekce s nenaučenými slovy, pak dokončení jednotky, hotová jednotka se přeskočí', () => {
  const open = () => true;
  const t1 = nextLearnTarget(units, new Map(), open, () => false)!;
  assert.deepEqual([t1.kind, t1.unitId], ['learn', units[0]!.id]);
  const u0 = units[0]!;
  const cards = new Map(u0.lessons.flatMap((l) => l.words).map((w) => [w.id, newState(w.id, 0)] as const));
  const t2 = nextLearnTarget(units, cards, open, () => false)!;
  assert.deepEqual([t2.kind, t2.unitId], ['test', u0.id]);
  const t3 = nextLearnTarget(units, cards, open, (id) => id === u0.id)!;
  assert.equal(t3.unitId, units[1]!.id);
  assert.equal(nextLearnTarget(units, new Map(), open, () => true), null);
  assert.equal(nextLearnTarget(units, new Map(), (id) => id === 'nic', () => false), null);
});

test('cvičení nad dialogy: správná odpověď je v možnostech, možnosti jsou unikátní, bez ID slovíček', () => {
  let total = 0;
  for (const u of units) {
    const qs = generateDialogueQuestions(u.lessons, 4, true);
    for (const q of qs) {
      total++;
      assert.ok(q.kind === 'dlg-reply' || q.kind === 'dlg-listen');
      if (q.kind !== 'dlg-reply' && q.kind !== 'dlg-listen') continue;
      assert.deepEqual(q.wordIds, []);
      assert.equal(new Set(q.options).size, q.options.length, `${u.id}: duplicitní možnosti`);
      assert.ok(q.answer >= 0 && q.options[q.answer], `${u.id}: chybí správná odpověď`);
      if (q.kind === 'dlg-reply') assert.ok(!q.options.includes(q.prompt) || q.options[q.answer] === q.prompt, 'předchozí replika není špatná možnost');
    }
  }
  assert.ok(total > 50, `málo cvičení nad dialogy: ${total}`);
  assert.ok(generateDialogueQuestions(units[0]!.lessons, 4, false).every((q) => q.kind === 'dlg-reply'), 'bez audia se neptá na poslech');
});
