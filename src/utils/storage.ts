export const getLocalStorageItem = <T>(key: string, defaultValue: T | null = null): T | string | null => {
  try {
    const rawValue = localStorage.getItem(key);
    if (rawValue === null) return defaultValue;
    return JSON.parse(rawValue) as T;
  } catch {
    return defaultValue;
  }
};

export const setLocalStorageItem = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // no-op
  }
};
