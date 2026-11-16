import { useEffect, useRef } from 'preact/hooks';
import type { Word } from '../types';
import { AudioButton } from './AudioButton';
import { WordInfo } from './WordInfo';

/** Vysvětlení slovíčka v dialogu přes původní plochu (nic se neposouvá). */
export const InfoDialog = ({ word, onClose }: { word: Word; onClose: () => void }) => {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 md:items-center" onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-label={`Jak se používá: ${word.pt}`} class="pop relative max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-line bg-surface p-5 shadow-lift">
        <button ref={close} type="button" aria-label="Zavřít" onClick={onClose}
          class="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface-2 text-xl font-bold">×</button>
        <div class="flex items-center gap-2 pr-12">
          <AudioButton text={word.pt} />
          <span lang="pt-PT" class="text-2xl font-extrabold text-brand-700 dark:text-brand-100">{word.pt}</span>
        </div>
        <p class="mt-1 text-ink-soft">{word.cs}</p>
        <div class="mt-4"><WordInfo word={word} /></div>
      </section>
    </div>
  );
};
