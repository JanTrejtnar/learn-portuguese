import { useEffect, useState } from 'preact/hooks';

export interface Toast {
  id: number;
  emoji: string;
  title: string;
  text?: string;
}

type Listener = () => void;
const toastListeners = new Set<(t: Toast) => void>();
const progressListeners = new Set<Listener>();
let nextId = 1;

/** Zobrazí krátké oznámení (odznak, splněný cíl…). */
export const toast = (t: Omit<Toast, 'id'>): void => {
  const full = { ...t, id: nextId++ };
  toastListeners.forEach((l) => l(full));
};

/** Dej vědět, že se změnil pokrok (kvůli vyhodnocení odznaků). */
export const notifyProgress = (): void => progressListeners.forEach((l) => l());

export const onProgressChanged = (l: Listener): (() => void) => {
  progressListeners.add(l);
  return () => progressListeners.delete(l);
};

export const useToasts = (): [Toast[], (id: number) => void] => {
  const [list, setList] = useState<Toast[]>([]);
  const dismiss = (id: number) => setList((l) => l.filter((t) => t.id !== id));
  useEffect(() => {
    const listener = (t: Toast) => {
      setList((l) => [...l.slice(-2), t]);
      setTimeout(() => setList((l) => l.filter((x) => x.id !== t.id)), 3200);
    };
    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  }, []);
  return [list, dismiss];
};
