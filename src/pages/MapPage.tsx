import { useEffect, useRef, useState } from 'preact/hooks';
import { Loading } from '../components/Loading';
import { unitCode, units, unitUnlocked } from '../content';
import type { TestResult } from '../lib/db';
import { useProgress } from '../lib/useProgress';
import { href } from '../router';
import { ViewSwitch } from '../components/ViewSwitch';
import type { Unit } from '../types';
import { TRAVEL_KEY } from '../components/PostcardScreen';

/* ───────── Zeměpis (lon/lat → SVG) ───────── */
const SX = 85;
const SY = 98;
const proj = (lon: number, lat: number): [number, number] => [(lon + 9.8) * SX, (42.3 - lat) * SY];
const pts = (list: [number, number][]) => list.map(([lon, lat]) => proj(lon, lat));
const fmt = (p: [number, number]) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;

// Obrys pevninského Portugalska: pobřeží shora dolů, pak hranice se Španělskem zdola nahoru (Minho, Douro, Tejo, Guadiana).
const COAST: [number, number][] = [
  [-8.87, 41.87], [-8.84, 41.69], [-8.78, 41.54], [-8.77, 41.38], [-8.67, 41.15], [-8.65, 41.0], [-8.66, 40.85], [-8.75, 40.64],
  [-8.8, 40.45], [-8.88, 40.15], [-8.95, 39.93], [-9.07, 39.6], [-9.2, 39.44], [-9.38, 39.36], [-9.35, 39.15], [-9.42, 38.96],
  [-9.5, 38.78], [-9.42, 38.69], [-9.2, 38.69], [-9.08, 38.78], [-8.97, 38.9], [-8.9, 38.8], [-8.95, 38.7], [-9.15, 38.65],
  [-9.22, 38.42], [-9.1, 38.44], [-8.95, 38.48], [-8.88, 38.52], [-8.78, 38.48], [-8.78, 38.3], [-8.78, 38.1], [-8.88, 37.95],
  [-8.82, 37.6], [-8.8, 37.44], [-8.85, 37.2], [-8.99, 37.02], [-8.67, 37.1], [-8.53, 37.12], [-8.3, 37.08], [-7.93, 37.0],
  [-7.65, 37.12], [-7.42, 37.19],
];
const BORDER: [number, number][] = [
  [-7.43, 37.55], [-7.52, 37.95], [-7.28, 38.17], [-6.96, 38.2], [-7.1, 38.52], [-6.96, 38.9], [-7.3, 39.1], [-7.05, 39.5],
  [-7.5, 39.65], [-6.95, 39.9], [-7.05, 40.2], [-6.85, 40.45], [-6.85, 40.9], [-6.7, 41.2], [-6.2, 41.55], [-6.55, 41.8],
  [-6.8, 41.98], [-7.5, 41.88], [-8.15, 41.82], [-8.2, 42.15], [-8.6, 42.0],
];
const outline = pts([...COAST, ...BORDER]);
const landPath = 'M' + outline.map(fmt).join(' L') + ' Z';
const borderPts = pts([COAST[COAST.length - 1]!, ...BORDER]);
const borderPath = 'M' + borderPts.map(fmt).join(' L');
const corner = (lon: number, lat: number) => `L${fmt(proj(lon, lat))}`;
const spainPath = 'M' + borderPts.map(fmt).join(' L') + ` ${corner(-8.87, 41.87)} ${corner(-8.9, 42.6)} ${corner(-3.5, 42.6)} ${corner(-3.5, 37.19)} Z`;

const curve = (list: [number, number][]) => {
  const p = pts(list);
  return 'M' + fmt(p[0]!) + p.slice(1).map((q, i) => { const a = p[i]!; return ` Q${((a[0] + q[0]) / 2 + (i % 2 ? 4 : -4)).toFixed(1)} ${((a[1] + q[1]) / 2).toFixed(1)} ${fmt(q)}`; }).join('');
};
const RIVERS = [
  curve([[-6.2, 41.15], [-7.0, 41.12], [-7.7, 41.17], [-8.2, 41.12], [-8.65, 41.14]]), // Douro
  curve([[-7.0, 39.7], [-7.8, 39.45], [-8.5, 39.1], [-8.95, 38.85], [-9.2, 38.69]]), // Tejo
  curve([[-7.45, 38.2], [-7.5, 37.7], [-7.42, 37.2]]), // Guadiana
];

