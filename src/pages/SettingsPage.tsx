import { useEffect, useRef, useState } from 'preact/hooks';
import { Breadcrumb } from '../components/Breadcrumb';
import { BACKUP_VERSION, backupFilename, buildBackup, parseBackup, sanitizeSettings, summarizeBackup } from '../lib/backup';
import { clearProgress, loadProgress, replaceProgress } from '../lib/db';
import { useInstall } from '../lib/install';
import { loadJson, saveJson } from '../lib/storage';
import { LearningSettings } from '../components/LearningSettings';
import { useTheme, type Theme } from '../lib/theme';

const STUDY_KEY = 'ap:study-settings';
const SEEN_KEY = 'ap:badges-seen';

const themes: { id: Theme; label: string }[] = [
  { id: 'auto', label: 'Podle systému' },
  { id: 'light', label: 'Světlý' },
  { id: 'dark', label: 'Tmavý' },
];

const Card = ({ title, children }: { title: string; children: preact.ComponentChildren }) => (
  <section class="mt-5 rounded-2xl border border-line bg-surface p-4">
    <h2 class="mb-2 font-semibold">{title}</h2>
    {children}
  </section>
);

const btn = 'rounded-xl border border-line-strong px-4 py-2 font-semibold hover:border-brand-500';

export const SettingsPage = () => {
  const [theme, setTheme] = useTheme();
  const install = useInstall();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const offlineReady = typeof navigator !== 'undefined' && !!navigator.serviceWorker?.controller;

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(null));
  }, []);

  const exportBackup = async () => {
    const p = await loadProgress();
    const backup = buildBackup(p, { settings: loadJson<Record<string, unknown>>(STUDY_KEY, {}), badgesSeen: loadJson<{ ids: string[] }>(SEEN_KEY, { ids: [] }).ids }, new Date());
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFilename(new Date());
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage({ ok: true, text: `Záloha uložena (${backup.cards.length} karet).` });
  };

  const importBackup = async (file: File) => {
    const parsed = parseBackup(await file.text());
    if (!parsed.ok) {
      setMessage({ ok: false, text: parsed.error });
      return;
    }
    const s = summarizeBackup(parsed.backup);
    const sure = window.confirm(`Nahradit stávající pokrok zálohou?\n\nZáloha obsahuje: ${s.cards} karet, ${s.days} dnů aktivity, ${s.tests} testů, ${s.xp} XP.\nSoučasný pokrok v tomto zařízení bude přepsán.`);
    if (!sure) return;
    await replaceProgress(parsed.backup);
    saveJson(STUDY_KEY, sanitizeSettings(parsed.backup.settings));
    saveJson(SEEN_KEY, { ids: parsed.backup.badgesSeen });
    setMessage({ ok: true, text: 'Záloha obnovena. Načítám znovu…' });
    setTimeout(() => window.location.reload(), 700);
  };

  const reset = async () => {
    if (!window.confirm('Opravdu smazat veškerý pokrok (karty, XP, testy, odznaky)? Tuto akci nelze vrátit. Doporučujeme nejdřív udělat zálohu.')) return;
    await clearProgress();
    saveJson(SEEN_KEY, { ids: [] });
    setMessage({ ok: true, text: 'Pokrok byl smazán. Načítám znovu…' });
    setTimeout(() => window.location.reload(), 700);
  };

  return (
    <div class="mx-auto max-w-xl">
      <Breadcrumb items={[{ label: 'Nastavení' }]} />
      <h1 class="text-2xl font-bold">Nastavení ⚙️</h1>

      {message && (
        <p role="status" class={`mt-4 rounded-xl p-3 text-sm ${message.ok ? 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100' : 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'}`}>
          {message.ok ? '✅' : '⚠️'} {message.text}
        </p>
      )}

      <Card title="Vzhled">
        <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Vzhled">
          {themes.map((t) => (
            <button key={t.id} type="button" role="radio" aria-checked={theme === t.id} onClick={() => setTheme(t.id)}
              class={`rounded-xl border-2 px-3 py-2 text-sm font-semibold ${theme === t.id ? 'border-brand-600 bg-brand-50 dark:bg-brand-900' : 'border-line'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      <Card title="Učení">
        <LearningSettings />
      </Card>

      <Card title="Aplikace a offline">
        <ul class="space-y-1 text-sm">
          <li>{offlineReady ? '✅ Aplikace je připravená pro offline použití.' : 'ℹ️ Offline režim se aktivuje po prvním úplném načtení s připojením.'}</li>
          <li>
            {persisted === true ? '✅ Úložiště je chráněné před automatickým smazáním.' : persisted === false ? '⚠️ Prohlížeč může při nedostatku místa údaje smazat. Dělej si zálohy.' : 'ℹ️ Stav úložiště není k dispozici.'}
          </li>
        </ul>
        <div class="mt-3">
          {install.standalone ? (
            <p class="text-sm">✅ Aplikace běží jako nainstalovaná.</p>
          ) : install.canPrompt ? (
            <button type="button" class={btn} onClick={install.install}>📲 Nainstalovat aplikaci</button>
          ) : install.ios ? (
            <p class="text-sm">📲 Na iPhonu nebo iPadu: v Safari klepni na <b>Sdílet</b> a potom <b>Přidat na plochu</b>.</p>
          ) : (
            <p class="text-sm text-muted">📲 Instalace: v nabídce prohlížeče zvol „Nainstalovat aplikaci“ nebo „Přidat na plochu“ (pokud ji tvůj prohlížeč nabízí).</p>
          )}
        </div>
      </Card>

      <Card title="Záloha pokroku">
        <p class="text-sm text-ink-soft">
          Pokrok je uložený jen v tomto prohlížeči. Záloha ti umožní přenést ho na jiné zařízení nebo ochránit před smazáním dat. Soubor obsahuje jen tvůj pokrok a nastavení (verze zálohy {BACKUP_VERSION}).
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button type="button" class={btn} onClick={exportBackup}>⬇️ Stáhnout zálohu</button>
          <button type="button" class={btn} onClick={() => fileRef.current?.click()}>⬆️ Obnovit ze zálohy</button>
          <input ref={fileRef} type="file" accept="application/json,.json" class="hidden" aria-label="Soubor zálohy"
            onChange={(e) => { const f = e.currentTarget.files?.[0]; e.currentTarget.value = ''; if (f) void importBackup(f); }} />
        </div>
      </Card>

      <Card title="Smazat pokrok">
        <p class="text-sm text-ink-soft">Vrátí aplikaci do původního stavu (karty, XP, testy i odznaky). Nastavení učení zůstane.</p>
        <button type="button" onClick={reset} class="mt-3 rounded-xl border border-red-300 px-4 py-2 font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950">🗑️ Smazat veškerý pokrok</button>
      </Card>
    </div>
  );
};
