import type { Word } from '../types';

const registerLabel = { formal: 'formální', informal: 'neformální', colloquial: 'hovorové' } as const;

/** Má slovíčko nějaké vysvětlení navíc (doslovný překlad, použití, odstín)? */
export const hasInfo = (w: Word): boolean => Boolean(w.usage || w.literal || w.register);

/** Panel s vysvětlením slovíčka. */
export const WordInfo = ({ word }: { word: Word }) => (
  <div class="w-full max-w-md rounded-2xl border border-line bg-surface-2 p-4 text-left text-sm" role="region" aria-label="Vysvětlení slovíčka">
    {word.literal && (
      <p>
        <span class="text-muted">Doslova: </span>
        <b>{word.literal}</b>
      </p>
    )}
    {word.usage && <p class={word.literal ? 'mt-2' : ''}>{word.usage}</p>}
    {word.register && (
      <p class="mt-2">
        <span class="rounded-full bg-gold-400/20 px-2 py-0.5 text-xs font-semibold">{registerLabel[word.register]}</span>
      </p>
    )}
  </div>
);
