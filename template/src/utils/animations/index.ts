/**
 * animations/index.ts
 *
 * Core anime.js animation module for the Astro site.
 *
 * Usage:
 *   Import `initAnimations` in a client-side <script> tag and call it on
 *   DOMContentLoaded or after the Astro page transition settles.
 *
 * Rules enforced here:
 *   - All animations are gated behind `prefers-reduced-motion: no-preference`
 *     via a guard clause at the top of initAnimations(). Users who opt into
 *     reduced motion never have JS set a hidden state, so they see fully
 *     visible static content.
 *   - Never set opacity-0 in CSS on animated elements — `utils.set()` inside
 *     each preset (presets.ts) owns the initial invisible state so elements
 *     stay visible if this module never runs.
 *   - `refreshObservers()` (scroll.ts) is called after `document.fonts.ready`
 *     so that scroll-trigger positions are recalculated after web fonts
 *     shift layout.
 *
 * Example usage in an Astro component:
 *   <script>
 *     import { initAnimations } from '@/utils/animations';
 *     initAnimations();
 *   </script>
 */
import { ANIMATION_DEFAULTS, presets, applyContainerPreset, type PresetOptions } from './presets.js';
import { refreshObservers } from './scroll.js';

export { ANIMATION_DEFAULTS };

/** parseInt with a NaN fallback + console.warn, matching the old module's counter guard style. */
function parseNumberAttr(raw: string, fallback: number, label: string): number {
  const n = parseInt(raw, 10);
  if (isNaN(n)) {
    console.warn(`[animations] Invalid ${label} value, using default:`, raw);
    return fallback;
  }
  return n;
}

function defaultStaggerFor(presetName: string): number {
  if (presetName === 'split-chars') return ANIMATION_DEFAULTS.staggerChars;
  if (presetName === 'split-words' || presetName === 'split-lines') return ANIMATION_DEFAULTS.staggerWords;
  return ANIMATION_DEFAULTS.staggerChildren;
}

/** Builds a PresetOptions from `data-*` modifier attributes, falling back to defaults. */
function resolveOptions(el: HTMLElement, presetName: string): PresetOptions {
  const ds = el.dataset;

  return {
    on: ds.on === 'load' ? 'load' : 'scroll',
    delay: ds.delay ? parseNumberAttr(ds.delay, 0, 'data-delay') : 0,
    duration: ds.duration
      ? parseNumberAttr(ds.duration, ANIMATION_DEFAULTS.duration, 'data-duration')
      : ANIMATION_DEFAULTS.duration,
    distance: ds.distance
      ? parseNumberAttr(ds.distance, ANIMATION_DEFAULTS.distance, 'data-distance')
      : ANIMATION_DEFAULTS.distance,
    stagger: ds.stagger
      ? parseNumberAttr(ds.stagger, defaultStaggerFor(presetName), 'data-stagger')
      : defaultStaggerFor(presetName),
    ease: ds.ease ?? ANIMATION_DEFAULTS.ease,
    repeat: ds.repeat === 'true',
  };
}

function processElement(el: HTMLElement): void {
  const childrenPreset = el.dataset.animateChildren;
  if (childrenPreset) {
    applyContainerPreset(el, childrenPreset, resolveOptions(el, childrenPreset));
    return;
  }

  const presetName = el.dataset.animate;
  if (!presetName) return;

  const preset = presets[presetName];

  if (!preset) {
    console.warn('[animations] Unknown data-animate preset:', presetName);
    return;
  }

  preset(el, resolveOptions(el, presetName));
}

// ===== Public Entry Point =====

/**
 * initAnimations()
 *
 * Call this once from a client-side <script> tag in your Astro layout.
 * Bails out immediately when the user has requested reduced motion, before
 * any preset touches the DOM — elements render in their natural, fully
 * visible markup state with no motion at all.
 */
export function initAnimations(): void {
  if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;

  document.querySelectorAll<HTMLElement>('[data-animate], [data-animate-children]').forEach(processElement);

  // Recalculate scroll-observer positions after web fonts finish loading.
  // Fonts can cause layout shifts that offset trigger start/end values.
  document.fonts.ready.then(() => {
    refreshObservers();
  });
}
