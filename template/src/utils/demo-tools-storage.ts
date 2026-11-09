/**
 * Browser-side persistence for Demo Mode Tools. Every helper swallows errors
 * (private mode, blocked storage, bad JSON) so tools never break the page.
 */
export const PREFIX = 'demo-tools:';

function store(): Storage | null {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

export function getItem<T>(key: string): T | null {
  try {
    const raw = store()?.getItem(PREFIX + key);
    return raw == null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

export function setItem(key: string, value: unknown): void {
  try {
    store()?.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function removeItem(key: string): void {
  try {
    store()?.removeItem(PREFIX + key);
  } catch {
    /* storage unavailable */
  }
}
