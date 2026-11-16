import { useState } from 'preact/hooks';
import { LEVEL_OPTIONS, tutorialSteps, type LevelChoice } from '../content/tutorial';
import { useStudySettings } from '../lib/settings';
import { GOAL_OPTIONS } from '../lib/xp';

export const ONBOARDED_KEY = 'ap:onboarded';

export const isOnboarded = (): boolean => {
  try { return localStorage.getItem(ONBOARDED_KEY) === '1'; } catch { return true; }
};

const finish = (to: string) => {
  try { localStorage.setItem(ONBOARDED_KEY, '1'); } catch { /* nevadí */ }
  window.location.hash = to;
};

const DESTINATION: Record<LevelChoice, string> = {
  zero: '/lesson/a1-u1-l1',
  a1: '/quiz/placement-a1',
  a2: '/quiz/placement-a2',
  look: '/',
};

const big = 'w-full rounded-xl px-4 py-3 text-left font-semibold';
const primary = `${big} mt-4 bg-brand-700 text-center text-white hover:bg-brand-600`;

/** Vstupní průvodce: jak fungují lekce, procvičování, odměny, denní cíl a výběr úrovně. */
export const WelcomePage = () => {
  const info = tutorialSteps();
  const goalStep = info.length;
  const levelStep = info.length + 1;
  const total = info.length + 2;
  const [step, setStep] = useState(0);
  const [settings, update] = useStudySettings();
  const current = info[step];

  return (
    <div class="mx-auto max-w-md text-center">
      <p class="text-xs text-muted">Krok {step + 1} ze {total}</p>

      {current && (
        <>
          <h1 class="mt-2 text-2xl font-extrabold"><span aria-hidden="true">{current.emoji}</span> {current.title}</h1>
          {current.intro && <p class="mt-2 text-ink-soft">{current.intro}</p>}
          <ul class="mt-4 space-y-2 text-left text-sm">
            {current.items.map((it) => (
              <li key={it.title} class="rounded-2xl border border-line bg-surface p-3">
                <b><span aria-hidden="true">{it.emoji}</span> {it.title}.</b> {it.text}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setStep(step + 1)} class={primary}>Dál</button>
        </>
      )}

      {step === goalStep && (
        <>
          <h1 class="mt-3 text-2xl font-extrabold">Kolik času denně máš?</h1>
          <p class="mt-2 text-sm text-ink-soft">Můžeš to kdykoli změnit v Nastavení.</p>
          <div class="mt-5 space-y-2" role="radiogroup" aria-label="Denní cíl">
            {GOAL_OPTIONS.map((g) => (
              <button key={g.xp} type="button" role="radio" aria-checked={settings.dailyGoal === g.xp} onClick={() => update({ dailyGoal: g.xp, newPerDay: g.xp === 20 ? 5 : g.xp === 40 ? 10 : 20 })}
                class={`${big} border-2 ${settings.dailyGoal === g.xp ? 'border-brand-600 bg-brand-50 dark:bg-brand-900' : 'border-line bg-surface'}`}>
                {g.label}<span class="block text-sm font-normal text-muted">{g.xp} XP denně ({g.hint}, asi {g.xp === 20 ? '5' : g.xp === 40 ? '10' : '15'} minut)</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setStep(levelStep)} class={primary}>Dál</button>
        </>
      )}

      {step === levelStep && (
        <>
          <h1 class="mt-3 text-2xl font-extrabold">Co už umíš?</h1>
          <p class="mt-2 text-sm text-ink-soft">Podle toho začneme od nuly, nebo přeskočíš, co už znáš. Přeskočené jednotky nedávají hvězdy, mince ani pohlednice.</p>
          <div class="mt-5 space-y-2">
            {LEVEL_OPTIONS.map((o, i) => (
              <button key={o.id} type="button" onClick={() => finish(DESTINATION[o.id])}
                class={`${big} ${i === 0 ? 'bg-brand-700 text-white hover:bg-brand-600' : 'border-2 border-line bg-surface'}`}>
                {o.title}<span class={`block text-sm font-normal ${i === 0 ? 'opacity-90' : 'text-muted'}`}>{o.hint}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {step > 0 && <button type="button" onClick={() => setStep(step - 1)} class="mt-4 text-sm text-muted underline">Zpět</button>}
    </div>
  );
};