// Dekorace: [lon, lat, emoji, velikost]
const LAND_DECOR: [number, number, string, number][] = [
  [-8.2, 41.05, '🌲', 11], [-7.9, 40.45, '🌲', 10], [-7.55, 40.25, '⛰️', 14], [-7.85, 38.05, '🌾', 12], [-7.45, 38.85, '🌾', 11],
  [-8.78, 41.4, '🐓', 12], [-7.55, 41.2, '🍇', 12], [-8.25, 37.28, '🍊', 11], [-8.0, 39.3, '🌳', 11], [-7.3, 38.5, '🌳', 10],
  [-8.6, 38.95, '🌳', 10], [-7.2, 40.6, '🌲', 10], [-8.15, 40.55, '🌳', 10],
];
const SEA_DECOR: [number, number, string, number, string][] = [
  [-10.0, 40.1, '⛵', 15, 'map-bob'], [-9.95, 37.7, '🐬', 14, 'map-bob-slow'], [-10.05, 41.5, '🐋', 15, 'map-bob'], [-9.95, 39.55, '🏄', 13, 'map-bob-slow'],
];
const WAVES: [number, number][] = [[-10.1, 38.9], [-10.05, 40.8], [-9.95, 42.0], [-10.0, 37.2], [-9.55, 37.0], [-9.7, 41.1], [-9.65, 39.0]];

// Drobné posuny kvůli čitelnosti u měst, která leží blízko sebe.
const NUDGE: Record<string, [number, number]> = { Sintra: [-14, -22], Lisboa: [8, 12], Porto: [-4, 6], Braga: [6, -8], 'Setúbal': [-8, 6], Viseu: [-8, -8], Guarda: [16, 16] };
const LABEL_LEFT = new Set(['Porto', 'Óbidos', 'Lagos', 'Setúbal', 'Aveiro']);

type State = 'done' | 'current' | 'open' | 'locked';
const LEVEL_TABS = ['A1', 'A2'] as const;
type Level = (typeof LEVEL_TABS)[number];

/** Hvězdy za nejlepší výsledek v testu jednotky. */
export const starsForResult = (t?: TestResult): 0 | 1 | 2 | 3 => {
  if (!t?.passed || t.skipped || t.best <= 0) return 0;
  return t.best >= 0.95 ? 3 : t.best >= 0.88 ? 2 : 1;
};

const STAR = 'M0 -6 L1.8 -1.9 L6.2 -1.7 L2.8 1.2 L3.9 5.5 L0 3.1 L-3.9 5.5 L-2.8 1.2 L-6.2 -1.7 L-1.8 -1.9 Z';

const Stars = ({ n, size = 1 }: { n: number; size?: number }) => (
  <g transform={`scale(${size})`}>
    {[-1, 0, 1].map((i) => (
      <path key={i} d={STAR} transform={`translate(${i * 8.5} ${i === 0 ? -1 : 1})`} fill={i + 2 <= n ? '#ffe900' : 'var(--track)'} stroke={i + 2 <= n ? '#c9ae00' : 'var(--line-strong)'} stroke-width="0.8" stroke-linejoin="round" />
    ))}
  </g>
);

const FlagMarker = () => (
  <g class="map-bounce">
    <path d="M-5 9 L0 17 L5 9 Z" fill="#fff" stroke="#ffe900" stroke-width="2" stroke-linejoin="round" />
    <circle r="11" fill="#fff" stroke="#ffe900" stroke-width="2.5" />
    <svg x="-8" y="-8" width="16" height="16" viewBox="0 0 32 32">
      <g clip-path="url(#flagclip)"><rect width="32" height="32" fill="#da291c" /><rect width="12.8" height="32" fill="#046a38" /><circle cx="12.8" cy="16" r="6" fill="none" stroke="#ffe900" stroke-width="2.4" /></g>
    </svg>
  </g>
);

