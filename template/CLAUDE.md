# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cloneable, rebrandable website template for local HVAC and home services companies. Built with **Astro 5.x**, **Tailwind CSS v4**, **Anime.js**, and **SendGrid** (forms). The site is fully static (pre-rendered), with all brand-specific content driven by YAML config files and Markdown content files — zero component code changes needed to rebrand.

Derived from a reference site, the template is better-designed and better-structured to be cloned and re-skinned for any local HVAC company.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server at localhost:4321
pnpm build            # Production build to ./dist/
pnpm preview          # Preview production build locally
pnpm astro check      # Run Astro diagnostics (TypeScript + component validation)
```

Package manager is **pnpm**.

## Architecture

- **Framework**: Astro 5.x with file-based routing (`src/pages/` → URL paths)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin — all theming in `src/styles/global.css` via `@theme` blocks. **No `tailwind.config.js`** (v4 is CSS-first).
- **Animations**: Anime.js v4 with ScrollObserver-based reveals. Elements use `data-animate` / `data-animate-children` attributes with `data-*` modifiers. Must respect `prefers-reduced-motion`. Never use `opacity-0` CSS on animated elements. Live demos at `/animation-examples`. Animation presets are in `src/utils/animations/`.
- **Icons**: `astro-icon` with two allowed Iconify sets only — `mdi` (primary, for new icons) and `material-symbols` (secondary, where all existing icons live). Pick names from Iconify (https://icon-sets.iconify.design/) — verify the exact name before use. Use `-outline` suffix for Material Symbols "Light" style (e.g., `material-symbols:phone-outline`). Renders as inline SVG at build time.
- **Fonts**: Self-hosted via Fontsource (`@fontsource-variable/nunito` for headings, `@fontsource/inter` for body).
- **Forms**: SendGrid via `/api/contact` serverless endpoint (Netlify function). API key in `.env` as `SENDGRID_API_KEY`. Email routing (to/from addresses, sender name) in `src/data/form-config.yaml` under `profiles.{test,production}` — switch `activeProfile` to go live. Only fields listed in `fieldOrder` in `src/pages/api/contact.ts` appear in notification emails. See [FORM_SETUP_README.md](FORM_SETUP_README.md).
- **TypeScript**: Strict mode enabled
- **Build tool**: Vite (via Astro)

## Data Layer

All brand-specific content lives in data/config files, never hardcoded in components:

- `src/data/branding.yaml` — Company identity, contact info, logos, SEO defaults, theme colors
- `src/data/form-config.yaml` — Contact-form email routing (to/from addresses, sender name) with `test`/`production` profiles
- `src/data/ctas.yaml` — CTA content (hero, services, emergency, footer)
- `src/data/faqs.yaml` — FAQ categories with questions/answers
- `src/data/navigation.yaml` — Main nav structure with dropdowns, utility nav
- `src/utils/data.ts` — Typed helper functions (`getBranding()`, `getCtas()`, etc.) using `js-yaml` + `readFileSync`

## Content Collections (Astro v5)

Service pages use Astro Content Collections with Markdown + YAML frontmatter:

- **Config location**: `src/content.config.ts` (NOT `src/content/config.ts` — v5 breaking change)
- **Loader**: `glob()` from `astro/loaders`
- **Rendering**: Standalone `render()` import from `astro:content` (NOT `entry.render()`)
- **Content structure**: `src/content/services/{category}/{slug}.md`
- **Two types**: `type: hub` (category landing pages, use `_hub.md`) and `type: service` (individual service pages)
- **Internal docs**: `documentation` collection (`src/content/documentation/*.md`, schema `{title, description, order}`) renders 9 dev-facing guides at `/docs/` (hub) + `/docs/{slug}/` via `src/layouts/DocsLayout.astro`. Gated by the `devPages` feature flag (via `gatedPaths`), noindex, excluded from sitemap; not registered in `.pages.yml` (not client-editable). Linked from the demo nav (Internal / Dev) and the styleguide sidebar.

## Feature Flags

Single source of truth for build-time gating of everything from optional page
sections to whole internal/demo route trees. See [FEATURE_FLAGS_PLAN.md](FEATURE_FLAGS_PLAN.md)
for the full flag table and history.

- **Source of truth**: `src/data/features.yaml` (flat map of booleans) +
  `src/utils/features.ts` (`getFeatures()`, `isFeatureEnabled(name)`).
- **Gating mechanisms**: `gatedPaths(name, buildPaths)` wraps a route's
  `getStaticPaths` — flag off means zero pages are built (the URL 404s and
  never reaches the sitemap); `<FeatureFlag name="...">…</FeatureFlag>`
  (`src/components/SharedComponents/FeatureFlag.astro`) gates a block of
  markup at a single call site; components with many call sites self-gate with
  an `isFeatureEnabled()` early return; `getVisibleNavigation()` filters
  `navigation.yaml` entries carrying a `flag:` key, which covers desktop nav,
  mobile nav, and the footer (it derives its links from mainNav).
- **Route convention**: flag-gated index routes are named `[...index].astro`
  (rest params matching the empty path) instead of `index.astro` so they can
  be wrapped in `gatedPaths()`.
- **Build-time only**: flags are read at build time — restart `pnpm dev` after
  editing `features.yaml` for a change to take effect.
- **Internal-tooling flags**: three flags gate internal/demo content rather
  than client-facing features —
  - `devTools` — reserved for future dev-tool features (e.g. a site theme
    picker); no consumer wired yet.
  - `devPages` — internal-team pages: `/docs` (hub + `[slug]`), `/styleguide`,
    `/animation-examples`.
  - `demoPages` — client-facing demo/variant pages (home design variants,
    industry demo homes/inner pages, `/landing/*` variants) plus the floating
    demo-page navigator. Replaces the old `demoNav` flag. **Set to `false`
    before client handoff.**

## Single-Page Landing Variants

Five prebuilt single-page landing templates live at `src/pages/landing/`: **lead-gen.astro** (full conversion one-pager), **promo.astro** (single-offer ad-traffic page), **brochure.astro** (digital business-card one-pager), **profile.astro** (Google-Business-Profile-style hub), and **coming-soon.astro** (pre-launch placeholder). All use `src/layouts/LandingPageLayout.astro` (anchor-link header, minimal footer with legal links + configurable developer credit, optional sticky mobile CTA) and render as noindex preview routes. **Developer workflow**: Browse `/landing/*` with the `demoPages` flag enabled, select the variant that fits the client use case, copy its contents into `src/pages/index.astro`, then delete `src/pages/landing/` and any other unneeded template pages. All variants pull content from existing YAML config (`branding.yaml`, `ctas.yaml`, etc.) plus inline placeholder copy — zero component changes required to rebrand.

## Source Layout

```
src/
├── pages/                    # File-based routes
│   ├── index.astro           # Homepage
│   ├── about.astro, faqs.astro, contact.astro, thank-you.astro
│   └── [category]/
│       ├── index.astro       # Service hub pages (getStaticPaths)
│       └── [slug].astro      # Service sub-pages (getStaticPaths)
├── layouts/
│   ├── BaseLayout.astro      # Root HTML shell (<html>, <head>, <body>)
│   ├── PageLayout.astro      # Extends Base — adds Header, Footer, Breadcrumbs, StickyPhoneBar
│   ├── ServiceHubLayout.astro
│   └── ServicePageLayout.astro
├── components/
│   ├── LayoutComponents/     # Header, DesktopNav, MobileNav, Footer, UtilityBar, Breadcrumbs, Head
│   ├── ButtonComponents/     # PrimaryButton, SecondaryButton, PhoneButton, IconButton, ButtonGroup
│   ├── FormComponents/       # ContactForm, QuickContactForm, TextInput, TextArea, SelectInput, Checkbox, FormMessage
│   ├── PopUpComponents/      # StickyPhoneBar
│   ├── HomePageComponents/   # HeroSection, ServicesOverview, WhyChooseUs, TestimonialsSlider, HomeContactSection
│   ├── InnerPageComponents/  # InnerHero, FaqAccordion, CtaBanner, ContentSection, ServiceGrid, ProcessSteps, FeatureCards, RelatedServices
│   └── SharedComponents/     # SectionWrapper, Card, Badge, Divider, StarRating
├── content/services/         # Markdown content (organized by category subdirectories)
├── data/                     # YAML config files
├── styles/global.css         # Tailwind imports, @theme tokens, component utility classes
├── utils/                    # data.ts, animations.ts, seo.ts
└── assets/                   # Logos, images (Astro-optimized)
```

## Design System

All design tokens defined in `src/styles/global.css` via Tailwind v4 `@theme` block:

- **Colors**: `primary`, `primary-dark`, `primary-light`, `secondary`, `accent`, `neutral-50` through `neutral-900`, semantic colors (success, warning, error, info), surface colors (bg, bg-alt, text, text-muted)
- **Typography**: `font-heading` (Nunito), `font-body` (Inter). Fluid `clamp()`-based font sizes from `xs` to `hero`.
- **Spacing**: `--spacing-section` for consistent vertical rhythm
- **Borders/Radius**: `radius-sm` through `radius-full`, `radius-btn`, `radius-card`
- **Shadows**: `shadow-sm` through `shadow-xl`, `shadow-btn`

Tokens auto-generate Tailwind utilities (e.g., `--color-primary` → `bg-primary`, `text-primary`, `border-primary`).

## Naming Conventions

- Components/Layouts: **PascalCase** (`HeroSection.astro`, `BaseLayout.astro`)
- Pages: **lowercase** (`index.astro`, `about.astro`)
- Assets: **kebab-case** (`logo-full.svg`, `og-default.jpg`)
- Data files: **kebab-case** (`branding.yaml`, `navigation.yaml`)
- Component folders: **PascalCase** with descriptive suffix (`LayoutComponents/`, `ButtonComponents/`)

## Coding Principles

- **File size limits**: Aim for **300–500 lines** per file. If a file exceeds that, consider splitting it into smaller component files. For files that are naturally larger, the hard ceiling is **800 lines**.
- **DRY**: If a new element or pattern is used **more than 3 times**, extract it into a reusable component. Use existing reusable components whenever possible, but don't over-abstract — pragmatism over purity.
- **Props-driven**: No component should hardcode brand-specific text. All content from YAML/props.
- **Theme-aware**: All colors reference CSS custom properties via Tailwind utilities — never hardcoded hex values.
- **Responsive-first**: Mobile layout is the default; desktop is the enhancement.
- **Accessible**: ARIA labels on interactive elements, proper heading hierarchy (single `<h1>` per page), keyboard navigation, focus indicators.
- **Alias imports**: Always use `@/` alias paths (e.g., `@/components/...`, `@/layouts/...`, `@/utils/...`) instead of relative paths (`../`, `../../`). The alias `@/` maps to `src/`. Relative paths are only acceptable for imports within the same directory (e.g., `./TextInput.astro` from another file in the same folder).
- **Conversion-focused**: Every page should have at least 2 conversion opportunities (CTAs, forms, phone links).

## Key Gotchas

1. **Content Collections v5 path**: Config must be `src/content.config.ts`, NOT `src/content/config.ts`. Wrong path causes silent failure.
2. **Tailwind v4 has no config file**: All theming via `@theme` in CSS. Use `@tailwindcss/vite`, NOT `@astrojs/tailwind`.
3. **anime.js ScrollObserver `repeat` defaults to `true`**: the module's `observeOnce()` (src/utils/animations/scroll.ts) passes `repeat: false` + `sync: 'play'` for once-only reveals — use it rather than calling `onScroll()` directly. Threshold order is reversed vs GSAP: `enter: '85% top'` = container position first, target second.
4. **No `opacity-0` on animated elements**: If JS fails, element stays invisible forever. utils.set() inside each preset (src/utils/animations/presets.ts) owns the hidden initial state.
5. **Scroll observers + fonts**: refreshObservers() runs after document.fonts.ready (already wired in initAnimations()) to recalculate trigger positions after font layout shifts.
6. **Contact form field allowlist**: Only fields listed in the `fieldOrder` array in `src/pages/api/contact.ts` will appear in notification emails. Adding a new form field requires updating that array. Every form must also include the hidden `botcheck` honeypot checkbox for spam protection. See [FORM_SETUP_README.md](FORM_SETUP_README.md).
7. **Hub pages use `_hub.md`**: Underscore prefix distinguishes hubs from sub-services. Filter by `type: hub` vs `type: service`.
8. **Service routing**: Uses `[category]/[slug].astro` pattern (not catch-all `[...slug].astro`) to avoid conflicts with static routes.
9. **Icon names**: Pick names from [Iconify](https://icon-sets.iconify.design/) and verify the exact name before use. A wrong name or a name from an uninstalled set fails silently at build (no error, just nothing renders). Using only `mdi` and `material-symbols` sets is required; a third set needs approval + `pnpm add @iconify-json/<set>`.

## Reference Documentation

- [PROJECT_BRIEF.md](PROJECT_BRIEF.md) — Original project brief
- [PROJECT_PLAN.md](PROJECT_PLAN.md) — Phased implementation checklist (7 phases)
