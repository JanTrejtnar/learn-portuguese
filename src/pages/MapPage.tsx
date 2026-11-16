import { units, unitUnlocked } from '../content';
import { useProgress } from '../lib/useProgress';
import { href } from '../router';

/** Schematická mapa pevninského Portugalska (lon/lat → SVG). */
const W = 260;
const H = 440;
const proj = (lon: number, lat: number): [number, number] => [(lon + 9.8) * 70, (42.3 - lat) * 80];

// Zjednodušený obrys: od severního pobřeží po jihu a zpět po hranici se Španělskem.
const OUTLINE: [number, number][] = [
  [-8.85, 41.87], [-8.83, 41.69], [-8.65, 41.15], [-8.75, 40.64], [-8.87, 40.15], [-9.07, 39.6], [-9.4, 39.36],
  [-9.5, 38.78], [-8.9, 38.52], [-8.88, 37.95], [-8.99, 37.02], [-8.67, 37.1], [-7.93, 37.02], [-7.42, 37.19],
  [-7.45, 37.55], [-7.5, 38.2], [-7.0, 38.2], [-7.2, 38.9], [-7.0, 39.3], [-7.35, 39.65], [-6.95, 39.95],
  [-7.0, 40.2], [-6.85, 40.9], [-6.2, 41.5], [-6.55, 41.95], [-8.15, 42.15],
];
const outlinePath = OUTLINE.map(([lon, lat], i) => `${i === 0 ? 'M' : 'L'}${proj(lon, lat).map((n) => n.toFixed(1)).join(' ')}`).join(' ') + ' Z';

type State = 'done' | 'current' | 'open' | 'locked';

export const MapPage = () => {
  const progress = useProgress();
  if (!progress) return <p class="py-16 text-center text-stone-500">Načítám…</p>;

  const mapped = units.filter((u) => u.city);
  const stateOf = (id: string): State => {
    if (progress.tests.get(id)?.passed) return 'done';
    return unitUnlocked(id, progress.tests) ? 'open' : 'locked';
  };
  const firstOpen = mapped.find((u) => stateOf(u.id) === 'open');
  const state = (id: string): State => (id === firstOpen?.id ? 'current' : stateOf(id));
  const doneCount = mapped.filter((u) => state(u.id) === 'done').length;
  const pts = mapped.map((u) => ({ u, p: proj(u.city!.lon, u.city!.lat) }));
  // Popisek vlevo, pokud by přetekl vpravo nebo se kryl s městem vedle.
  const labelLeft = (name: string) => ['Sintra', 'Porto', 'Óbidos'].includes(name);

  const colors: Record<State, { fill: string; stroke: string }> = {
    done: { fill: '#16a34a', stroke: '#14532d' },
    current: { fill: '#0d9488', stroke: '#134e4a' },
    open: { fill: '#0d9488', stroke: '#134e4a' },
    locked: { fill: '#a8a29e', stroke: '#57534e' },
  };

  return (
    <div>
      <h1 class="text-2xl font-bold">Cesta Portugalskem 🇵🇹</h1>
      <p class="mt-1 text-stone-600 dark:text-stone-400">
        Každá jednotka je jedno město. Splň test jednotky a cesta pokračuje dál. Hotovo: <b>{doneCount} / {mapped.length}</b>.
      </p>

      {firstOpen && (
        <a href={href(`/unit/${firstOpen.id}`)} class="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-brand-700 p-4 text-white hover:bg-brand-600">
          <span>
            <span class="block text-sm opacity-80">Právě jsi v městě</span>
            <span class="block text-lg font-bold">📍 {firstOpen.city!.name} · {firstOpen.title}</span>
          </span>
          <span class="shrink-0 rounded-xl bg-white px-3 py-1.5 text-sm font-semibold text-brand-700">Pokračovat</span>
        </a>
      )}

      <div class="mx-auto mt-6 max-w-sm rounded-3xl border border-stone-200 bg-sky-50 p-3 dark:border-stone-800 dark:bg-stone-900">
        <svg viewBox={`-50 0 ${W + 50} ${H}`} class="h-auto w-full" role="img" aria-label="Mapa Portugalska s městy jednotek">
          <path d={outlinePath} fill="#ecfccb" stroke="#84cc16" stroke-width="1.5" stroke-linejoin="round" class="dark:opacity-80" />
          {/* trasa */}
          {pts.slice(0, -1).map(({ u, p }, i) => {
            const next = pts[i + 1]!;
            const done = state(u.id) === 'done';
            const long = Math.hypot(next.p[0] - p[0], next.p[1] - p[1]) > 150;
            // Dlouhý přesun (sever → jih) vedeme obloukem podél východní hranice, ne přes střed země.
            const d = long
              ? `M${p[0]} ${p[1]} Q${Math.max(p[0], next.p[0]) + 95} ${(p[1] + next.p[1]) / 2} ${next.p[0]} ${next.p[1]}`
              : `M${p[0]} ${p[1]} L${next.p[0]} ${next.p[1]}`;
            return <path key={u.id} d={d} fill="none" stroke={done ? '#16a34a' : '#a8a29e'} stroke-width="2.5" stroke-dasharray={done ? undefined : '5 5'} stroke-linecap="round" />;
          })}
          {pts.map(({ u, p }) => {
            const st = state(u.id);
            const col = colors[st];
            const left = labelLeft(u.city!.name);
            return (
              <a key={u.id} href={href(`/unit/${u.id}`)} aria-label={`${u.city!.name}: ${u.title}`}>
                {st === 'current' && <circle cx={p[0]} cy={p[1]} r="14" fill={col.fill} opacity="0.25"><animate attributeName="r" values="9;17;9" dur="2s" repeatCount="indefinite" /></circle>}
                <circle cx={p[0]} cy={p[1]} r="9" fill={col.fill} stroke={col.stroke} stroke-width="1.5" />
                <text x={p[0]} y={p[1] + 3.5} text-anchor="middle" font-size="10" font-weight="700" fill="#fff">{st === 'done' ? '✓' : st === 'locked' ? '🔒' : u.order}</text>
                <text x={p[0] + (left ? -13 : 13)} y={p[1] + 4} text-anchor={left ? 'end' : 'start'} font-size="11" font-weight="600" fill={st === 'locked' ? '#78716c' : '#134e4a'}>{u.city!.name}</text>
              </a>
            );
          })}
        </svg>
      </div>

      <ul class="mt-6 space-y-2">
        {mapped.map((u) => {
          const st = state(u.id);
          return (
            <li key={u.id}>
              <a href={href(`/unit/${u.id}`)} class="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900">
                <span class="text-2xl" aria-hidden="true">{st === 'done' ? '✅' : st === 'locked' ? '🔒' : '📍'}</span>
                <span class="min-w-0">
                  <span class="block font-semibold">{u.city!.name}</span>
                  <span class="block text-sm text-stone-600 dark:text-stone-400">Jednotka {u.order}: {u.title}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
