import { useState } from 'preact/hooks';
import type { Word } from '../types';
import { AudioButton } from './AudioButton';
import { hasInfo, WordInfo } from './WordInfo';

const genderLabel: Record<string, string> = { m: 'm.', f: 'ž.', 'm/f': 'm./ž.' };

export const WordRow = ({ word }: { word: Word }) => {
  const [info, setInfo] = useState(false);
  return (
  <li class="rounded-xl border border-line bg-surface p-4">
    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <span class="flex items-center gap-2">
        <AudioButton text={word.pt} />
        <span class="text-lg font-semibold text-brand-700 dark:text-brand-100" lang="pt-PT">{word.pt}</span>
      </span>
      <span class="flex items-center gap-2 text-ink-soft">
        {word.cs}
        {hasInfo(word) && (
          <button type="button" aria-expanded={info} aria-label="Jak se to používá?" onClick={() => setInfo((v) => !v)}
            class={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold-400 text-sm font-bold ${info ? 'bg-gold-400/40' : 'bg-gold-400/15'}`}>ⓘ</button>
        )}
      </span>
    </div>
    {info && hasInfo(word) && <div class="mt-2"><WordInfo word={word} /></div>}
    {word.gender && <span class="mt-1 inline-block text-xs text-muted">{genderLabel[word.gender]}</span>}
    {word.example && (
      <p class="mt-2 flex items-center gap-2 text-sm">
        <AudioButton text={word.example.pt} />
        <span>
          <span lang="pt-PT" class="italic">{word.example.pt}</span>
          <span class="text-muted"> — {word.example.cs}</span>
        </span>
      </p>
    )}
    {word.note && <p class="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">💡 {word.note}</p>}
  </li>
);
};
