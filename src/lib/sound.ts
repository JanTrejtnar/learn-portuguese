/** Krátké zvuky generované v kódu (WAV přes <audio>). Selhání je tiché, zvuky jdou vypnout v Nastavení. */
import { loadJson } from './storage';

const soundsOn = (): boolean => loadJson<{ sounds?: boolean }>('ap:study-settings', {}).sounds !== false;

interface Note { f: number; at: number; len: number; vol?: number; type?: 'sine' | 'triangle' }

const RATE = 22050;

/** Zvuk se předem „vyrenderuje“ do WAV a přehrává přes <audio>: to funguje i na iPhonu s vypnutým zvonkem
 *  (WebAudio se tam ztlumí) a po prvním dotyku bez dalších triků. */
const renderWav = (notes: Note[]): string => {
  const total = Math.max(...notes.map((n) => n.at + n.len)) + 0.1;
  const n = Math.ceil(total * RATE);
  const data = new Float32Array(n);
  for (const note of notes) {
    const start = Math.floor(note.at * RATE);
    const len = Math.floor(note.len * RATE);
    const vol = note.vol ?? 0.5;
    for (let i = 0; i < len && start + i < n; i++) {
      const t = i / RATE;
      const ph = 2 * Math.PI * note.f * t;
      const wave = note.type === 'sine' ? Math.sin(ph) : (2 / Math.PI) * Math.asin(Math.sin(ph));
      const env = Math.min(1, t / 0.015) * Math.exp((-3.2 * i) / len);
      data[start + i]! += wave * env * vol;
    }
  }
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const str = (o: number, t: string) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, RATE, true); v.setUint32(28, RATE * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, data[i]!)) * 32767, true);
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
};

const cache = new Map<string, HTMLAudioElement>();

const SOUNDS: Record<string, Note[]> = {
  chime: [
    { f: 523.25, at: 0, len: 0.3 }, { f: 659.25, at: 0.14, len: 0.3 }, { f: 783.99, at: 0.28, len: 0.3 },
    { f: 1046.5, at: 0.42, len: 1.0, vol: 0.55 }, { f: 1318.5, at: 0.42, len: 1.0, vol: 0.25 },
  ],
  // krátké a jemné: jedno měkké „pop“ místo melodie
  correct: [{ f: 784, at: 0, len: 0.11, type: 'sine', vol: 0.28 }],
  wrong: [{ f: 196, at: 0, len: 0.14, type: 'sine', vol: 0.3 }],
};

let silentUrl: string | undefined;
const silent = (): string => (silentUrl ??= renderWav([{ f: 440, at: 0, len: 0.05, vol: 0 }]));

const urls = new Map<string, string>();
const element = (name: string): HTMLAudioElement | undefined => {
  try {
    let a = cache.get(name);
    if (!a) {
      const url = renderWav(SOUNDS[name]!);
      urls.set(name, url);
      a = new Audio(url);
      a.preload = 'auto';
      cache.set(name, a);
    }
    return a;
  } catch {
    return undefined;
  }
};

/** iOS dovolí přehrát zvuk jen elementu, který byl „odemčen“ přehráním při dotyku. Odemykáme tichým souborem
 *  (ztlumené přehrání nestačí) a potom do elementu vrátíme skutečný zvuk. */
export const unlockAudio = (): void => {
  const go = () => {
    webAudio();
    window.removeEventListener('pointerdown', go);
    window.removeEventListener('keydown', go);
    for (const name of Object.keys(SOUNDS)) {
      const a = element(name);
      if (!a) continue;
      const real = urls.get(name)!;
      const restore = () => { a.pause(); a.src = real; a.load(); };
      try {
        a.src = silent();
        void a.play().then(restore).catch(restore);
      } catch { restore(); }
    }
  };
  window.addEventListener('pointerdown', go);
  window.addEventListener('keydown', go);
};

let actx: AudioContext | undefined;
const webAudio = (): AudioContext | undefined => {
  try {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return undefined;
    actx ??= new C();
    if (actx.state === 'suspended') void actx.resume();
    return actx;
  } catch {
    return undefined;
  }
};

/** Záloha, když <audio> přehrání odmítne: stejné tóny přes WebAudio. */
const playWebAudio = (name: string): void => {
  const ctx = webAudio();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  for (const n of SOUNDS[name] ?? []) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = n.type ?? 'triangle';
    o.frequency.value = n.f;
    g.gain.setValueAtTime(0.0001, t0 + n.at);
    g.gain.linearRampToValueAtTime(n.vol ?? 0.5, t0 + n.at + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.at + n.len);
    o.connect(g).connect(ctx.destination);
    o.start(t0 + n.at);
    o.stop(t0 + n.at + n.len + 0.05);
  }
};

const lastPlayed = new Map<string, number>();

const play = (name: string, dedupeMs = 0): void => {
  if (!soundsOn()) return;
  const now = Date.now();
  if (dedupeMs && now - (lastPlayed.get(name) ?? 0) < dedupeMs) return;
  lastPlayed.set(name, now);
  const a = element(name);
  if (!a) { playWebAudio(name); return; }
  try {
    a.muted = false;
    a.volume = 1;
    a.currentTime = 0;
    void a.play().catch(() => playWebAudio(name));
  } catch {
    playWebAudio(name);
  }
};

/** Dokončení lekce / testu: stoupající fanfára. Víc volání těsně po sobě se sloučí (jedno ze dvou může být
 *  navázané přímo na klepnutí, které iOS vždy pustí). */
export const playChime = (): void => play('chime', 3000);

/** Správná odpověď: veselé „ding“. */
export const playCorrect = (): void => play('correct');

/** Špatná odpověď: jemné klesnutí. */
export const playWrong = (): void => play('wrong');
