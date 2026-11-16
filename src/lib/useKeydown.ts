import { useEffect, useRef } from 'preact/hooks';

/**
 * Globální obsluha kláves, která vždy vidí aktuální stav komponenty.
 * Posluchač se registruje jen jednou a volá nejnovější `handler` (bez zastaralých closure
 * mezi překreslením a spuštěním efektů).
 */
export const useKeydown = (handler: (e: KeyboardEvent) => void): void => {
  const latest = useRef(handler);
  latest.current = handler;
  useEffect(() => {
    const listener = (e: KeyboardEvent) => latest.current(e);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
};
