/**
 * presets.ts
 *
 * One function per `data-animate` value. Every preset follows the same
 * shape: `utils.set(el, hiddenState)` to establish the JS-owned starting
 * point, then `animate(el, { ...visibleState, ..., autoplay })` where
 * `autoplay` is either `true` (play on load) or a ScrollObserver from
 * scroll.ts (play once scrolled into view). Never set the hidden state in
 * CSS — if this module fails to load, elements must stay visible.
 */
import { animate, stagger, splitText, utils } from 'animejs';
import { observeOnce } from './scroll.js';

/** Shared defaults for every animation, in milliseconds (anime.js v4 default timeUnit). */
export const ANIMATION_DEFAULTS = {
  duration: 700,
  ease: 'outQuart',
  /** ScrollObserver threshold for standard reveals (anime order — see scroll.ts). */
  enter: '85% top',
  distance: 40,
  staggerChildren: 80,
  staggerChars: 40,
  staggerWords: 80,
} as const;

export interface PresetOptions {
  on: 'scroll' | 'load';
  delay: number;
  duration: number;
  distance: number;
  stagger: number;
  ease: string;
  repeat: boolean;
}

/** Resolves the `autoplay` param: immediate on load, or a once-only scroll observer. */
function resolveAutoplay(el: HTMLElement, opts: PresetOptions) {
  return opts.on === 'load'
    ? true
    : observeOnce(el, { enter: ANIMATION_DEFAULTS.enter, repeat: opts.repeat });
}

type VisualState = { hidden: Record<string, number | string>; visible: Record<string, number | string> };
type StateFn = (opts: PresetOptions) => VisualState;

/** Hidden/visible pairs shared between single-element presets and the `data-animate-children` container preset. */
const STATES: Record<string, StateFn> = {
  fade: () => ({ hidden: { opacity: 0 }, visible: { opacity: 1 } }),
  'fade-up': (o) => ({ hidden: { opacity: 0, translateY: o.distance }, visible: { opacity: 1, translateY: 0 } }),
  'fade-down': (o) => ({ hidden: { opacity: 0, translateY: -o.distance }, visible: { opacity: 1, translateY: 0 } }),
  'fade-left': (o) => ({ hidden: { opacity: 0, translateX: o.distance }, visible: { opacity: 1, translateX: 0 } }),
  'fade-right': (o) => ({ hidden: { opacity: 0, translateX: -o.distance }, visible: { opacity: 1, translateX: 0 } }),
  'zoom-in': () => ({ hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } }),
  'blur-in': () => ({ hidden: { opacity: 0, filter: 'blur(8px)' }, visible: { opacity: 1, filter: 'blur(0px)' } }),
};

/** Shared body for every single-element preset backed by a STATES entry. */
function reveal(el: HTMLElement, opts: PresetOptions, stateFn: StateFn): void {
  const { hidden, visible } = stateFn(opts);
  utils.set(el, hidden);
  animate(el, {
    ...visible,
    duration: opts.duration,
    ease: opts.ease,
    delay: opts.delay,
    autoplay: resolveAutoplay(el, opts),
  });
}

/** split-chars / split-words / split-lines: hidden state goes on the split units, not the container. */
function splitReveal(el: HTMLElement, opts: PresetOptions, unit: 'chars' | 'words' | 'lines'): void {
  const splitter = splitText(el, { accessible: true });
  const targets = splitter[unit];
  if (!targets?.length) return;

  utils.set(targets, { opacity: 0, translateY: 20 });
  animate(targets, {
    opacity: 1,
    translateY: 0,
    duration: opts.duration,
    ease: opts.ease,
    delay: stagger(opts.stagger, { start: opts.delay }),
    autoplay: resolveAutoplay(el, opts),
  });
}

/**
 * Animated number counter for `data-animate="counter"` elements. Reads the
 * target from `data-count-to`, warning (and bailing) exactly like the old
 * GSAP module did for a missing or non-numeric value.
 */
function counter(el: HTMLElement, opts: PresetOptions): void {
  const rawTarget = el.dataset.countTo;

  if (!rawTarget) {
    console.warn('[animations] Counter element is missing data-count-to attribute:', el);
    return;
  }

  const target = parseInt(rawTarget, 10);

  if (isNaN(target)) {
    console.warn('[animations] data-count-to value is not a valid integer:', rawTarget);
    return;
  }

  const proxy = { v: 0 };

  animate(proxy, {
    v: target,
    duration: 2000,
    ease: 'outCubic',
    // utils.round is overloaded: called with one arg (decimalLength) it
    // returns a chained (value) => number modifier — utils.round(0) rounds
    // the tweened value to a whole number on every update.
    modifier: utils.round(0),
    autoplay: opts.on === 'load' ? true : observeOnce(el, { enter: '80% top', repeat: opts.repeat }),
    onUpdate: () => {
      el.innerText = String(proxy.v);
    },
  });
}

/** Preset map dispatched by `data-animate="<name>"`. */
export const presets: Record<string, (el: HTMLElement, opts: PresetOptions) => void> = {
  fade: (el, opts) => reveal(el, opts, STATES.fade),
  'fade-up': (el, opts) => reveal(el, opts, STATES['fade-up']),
  'fade-down': (el, opts) => reveal(el, opts, STATES['fade-down']),
  'fade-left': (el, opts) => reveal(el, opts, STATES['fade-left']),
  'fade-right': (el, opts) => reveal(el, opts, STATES['fade-right']),
  'zoom-in': (el, opts) => reveal(el, opts, STATES['zoom-in']),
  'blur-in': (el, opts) => reveal(el, opts, STATES['blur-in']),
  'split-chars': (el, opts) => splitReveal(el, opts, 'chars'),
  'split-words': (el, opts) => splitReveal(el, opts, 'words'),
  'split-lines': (el, opts) => splitReveal(el, opts, 'lines'),
  counter,
};

/**
 * Container preset for `data-animate-children="<preset>"`. Applies the named
 * preset's hidden state to the element's direct children and animates them
 * together as one staggered group under a single scroll observer on the
 * container (rather than one observer per child).
 */
export function applyContainerPreset(el: HTMLElement, presetName: string, opts: PresetOptions): void {
  const stateFn = STATES[presetName];

  if (!stateFn) {
    console.warn('[animations] Unknown data-animate-children preset:', presetName);
    return;
  }

  const children = Array.from(el.children) as HTMLElement[];
  if (!children.length) return;

  const { hidden, visible } = stateFn(opts);
  utils.set(children, hidden);
  animate(children, {
    ...visible,
    duration: opts.duration,
    ease: opts.ease,
    delay: stagger(opts.stagger, { start: opts.delay }),
    autoplay: resolveAutoplay(el, opts),
  });
}
