import type { Word } from '../types';
import { AudioButton } from './AudioButton';

const registerLabel = { formal: 'formální', informal: 'neformální', colloquial: 'hovorové' } as const;

/** Má slovíčko nějaké vysvětlení navíc (doslovný překlad, použití, odstín)? */
export const hasInfo = (w: Word): boolean => Boolean(w.usage || w.literal || w.register);

/** Rozdělí vysvětlení na úvod, příklady („PT věta.“ (český překlad)) a případný závěr. */
export const splitUsage = (usage: string): { intro: string; examples: { pt: string; cs: string }[]; outro: string } => {
  const parts = usage.split(/(„[^“]+“\s*\([^)]*\))/);
  const examples: { pt: string; cs: string }[] = [];
  const outro: string[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const m = /^„([^“]+)“\s*\(([^)]*)\)$/.exec(parts[i]!);
    if (m) examples.push({ pt: m[1]!, cs: m[2]! });
    const rest = (parts[i + 1] ?? '').trim();
    if (rest) outro.push(rest);
  }
  return { intro: (parts[0] ?? '').trim(), examples, outro: outro.join(' ') };
};

const Usage = ({ usage, first }: { usage: string; first: boolean }) => {
  const { intro, examples, outro } = splitUsage(usage);
  if (examples.length === 0) return <p class={first ? '' : 'mt-2'}>{usage}</p>;
  return (
    <div class={first ? '' : 'mt-2'}>
      {intro && <p>{intro}</p>}
      <ul class="mt-1.5 list-disc space-y-1.5 pl-5">
        {examples.map((e, i) => (
          <li key={i}>
            <span class="inline-flex items-center gap-2"><span lang="pt-PT" class="font-semibold">{e.pt}</span><AudioButton text={e.pt} /></span>
            <span class="block text-ink-soft">{e.cs}</span>
          </li>
        ))}
      </ul>
      {outro && <p class="mt-1.5">{outro}</p>}
    </div>
  );
};

/** Panel s vysvětlením slovíčka. */
export const WordInfo = ({ word }: { word: Word }) => (
  <div class="w-full max-w-md rounded-2xl border border-line bg-surface-2 p-4 text-left text-sm" role="region" aria-label="Vysvětlení slovíčka">
    {word.literal && (
      <p>
        <span class="text-muted">Doslova: </span>
        <b>{word.literal}</b>
      </p>
    )}
    {word.usage && <Usage usage={word.usage} first={!word.literal} />}
    {word.register && (
      <p class="mt-2">
        <span class="rounded-full bg-gold-400/20 px-2 py-0.5 text-xs font-semibold">{registerLabel[word.register]}</span>
      </p>
    )}
  </div>
);
