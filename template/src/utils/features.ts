import { loadYaml, getNavigation, type Navigation } from './data';

export interface FeatureFlags {
  blog: boolean;
  careers: boolean;
  offers: boolean;
  coupons: boolean;
  serviceAreas: boolean;
  reviews: boolean;
  faqs: boolean;
  search: boolean;
  translate: boolean;
  exitIntentModal: boolean;
  stickyPhoneBar: boolean;
  floatingContactButton: boolean;
  analytics: boolean;
  emergencyCta: boolean;
  devTools: boolean;
  devPages: boolean;
  demoPages: boolean;
}

export type FeatureName = keyof FeatureFlags;

let featuresCache: FeatureFlags | null = null;

export function getFeatures(): FeatureFlags {
  if (!featuresCache) {
    featuresCache = loadYaml<FeatureFlags>('features.yaml');
  }
  return featuresCache;
}

/** Missing or non-boolean values read as disabled (fail-closed). */
export function isFeatureEnabled(name: FeatureName): boolean {
  return getFeatures()[name] === true;
}

/**
 * Gate a getStaticPaths result on a feature flag. Disabled → [] → Astro
 * builds zero pages for the route: no HTML, no sitemap entry, URL 404s.
 */
export async function gatedPaths<T>(name: FeatureName, buildPaths: () => T[] | Promise<T[]>): Promise<T[]> {
  if (!isFeatureEnabled(name)) return [];
  return buildPaths();
}

/**
 * Navigation with flagged-off items removed. Nav consumers (DesktopNavV2,
 * MobileNav, Footer) use this instead of getNavigation() so link visibility
 * follows features.yaml with no per-component logic.
 */
export function getVisibleNavigation(): Navigation {
  const { mainNav, utilityNav } = getNavigation();
  return {
    utilityNav,
    mainNav: mainNav.filter((item) => !item.flag || isFeatureEnabled(item.flag)),
  };
}
