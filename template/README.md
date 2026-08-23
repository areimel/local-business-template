# Local AC Company Website Template

A cloneable, rebrandable website template for local HVAC and home services companies. Built with Astro 5.x, designed for fast page loads, conversion-optimized layouts, and easy content swapping via YAML config files and Markdown content.

Links:
- GitHub: https://github.com/areimel/local-business-template

Inspiration Websites:
- https://gmcooper.com/
- https://metzaircontrol.com/
- https://makeithappenpainting.com/ 
- https://www.sandjplumbing.com/ 

## Tech Stack

| Technology | Purpose |
|---|---|
| **Astro 5.x** | Static site generator with file-based routing and Content Collections |
| **Tailwind CSS v4** | Utility-first styling via `@theme` blocks (no `tailwind.config.js`) |
| **Anime.js v4** | Scroll-triggered reveals, staggered sequences, text splitting, counters |
| **astro-icon + Material Symbols** | Inline SVG icons at build time (outline variants for "Light" style) |
| **Fontsource (Nunito + Inter)** | Self-hosted fonts for best Core Web Vitals |
| **SendGrid** | Transactional email for form submissions via `/api/contact` serverless endpoint |
| **@astrojs/netlify** | Netlify adapter enabling server-side API routes on a static site |
| **js-yaml** | YAML data file loading at build time |

## Project Structure

```
local-business-template/
├── public/                          # Static files (favicon, robots.txt, OG images)
├── src/
│   ├── assets/                      # Images & logos (Astro-optimized)
│   │   ├── logos/
│   │   └── images/
│   ├── components/
│   │   ├── LayoutComponents/        # Header, Footer, Nav, UtilityBar, Breadcrumbs
│   │   ├── ButtonComponents/        # PrimaryButton, SecondaryButton, PhoneButton, etc.
│   │   ├── FormComponents/          # ContactForm, TextInput, SelectInput, etc.
│   │   ├── PopUpComponents/         # StickyPhoneBar, modals, banners
│   │   ├── HomePageComponents/      # HeroSection, ServicesOverview, WhyChooseUs, etc.
│   │   ├── InnerPageComponents/     # InnerHero, FaqAccordion, CtaBanner, ServiceGrid, etc.
│   │   └── SharedComponents/        # SectionWrapper, Card, Badge, StarRating, Divider
│   ├── content/
│   │   └── services/                # Markdown content files (organized by category)
│   │       ├── air-conditioning/
│   │       ├── heating/
│   │       ├── plumbing/
│   │       ├── gas/
│   │       └── electrical-services/
│   ├── data/                        # Global YAML config files
│   │   ├── branding.yaml            # Company name, phone, email, logos, SEO, theme colors
│   │   ├── ctas.yaml                # CTA content (hero, service, emergency, footer)
│   │   ├── faqs.yaml                # FAQ categories and questions
│   │   └── navigation.yaml          # Main nav and utility nav structure
│   ├── layouts/
│   │   ├── BaseLayout.astro         # Root HTML shell
│   │   ├── PageLayout.astro         # Header + Footer + main content area
│   │   ├── ServiceHubLayout.astro   # Service category hub pages
│   │   └── ServicePageLayout.astro  # Individual service pages
│   ├── pages/
│   │   ├── index.astro              # Homepage
│   │   ├── about.astro
│   │   ├── faqs.astro
│   │   ├── contact.astro
│   │   ├── thank-you.astro
│   │   └── [category]/
│   │       ├── index.astro          # Service hub pages (dynamic)
│   │       └── [slug].astro         # Service sub-pages (dynamic)
│   ├── styles/
│   │   └── global.css               # Tailwind imports, @theme tokens, component classes
│   └── utils/
│       ├── data.ts                  # YAML data loading helpers
│       ├── animations/              # Anime.js animation presets
│       └── seo.ts                   # JSON-LD structured data generators
├── content.config.ts                # Astro v5 Content Collections schema
├── astro.config.mjs
├── PROJECT_BRIEF.md
├── PROJECT_PLAN.md
└── CLAUDE.md
```

## Sitemap

```
/                          Homepage
├── about/                 About Us
├── faqs/                  Frequently Asked Questions
├── contact/               Contact Us
├── thank-you/             Form Confirmation
├── air-conditioning/      AC Hub (10 sub-services)
├── heating/               Heating Hub (5 sub-services)
├── plumbing/              Plumbing Hub (13 sub-services)
├── gas/                   Gas Hub (4 sub-services)
└── electrical-services/   Electrical Hub (8 sub-services)
```

