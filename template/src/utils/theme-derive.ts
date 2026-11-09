/**
 * Derive a full theme from one primary color. Port of customThemeFromPrimary
 * in bin/themes.mjs (keep in sync; tests/unit/theme-derive.test.ts guards parity).
 */
export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  accent: string;
  accentDark: string;
  accentLight: string;
}

const DEFAULT_SECONDARY = {
  secondary: '#02c0f3',
  secondaryDark: '#0299c2',
  secondaryLight: '#33d4ff',
};

const DEFAULT_ACCENT = {
  accent: '#ff8707',
  accentDark: '#cc6c05',
  accentLight: '#ffa940',
};

/** Normalize to #rrggbb. Accepts #abc, #aabbcc, abc, aabbcc. Throws if invalid. */
export function normalizeHex(hex: string): string {
  let h = String(hex).trim().toLowerCase();
  if (!h.startsWith('#')) h = '#' + h;
  if (!/^#[0-9a-f]{3}([0-9a-f]{3})?$/.test(h)) {
    throw new Error(`Invalid hex color: "${hex}". Use #rgb or #rrggbb format.`);
  }
  if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  return h;
}

function adjustBrightness(hex: string, factor: number): string {
  const h = normalizeHex(hex);
  const rgb = [h.slice(1, 3), h.slice(3, 5), h.slice(5, 7)].map((x) => parseInt(x, 16));
  const adjusted =
    factor < 1 ? rgb.map((c) => c * factor) : rgb.map((c) => c + (255 - c) * (factor - 1));
  const clamp = (x: number) => Math.round(Math.max(0, Math.min(255, x)));
  return '#' + adjusted.map((c) => clamp(c).toString(16).padStart(2, '0')).join('');
}

export function deriveThemeFromPrimary(hex: string): ThemeColors {
  const primary = normalizeHex(hex);
  return {
    primary,
    primaryDark: adjustBrightness(primary, 0.8),
    primaryLight: adjustBrightness(primary, 1.18),
    ...DEFAULT_SECONDARY,
    ...DEFAULT_ACCENT,
  };
}

/** Map theme colors to the CSS custom properties defined in global.css @theme. */
export function themeToCssVars(colors: ThemeColors): Record<string, string> {
  return {
    '--color-primary': colors.primary,
    '--color-primary-dark': colors.primaryDark,
    '--color-primary-light': colors.primaryLight,
    '--color-secondary': colors.secondary,
    '--color-secondary-dark': colors.secondaryDark,
    '--color-secondary-light': colors.secondaryLight,
    '--color-accent': colors.accent,
    '--color-accent-dark': colors.accentDark,
    '--color-accent-light': colors.accentLight,
  };
}
