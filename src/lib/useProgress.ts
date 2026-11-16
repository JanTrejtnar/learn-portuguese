import { useEffect, useState } from 'preact/hooks';
import { loadProgress, type Progress } from './db';

/** Načte pokrok z IndexedDB (asynchronně). `null` = ještě se načítá. */
export const useProgress = (): Progress | null => {
  const [progress, setProgress] = useState<Progress | null>(null);
  useEffect(() => {
    let alive = true;
    loadProgress().then((p) => alive && setProgress(p));
    return () => {
      alive = false;
    };
  }, []);
  return progress;
};
