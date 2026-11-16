/** Bezpečný wrapper nad localStorage (v soukromém režimu může házet výjimky). */
export const loadJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : ({ ...fallback, ...JSON.parse(raw) } as T);
  } catch {
    return fallback;
  }
};

export const saveJson = (key: string, value: unknown): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* úložiště nedostupné – nastavení prostě nepřežije reload */
  }
};
