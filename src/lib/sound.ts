/** Krátké zvuky bez audio souborů (WebAudio). Selhání je tiché, zvuky jdou vypnout v Nastavení. */
import { loadJson } from './storage';

let ctx: AudioContext | undefined;

const soundsOn = (): boolean => loadJson<{ sounds?: boolean }>('ap:study-settings', {}).sounds !== false;

const getCtx = (): AudioContext | undefined => {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return undefined;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return undefined;
  }
};

/** Prohlížeče pustí zvuk až po prvním dotyku; tohle kontext „odemkne“ hned při první interakci. */
export const unlockAudio = (): void => {
  const go = () => {
    getCtx();
    window.removeEventListener('pointerdown', go);
    window.removeEventListener('keydown', go);
  };
  window.addEventListener('pointerdown', go);
  window.addEventListener('keydown', go);
};

interface Note { f: number; at: number; len: number; vol?: number; type?: OscillatorType }

const play = (notes: Note[]): void => {
  if (!soundsOn()) return;
  const c = getCtx();
  if (!c) return;
  try {
    const t0 = c.currentTime + 0.03;
    for (const n of notes) {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = n.type ?? 'triangle';
      osc.frequency.value = n.f;
      const start = t0 + n.at;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(n.vol ?? 0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + n.len);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(start + n.len + 0.05);
    }
  } catch {
    /* zvuk je bonus */
  }
};

/** Dokončení lekce / testu: stoupající fanfára. */
export const playChime = (): void =>
  play([
    { f: 523.25, at: 0, len: 0.25 }, { f: 659.25, at: 0.12, len: 0.25 }, { f: 783.99, at: 0.24, len: 0.25 },
    { f: 1046.5, at: 0.36, len: 0.9, vol: 0.22 }, { f: 1318.5, at: 0.36, len: 0.9, vol: 0.1 },
  ]);

/** Správná odpověď: veselé „ding“. */
export const playCorrect = (): void => play([{ f: 880, at: 0, len: 0.14 }, { f: 1318.5, at: 0.09, len: 0.28 }]);

/** Špatná odpověď: jemné, nepříjemně neznějící klesnutí. */
export const playWrong = (): void => play([{ f: 330, at: 0, len: 0.16, type: 'sine', vol: 0.16 }, { f: 247, at: 0.12, len: 0.3, type: 'sine', vol: 0.16 }]);
