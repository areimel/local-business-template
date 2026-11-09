# Feature Flags — Implementation Plan & Checklist

Single source of truth for the feature-flag rollout. Update checkboxes as work lands.

## How the system works

- **`src/data/features.yaml`** — flat map of feature booleans. The only file devs edit per client.
- **`src/utils/features.ts`** — `getFeatures()` / `isFeatureEnabled(name)` (cached, fail-closed), `gatedPaths(name, buildPaths)` for routes, `getVisibleNavigation()` for nav/footer.
- **`src/components/SharedComponents/FeatureFlag.astro`** — `<FeatureFlag name="blog">…</FeatureFlag>` renders its children only when the flag is on. No wrapping DOM.
- **Routes**: flag-gated pages use dynamic routes whose `getStaticPaths` is wrapped in `gatedPaths()`. Disabled → zero pages built → URL 404s and never reaches the sitemap. Static index pages are renamed `index.astro` → `[...index].astro` (rest params match the empty path) so they can be gated too.
- **Nav**: nav items in `navigation.yaml` may carry a `flag:` key; `getVisibleNavigation()` filters them, which fixes desktop nav, mobile nav, AND footer (footer derives its links from mainNav).

⚠️ **Flags are build-time.** Restart `pnpm dev` after editing `features.yaml`.

## Flags (17)

| Flag | Controls | Status |
|---|---|---|
| `blog` | /blog/ + /blog/[slug]/ pages, nav link, homepage blog section, search-index entries | ✅ |
| `careers` | /careers/ + /careers/[slug]/ pages, nav link | ✅ |
| `offers` | /offers/[slug] campaign landing pages | ✅ |
| `coupons` | /coupons/ page, nav link ("Specials"), homepage coupons section | ✅ |
| `serviceAreas` | /service-areas/* pages, nav link, homepage section, areaServed schema | ✅ |
| `reviews` | ALL review UI (StarRating, ReviewsBadge, TestimonialHighlight, TestimonialsSlider, HomeReviews self-gate) + review schema | ✅ |
| `faqs` | /faqs/ page, nav link, homepage FAQ section (service-page FAQ blocks are content-driven, unaffected) | ✅ |
| `search` | Search modal, trigger buttons, /search-index.json endpoint | ✅ |
| `translate` | Google Translate widget in utility bar | ✅ |
| `exitIntentModal` | Exit-intent coupon popup | ✅ |
| `stickyPhoneBar` | Mobile sticky phone bar | ✅ |
| `floatingContactButton` | Floating contact widget | ✅ |
| `analytics` | GTM head/body scripts (still requires `gtm.id` in analytics-config.yaml) — defaults `false` (placeholder id) | ✅ |
| `emergencyCta` | EmergencyCtaBanner sections sitewide (self-gating). 24/7 copy in ctas.yaml/branding/heroes is content — manual edits still needed | ✅ |
| `devTools` | Demo Mode Tools Tools tab (theme picker) + head script that re-applies a saved preview theme. First consumer | ✅ |
| `devPages` | Internal-team pages: `/docs` (hub + `[slug]`), `/styleguide`, `/animation-examples` | ✅ |
| `demoPages` | All client-facing demo/variant pages (home design variants, industry demo homes + inner pages, `/landing/*` variants) plus the floating Demo Mode Tools widget (Pages tab). Renamed from `demoNav` and broadened to cover the demo/variant routes themselves, not just the widget. Internal tool — turn OFF before client handoff | ✅ |

## Commits

- [x] 1. Groundwork: features.yaml, features.ts, FeatureFlag.astro, this file (zero behavior change)
- [x] 2. Layout/UI components gated + legacy `enabled:` keys migrated (modals, floating-contact, analytics) + translate gate
- [x] 3. Nav/footer filtering + search gating
- [x] 4. Page controllers: blog, careers, faqs, coupons, offers
- [x] 5. Entangled wave: serviceAreas, reviews (all review UI), emergencyCta, coupons↔exit-modal link

## Verified 2026-07-16

- All-flags-on build is route-identical to the pre-flag baseline (84 HTML pages).
- Everything-off build: zero pages for blog/careers/faqs/coupons/offers/service-areas, empty sitemap entries, no GTM/search/sticky-bar/exit-modal/star markup on the homepage, search-index.json = `[]`.
- Emitted-but-unreferenced SearchModal JS bundle confirmed harmless (no HTML references it); unrendered component CSS selectors remain in the shared stylesheet (bytes only).
- `pnpm astro check`: no new errors (3 pre-existing setInterval type errors in SocialProofBand/HeroSlider are unrelated).

## Dev Mode consolidation

The former standalone "Dev Mode" system — `PUBLIC_DEV_MODE` build-time env var,
`?devmode=true` runtime reveal (persisted in `localStorage`), `DevPageGuard`,
`DevModeWrapper`, and `src/components/DevModeComponents/` — has been removed
entirely and merged into this build-time flag system. `devPages` now gates the
internal-team pages it used to guard (`/docs`, `/styleguide`,
`/animation-examples`), and `demoPages` (renamed from `demoNav`) covers the
client-facing demo/variant routes plus the floating Demo Mode Tools widget. Gating is
now 100% build-time via `gatedPaths()` — there is no runtime toggle or
`localStorage` state anymore.

## Migrated legacy toggles (removed — features.yaml wins)

- `modals.yaml → exitIntent.enabled`
- `floating-contact.yaml → enabled` (top-level; `speechBubble.enabled` stays — unrelated sub-toggle)
- `analytics-config.yaml → gtm.enabled` (`gtm.id` stays)

## Gating conventions

- **Single call site** (PageLayout/BaseLayout/homepage sections): wrap at the call site with `<FeatureFlag>` — visible at the composition root.
- **Many call sites** (StarRating, EmergencyCtaBanner, etc.): the component self-gates with an `isFeatureEnabled()` early return — one guard covers every usage.
- **Cross-feature interaction**: `coupons: false` also empties the exit-intent modal (its content is coupons), which then self-hides.

## Deferred / needs user input

- **emergencyCta copy**: the flag hides `EmergencyCtaBanner` sections; 24/7 messaging inside `ctas.yaml`, hero copy, and the utility bar is content and still needs per-client edits.
- **Industry variant/demo pages** (home-dental, styleguide, etc.): out of scope — dev/demo pages, already sitemap-filtered.
- **Pages CMS**: features.yaml may want a `.pages.yml` entry so non-devs can toggle flags — out of scope for v1.

## Verification per commit

1. `pnpm astro check` — no type errors.
2. `pnpm build` with all flags `true` — output matches baseline (84 HTML pages; commits 4–5 rename route files but URLs are unchanged).
3. Flip the commit's flag(s) `false` → `pnpm build` → route absent from `dist/` and sitemap, links gone from nav/footer, markup gone from pages.
4. Flag-off build: check `dist/_astro/*.js` for leaked scripts from disabled components (known Astro behavior: JS bundling follows static imports, not render conditionals — see astro#5739).
5. Restore all flags `true` before committing.