~50 total pages generated from 5 page templates.

## Commands

All commands run from the project root:

| Command | Action |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start dev server at `localhost:4321` |
| `pnpm build` | Production build to `./dist/` |
| `pnpm preview` | Preview production build locally |
| `pnpm astro check` | TypeScript + component validation |

## Rebranding Workflow

To clone this template for a new client, choose one of two approaches:

**Full multi-page template** (40–50 pages of content) — follow the 6-step workflow below.

**Single-page landing variant** (faster, for simple client sites) — with the `demoPages` feature flag enabled (see `src/data/features.yaml`), browse the prebuilt templates at `/landing/` (lead-gen, promo, brochure, profile, or coming-soon), pick the variant that fits the client, copy its contents into `src/pages/index.astro`, then delete `src/pages/landing/` and any unneeded template pages. Same YAML-driven branding, minimal setup time.

### Full Template Rebranding

1. **Clone & install** — `git clone` + `pnpm install`
2. **Update `src/data/branding.yaml`** — Company name, phone, email, address, logos, SEO defaults, theme colors, and `sendgrid.toEmail` / `sendgrid.fromEmail` / `sendgrid.fromName`
3. **Update content files** — Edit `ctas.yaml`, `faqs.yaml`, `navigation.yaml`, and Markdown files in `src/content/services/`
4. **Replace assets** — Logos in `src/assets/logos/`, images in `src/assets/images/`, favicon, OG image
5. **Configure SendGrid** — See [SendGrid Setup](#sendgrid-setup) below
6. **Build & deploy** — `pnpm build` and deploy `dist/`

Estimated time for a full rebrand: **30–60 minutes** (with content pre-written).

## Pages CMS Integration

Non-technical editors can manage site content through a web UI instead of editing Markdown/YAML by hand, using [Pages CMS](https://pagescms.org) — a free, open-source, Git-based CMS. It commits edits straight back to the repo, so there's no separate database or hosting.

**The contract is [`.pages.yml`](.pages.yml)** at the repo root. It declares every file and content collection an editor may change and the field schema for each (20 models: branding, navigation, CTAs, FAQs, coupons, service areas, modals, all content collections, and the config files). `.pages.yml` is read **only by the Pages CMS app** — it is not part of the Astro build, so editing it never affects `pnpm build`.

**Connect the repo:**

1. Go to [app.pagescms.org](https://app.pagescms.org) and sign in with GitHub.
2. Authorize the Pages CMS GitHub App for this repository (grant **read/write to repository contents** — that's all it needs).
3. Select the repo. Pages CMS reads `.pages.yml` and lists all content models automatically.

**How edits flow:** Pages CMS commits directly to a branch (your default branch unless you pick another). For a review step, point editors at a dedicated content branch (e.g. `content`) and open PRs into `main`, or enable branch protection on `main`. Each save is a normal Git commit, so all changes are versioned and revertible.

**Image uploads** land in [`src/assets/images/cms-uploads/`](src/assets/images/cms-uploads/) (set via the `media` block in `.pages.yml`). Fields with `type: image` show an upload/picker widget and store the resulting path string.

**SEO & Schema control:** Most SEO data is editable from the CMS without code changes:

- **Meta defaults** — the `branding` model holds the title template, default title/description/OG image, locale, business identity, `businessHours`, and `priceRange`. These cascade site-wide into meta tags and auto-generated JSON-LD (`LocalBusiness`, `OpeningHoursSpecification`, etc.).
- **Per-page meta** — every content collection exposes `seoTitle` / `seoDescription` / `ogImage`.
- **Custom Schema/JSON-LD — two layers**, both editable as raw `<script type="application/ld+json">…</script>` blocks that render in addition to the auto-generated schema:
  - **Global** — the `schema-config` model (`src/data/schema-config.yaml`, `Schema Data` field) injects on **every page**. Use for site-wide `Organization` / `WebSite` markup.
  - **Per-page** — each entry's `Schema Data` field (blog, services, locations, campaigns, pages, careers) injects only on that page. Use for extra types (`Product`, `HowTo`, etc.).

  Pasted JSON-LD is rendered verbatim at build time via `BaseLayout.astro` — paste the full `<script>` tag. Because it commits through Git like any other content, it follows the same trusted-editor / review-via-PR model.

**Keeping the CMS in sync:** when you add or rename a key in a `src/data/*.yaml` file or a field in `src/content.config.ts`, update the matching model in `.pages.yml` so editors can see it. Fields the schema doesn't define are silently dropped by Astro at build, and fields in the data that `.pages.yml` omits are invisible to editors.

## SendGrid Setup

Form submissions are delivered via SendGrid through a server-side endpoint at `/api/contact` (a Netlify serverless function). The endpoint sends email to the recipient defined in [`src/pages/api/contact.ts`](src/pages/api/contact.ts) and reads credentials from environment variables.

### Step 1 — Create a SendGrid API key

1. Log in to [app.sendgrid.com](https://app.sendgrid.com)
2. Go to **Settings → API Keys → Create API Key**
3. Select **Restricted Access** and enable **Mail Send → Full Access**
4. Copy the generated key immediately — it is only shown once

### Step 2 — Verify your sender address

SendGrid requires a verified "From" address before it will deliver email.

**Option A — Single Sender Verification** (quickest for testing):
1. Go to **Settings → Sender Authentication → Single Sender Verification**
2. Click **Create a Sender** and enter the address you will use as `SENDGRID_FROM_EMAIL`
3. Open the verification email sent to that address and click the confirmation link

**Option B — Domain Authentication** (recommended for production):
1. Go to **Settings → Sender Authentication → Authenticate Your Domain**
2. Add the DNS records provided by SendGrid to your domain registrar
3. Once verified, any `@yourdomain.com` address can be used as the sender

### Step 3 — Configure local environment variables

```bash
cp .env.example .env
```

Edit `.env` with your actual values (this file is gitignored and never committed):

```env
SENDGRID_API_KEY=SG.your_actual_key_here
```

> Email addresses (recipient, sender address, sender display name) are configured in [`src/data/branding.yaml`](src/data/branding.yaml) under the `sendgrid:` key — not in `.env`.

### Step 4 — Configure Netlify for production

Environment variables must be set in the Netlify dashboard before deploying — they are never stored in the repo.

1. Open your site in the [Netlify dashboard](https://app.netlify.com)
2. Go to **Site configuration → Environment variables → Add a variable**
3. Add the variable:

| Key | Value |
|---|---|
| `SENDGRID_API_KEY` | Your SendGrid API key (`SG.xxx...`) |

4. Trigger a new deploy for the variable to take effect

### Step 5 — Verify it works

Submit a contact form on the deployed site and confirm the recipient inbox receives the email. If troubleshooting, check **Netlify → Functions → contact** for server logs.

### Environment variable reference

| Variable | Required | Description |
|---|---|---|
| `SENDGRID_API_KEY` | Yes | Secret API key from SendGrid (Mail Send scope). Starts with `SG.` |

### Email address configuration

Email addresses are **not** stored as environment variables — they live in [`src/data/branding.yaml`](src/data/branding.yaml) under the `sendgrid:` key:

```yaml
sendgrid:
  toEmail: "recipient@yourdomain.com"    # Who receives form submissions
  fromEmail: "noreply@yourdomain.com"    # Verified SendGrid sender address
  fromName: "Your Company Website"       # Display name shown in email clients
```

`fromEmail` must be verified in your SendGrid account (see Step 2 above).

> **When rebranding:** Update `sendgrid.toEmail`, `sendgrid.fromEmail`, and `sendgrid.fromName` in [`src/data/branding.yaml`](src/data/branding.yaml). Verify `fromEmail` in SendGrid before deploying.

### Form field allowlist

The `/api/contact` endpoint only includes fields that are explicitly listed in the `fieldOrder` array in [`src/pages/api/contact.ts`](src/pages/api/contact.ts). No other submitted field names will appear in notification emails.

| Field | Forms that use it |
|---|---|
| `name` | All forms |
| `email` | ContactForm, ServiceHero, HeroSlider |
| `phone` | All forms |
| `service` | All forms |
| `message` | ContactForm only |
| `preferred_date` | HeroSlider, CompactHeroWithForm |
| `consent` | ContactForm, QuickContactForm, HeroSlider |

If you add a new input field to any form, add its `name` to the `fieldOrder` array in `contact.ts` for it to appear in the email. See [FORM_SETUP_README.md](FORM_SETUP_README.md) for the complete developer guide.

---

## Reference Documentation

- [PROJECT_BRIEF.md](PROJECT_BRIEF.md) — Original project brief and requirements
- [PROJECT_PLAN.md](PROJECT_PLAN.md) — Phased implementation checklist
