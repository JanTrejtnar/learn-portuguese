import { useState } from 'preact/hooks';
import type { Word } from '../types';
import { useKeydown } from '../lib/useKeydown';
import { InfoDialog } from './InfoDialog';
import { hasInfo } from './WordInfo';
import { AudioButton } from './AudioButton';

interface Props {
  word: Word;
  flipped: boolean;
  direction: 'pt-cs' | 'cs-pt';
  onFlip: () => void;
}

const PtText = ({ text, big }: { text: string; big?: boolean }) => (
  <span lang="pt-PT" class={`font-bold text-brand-700 dark:text-brand-100 ${big ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>{text}</span>
);

export const Flashcard = ({ word, flipped, direction, onFlip }: Props) => {
  const ptFirst = direction === 'pt-cs';
  const [info, setInfo] = useState(false);
  const canInfo = flipped && hasInfo(word);
  useKeydown((e) => {
    if (e.key.toLowerCase() === 'i' && canInfo && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement)) setInfo((v) => !v);
  });

  return (
    <div
      onClick={onFlip}
      class="relative flex min-h-80 cursor-pointer select-none flex-col items-center justify-center gap-4 rounded-3xl border border-line bg-surface p-6 text-center shadow-sm transition"
    >
      {flipped && hasInfo(word) && (
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label="Jak se to používá?"
          title="Jak se to používá?"
          onClick={(e) => { e.stopPropagation(); setInfo((v) => !v); }}
          class={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-lg ${info ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-100' : 'text-muted hover:bg-surface-2'}`}
        >
          <span aria-hidden="true">ⓘ</span>
        </button>
      )}

      {/* Přední strana */}
      {ptFirst ? (
        <div class="flex flex-col items-center gap-3">
          <PtText text={word.pt} big />
          <AudioButton text={word.pt} size="md" withSlow />
        </div>
      ) : (
        <div class="text-2xl font-semibold sm:text-3xl">{word.cs}</div>
      )}

      {!flipped && <p class="mt-4 text-sm text-muted">Klepni pro otočení</p>}

      {/* Zadní strana */}
      {flipped && (
        <div class="mt-2 flex w-full flex-col items-center gap-3 border-t border-dashed border-line pt-5">
          {ptFirst ? (
            <div class="text-2xl font-semibold">{word.cs}</div>
          ) : (
            <div class="flex flex-col items-center gap-3">
              <PtText text={word.pt} />
              <AudioButton text={word.pt} size="md" withSlow />
            </div>
          )}
          {info && hasInfo(word) && <InfoDialog word={word} onClose={() => setInfo(false)} />}
          {word.gender && <span class="text-xs text-muted">{{ m: 'mužský rod', f: 'ženský rod', 'm/f': 'mužský / ženský rod' }[word.gender]}</span>}
          {word.example && (
            <p class="flex items-center gap-2 text-sm">
              <AudioButton text={word.example.pt} />
              <span class="text-left">
                <span lang="pt-PT" class="italic">{word.example.pt}</span>
                <span class="block text-muted">{word.example.cs}</span>
              </span>
            </p>
          )}
          {word.note && <p class="max-w-md rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">💡 {word.note}</p>}
        </div>
      )}
    </div>
  );
};
