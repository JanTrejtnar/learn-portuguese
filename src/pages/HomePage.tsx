import { unitCode, units, unitUnlocked, unlockedWords } from '../content';
import type { Progress } from '../lib/db';
import { useStudySettings } from '../lib/settings';
import { nextLearnTarget } from '../lib/learn';
import { useProgress } from '../lib/useProgress';
import { xpToday } from '../lib/xp';
import { Icon } from '../components/Icon';
import { ViewSwitch } from '../components/ViewSwitch';
import { PlayerStrip } from '../components/PlayerStrip';
import { href } from '../router';
import { useEffect } from 'preact/hooks';
import { isOnboarded } from './WelcomePage';
import { backupReminderDue, getBackupSnooze, getLastBackup, snoozeBackupReminder } from '../lib/backupReminder';
import { useState } from 'preact/hooks';

const LEVELS = [
  { level: 'A1', title: 'A1 — Začátečník' },
  { level: 'A2', title: 'A2 — Základní' },
  { level: 'B1', title: 'B1 — Samostatný' },
] as const;

const PlayerStripWithSettings = ({ progress }: { progress: Progress }) => {
  const [settings] = useStudySettings();
  return <PlayerStrip progress={progress} goal={settings.dailyGoal} />;
};

const TodayCard = ({ progress }: { progress: Progress }) => {
  const [settings] = useStudySettings();
  const now = Date.now();
  const words = unlockedWords(progress.tests);
  const due = words.filter((w) => (progress.cards.get(w.id)?.due ?? Infinity) <= now).length;
  const target = nextLearnTarget(units, progress.cards, (id) => unitUnlocked(id, progress.tests), (id) => !!progress.tests.get(id)?.passed);
  const goalMissing = xpToday(progress.days, now) < settings.dailyGoal;
  const btn = 'inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold-400 px-5 py-2.5 font-bold text-brand-950 shadow-soft hover:bg-gold-300';
  const btn2 = 'inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/50 px-5 py-2.5 font-bold text-white hover:bg-white/10';
  const first = progress.cards.size === 0;
  const heading = target?.kind === 'learn'
    ? (first ? 'Začni první lekcí' : `Další lekce: ${target.lessonTitle}`)
    : target?.kind === 'test' ? 'Všechna slova jsou probraná'
    : due > 0 ? `${due} k opakování` : 'Na dnes hotovo 🎉';
  return (
    <div class="relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white shadow-lift">
      <div class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border-[18px] border-gold-400/25" aria-hidden="true" />
      <div class="pointer-events-none absolute -bottom-9 -right-3 h-24 w-24 rounded-full border-[10px] border-flag-600/55" aria-hidden="true" />
      <div class="relative">
        <div class="text-sm font-semibold uppercase tracking-wide text-brand-100">Dnešní plán</div>
        <div class="mt-1 text-2xl font-extrabold">{heading}</div>
        {target?.kind === 'learn' && due > 0 && <div class="mt-1 text-sm text-brand-100">{due} slov čeká na opakování</div>}
        <div class="mt-4 flex flex-wrap gap-3">
          {target?.kind === 'learn' && <a href={href(`/learn/${target.lessonId}`)} class={btn}><Icon name="play" class="h-4 w-4" filled />Pokračovat<Icon name="arrow" class="h-5 w-5" /></a>}
          {target?.kind === 'test' && <a href={href(`/quiz/${target.unitId}`)} class={btn}><Icon name="trophy" class="h-5 w-5" />Dokončit jednotku<Icon name="arrow" class="h-5 w-5" /></a>}
          {due > 0 && <a href={href('/cards/all')} class={target ? btn2 : btn}>🃏 Opakovat ({due})</a>}
          {!target && due === 0 && goalMissing && <a href={href('/quiz/quick')} class={btn}>⚡ Rychlý kvíz za XP</a>}
          {!target && due === 0 && !goalMissing && <a href={href('/roleplay')} class={btn}>🎭 Zkus scénář<Icon name="arrow" class="h-5 w-5" /></a>}
        </div>
      </div>
    </div>
  );
};

