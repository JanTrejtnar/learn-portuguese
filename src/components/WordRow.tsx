import type { Word } from '../types';

const genderLabel: Record<string, string> = { m: 'm.', f: 'ž.', 'm/f': 'm./ž.' };

export const WordRow = ({ word }: { word: Word }) => (
  <li class="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <span class="text-lg font-semibold text-brand-700 dark:text-brand-100" lang="pt-PT">{word.pt}</span>
      <span class="text-stone-700 dark:text-stone-300">{word.cs}</span>
    </div>
    {word.gender && <span class="mt-1 inline-block text-xs text-stone-500">{genderLabel[word.gender]}</span>}
    {word.example && (
      <p class="mt-2 text-sm">
        <span lang="pt-PT" class="italic">{word.example.pt}</span>
        <span class="text-stone-500"> — {word.example.cs}</span>
      </p>
    )}
    {word.note && <p class="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">💡 {word.note}</p>}
  </li>
);
