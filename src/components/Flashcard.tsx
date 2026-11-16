import type { Word } from '../types';
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

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={flipped ? 'Karta otočená' : 'Otočit kartu'}
      onClick={onFlip}
      class="flex min-h-80 cursor-pointer select-none flex-col items-center justify-center gap-4 rounded-3xl border border-line bg-surface p-6 text-center shadow-sm transition"
    >
      {/* Přední strana */}
      {ptFirst ? (
        <div class="flex flex-col items-center gap-3">
          <PtText text={word.pt} big />
          <AudioButton text={word.pt} size="md" withSlow />
        </div>
      ) : (
        <div class="text-2xl font-semibold sm:text-3xl">{word.cs}</div>
      )}

      {!flipped && <p class="mt-4 text-sm text-muted">Klepni nebo stiskni mezerník pro otočení</p>}

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
