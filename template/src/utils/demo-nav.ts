import { loadYaml } from './data';

// Build-time only: reads src/data/demo-nav.yaml via the shared loadYaml()
// loader and caches the parsed result once per build (see features.ts for
// the same pattern applied to feature flags).

export interface DemoNavLink {
  label: string;
  url: string;
  description?: string;
}

export interface DemoNavSection {
  title: string;
  links: DemoNavLink[];
}

export interface DemoNavConfig {
  button: { label: string; ariaLabel: string };
  panelTitle: string;
  sections: DemoNavSection[];
}

let demoNavCache: DemoNavConfig | null = null;

export function getDemoNav(): DemoNavConfig {
  if (!demoNavCache) {
    demoNavCache = loadYaml<DemoNavConfig>('demo-nav.yaml');
  }
  return demoNavCache;
}
