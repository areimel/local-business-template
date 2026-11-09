import { loadYaml } from './data';
import type { ThemeColors } from './theme-derive';

// Build-time only: reads src/data/demo-tools.yaml via the shared loadYaml()
// loader and caches the parsed result once per build (see features.ts for
// the same pattern applied to feature flags).

export interface DemoToolsLink {
  label: string;
  url: string;
  description?: string;
}

export interface DemoToolsSection {
  title: string;
  links: DemoToolsLink[];
}

export interface DemoToolsConfig {
  button: { label: string; ariaLabel: string };
  panelTitle: string;
  sections: DemoToolsSection[];
}

let demoToolsCache: DemoToolsConfig | null = null;

export function getDemoTools(): DemoToolsConfig {
  if (!demoToolsCache) {
    demoToolsCache = loadYaml<DemoToolsConfig>('demo-tools.yaml');
  }
  return demoToolsCache;
}

export interface DemoThemePreset {
  slug: string;
  label: string;
  hint?: string;
  colors: ThemeColors;
}

let demoThemesCache: DemoThemePreset[] | null = null;

/** Presets for the Demo Mode Tools theme picker (src/data/demo-themes.yaml). */
export function getDemoThemes(): DemoThemePreset[] {
  if (!demoThemesCache) {
    demoThemesCache = loadYaml<DemoThemePreset[]>('demo-themes.yaml');
  }
  return demoThemesCache;
}
