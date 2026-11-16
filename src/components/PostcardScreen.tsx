import { useEffect, useRef } from 'preact/hooks';
import { units, unitCode } from '../content';
import { postcards } from '../content/postcards';
import { href } from '../router';
import { AudioButton } from './AudioButton';
import { Celebrate } from './Celebrate';

export const TRAVEL_KEY = 'ap:map-travel';

/** Pohlednice jako dopis s letecky červenozeleným okrajem a razítkem. */
export const PostcardCard = ({ unitId, tilt = true }: { unitId: string; tilt?: boolean }) => {
  const unit = units.find((u) => u.id === unitId);
  const card = postcards[unitId];
  if (!unit?.city || !card) return null;
  return (
        <article class={`pop mt-5 ${tilt ? 'rotate-[-1.5deg]' : ''} rounded-xl bg-[#fffdf6] p-2 text-[#14221a] shadow-lift`} style={{ backgroundImage: 'repeating-linear-gradient(135deg, #da291c 0 14px, #fffdf6 14px 24px, #046a38 24px 38px, #fffdf6 38px 48px)', padding: '7px' }}>
          <div class="rounded-md bg-[#fffdf6] p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-xs font-bold uppercase tracking-wide text-[#556659]">Saudações de</div>
                <h2 class="text-3xl font-extrabold leading-tight" lang="pt-PT">{unit.city.name}</h2>
              </div>
              <div class="flex h-16 w-14 shrink-0 items-center justify-center rounded-sm border-2 border-dashed border-flag-600 bg-gold-200 text-3xl" aria-hidden="true">{unit.city.icon ?? '📮'}</div>
            </div>
            <p class="mt-3 text-sm">{card.fact}</p>
            <p class="mt-3 flex items-center gap-2 border-t border-[#e2dece] pt-3 text-sm">
              <AudioButton text={card.pt} />
              <span>
                <span lang="pt-PT" class="block font-semibold italic">{card.pt}</span>
                <span class="block text-[#556659]">{card.cs}</span>
              </span>
            </p>
          </div>
        </article>
  );
};

/** Celoobrazovková oslava nově získané pohlednice (po prvním splnění jednotky). */
export const PostcardScreen = ({ unitId, next, onClose }: { unitId: string; next: { id: string; title: string } | null; onClose: () => void }) => {
  const unit = units.find((u) => u.id === unitId);
  const card = postcards[unitId];
  const go = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    go.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  if (!unit?.city || !card) return null;
  const toMap = () => {
    try { if (next) sessionStorage.setItem(TRAVEL_KEY, JSON.stringify({ from: unitId, to: next.id })); } catch { /* bonus */ }
  };
  const btn = 'flex min-h-12 items-center justify-center rounded-xl px-4 py-3 font-bold';
  return (
    <div role="dialog" aria-modal="true" aria-label={`Nová pohlednice: ${unit.city.name}`} class="fixed inset-0 z-[60] overflow-y-auto bg-gradient-to-b from-brand-800 via-brand-900 to-brand-950 px-4 py-6 text-white">
      <Celebrate full />
      <div class="mx-auto flex min-h-full max-w-md flex-col justify-center">
        <p class="text-center text-sm font-bold uppercase tracking-widest text-gold-300">Jednotka {unitCode(unit)} dokončena</p>
        <h1 class="mt-1 text-center text-3xl font-extrabold">Nová pohlednice! 💌</h1>

        <PostcardCard unitId={unitId} />

        <div class="mt-7 grid gap-2">
          <a ref={go} href={href('/map')} onClick={toMap} class={`${btn} bg-gold-400 text-brand-950 shadow-soft hover:bg-gold-300`}>
            {next ? `Pokračovat na mapě → ${units.find((u) => u.id === next.id)?.city?.name ?? ''}` : 'Zobrazit mapu →'}
          </a>
          <div class="grid grid-cols-2 gap-2">
            <a href={href('/collection')} class={`${btn} border border-white/40 hover:bg-white/10`}>Sbírka pohlednic</a>
            <button type="button" onClick={onClose} class={`${btn} border border-white/40 hover:bg-white/10`}>Zavřít</button>
          </div>
        </div>
      </div>
    </div>
  );
};
