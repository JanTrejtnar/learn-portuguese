import { useStudySettings } from '../lib/settings';
import { GOAL_OPTIONS } from '../lib/xp';

const chip = (on: boolean) => `rounded-xl border-2 px-3 py-2 text-left text-sm ${on ? 'border-brand-600 bg-brand-50 dark:bg-brand-900' : 'border-line'}`;

/** Všechna nastavení učení na jednom místě (stránka Nastavení). */
export const LearningSettings = () => {
  const [s, update] = useStudySettings();
  return (
    <div class="space-y-5 text-sm">
      <div>
        <div class="mb-2 font-semibold">Denní cíl</div>
        <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Denní cíl">
          {GOAL_OPTIONS.map((g) => (
            <button key={g.xp} type="button" role="radio" aria-checked={s.dailyGoal === g.xp} onClick={() => update({ dailyGoal: g.xp })} class={chip(s.dailyGoal === g.xp)}>
              <b>{g.label}</b> · {g.xp} XP<span class="block text-xs text-muted">{g.hint}</span>
            </button>
          ))}
        </div>
      </div>
      <label class="flex items-center justify-between gap-3">
        <span><b class="font-semibold">Nových karet denně</b><span class="block text-xs text-muted">Kolik nových slovíček se ti denně nabídne.</span></span>
        <select value={s.newPerDay} onChange={(e) => update({ newPerDay: Number(e.currentTarget.value) })} class="rounded-lg border border-line-strong bg-surface px-2 py-1">
          {[5, 10, 15, 20, 30].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <div>
        <div class="mb-2 font-semibold">Hodnocení karet</div>
        <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Hodnocení karet">
          <button type="button" role="radio" aria-checked={s.simpleRating} onClick={() => update({ simpleRating: true })} class={chip(s.simpleRating)}><b>Jednoduché</b><span class="block text-xs text-muted">Neznal jsem / Znal jsem</span></button>
          <button type="button" role="radio" aria-checked={!s.simpleRating} onClick={() => update({ simpleRating: false })} class={chip(!s.simpleRating)}><b>Podrobné</b><span class="block text-xs text-muted">4 tlačítka</span></button>
        </div>
      </div>
      <div>
        <div class="mb-2 font-semibold">Směr karet</div>
        <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Směr karet">
          <button type="button" role="radio" aria-checked={s.direction === 'pt-cs'} onClick={() => update({ direction: 'pt-cs' })} class={chip(s.direction === 'pt-cs')}>Portugalsky → česky</button>
          <button type="button" role="radio" aria-checked={s.direction === 'cs-pt'} onClick={() => update({ direction: 'cs-pt' })} class={chip(s.direction === 'cs-pt')}>Česky → portugalsky</button>
        </div>
      </div>
      <label class="flex items-center gap-2"><input type="checkbox" checked={s.autoplay} onChange={(e) => update({ autoplay: e.currentTarget.checked })} class="h-4 w-4 accent-teal-700" /> Automaticky přehrát výslovnost</label>
      <label class="flex items-center gap-2"><input type="checkbox" checked={s.shuffle} onChange={(e) => update({ shuffle: e.currentTarget.checked })} class="h-4 w-4 accent-teal-700" /> Zamíchat pořadí karet</label>
      <label class="flex items-center gap-2"><input type="checkbox" checked={s.showTranslations} onChange={(e) => update({ showTranslations: e.currentTarget.checked })} class="h-4 w-4 accent-teal-700" /> Ukazovat české překlady ve scénářích</label>
    </div>
  );
};