/** Po dokončení jednotky se mapa otevře s animací přesunu praporku do dalšího města (jednorázově). */
const readTravel = (): { from: string; to: string } | null => {
  try {
    const raw = sessionStorage.getItem(TRAVEL_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(TRAVEL_KEY);
    const t = JSON.parse(raw) as { from?: string; to?: string };
    return t.from && t.to ? { from: t.from, to: t.to } : null;
  } catch {
    return null;
  }
};

export const MapPage = () => {
  const progress = useProgress();
  const [chosen, setChosen] = useState<Level | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const travelRef = useRef<{ from: string; to: string } | null | undefined>(undefined);
  if (travelRef.current === undefined) travelRef.current = readTravel();
  const [travelOver, setTravelOver] = useState(false);
  useEffect(() => {
    if (!travelRef.current) return;
    const t = window.setTimeout(() => setTravelOver(true), 2400);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!selected) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);
  if (!progress) return <Loading />;

  const withCity = units.filter((u) => u.city);
  const currentUnit = withCity.find((u) => !progress.tests.get(u.id)?.passed && unitUnlocked(u.id, progress.tests));
  const travelTo = travelRef.current ? withCity.find((u) => u.id === travelRef.current!.to) : undefined;
  const level: Level = chosen ?? ((travelTo?.level as Level | undefined) ?? (currentUnit?.level as Level | undefined) ?? 'A1');
  const mapped = withCity.filter((u) => u.level === level);

  const stateOf = (u: Unit): State => {
    if (progress.tests.get(u.id)?.passed) return 'done';
    if (!unitUnlocked(u.id, progress.tests)) return 'locked';
    return u.id === mapped.find((m) => !progress.tests.get(m.id)?.passed && unitUnlocked(m.id, progress.tests))?.id ? 'current' : 'open';
  };

  const positioned = mapped.map((u) => {
    const base = proj(u.city!.lon, u.city!.lat);
    const [dx, dy] = NUDGE[u.city!.name] ?? [0, 0];
    return { u, p: [base[0] + dx, base[1] + dy] as [number, number], st: stateOf(u) };
  });
  const sel = positioned.find((x) => x.u.id === selected);
  const done = positioned.filter((x) => x.st === 'done').length;
  const stars = positioned.reduce((a, x) => a + starsForResult(progress.tests.get(x.u.id)), 0);
  const allDone = positioned.length > 0 && done === positioned.length;

  const segments = positioned.slice(0, -1).map((a, i) => {
    const b = positioned[i + 1]!;
    const dx = b.p[0] - a.p[0];
    const dy = b.p[1] - a.p[1];
    const len = Math.hypot(dx, dy);
    const long = len > 230;
    const ctrl: [number, number] = long
      ? [Math.max(a.p[0], b.p[0]) + 120, (a.p[1] + b.p[1]) / 2]
      : [(a.p[0] + b.p[0]) / 2 + (-dy / len) * len * 0.2 * (i % 2 ? 1 : -1), (a.p[1] + b.p[1]) / 2 + (dx / len) * len * 0.2 * (i % 2 ? 1 : -1)];
    return { d: `M${fmt(a.p)} Q${fmt(ctrl)} ${fmt(b.p)}`, len: Math.round(len * 1.25), done: a.st === 'done', next: a.st === 'current' };
  });

  const travelIdx = travelRef.current ? positioned.findIndex((x, i) => x.u.id === travelRef.current!.from && positioned[i + 1]?.u.id === travelRef.current!.to) : -1;
  const traveling = travelIdx >= 0 && !travelOver;

  const fills: Record<State, { fill: string; ring: string }> = {
    done: { fill: '#ffe900', ring: '#046a38' },
    current: { fill: 'var(--surface)', ring: 'var(--color-flag-600)' },
    open: { fill: 'var(--surface)', ring: 'var(--color-brand-600)' },
    locked: { fill: 'var(--surface-2)', ring: 'var(--line-strong)' },
  };

  const prevOf = (u: Unit): Unit | undefined => {
    const i = units.findIndex((x) => x.id === u.id);
    return i > 0 ? units[i - 1] : undefined;
  };

  const selState = sel?.st;
  const selResult = sel ? progress.tests.get(sel.u.id) : undefined;
  const selStars = starsForResult(selResult);

  return (
    <div class="mx-auto max-w-md">
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-2xl font-extrabold">Cesta Portugalskem</h1>
        <div class="text-right text-sm font-bold leading-tight">
          <div>🏁 {done} / {positioned.length}</div>
          <div class="text-amber-700 dark:text-gold-400">⭐ {stars} / {positioned.length * 3}</div>
        </div>
      </div>

      <div class="mt-2 flex items-center gap-2">
        <ViewSwitch current="map" compact />
        <div class="ml-auto flex gap-2" role="tablist" aria-label="Úroveň">
          {LEVEL_TABS.map((l) => (
            <button key={l} type="button" role="tab" aria-selected={level === l} onClick={() => { setChosen(l); setSelected(null); }}
              class={`min-h-10 rounded-xl px-4 py-1.5 font-bold ${level === l ? 'bg-brand-700 text-white shadow-soft' : 'border border-line-strong bg-surface'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {allDone && (
        <div class="pop mt-2 rounded-2xl bg-gold-400 p-2 text-center text-sm font-extrabold text-brand-950 shadow-lift">🏆 Úroveň {level} dokončena! Parabéns!</div>
      )}

      {/* Mapa je hlavní prvek obrazovky: plná šířka, bez okrajů; zbytek se případně doscrolluje. */}
      <div class="-mx-4 mt-3 overflow-hidden border-y border-line shadow-lift md:mx-0 md:rounded-3xl md:border">
        <svg viewBox="-50 -20 375 590" class="block h-auto w-full" role="group" aria-label={`Herní mapa Portugalska, úroveň ${level}`}>
          <defs>
            <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--sea-1)" /><stop offset="1" style="stop-color: var(--sea-2)" /></linearGradient>
            <linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color: var(--land-1)" /><stop offset="1" style="stop-color: var(--land-2)" /></linearGradient>
            <linearGradient id="spain" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color: var(--spain-1)" /><stop offset="1" style="stop-color: var(--spain-2)" /></linearGradient>
            <clipPath id="flagclip"><rect width="32" height="32" rx="8" /></clipPath>
          </defs>

          <rect x="-50" y="-20" width="375" height="590" fill="url(#sea)" />
          {WAVES.map(([lon, lat], i) => {
            const [x, y] = proj(lon, lat);
            return <path key={i} d={`M${x} ${y} q4 -4 8 0 t8 0 t8 0`} fill="none" stroke="var(--sea-line)" stroke-width="1.6" stroke-linecap="round" opacity=".7" class="map-drift" style={{ animationDelay: `${i * 0.6}s` }} />;
          })}
          <text x="-38" y="300" font-size="11" font-style="italic" letter-spacing="2" fill="var(--sea-line)" opacity=".9" transform="rotate(-90 -38 300)" text-anchor="middle">Oceano Atlântico</text>

          <path d={spainPath} fill="url(#spain)" />
          <text x="262" y="330" font-size="12" font-weight="700" letter-spacing="3" fill="var(--muted)" opacity=".5" text-anchor="middle" transform="rotate(90 262 330)">ESPANHA</text>

          <path d={landPath} fill="none" stroke="var(--sand)" stroke-width="9" stroke-linejoin="round" />
          <path d={landPath} fill="url(#land)" stroke="var(--sand)" stroke-width="2" stroke-linejoin="round" />
          <path d={borderPath} fill="none" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="5 4" opacity=".55" />
          {RIVERS.map((d, i) => <path key={i} d={d} fill="none" stroke="var(--river)" stroke-width="2.6" stroke-linecap="round" opacity=".9" />)}

          {LAND_DECOR.map(([lon, lat, e, s], i) => { const [x, y] = proj(lon, lat); return <text key={i} x={x} y={y} font-size={s} text-anchor="middle" opacity=".85" aria-hidden="true">{e}</text>; })}
          {SEA_DECOR.map(([lon, lat, e, s, cls], i) => { const [x, y] = proj(lon, lat); return <g key={i} class={cls} aria-hidden="true"><text x={x} y={y} font-size={s} text-anchor="middle">{e}</text></g>; })}

          {/* cesta */}
          {segments.map((s, i) => <path key={`b${i}`} d={s.d} fill="none" stroke="var(--road)" stroke-width="10" stroke-linecap="round" opacity=".55" />)}
          {segments.map((s, i) =>
            s.done ? (
              <path key={`g${i}`} d={s.d} fill="none" stroke="#ffe900" stroke-width="4.5" stroke-linecap="round" class="map-draw" style={i === travelIdx ? { '--len': s.len, animationDelay: '.5s', animationDuration: '1.6s', animationTimingFunction: 'linear' } : { '--len': s.len }} />
            ) : (
              <path key={`d${i}`} d={s.d} fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="0.1 8" class={s.next ? 'map-flow' : ''} opacity={s.next ? 1 : 0.8} />
            ),
          )}

          {traveling && (
            <g visibility="hidden" aria-hidden="true">
              <set attributeName="visibility" to="visible" begin=".5s" fill="freeze" />
              <animateMotion dur="1.6s" begin=".5s" fill="freeze" {...({ path: segments[travelIdx]!.d } as object)} calcMode="linear" />
              <g transform="translate(0 -42)"><FlagMarker /></g>
            </g>
          )}

          {/* města */}
          {positioned.map(({ u, p, st }) => {
            const left = LABEL_LEFT.has(u.city!.name);
            const name = u.city!.name;
            const w = name.length * 5.8 + 14;
            const off = st === 'current' ? 30 : 20;
            const f = fills[st];
            const isSel = sel?.u.id === u.id;
            const result = progress.tests.get(u.id);
            return (
              <g key={u.id} class="map-node" transform={`translate(${p[0]} ${p[1]})`} role="button" tabIndex={0}
                aria-label={`${name}: ${u.title}, ${st === 'done' ? 'splněno' : st === 'locked' ? 'zamčeno' : 'k dispozici'}`}
                onClick={() => setSelected(u.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(u.id); } }}>
                <circle r="28" fill="transparent" />
                {isSel && <circle r="25" fill="none" stroke="#ffe900" stroke-width="3" stroke-dasharray="6 4" class="map-flow" />}
                {st === 'current' && (
                  <>
                    <circle r="17" fill="var(--color-flag-600)" class="map-pulse" />
                    <circle r="27" fill="none" stroke="var(--color-flag-600)" stroke-width="3.5" stroke-dasharray="7 5" class="map-flow" />
                    <circle r="22" fill="#ffe900" opacity=".35" class="map-pulse" />
                  </>
                )}
                <g transform={st === 'current' ? 'scale(1.3)' : undefined}>
                  <circle class="map-ring" r="15" fill={f.fill} stroke={f.ring} stroke-width={st === 'done' ? 4 : 3.5} stroke-dasharray={st === 'locked' ? '4 3' : undefined} />
                  <text y="5.5" font-size="16" text-anchor="middle" opacity={st === 'locked' ? 0.3 : 1} aria-hidden="true">{u.city!.icon ?? u.emoji}</text>
                </g>
                {st === 'locked' && <text x="9" y="14" font-size="10" aria-hidden="true">🔒</text>}
                {st === 'locked' && <g class="map-drift" aria-hidden="true"><text x="-17" y="-8" font-size="14" opacity=".9">☁️</text></g>}
                {st === 'done' && (
                  <g aria-hidden="true">
                    <circle cx="12" cy="-12" r="8" fill="#046a38" stroke="#fff" stroke-width="2" />
                    <path d="M8 -12 l3 3 l5 -5.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                  </g>
                )}
                {st === 'done' && <g transform="translate(0 26)"><Stars n={starsForResult(result)} size={1} /></g>}
                <g transform={`translate(${left ? -(w + off) : off} -9)`} aria-hidden="true">
                  <rect width={w} height="18" rx="9" fill={st === 'done' ? '#ffe900' : st === 'current' ? 'var(--color-flag-600)' : 'var(--surface)'} stroke={st === 'done' ? '#046a38' : st === 'current' ? '#fff' : 'var(--line)'} stroke-width={st === 'locked' ? 1 : 1.6} opacity={st === 'locked' ? 0.75 : 1} />
                  <text x={w / 2} y="12.5" font-size="10" font-weight="800" text-anchor="middle" fill={st === 'done' ? '#14221a' : st === 'current' ? '#fff' : st === 'locked' ? 'var(--muted)' : 'var(--map-ink)'}>{name}</text>
                </g>
                {st === 'current' && !traveling && (
                  <g transform="translate(0 -42)" aria-hidden="true"><FlagMarker /></g>
                )}
              </g>
            );
          })}
          <text x="-30" y="-2" font-size="9" fill="var(--muted)" opacity=".8">N ↑</text>
        </svg>
      </div>

      {sel && (
        <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 pb-20 md:items-center md:pb-3" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
        <section role="dialog" aria-modal="true" aria-label={`${sel.u.city!.name}: ${sel.u.title}`} class="pop relative max-h-full w-full max-w-md overflow-y-auto rounded-3xl border border-line bg-surface p-5 shadow-lift" key={sel.u.id}>
          <button ref={closeRef} type="button" aria-label="Zavřít" onClick={() => setSelected(null)}
            class="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface-2 text-xl font-bold">×</button>
          <div class="flex items-center gap-4 pr-10">
            <div class={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 text-3xl ${selState === 'done' ? 'border-gold-400 bg-brand-600' : selState === 'locked' ? 'border-line-strong bg-surface-2 opacity-70' : 'border-brand-600 bg-surface'}`} aria-hidden="true">
              {sel.u.city!.icon ?? sel.u.emoji}
            </div>
            <div class="min-w-0">
              <div class="text-xs font-bold uppercase tracking-wide text-muted">Jednotka {unitCode(sel.u)}</div>
              <h2 class="text-2xl font-extrabold leading-tight">{sel.u.city!.name}</h2>
              <div class="font-semibold text-ink-soft">{sel.u.title}</div>
            </div>
          </div>
          <p class="mt-3 text-sm text-muted">{sel.u.subtitle}</p>
          <div class="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span class="rounded-full bg-surface-2 px-3 py-1 font-semibold">{sel.u.lessons.length} lekce</span>
            {selState === 'done' && selResult && (
              <span class="rounded-full bg-brand-100 px-3 py-1 font-bold text-brand-800 dark:bg-brand-900 dark:text-brand-100">✓ splněno{selResult.best > 0 ? ` · ${Math.round(selResult.best * 100)} %` : ''}</span>
            )}
            {selState === 'done' && selStars > 0 && <span class="font-bold text-amber-700 dark:text-gold-400">{'⭐'.repeat(selStars)}</span>}
            {selState === 'current' && <span class="rounded-full bg-flag-600 px-3 py-1 font-bold text-white">další krok</span>}
            {selState === 'locked' && <span class="rounded-full bg-surface-2 px-3 py-1 font-bold text-muted">🔒 zamčeno</span>}
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            {selState !== 'locked' ? (
              <>
                <a href={href(`/unit/${sel.u.id}`)} class="inline-flex min-h-11 items-center rounded-xl bg-brand-700 px-5 py-2.5 font-bold text-white shadow-soft hover:bg-brand-600">
                  {selState === 'done' ? 'Opakovat jednotku' : 'Pokračovat'} →
                </a>
                {selState !== 'done' && <a href={href(`/quiz/${sel.u.id}`)} class="inline-flex min-h-11 items-center rounded-xl border border-line-strong px-5 py-2.5 font-bold hover:border-brand-500">🏆 Dokončit jednotku</a>}
              </>
            ) : (
              <>
                <p class="w-full text-sm text-ink-soft">Odemkneš ji splněním testu jednotky {prevOf(sel.u) ? `„${prevOf(sel.u)!.title}“` : 'před ní'}.</p>
                {prevOf(sel.u) && (
                  <a href={href(`/quiz/${prevOf(sel.u)!.id}`)} class="inline-flex min-h-11 items-center rounded-xl bg-brand-700 px-5 py-2.5 font-bold text-white shadow-soft hover:bg-brand-600">Spustit tento test</a>
                )}
              </>
            )}
          </div>
        </section>
        </div>
      )}
    </div>
  );
};
