/**
 * scroll.ts
 *
 * Scroll-triggered reveal helper built on anime.js's `onScroll()` /
 * `ScrollObserver`.
 *
 * IMPORTANT — threshold order is reversed vs GSAP ScrollTrigger:
 *   GSAP:    start: 'top 85%'   (element's TOP hits 85% down the viewport)
 *   anime:   enter: '85% top'  (viewport's 85% line hits the element's TOP)
 * The two strings above are equivalent triggers, just written back-to-front.
 *
 * anime.js's `repeat` option on a ScrollObserver defaults to `true` (replays
 * every time the element re-enters view). `observeOnce()` flips that default
 * to `false` so the common "reveal once" case doesn't need repeating per call
 * site.
 */
import { onScroll } from 'animejs';
import type { ScrollObserver } from 'animejs';

/** Every observer created via observeOnce(), so positions can be recalculated later. */
const observers: ScrollObserver[] = [];

export interface ObserveOnceOptions {
  /** Threshold string, e.g. '85% top'. See file header for the GSAP-order gotcha. */
  enter?: string;
  /** true replays the animation every time the element re-enters view. */
  repeat?: boolean;
}

/**
 * observeOnce(el, options)
 *
 * Wraps `onScroll()` for the common "reveal once when scrolled into view"
 * case used by the preset animations. The returned ScrollObserver is a
 * valid value for an animation's `autoplay` param.
 */
export function observeOnce(
  el: Element,
  { enter = '85% top', repeat = false }: ObserveOnceOptions = {}
): ScrollObserver {
  // anime.js's default sync mode is 'play pause' — leaving the viewport
  // mid-animation would freeze it (staggered tails never finish). 'play'
  // lets a started animation always run to completion; 'restart' replays
  // from the beginning on every re-enter for repeat mode.
  const observer = onScroll({
    target: el as HTMLElement,
    enter,
    repeat,
    sync: repeat ? 'restart' : 'play',
  });
  observers.push(observer);
  return observer;
}

/**
 * refreshObservers()
 *
 * Recalculates every tracked ScrollObserver's bounds. Call after
 * `document.fonts.ready` — web fonts shift layout and invalidate
 * previously computed trigger positions.
 */
export function refreshObservers(): void {
  observers.forEach((observer) => {
    // anime.js resolves an observer's target on the next animation frame
    // after creation. If fonts.ready wins that race (fonts cached), target
    // is still null and refresh() would throw — skip: the observer refreshes
    // itself with post-font layout when it resolves. Also skip reverted
    // (completed once-only) observers so refresh() doesn't resurrect them.
    if (observer.target && !observer.reverted) observer.refresh();
  });
}
