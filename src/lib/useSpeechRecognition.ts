import { useEffect, useRef, useState } from 'preact/hooks';
import { stopSpeaking } from './audio';

// Web Speech API pro rozpoznávání řeči nemá v TypeScriptu stabilní typy, proto `any`.
type RecognitionCtor = new () => any;
const ctor = (): RecognitionCtor | undefined =>
  typeof window === 'undefined' ? undefined : ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition);

export const recognitionSupported = (): boolean => !!ctor();

const messages: Record<string, string> = {
  'not-allowed': 'Prohlížeč nemá povolený mikrofon. Povol ho v nastavení stránky.',
  'service-not-allowed': 'Rozpoznávání řeči není v tomto prohlížeči povolené.',
  'no-speech': 'Nic jsem neslyšel. Zkus to znovu a mluv blíž k mikrofonu.',
  'audio-capture': 'Mikrofon nebyl nalezen.',
  network: 'Rozpoznávání řeči potřebuje připojení k internetu.',
  'language-not-supported': 'Tento prohlížeč neumí rozpoznávat evropskou portugalštinu (pt-PT).',
};

export const useSpeechRecognition = () => {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<any>(null);

  const start = (onResult: (alternatives: string[]) => void): void => {
    const Ctor = ctor();
    if (!Ctor) return;
    stopSpeaking(); // ať mikrofon nenahrává přehrávaný vzor
    setError(null);
    const r = new Ctor();
    r.lang = 'pt-PT';
    r.interimResults = false;
    r.maxAlternatives = 3;
    r.onresult = (e: any) => {
      const first = e.results?.[0];
      if (!first) return;
      const alts: string[] = [];
      for (let i = 0; i < first.length; i++) alts.push(first[i].transcript);
      onResult(alts);
    };
    r.onerror = (e: any) => setError(messages[e.error] ?? `Rozpoznávání se nezdařilo (${e.error}).`);
    r.onend = () => setListening(false);
    rec.current = r;
    try {
      r.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const stop = (): void => rec.current?.stop?.();
  useEffect(() => () => rec.current?.abort?.(), []);

  return { supported: recognitionSupported(), listening, error, start, stop };
};
