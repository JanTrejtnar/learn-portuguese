import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Loading } from '../components/Loading';
import { AudioButton } from '../components/AudioButton';
import { Breadcrumb } from '../components/Breadcrumb';
import { VoiceWarning } from '../components/VoiceWarning';
import { unitUnlocked } from '../content';
import { getScenario } from '../content/roleplay';
import { speak, stopSpeaking } from '../lib/audio';
import { grantXp } from '../lib/award';
import { saveTest, type Progress } from '../lib/db';
import { PASS_RATIO_RP, scoreTurns, xpForTurns, type RoleplayChoice, type Scenario, type Turn } from '../lib/roleplay';
import { useStudySettings } from '../lib/settings';
import { useProgress } from '../lib/useProgress';
import { href } from '../router';
import { NotFoundPage } from './NotFoundPage';

const tone: Record<RoleplayChoice['quality'], { icon: string; box: string }> = {
  good: { icon: '✅', box: 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100' },
  ok: { icon: '👍', box: 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100' },
  bad: { icon: '⚠️', box: 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100' },
};

export const RoleplayPage = ({ id }: { id: string }) => {
  const scenario = getScenario(id);
  const progress = useProgress();
  if (!scenario) return <NotFoundPage />;
  if (!progress) return <Loading />;
  if (!unitUnlocked(scenario.unitId, progress.tests)) {
    return (
      <div class="py-12 text-center">
        <div class="text-5xl" aria-hidden="true">🔒</div>
        <h1 class="mt-3 text-xl font-bold">Scénář je zamčený</h1>
        <a href={href('/roleplay')} class="mt-5 inline-block rounded-xl bg-brand-700 px-4 py-2.5 font-semibold text-white">Zpět na scénáře</a>
      </div>
    );
  }
  return <Session key={id} scenario={scenario} progress={progress} />;
};

const Session = ({ scenario, progress }: { scenario: Scenario; progress: Progress }) => {
  const [settings, update] = useStudySettings();
  const [attempt, setAttempt] = useState(0);
  const [nodeId, setNodeId] = useState(scenario.start);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState<RoleplayChoice | null>(null);
  const [done, setDone] = useState(false);
  const [xp, setXp] = useState(0);
  const saved = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  const node = scenario.nodes[nodeId]!;
  // Pořadí možností se míchá, ať není správná odpověď vždy nahoře.
  const choices = useMemo(() => [...node.choices].sort(() => Math.random() - 0.5), [nodeId, attempt]);

  useEffect(() => {
    if (!done) speak(node.npc.pt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId, attempt]);
  useEffect(() => stopSpeaking, []);
  useEffect(() => endRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' }), [turns.length, pending, done]);

  const pick = (c: RoleplayChoice) => {
    if (pending) return;
    setPending(c);
  };

  const proceed = () => {
    if (!pending) return;
    const nextTurns = [...turns, { nodeId, choice: pending }];
    setTurns(nextTurns);
    setPending(null);
    if (pending.next === null) {
      setDone(true);
      if (!saved.current) {
        saved.current = true;
        const { ratio } = scoreTurns(nextTurns);
        const key = `rp:${scenario.id}`;
        const old = progress.tests.get(key);
        const result = { id: key, best: Math.max(old?.best ?? 0, ratio), passed: (old?.passed ?? false) || ratio >= PASS_RATIO_RP, attempts: (old?.attempts ?? 0) + 1, last: Date.now() };
        progress.tests.set(key, result);
        void saveTest(result);
        setXp(grantXp(progress.days, xpForTurns(nextTurns), settings.dailyGoal));
      }
    } else {
      setNodeId(pending.next);
    }
  };

  const restart = () => {
    saved.current = false;
    setNodeId(scenario.start);
    setTurns([]);
    setPending(null);
    setDone(false);
    setXp(0);
    setAttempt((a) => a + 1);
  };

  const result = scoreTurns(turns);
  const Bubble = ({ who, pt, cs, right }: { who: string; pt: string; cs: string; right?: boolean }) => (
    <div class={`flex ${right ? 'justify-end' : 'justify-start'}`}>
      <div class={`max-w-[85%] rounded-2xl px-4 py-3 ${right ? 'bg-brand-700 text-white' : 'border border-line bg-surface'}`}>
        <div class={`text-xs font-semibold ${right ? 'opacity-80' : 'text-brand-700 dark:text-brand-100'}`}>{who}</div>
        <div class="flex items-start gap-2">
          <p lang="pt-PT" class="font-medium">{pt}</p>
          {!right && <AudioButton text={pt} />}
        </div>
        {settings.showTranslations && <p class={`mt-1 text-sm ${right ? 'opacity-80' : 'text-muted'}`}>{cs}</p>}
      </div>
    </div>
  );

  return (
    <div class="mx-auto max-w-xl">
      <Breadcrumb items={[{ label: 'Scénáře', to: '/roleplay' }, { label: scenario.title }]} />
      <VoiceWarning />

      <div class="mb-4 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900 dark:bg-brand-900 dark:text-brand-100">
        <p><b>{scenario.emoji} {scenario.setting}</b></p>
        <p class="mt-1">🎯 {scenario.goal}</p>
        <label class="mt-3 flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={settings.showTranslations} onChange={(e) => update({ showTranslations: e.currentTarget.checked })} class="h-4 w-4 accent-teal-700" />
          Zobrazovat české překlady
        </label>
      </div>

      <div class="space-y-3" aria-live="polite">
        {turns.map((t, i) => (
          <div key={i} class="space-y-2">
            <Bubble who={scenario.npcName} pt={scenario.nodes[t.nodeId]!.npc.pt} cs={scenario.nodes[t.nodeId]!.npc.cs} />
            <Bubble who="Ty" pt={t.choice.pt} cs={t.choice.cs} right />
            <p class={`rounded-xl px-3 py-2 text-sm ${tone[t.choice.quality].box}`}>{tone[t.choice.quality].icon} {t.choice.feedback}</p>
          </div>
        ))}

        {!done && (
          <div class="space-y-2">
            <Bubble who={scenario.npcName} pt={node.npc.pt} cs={node.npc.cs} />
            {pending && (
              <>
                <Bubble who="Ty" pt={pending.pt} cs={pending.cs} right />
                <p class={`rounded-xl px-3 py-2 text-sm ${tone[pending.quality].box}`} role="status">{tone[pending.quality].icon} {pending.feedback}</p>
              </>
            )}
          </div>
        )}
      </div>

      {!done && !pending && (
        <ul class="mt-4 space-y-2" aria-label="Co odpovíš?">
          {choices.map((c) => (
            <li key={c.pt}>
              <button type="button" onClick={() => pick(c)} class="w-full rounded-xl border-2 border-line bg-surface px-4 py-3 text-left hover:border-brand-500">
                <span lang="pt-PT" class="block font-medium">{c.pt}</span>
                {settings.showTranslations && <span class="block text-sm text-muted">{c.cs}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!done && pending && (
        <button type="button" onClick={proceed} class="mt-4 w-full rounded-xl bg-brand-700 py-3 font-semibold text-white hover:bg-brand-600">
          {pending.next === null ? 'Dokončit scénář' : 'Pokračovat'}
        </button>
      )}

      {done && (
        <div class="mt-6 rounded-3xl border border-line bg-surface p-6 text-center">
          <div class="text-4xl" aria-label={`${result.stars} hvězdy`}>{'⭐'.repeat(result.stars)}</div>
          <h2 class="mt-2 text-2xl font-bold">{Math.round(result.ratio * 100)} %</h2>
          <p class="text-sm text-ink-soft">
            {result.ratio >= PASS_RATIO_RP ? 'Scénář splněn! Muito bem!' : 'Zkus to znovu, jde to i lépe.'}
          </p>
          {xp > 0 && <p class="mt-2 text-sm font-semibold text-brand-700 dark:text-brand-100">+{xp} XP ⭐</p>}
          {turns.some((t) => t.choice.quality !== 'good') && (
            <div class="mt-4 text-left">
              <h3 class="mb-2 font-semibold">Jak to říct lépe</h3>
              <ul class="space-y-2 text-sm">
                {turns.filter((t) => t.choice.quality !== 'good').map((t, i) => {
                  const best = scenario.nodes[t.nodeId]!.choices.find((c) => c.quality === 'good')!;
                  return (
                    <li key={i} class="rounded-lg bg-app p-2">
                      <span class="text-red-600 line-through">{t.choice.pt}</span>{' '}
                      <b lang="pt-PT" class="text-green-700 dark:text-green-400">{best.pt}</b>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div class="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={restart} class="rounded-xl bg-brand-700 px-4 py-2.5 font-semibold text-white hover:bg-brand-600">Zkusit znovu</button>
            <a href={href('/roleplay')} class="rounded-xl border border-line-strong px-4 py-2.5 font-semibold">Další scénáře</a>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};
