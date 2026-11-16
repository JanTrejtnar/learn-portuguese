import { useState } from 'preact/hooks';
import { Logo } from '../components/Logo';
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

const big = 'w-full rounded-xl px-4 py-3 text-left font-semibold';

/** Úvod pro nového uživatele: jak se učíme, denní cíl a kde začít. */
export const WelcomePage = () => {
  const [step, setStep] = useState(0);
  const [settings, update] = useStudySettings();
  return (
    <div class="mx-auto max-w-md py-6 text-center">
      <Logo class="mx-auto h-16 w-16" />
      <p class="mt-2 text-xs text-muted">Krok {step + 1} ze 3</p>

      {step === 0 && (
        <>
          <h1 class="mt-3 text-3xl font-extrabold">Bem-vindo! 👋</h1>
          <p class="mt-3 text-ink-soft">Naučíš se evropskou portugalštinu (A1–A2) v češtině. Jak to funguje:</p>
          <ol class="mt-5 space-y-3 text-left">
            <li class="rounded-2xl border border-line bg-surface p-4"><b>1. Lekce.</b> Prohlédneš si slovíčka, gramatiku a dialog. Ke každému slovíčku je výslovnost a vysvětlení.</li>
            <li class="rounded-2xl border border-line bg-surface p-4"><b>2. Kartičky.</b> Aplikace ti slovíčka připomíná ve chvíli, kdy bys je začal(a) zapomínat. Stačí pár minut denně.</li>
            <li class="rounded-2xl border border-line bg-surface p-4"><b>3. Test.</b> Po každé jednotce test (80 %) odemkne další jednotku.</li>
          </ol>
          <button type="button" onClick={() => setStep(1)} class={`${big} mt-6 bg-brand-700 text-center text-white hover:bg-brand-600`}>Dál</button>
        </>
      )}

      {step === 1 && (
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
          <button type="button" onClick={() => setStep(2)} class={`${big} mt-6 bg-brand-700 text-center text-white hover:bg-brand-600`}>Dál</button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 class="mt-3 text-2xl font-extrabold">Co už umíš?</h1>
          <div class="mt-5 space-y-2">
            <button type="button" onClick={() => finish('/lesson/a1-u1-l1')} class={`${big} bg-brand-700 text-white hover:bg-brand-600`}>Začínám od nuly<span class="block text-sm font-normal opacity-90">Začneme první lekcí: pozdravy</span></button>
            <button type="button" onClick={() => finish('/quiz/a1-u1')} class={`${big} border-2 border-line bg-surface`}>Už něco umím<span class="block text-sm font-normal text-muted">Zkus test první jednotky a případně ji přeskoč</span></button>
            <button type="button" onClick={() => finish('/')} class={`${big} border-2 border-line bg-surface`}>Jen se porozhlédnout<span class="block text-sm font-normal text-muted">Přejít na hlavní stránku</span></button>
          </div>
        </>
      )}
    </div>
  );
};
