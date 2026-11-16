import { useEffect, useRef, useState } from 'preact/hooks';
import { href } from '../router';
import { Icon } from './Icon';

interface Props {
  /** Kam se jde po odchodu (hash cesta). */
  exitTo: string;
  /** Vysvětlení v potvrzovacím dialogu. */
  note?: string;
  /** Postup 0–1 (volitelný pruh). */
  progress?: number;
  /** Text vpravo od pruhu, např. „3 / 12“. */
  counter?: string;
  /** false = cvičení je hotové, odchod bez ptaní. */
  confirm?: boolean;
}

/** Jediný prvek rozhraní uvnitř cvičení: křížek (s potvrzením) a pruh postupu. */
export const SessionBar = ({ exitTo, note = 'Rozdělané cvičení se nedokončí.', progress, counter, confirm = true }: Props) => {
  const [open, setOpen] = useState(false);
  const stay = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    stay.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const leave = () => { window.location.hash = exitTo; };
  return (
    <div class="mb-4 flex items-center gap-3">
      {confirm ? (
        <button type="button" aria-label="Opustit cvičení" onClick={() => setOpen(true)} class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2">
          <Icon name="close" class="h-6 w-6" />
        </button>
      ) : (
        <a href={href(exitTo)} aria-label="Zavřít" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2">
          <Icon name="close" class="h-6 w-6" />
        </a>
      )}
      {progress !== undefined && (
        <div class="flex-1">
          <div class="h-3 overflow-hidden rounded-full bg-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Postup">
            <div class="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${Math.min(100, progress * 100)}%` }} />
          </div>
        </div>
      )}
      {counter && <span class="shrink-0 text-xs font-semibold text-muted">{counter}</span>}

      {open && (
        <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 md:items-center" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="leave-title" class="pop w-full max-w-sm rounded-3xl border border-line bg-surface p-5 shadow-lift">
            <h2 id="leave-title" class="text-xl font-extrabold">Opravdu chceš odejít?</h2>
            <p class="mt-1 text-ink-soft">{note}</p>
            <div class="mt-4 grid gap-2">
              <button ref={stay} type="button" onClick={() => setOpen(false)} class="min-h-12 rounded-xl bg-brand-700 px-4 py-3 font-bold text-white shadow-soft hover:bg-brand-600">Zůstat</button>
              <button type="button" onClick={leave} class="min-h-12 rounded-xl border border-line-strong px-4 py-3 font-bold">Odejít</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
