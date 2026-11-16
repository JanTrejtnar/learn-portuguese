import { useEffect, useState } from 'preact/hooks';

/**
 * Audio přes Web Speech API – striktně evropská portugalština.
 * Nikdy nepřepínáme na jiný hlas než pt-PT: pokud zařízení pt-PT hlas nemá, uživatele upozorníme.
 */
export type VoiceStatus =
  | 'unsupported' // prohlížeč nemá speechSynthesis
  | 'ready' // nalezen pt-PT hlas
  | 'unknown' // seznam hlasů je prázdný (některé Androidy) – zkusíme přehrát podle jazyka
  | 'no-pt-pt'; // hlasy existují, ale pt-PT mezi nimi není

const supported = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window;

const normLang = (lang: string): string => lang.replace('_', '-').toLowerCase();

export const findPtPtVoice = (): SpeechSynthesisVoice | undefined => {
  if (!supported()) return undefined;
  const voices = window.speechSynthesis.getVoices().filter((v) => normLang(v.lang) === 'pt-pt');
  // Preferuj lokální hlas (funguje offline) a ten s nejlepším jménem (Joana, Helia…)
  return voices.find((v) => v.localService) ?? voices[0];
};

const computeStatus = (): VoiceStatus => {
  if (!supported()) return 'unsupported';
  const all = window.speechSynthesis.getVoices();
  if (all.length === 0) return 'unknown';
  return findPtPtVoice() ? 'ready' : 'no-pt-pt';
};

/** Jednorázový dotaz na stav hlasu (mimo komponenty). */
export const getVoiceStatus = computeStatus;

/** Reaktivní stav hlasu – hlasy se v prohlížečích načítají asynchronně. */
export const useVoiceStatus = (): VoiceStatus => {
  const [status, setStatus] = useState<VoiceStatus>(computeStatus);
  useEffect(() => {
    if (!supported()) return;
    const update = () => setStatus(computeStatus());
    update();
    window.speechSynthesis.addEventListener('voiceschanged', update);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update);
  }, []);
  return status;
};

/** Z kartičkového textu rozdělí varianty („Obrigado / Obrigada“) na samostatné úseky; mezi nimi se udělá pauza. */
export const speechParts = (pt: string): string[] =>
  pt
    .replace(/^(o|a|os|as)\/(o|a|os|as) /i, '$1 ') // „o/a estudante“ → „o estudante“
    .split(/\s*\/\s*/)
    .map((p) => p.replace(/…/g, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

/** Zachování staršího názvu: text vhodný k přečtení v jednom kuse. */
export const toSpeakable = (pt: string): string => speechParts(pt).join('. ');

/** Pauza mezi variantami slova (ms). */
const PAUSE_MS = 550;
let playId = 0;
let pauseTimer: number | undefined;

export const stopSpeaking = (): void => {
  playId++;
  clearTimeout(pauseTimer);
  if (supported()) window.speechSynthesis.cancel();
};

/** Přehraje text. Vrací false, pokud se přehrávat nemůže (chybí pt-PT hlas / podpora). */
export const speak = (text: string, opts: { slow?: boolean } = {}): boolean => {
  const status = computeStatus();
  if (status === 'unsupported' || status === 'no-pt-pt') return false;

  const synth = window.speechSynthesis;
  const busy = synth.speaking || synth.pending;
  stopSpeaking();
  const id = playId;
  const parts = speechParts(text);
  const playPart = (i: number) => {
    if (id !== playId || i >= parts.length) return;
    const voice = findPtPtVoice();
    const u = new SpeechSynthesisUtterance(parts[i]);
    u.lang = 'pt-PT';
    if (voice) u.voice = voice;
    // pomalé přehrání je opravdu znatelně pomalejší
    u.rate = opts.slow ? 0.35 : 1;
    if (i + 1 < parts.length) {
      const after = () => {
        pauseTimer = window.setTimeout(() => playPart(i + 1), PAUSE_MS);
      };
      u.onend = after;
      u.onerror = after;
    }
    synth.speak(u);
  };
  // Hned po cancel() nebo při úplně prvním použití by prohlížeč první větu občas spolkl:
  // počkáme na načtení hlasů (nejvýš 600 ms) a kratičkou chvíli po zrušení předchozího čtení.
  const start = () => {
    if (id !== playId) return;
    if (busy) pauseTimer = window.setTimeout(() => playPart(0), 60);
    else playPart(0);
  };
  if (synth.getVoices().length > 0) start();
  else {
    let started = false;
    const go = () => { if (started) return; started = true; synth.removeEventListener('voiceschanged', go); start(); };
    synth.addEventListener('voiceschanged', go);
    window.setTimeout(go, 600);
  }
  return true;
};
