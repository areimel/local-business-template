import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PREFIX, getItem, setItem, removeItem } from '@/utils/demo-tools-storage';

const g = globalThis as Record<string, unknown>;

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k: string) => (data.has(k) ? data.get(k)! : null),
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

describe('demo-tools-storage', () => {
  let original: unknown;
  beforeEach(() => { original = g.localStorage; });
  afterEach(() => {
    if (original === undefined) delete g.localStorage;
    else g.localStorage = original;
  });

  it('round-trips JSON values under the prefix', () => {
    const s = memoryStorage();
    g.localStorage = s;
    setItem('theme', { id: 'x', n: [1, 2] });
    expect(PREFIX).toBe('demo-tools:');
    expect(s.data.has('demo-tools:theme')).toBe(true);
    expect(getItem('theme')).toEqual({ id: 'x', n: [1, 2] });
  });

  it('returns null for missing keys and invalid JSON', () => {
    const s = memoryStorage();
    g.localStorage = s;
    expect(getItem('nope')).toBeNull();
    s.data.set('demo-tools:bad', '{not json');
    expect(getItem('bad')).toBeNull();
  });

  it('removes items', () => {
    g.localStorage = memoryStorage();
    setItem('a', 1);
    removeItem('a');
    expect(getItem('a')).toBeNull();
  });

  it('never throws when storage throws or is absent', () => {
    const boom = () => { throw new Error('blocked'); };
    g.localStorage = { getItem: boom, setItem: boom, removeItem: boom };
    expect(() => setItem('a', 1)).not.toThrow();
    expect(() => removeItem('a')).not.toThrow();
    expect(getItem('a')).toBeNull();
    delete g.localStorage;
    expect(() => setItem('a', 1)).not.toThrow();
    expect(getItem('a')).toBeNull();
  });
});
