/**
 * bin/themes.mjs
 *
 * Color theme presets for scaffolder CLI.
 * Each theme provides 9 color values: primary, secondary, accent + dark/light variants.
 *
 * Exports:
 *   - themes: Map of theme slugs to { label, hint, colors }
 *   - themeChoices: Pre-mapped for CLI prompt (value, label, hint)
 *   - customThemeFromPrimary(hex): Derive a complete theme from one primary color
 */

// ============================================================================
// Helpers: Hex/RGB conversion and brightness adjustment
// ============================================================================

/**
 * Normalize hex color to #rrggbb format.
 * Accepts #abc, #aabbcc, or abc/aabbcc (without #).
 * @throws {Error} If input is not a valid hex color
 */
function normalizeHex(hex) {
  let h = hex.toString().trim().toLowerCase();
  if (!h.startsWith('#')) h = '#' + h;

  if (!/^#[0-9a-f]{3}([0-9a-f]{3})?$/.test(h)) {
    throw new Error(`Invalid hex color: "${hex}". Use #rgb or #rrggbb format.`);
  }

  // Expand 3-digit to 6-digit
  if (h.length === 4) {
    h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }

  return h;
}

/**
 * Convert hex to [r, g, b] array (0–255 each)
 */
function hexToRgb(hex) {
  const h = normalizeHex(hex);
  const r = parseInt(h[1] + h[2], 16);
  const g = parseInt(h[3] + h[4], 16);
  const b = parseInt(h[5] + h[6], 16);
  return [r, g, b];
}

/**
 * Convert [r, g, b] array to hex string #rrggbb
 */
function rgbToHex([r, g, b]) {
  const clamp = (x) => Math.round(Math.max(0, Math.min(255, x)));
  return '#' + [clamp(r), clamp(g), clamp(b)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Adjust color brightness
 * @param {string} hex - Color to adjust
 * @param {number} factor - < 1 darkens (toward black), > 1 lightens (toward white)
 */
function adjustBrightness(hex, factor) {
  const [r, g, b] = hexToRgb(hex);
  let adjusted;

  if (factor < 1) {
    // Darken: scale toward black
    adjusted = [r * factor, g * factor, b * factor];
  } else {
    // Lighten: scale toward white
    const pct = factor - 1;
    adjusted = [
      r + (255 - r) * pct,
      g + (255 - g) * pct,
      b + (255 - b) * pct,
    ];
  }

  return rgbToHex(adjusted);
}

// ============================================================================
// Default secondary and accent (reused in customThemeFromPrimary)
// ============================================================================

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

// ============================================================================
// Theme Presets
// ============================================================================

export const themes = {
  'red-cyan': {
    label: 'Red / Cyan (default)',
    hint: 'Bold red and cyan for high contrast',
    colors: {
      primary: '#ff1100',
      primaryDark: '#cc0e00',
      primaryLight: '#ff4433',
      ...DEFAULT_SECONDARY,
      ...DEFAULT_ACCENT,
    },
  },
  'cool-blue': {
    label: 'Cool Blue',
    hint: 'Trust and professionalism in a cool palette',
    colors: {
      primary: '#0066cc',
      primaryDark: '#0052a3',
      primaryLight: '#2e82d5',
      secondary: '#00aaff',
      secondaryDark: '#0088cc',
      secondaryLight: '#33bbff',
      accent: '#ff9900',
      accentDark: '#cc7a00',
      accentLight: '#ffb333',
    },
  },
  'forest-green': {
    label: 'Forest Green',
    hint: 'Eco-friendly natural tones',
    colors: {
      primary: '#2d6a4f',
      primaryDark: '#1b4332',
      primaryLight: '#40916c',
      secondary: '#52796f',
      secondaryDark: '#354f45',
      secondaryLight: '#6fa899',
      accent: '#d4a574',
      accentDark: '#aa8459',
      accentLight: '#e6c8a0',
    },
  },
  'slate-navy': {
    label: 'Slate & Navy',
    hint: 'Modern corporate with depth',
    colors: {
      primary: '#1a2845',
      primaryDark: '#0f1829',
      primaryLight: '#2d4570',
      secondary: '#546b7c',
      secondaryDark: '#3d4d5e',
      secondaryLight: '#748a99',
      accent: '#ff6b35',
      accentDark: '#cc5629',
      accentLight: '#ff8855',
    },
  },
  'warm-orange': {
    label: 'Warm Orange',
    hint: 'Energetic and approachable',
    colors: {
      primary: '#f77f00',
      primaryDark: '#cc6600',
      primaryLight: '#fcaa2f',
      secondary: '#004e89',
      secondaryDark: '#002c52',
      secondaryLight: '#2d7aa6',
      accent: '#ffd60a',
      accentDark: '#cc9d08',
      accentLight: '#ffe338',
    },
  },
};

// ============================================================================
// CLI Choices (pre-mapped for prompt)
// ============================================================================

export const themeChoices = Object.entries(themes).map(([value, t]) => ({
  value,
  label: t.label,
  hint: t.hint,
}));

// ============================================================================
// Custom Theme Generator
// ============================================================================

/**
 * Generate a complete theme from a single primary hex color.
 * Derives primaryDark (~20% darker) and primaryLight (~18% lighter) from primary.
 * Reuses default secondary and accent for consistency and predictability.
 *
 * @param {string} primaryHex - Color in #rgb, #rrggbb, rgb, or rrggbb format
 * @returns {Object} Complete 9-key colors object { primary, primaryDark, primaryLight, ... }
 * @throws {Error} If hex color is invalid
 */
export function customThemeFromPrimary(primaryHex) {
  // Validate and normalize
  const primary = normalizeHex(primaryHex);

  // Derive dark/light variants: 20% darker, 18% lighter
  const primaryDark = adjustBrightness(primary, 0.8);
  const primaryLight = adjustBrightness(primary, 1.18);

  return {
    primary,
    primaryDark,
    primaryLight,
    ...DEFAULT_SECONDARY,
    ...DEFAULT_ACCENT,
  };
}
