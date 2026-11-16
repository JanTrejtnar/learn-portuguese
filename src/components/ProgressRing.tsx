/** Kruhový ukazatel (např. denní cíl). */
export const ProgressRing = ({ value, max, size = 64, children }: { value: number; max: number; size?: number; children?: preact.ComponentChildren }) => {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  const ratio = Math.min(1, max > 0 ? value / max : 0);
  return (
    <div class="relative shrink-0" style={{ width: `${size}px`, height: `${size}px` }} role="img" aria-label={`${value} z ${max}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} class="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" stroke-width="6" class="opacity-20" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-dasharray={c} stroke-dashoffset={c * (1 - ratio)} class="transition-all duration-500" />
      </svg>
      <div class="absolute inset-0 flex items-center justify-center text-xs font-bold">{children}</div>
    </div>
  );
};
