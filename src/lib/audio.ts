import { useEffect, useState } from 'preact/hooks';

/**
 * Audio přes Web Speech API – striktně evropská portugalština.
 * Nikdy nepřepínáme na pt-BR: pokud zařízení pt-PT hlas nemá, uživatele upozorníme.
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

/** Z kartičkového textu (např. „Obrigado / Obrigada“, „Chamo-me…“) udělá text vhodný k přečtení. */
export const toSpeakable = (pt: string): string =>
  pt
    .replace(/\s*\/\s*/g, '. ')
    .replace(/…/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const stopSpeaking = (): void => {
  if (supported()) window.speechSynthesis.cancel();
};

/** Přehraje text. Vrací false, pokud se přehrávat nemůže (chybí pt-PT hlas / podpora). */
export const speak = (text: string, opts: { slow?: boolean } = {}): boolean => {
  const status = computeStatus();
  if (status === 'unsupported' || status === 'no-pt-pt') return false;

  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(toSpeakable(text));
  utterance.lang = 'pt-PT';
  const voice = findPtPtVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = opts.slow ? 0.65 : 0.95;
  synth.speak(utterance);
  return true;
};
