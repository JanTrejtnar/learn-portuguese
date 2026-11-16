import { unitCode, units, unitUnlocked, unlockedWords } from '../content';
import type { Progress } from '../lib/db';
import { useStudySettings } from '../lib/settings';
import { useProgress } from '../lib/useProgress';
import { xpToday } from '../lib/xp';
import { Icon } from '../components/Icon';
import { ViewSwitch } from '../components/ViewSwitch';
import { PlayerStrip } from '../components/PlayerStrip';
import { href } from '../router';
import { useEffect, useState } from 'preact/hooks';
import { saveTest } from '../lib/db';
import { isOnboarded } from './WelcomePage';

const LEVELS = [
  { level: 'A1', title: 'A1 — Začátečník' },
  { level: 'A2', title: 'A2 — Základní' },
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
  const unseen = words.filter((w) => !progress.cards.has(w.id)).length;
  const fresh = Math.min(unseen, settings.newPerDay);
  const todo = due + fresh;
  const goalMissing = xpToday(progress.days, now) < settings.dailyGoal;
  const btn = 'inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold-400 px-5 py-2.5 font-bold text-brand-950 shadow-soft hover:bg-gold-300';
  return (
    <div class="relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-5 text-white shadow-lift">
      <div class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border-[18px] border-gold-400/25" aria-hidden="true" />
      <div class="pointer-events-none absolute -bottom-9 -right-3 h-24 w-24 rounded-full border-[10px] border-flag-600/55" aria-hidden="true" />
      <div class="relative">
        <div class="text-sm font-semibold uppercase tracking-wide text-brand-100">Dnešní plán</div>
        <div class="mt-1 text-2xl font-extrabold">{fresh > 0 && progress.cards.size === 0 ? 'Začni první lekcí' : todo > 0 ? `${due} k opakování · ${fresh} nových` : 'Na dnes hotovo 🎉'}</div>
        <div class="mt-4 flex flex-wrap gap-3">
          {progress.cards.size === 0 && <a href={href('/lesson/a1-u1-l1')} class={btn}>Otevřít lekci<Icon name="arrow" class="h-5 w-5" /></a>}
          {progress.cards.size > 0 && todo > 0 && <a href={href('/cards/all')} class={btn}>Začít<Icon name="arrow" class="h-5 w-5" /></a>}
          {todo === 0 && goalMissing && <a href={href('/quiz/quick')} class={btn}>⚡ Rychlý kvíz za XP</a>}
          {todo === 0 && !goalMissing && <a href={href('/roleplay')} class={btn}>🎭 Zkus scénář<Icon name="arrow" class="h-5 w-5" /></a>}
        </div>
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
  const [, force] = useState(0);
  useEffect(() => {
    if (progress && progress.cards.size === 0 && progress.days.size === 0 && !isOnboarded()) window.location.hash = '#/welcome';
  }, [progress]);
  // První odemčená a nesplněná jednotka = „další krok“
  const firstLocked = progress ? units.find((u) => !unitUnlocked(u.id, progress.tests)) : undefined;
  const current = progress ? units.find((u) => unitUnlocked(u.id, progress.tests) && !progress.tests.get(u.id)?.passed) : undefined;
  return (
  <div>
    <p class="text-sm font-semibold text-muted">{g.cs}</p>
    <h1 class="text-3xl font-extrabold md:text-4xl">{g.pt}</h1>

    <div class="mt-5">{progress ? <PlayerStripWithSettings progress={progress} /> : <div class="skeleton h-24" />}</div>
    {progress && <TodayCard progress={progress} />}

    <ViewSwitch current="list" />

    {LEVELS.map(({ level, title }) => (
      <section key={level}>
        <h2 class="mt-9 mb-3 text-sm font-bold uppercase tracking-wider text-muted">{title}</h2>
        <ul class="grid gap-3 sm:grid-cols-2">
          {units.filter((u) => u.level === level).map((u) => {
            const locked = progress ? !unitUnlocked(u.id, progress.tests) : false;
            const t = progress?.tests.get(u.id);
            const idx = units.findIndex((x) => x.id === u.id);
            const prevUnit = idx > 0 ? units[idx - 1] : undefined;
            const canSkipTo = locked && !!prevUnit && !!progress && u.id === firstLocked?.id;
            const unlock = () => {
              if (!prevUnit || !progress) return;
              const old = progress.tests.get(prevUnit.id);
              const result = { id: prevUnit.id, best: old?.best ?? 0, passed: true, attempts: old?.attempts ?? 0, last: Date.now(), skipped: true };
              progress.tests.set(prevUnit.id, result);
              void saveTest(result);
              force((n) => n + 1);
            };
            return (
              <li key={u.id}>
                <a
                  href={href(`/unit/${u.id}`)}
                  class={`flex h-full items-center gap-4 rounded-2xl border bg-surface p-4 shadow-soft hover:shadow-lift ${current?.id === u.id ? 'border-brand-600 ring-2 ring-brand-600/30' : 'border-line hover:border-brand-500'} ${locked ? 'opacity-70' : ''}`}
                >
                  <span class={`text-3xl ${locked ? 'opacity-40 grayscale' : ''}`} aria-hidden="true">{u.emoji}</span>
                  <span class="min-w-0">
                    <span class="block text-xs text-muted">Jednotka {unitCode(u)} · {u.lessons.length} lekce</span>
                    <span class="block font-semibold">{u.title}</span>
                    <span class="block text-sm text-ink-soft">{u.subtitle}</span>
                  </span>
                  {t?.passed && <span class="ml-auto shrink-0 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-100">✓ splněno</span>}
                  {current?.id === u.id && <span class="ml-auto shrink-0 rounded-full bg-flag-600 px-2.5 py-1 text-xs font-bold text-white">další krok</span>}
                  {locked && <span class="ml-auto shrink-0 text-muted"><Icon name="lock" class="h-5 w-5" /></span>}
                </a>
                {canSkipTo && prevUnit && (
                  <button type="button" onClick={() => { if (window.confirm(`Odemknout jednotku „${u.title}“ bez testu jednotky „${prevUnit.title}“? Test můžeš kdykoli splnit později.`)) unlock(); }}
                    class="mt-1 ml-2 text-xs font-semibold text-muted underline hover:text-brand-700">Už to umím, odemknout</button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    ))}

  </div>
  );
};