const BackupReminder = ({ progress }: { progress: Progress }) => {
  const [hidden, setHidden] = useState(false);
  const due = !hidden && backupReminderDue({ activeDays: progress.days.size, lastBackup: getLastBackup(), snoozedUntil: getBackupSnooze(), now: Date.now() });
  if (!due) return null;
  return (
    <div role="region" aria-label="Připomenutí zálohy" class="mt-4 rounded-2xl border border-gold-400 bg-surface p-4 text-sm">
      <p class="font-semibold">💾 Zálohuj si pokrok</p>
      <p class="mt-1 text-ink-soft">Pokrok je uložený jen v tomto prohlížeči a může zmizet, třeba po vymazání dat. Záloha je jeden soubor.</p>
      <div class="mt-3 flex flex-wrap gap-2">
        <a href={href('/settings')} class="inline-flex min-h-11 items-center rounded-xl bg-brand-700 px-4 py-2 font-semibold text-white">Stáhnout zálohu</a>
        <button type="button" class="min-h-11 rounded-xl border border-line-strong px-4 py-2 font-semibold" onClick={() => { snoozeBackupReminder(Date.now()); setHidden(true); }}>Později</button>
      </div>
    </div>
  );
};

const greeting = (): { pt: string; cs: string } => {
  const h = new Date().getHours();
  return h < 12 ? { pt: 'Bom dia!', cs: 'Dobré ráno' } : h < 19 ? { pt: 'Boa tarde!', cs: 'Dobré odpoledne' } : { pt: 'Boa noite!', cs: 'Dobrý večer' };
};

export const HomePage = () => {
  const progress = useProgress();
  const g = greeting();
  useEffect(() => {
    if (progress && progress.cards.size === 0 && progress.days.size === 0 && !isOnboarded()) window.location.hash = '#/welcome';
  }, [progress]);
  // První odemčená a nesplněná jednotka = „další krok“
  const current = progress ? units.find((u) => unitUnlocked(u.id, progress.tests) && !progress.tests.get(u.id)?.passed) : undefined;
  return (
  <div>
    <h1 class="flex flex-wrap items-baseline gap-x-3 text-2xl font-extrabold md:text-3xl">{g.pt}<span class="text-sm font-semibold text-muted">{g.cs}</span></h1>

    <div class="mt-3">{progress ? <PlayerStripWithSettings progress={progress} /> : <div class="skeleton h-24" />}</div>
    {progress && <TodayCard progress={progress} />}
    {progress && <BackupReminder progress={progress} />}

    <div class="mt-8 flex items-center justify-between gap-3">
      <h2 class="text-xl font-extrabold">Lekce</h2>
      <ViewSwitch current="list" compact />
    </div>

    {LEVELS.map(({ level, title }) => (
      <section key={level}>
        <h3 class="mt-6 mb-3 text-sm font-bold uppercase tracking-wider text-muted">{title}</h3>
        <ul class="grid gap-3 sm:grid-cols-2">
          {units.filter((u) => u.level === level).map((u) => {
            const locked = progress ? !unitUnlocked(u.id, progress.tests) : false;
            const t = progress?.tests.get(u.id);
            return (
              <li key={u.id} class="flex flex-col">
                <a
                  href={href(`/unit/${u.id}`)}
                  class={`flex flex-1 items-center gap-4 rounded-2xl border p-4 hover:shadow-lift ${
                    current?.id === u.id ? 'unit-current border-2 border-brand-600 bg-brand-50 shadow-lift dark:bg-brand-950'
                    : t?.passed ? 'border-2 border-brand-600 bg-brand-50 shadow-soft dark:bg-brand-950'
                    : locked ? 'border-dashed border-line-strong bg-surface-2'
                    : 'border-line bg-surface shadow-soft hover:border-brand-500'}`}
                >
                  <span class={`text-3xl ${locked ? 'opacity-40 grayscale' : ''}`} aria-hidden="true">{u.emoji}</span>
                  <span class="min-w-0">
                    <span class="block text-xs text-muted">Jednotka {unitCode(u)} · {u.lessons.length} lekce</span>
                    <span class="block font-semibold">{u.title}</span>
                    <span class="block text-sm text-ink-soft">{u.subtitle}</span>
                  </span>
                  {t?.passed && <span class="ml-auto shrink-0 rounded-full bg-brand-700 px-2.5 py-1 text-xs font-bold text-white">✓ splněno</span>}
                  {current?.id === u.id && <span class="ml-auto shrink-0 rounded-full bg-gold-400 px-2.5 py-1 text-xs font-extrabold text-brand-950">Tady jsi</span>}
                  {locked && <span class="ml-auto shrink-0 text-muted"><Icon name="lock" class="h-5 w-5" /></span>}
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    ))}

    <p class="mt-10 text-center text-xs text-muted">Obsah vznikl s pomocí AI a zatím ho nezkontroloval rodilý mluvčí. <a href={href('/about')} class="underline">Víc a soukromí</a></p>
  </div>
  );
};
