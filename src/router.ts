import { useEffect, useState } from 'preact/hooks';

/** Jednoduchý hash router (#/unit/a1-u1) – funguje na statickém hostingu bez nastavení serveru. */
const currentPath = (): string => {
  const hash = window.location.hash.replace(/^#/, '');
  return hash === '' ? '/' : hash;
};

export const usePath = (): string => {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const onChange = () => {
      setPath(currentPath());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
};

export const href = (path: string): string => `#${path}`;

export interface Match {
  name: 'home' | 'unit' | 'lesson' | 'cards' | 'study' | 'free' | 'stats' | 'notFound';
  params: Record<string, string>;
}

export const matchRoute = (path: string): Match => {
  if (path === '/') return { name: 'home', params: {} };
  const unit = /^\/unit\/([\w-]+)$/.exec(path);
  if (unit) return { name: 'unit', params: { id: unit[1]! } };
  const lesson = /^\/lesson\/([\w-]+)$/.exec(path);
  if (lesson) return { name: 'lesson', params: { id: lesson[1]! } };
  if (path === '/cards') return { name: 'cards', params: {} };
  const study = /^\/cards\/([\w-]+)$/.exec(path);
  if (study) return { name: 'study', params: { deck: study[1]! } };
  const free = /^\/free\/([\w-]+)$/.exec(path);
  if (free) return { name: 'free', params: { deck: free[1]! } };
  if (path === '/stats') return { name: 'stats', params: {} };
  return { name: 'notFound', params: {} };
};
