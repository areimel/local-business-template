import { describe, it, expect } from 'vitest';
import { deriveThemeFromPrimary, normalizeHex, themeToCssVars } from '@/utils/theme-derive';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Guards parity with the CLI implementation: if bin/themes.mjs changes its
// math, src/utils/theme-derive.ts must change with it. bin/ only exists in the
// create-localbiz repo (not in scaffolded sites), so skip when it's absent.
const binThemes = fileURLToPath(new URL('../../../bin/themes.mjs', import.meta.url));

describe.skipIf(!existsSync(binThemes))('deriveThemeFromPrimary() parity with bin/themes.mjs', () => {
  it.each(['#ff1100', '#1a7f5a', '#abc', '336699', '#000000', '#ffffff'])('matches for %s', async (hex) => {
    const { customThemeFromPrimary } = await import(/* @vite-ignore */ binThemes);
    expect(deriveThemeFromPrimary(hex)).toEqual(customThemeFromPrimary(hex));
  });
});

describe('normalizeHex()', () => {
  it('expands 3-digit, lowercases, adds #', () => {
    expect(normalizeHex('#ABC')).toBe('#aabbcc');
    expect(normalizeHex('ABCDEF')).toBe('#abcdef');
    expect(normalizeHex('  #123456 ')).toBe('#123456');
  });
  it.each(['', '#12', '#12345', 'ggg', '#1234567'])('throws for %j', (bad) => {
    expect(() => normalizeHex(bad)).toThrow(/Invalid hex/);
  });
});

describe('themeToCssVars()', () => {
  it('maps all nine keys to --color-* vars', () => {
    const vars = themeToCssVars(deriveThemeFromPrimary('#ff1100'));
    expect(Object.keys(vars)).toEqual([
      '--color-primary', '--color-primary-dark', '--color-primary-light',
      '--color-secondary', '--color-secondary-dark', '--color-secondary-light',
      '--color-accent', '--color-accent-dark', '--color-accent-light',
    ]);
    expect(vars['--color-primary']).toBe('#ff1100');
    expect(vars['--color-accent-light']).toBe('#ffa940');
  });
});
