import { useState } from 'preact/hooks';
import type { Word } from '../types';
import { oneVariant } from '../lib/quiz';
import { AudioButton } from './AudioButton';
import { BottomBar, bigBtn } from './BottomBar';

/** Představení nových slov před cvičením: portugalsky, česky, výslovnost a příklad. */
export const LearnIntro = ({ words, onDone }: { words: Word[]; onDone: () => void }) => {
  const [i, setI] = useState(0);
  const w = words[i];
  if (!w) return null;
  const last = i === words.length - 1;
  return (
    <div>
      <p class="mt-2 text-center text-sm font-semibold text-muted">Nová slova {i + 1} / {words.length}</p>
      <div key={w.id} class="mt-3 rounded-3xl border border-line bg-surface p-6 text-center shadow-soft">
        <div class="flex items-center justify-center gap-3">
          <h1 class="text-3xl font-extrabold" lang="pt-PT">{w.pt}</h1>
          <AudioButton text={oneVariant(w.pt)} size="md" withSlow />
        </div>
        <p class="mt-2 text-xl text-ink-soft">{w.cs}</p>
        {w.literal && <p class="mt-1 text-sm text-muted">doslova: {w.literal}</p>}
        {w.example && (
          <div class="mt-5 rounded-2xl bg-surface-2 p-3 text-left text-sm">
            <div class="flex items-center gap-2"><span lang="pt-PT" class="font-semibold">{w.example.pt}</span><AudioButton text={w.example.pt} /></div>
            <div class="text-ink-soft">{w.example.cs}</div>
          </div>
        )}
        {w.usage && <p class="mt-3 text-left text-sm text-ink-soft">{w.usage}</p>}
      </div>
      <p class="mt-4 text-center text-sm text-ink-soft">Za chvíli se tě na ně zeptám.</p>
      <BottomBar>
        <button type="button" class={bigBtn} onClick={() => (last ? onDone() : setI(i + 1))}>{last ? 'Začít cvičení' : 'Rozumím, dál'}</button>
      </BottomBar>
    </div>
  );
};
