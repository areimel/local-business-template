---
title: "Project Rebranding"
description: "Complete walkthrough for rebranding the template with new company identity"
order: 5
---

# Project Rebranding Guide

This guide walks you through every file and setting you'll need to update to rebrand this template for a new client. The process takes roughly **30–60 minutes** if you have the client's information and assets ready.

> **Prerequisite:** Make sure you've completed the [Initial Setup Guide](/docs/initial-setup/) and can run the project locally with `pnpm dev` before starting.

---

## How Rebranding Works

This project is designed so that **all brand-specific content lives in data files and asset folders** — not in component code. You should never need to edit `.astro` component files to rebrand the site. Instead, components read from a set of YAML config files and display whatever content they find there.

Here's a high-level view of the files you'll be working with:

| File | What It Controls |
|------|-----------------|
| `src/data/branding.yaml` | Company name, contact info, SEO |
| `src/data/form-config.yaml` | Contact-form email routing (to/from addresses) |
| `src/styles/global.css` | Brand colors and fonts |
| `src/data/ctas.yaml` | Call-to-action text across the site |
| `src/data/navigation.yaml` | Navigation menu structure and utility bar |
| `src/data/faqs.yaml` | Frequently asked questions |
| `src/data/service-areas.yaml` | Cities and regions served |
| `src/assets/logos/` | Logo image files |
| `public/favicon.*` | Browser tab icon |
| `src/assets/images/` | Hero images, team photos |
| `astro.config.mjs` | Live site URL |
| `src/content/services/` | Individual service page content |

The rest of this guide walks through each one step by step.

---

## Step 1: Update Company Information

### branding.yaml — The Central Config File

**File:** `src/data/branding.yaml`

This is the single most important file for rebranding. Nearly every page on the site pulls data from it — the company name in the header, the phone number in the footer, the SEO titles in search results, and more.

Open the file and update each section:

#### Company Identity

```yaml
companyName: "Acme Heating & Cooling"
companyNameShort: "Acme"
tagline: "Your Comfort, Our Priority"
yearEstablished: 2000
```

- **companyName** — The full company name. Used in page titles, the header, footer, and throughout the site.
- **companyNameShort** — A shorter version. Used in phrases like "The Acme Difference" on the About page.
- **tagline** — The company's slogan or mission statement.
- **yearEstablished** — The year the company was founded. The About page uses this to calculate "X years in business."

#### Contact Information

```yaml
phone: "(555) 123-4567"
phoneRaw: "5551234567"
email: "info@acmeheating.com"
address:
  street: "1234 Market Street"
  suite: "Suite 100"
  city: "Philadelphia"
  state: "PA"
  zip: "19107"
  full: "1234 Market Street, Suite 100, Philadelphia, PA 19107"
```

- **phone** — The display-formatted phone number (what visitors see).
- **phoneRaw** — The digits-only version (used in `tel:` links so phones can dial it).
- **email** — Contact email address.
- **address** — The full business address broken into parts. The `full` field is a pre-formatted single-line version used in some components.

> **Tip:** Make sure `phoneRaw` contains only digits — no spaces, dashes, or parentheses. This is what mobile devices use to initiate a phone call.

#### Online Presence

```yaml
website: "https://example.com"
googleMapsUrl: "https://maps.google.com/?q=1234+Market+Street+Philadelphia+PA+19107"
googleReviewUrl: ""
socialMedia:
  facebook: ""
  instagram: ""
  youtube: ""
  nextdoor: ""
```

- **website** — The live website URL. Also update this in `astro.config.mjs` (covered in Step 5).
- **googleMapsUrl** — A Google Maps link to the business address. Replace the address in the URL with the new one.
- **googleReviewUrl** — A direct link to the company's Google review page. Leave empty if not set up yet.
- **socialMedia** — Social media profile URLs. Leave any field empty (`""`) if the company doesn't use that platform — the site will simply hide that icon.

#### Logo Paths

```yaml
logo: "logos/logo-full.svg"
logoIcon: "logos/logo-icon.svg"
logoText: "logos/logo-text.svg"
```

These paths point to logo files inside `src/assets/`. You don't need to change these paths — just replace the actual image files (covered in Step 3). Only change these if you're using different filenames or a different file format.

#### SEO Defaults

```yaml
seo:
  titleTemplate: "%s | Acme Heating & Cooling"
  defaultTitle: "Acme Heating & Cooling | Philadelphia's Trusted HVAC Experts"
  defaultDescription: "Family-owned HVAC company serving Greater Philadelphia since 2000. AC repair, heating, and more. Call (555) 123-4567."
  defaultImage: "/images/og-default.jpg"
  locale: "en_US"
```

**SEO** (Search Engine Optimization) controls how the site appears in Google search results and when shared on social media.

- **titleTemplate** — The format for every page's browser tab title. `%s` is replaced with the page name (e.g., "About Us | Acme Heating & Cooling").
- **defaultTitle** — The title used on the homepage and as a fallback for pages without a custom title.
- **defaultDescription** — The description that appears under the title in search results.
- **defaultImage** — The image shown when the site is shared on social media (covered in Step 3).
- **locale** — Language and region code. `en_US` is correct for US English.

#### Service Area

```yaml
serviceArea:
  primary: "Greater Philadelphia"
  regions:
    - "Philadelphia Metro"
    - "Delaware County"
    - "Montgomery County"
```

- **primary** — The main geographic area. Used in descriptions like "Serving Greater Philadelphia."
- **regions** — Specific regions within the service area.

#### Contact Form Email Routing

Contact form submissions are **not** configured in `branding.yaml`. This template sends form data through **SendGrid** via the `/api/contact` serverless endpoint, and email routing lives in a separate file:

**File:** `src/data/form-config.yaml`

```yaml
activeProfile: "test"

profiles:
  test:
    toEmail:
      - "your-test-inbox@example.com"
    fromEmail: "hosting@example.com"
    fromName: "Your Company Name [TEST]"

  production:
    toEmail:
      - "info@example.com"
    fromEmail: "noreply@example.com"
    fromName: "Your Company Name"
```

- **activeProfile** — Switch between `"test"` and `"production"`. Keep it on `test` until the client is ready to receive real leads.
- **toEmail** — Who receives the notification email (accepts one or more addresses).
- **fromEmail** / **fromName** — The sender identity shown on the notification email.

You'll also need a SendGrid API key in `.env` as `SENDGRID_API_KEY`. See `FORM_SETUP_README.md` in the project root for the full setup walkthrough.

> **Important:** Leave `activeProfile` set to `test` while building out the site so form submissions don't go to the client's real inbox before launch. Switch it to `production` — and confirm the `SENDGRID_API_KEY` is set — before going live.

#### Theme Colors (Reference Only)

```yaml
theme:
  primary: "#0066CC"
  primaryDark: "#004999"
  secondary: "#10B981"
  accent: "#00BCD4"
  neutral: "#1a1a2e"
  neutralLight: "#f5f5f7"
  white: "#ffffff"
```

These values are **for reference only** — they don't actually control the site's colors. The real color values are in `src/styles/global.css` (covered in Step 2). After you change colors in the CSS file, update these values here to keep them in sync.

---

## Step 2: Customize the Color Scheme

### global.css — The @theme Block

**File:** `src/styles/global.css`

The site's colors are defined using **CSS custom properties** (also called CSS variables). Think of them as named labels for colors — instead of typing `#0066CC` every time you need the brand's blue, you write `var(--color-primary)`. This means changing the brand color in one place updates it everywhere on the site.

All color definitions live inside the `@theme` block at the top of the file:

#### Primary Colors

```css
--color-primary: #0066CC;
--color-primary-dark: #004999;
--color-primary-light: #3399FF;
```

The **primary** color is the main brand color. It's used for:
- Navigation links and hover states
- Headings and text accents
- Outline buttons and borders
- Focus indicators

You need three variants:
- **primary** — The main color
- **primary-dark** — A darker shade (used for hover states)
- **primary-light** — A lighter shade (used for backgrounds and highlights)

#### Secondary Colors

```css
--color-secondary: #10B981;
--color-secondary-dark: #059669;
--color-secondary-light: #34D399;
```

The **secondary** color is used for the main call-to-action (CTA) buttons — the most prominent "Get an Estimate" and "Schedule Service" buttons. Same three-variant pattern as primary.

#### Accent Colors

```css
--color-accent: #00BCD4;
--color-accent-dark: #008BA3;
--color-accent-light: #4DD0E1;
```

The **accent** color is used sparingly for highlights, badges, and decorative elements. Same three-variant pattern.

#### What You Can Leave Alone

The following color groups generally **don't need to change** during a rebrand:

- **Neutrals** (`--color-neutral-50` through `--color-neutral-900`) — Grays used for text, backgrounds, and borders. These work with any brand color.
- **Semantic colors** (`--color-success`, `--color-warning`, `--color-error`, `--color-info`) — Standard green/yellow/red/blue for status messages.
- **Surface colors** (`--color-bg`, `--color-bg-alt`, `--color-text`, `--color-text-muted`) — Page backgrounds and text colors.

#### Tips for Choosing Colors

- **Contrast matters.** White text needs to be readable on your primary and secondary colors. Use a tool like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify.
- **Dark/light variants.** A quick method: take your base color and darken it 20% for the dark variant, lighten it 20% for the light variant.
- **Keep secondary bold.** Since secondary is used for CTA buttons, choose a color that stands out against the primary. Green, orange, and bright blue are common choices.

#### After Updating Colors

Once you've set your colors in `global.css`, go back to `src/data/branding.yaml` and update the `theme` section to match. Those values are for reference only, but keeping them in sync helps other developers understand the color scheme at a glance.

#### Changing Fonts (Optional)

If you want to change the heading or body font, update these lines:

```css
--font-heading: 'Outfit Variable', 'Outfit', 'Trebuchet MS', Tahoma, sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

> **Note:** Changing fonts also requires installing the new font package. This project uses [Fontsource](https://fontsource.org/) for self-hosted fonts. You would need to run `pnpm add @fontsource-variable/your-font-name` (or `@fontsource/your-font-name` for non-variable fonts) and import it in the project. This is optional and more advanced — the default fonts work well for most brands.

---

## Step 3: Replace Logo & Image Assets

### Logos

**Location:** `src/assets/logos/`

Replace these three files with the new company's logos. **Keep the exact same filenames:**

| File | Usage | Recommended Size |
|------|-------|-----------------|
| `logo-full.svg` | Header, footer — the full logo (icon + text) | 400–600px wide |
| `logo-icon.svg` | Favicon fallback, compact displays — just the icon/mark | 200x200px |
| `logo-text.svg` | Alternate layout — just the text/wordmark | 300–400px wide |

> **Tip:** SVG is the default format here since it scales cleanly at any size. If the client only has a raster logo, a PNG with a transparent background also works — just update the file extensions in `branding.yaml` to match.

### Favicons

**Location:** `public/`

The **favicon** is the small icon that appears in the browser tab next to the page title. Replace these three files:

| File | Size | Format |
|------|------|--------|
| `favicon.ico` | 32x32px | ICO |
| `favicon.png` | 32x32px | PNG |
| `favicon-192.png` | 192x192px | PNG |

You can generate all three from a single image using [https://favicon.io](https://favicon.io) — upload your logo icon and download the generated files.

### Hero & Team Images

**Location:** `src/assets/images/`

| Folder | Contents | Recommended Size |
|--------|----------|-----------------|
| `hero/` | Large banner images for page headers | 1920x1080px max |
| `team/` | Staff and team photos | 1200x800px |

Replace the placeholder images with real company photos. You can keep the existing filenames or use new ones — but if you change filenames, you'll need to update any references in the service page markdown files.

**Before adding new images**, drop the source files into a `temp_images/` folder at the project root and run the optimization script:

```bash
pnpm images:optimize
```

This resizes and compresses each image (targeting a max width of 2400px and a target file size around 450KB) into `temp_images/optimized/`. Move the optimized files into the correct `src/assets/images/` subfolder. Large images can cause slow page loads and issues with Git.

### OG (Social Sharing) Image

**What it is:** When someone shares a link to the site on Facebook, LinkedIn, X (Twitter), or in a messaging app, an **OG image** (Open Graph image) is the preview image that appears alongside the link.

**Create an OG image** with these specifications:
- **Size:** 1200x630px
- **Format:** JPG
- **Content:** Typically the company logo on a branded background
- **Save as:** `public/images/og-default.jpg`

Unlike the logo and hero images, this file lives in `public/images/` (not `src/assets/images/`) since it needs to be served from a stable, unprocessed URL for social platforms to fetch. The path is already configured in `branding.yaml` under `seo.defaultImage`.

---

## Step 4: Update Site Content

### CTA Copy

**File:** `src/data/ctas.yaml`

**CTAs** (Calls to Action) are the prompts that encourage visitors to take action — "Get an Estimate," "Call Now," "Schedule Service," etc. This file controls all of them.

Each section corresponds to a different part of the site:

```yaml
# Example: Hero Section CTA
hero:
  heading: "Philadelphia's Trusted HVAC Team"
  subheading: "Family-owned. Locally operated. Serving Greater Philadelphia since 2000."
  primaryButton:
    text: "Get an Estimate"
    url: "/contact/"
  secondaryButton:
    text: "Call Now"
    url: "tel:5551234567"
```

Update the headings, body text, and phone numbers in each section:

| Section | Where It Appears |
|---------|-----------------|
| `hero` | Homepage hero banner |
| `servicesCta` | Below the services overview |
| `emergencyCta` | Emergency service banner (includes phone number) |
| `footerCta` | Above the site footer |
| `blogCta` | Blog post pages |
| `locationsCta` | Service areas page |
| `careersCta` | Careers page |

> **Tip:** Make sure any phone numbers in CTA text match what you set in `branding.yaml`. The `tel:` URLs should use the digits-only format (e.g., `tel:5551234567`).

### Navigation

**File:** `src/data/navigation.yaml`

This file controls the site's navigation menus.

**Main navigation** — The menu items and dropdowns:

```yaml
mainNav:
  - label: "Air Conditioning"
    url: "/air-conditioning/"
    children:
      - label: "AC Repair"
        url: "/air-conditioning/ac-repair/"
      # ...more sub-items
```

You can rename labels, reorder items, or add/remove menu entries. If the new client offers different services, update the labels and URLs accordingly.

**Utility navigation** — The phone number and email in the top bar:

```yaml
utilityNav:
  - label: "(555) 123-4567"
    url: "tel:5551234567"
    icon: "material-symbols:call"
  - label: "info@acmeheating.com"
    url: "mailto:info@acmeheating.com"
    icon: "material-symbols:mail-outline"
```

Update the phone number and email to match what you set in `branding.yaml`.

### FAQs

**File:** `src/data/faqs.yaml`

Replace the questions and answers with content relevant to the new company:

```yaml
categories:
  - name: "General Service Questions"
    slug: "general"
    questions:
      - question: "What kinds of services do you offer?"
        answer: "We handle AC and heating services for homeowners..."
```

You can rename categories, add new ones, or remove categories that don't apply.

### Service Areas

**File:** `src/data/service-areas.yaml`

Update the cities and regions to match the new company's service area:

```yaml
heading: "Proudly Serving Greater Philadelphia"
cities:
  - "Philadelphia"
  - "Ardmore"
  - "Conshohocken"
  # ...more cities
```

Update the heading, subheading, city list, and region groupings.

### Service Pages

**Location:** `src/content/services/`

Service pages are written in **Markdown** — a simple text format that uses symbols for formatting (like `#` for headings and `**` for bold text). Each service has its own `.md` file.

The content is organized by category:

```
src/content/services/
├── air-conditioning/
│   ├── _hub.md              ← Category landing page
│   ├── ac-repair.md
│   ├── ac-maintenance.md
│   └── ...
└── heating/
    ├── _hub.md              ← Category landing page
    ├── heating-repair.md
    └── ...
```

Each file has a **frontmatter** section at the top (between `---` markers) with structured data, followed by the page content in Markdown:

```markdown
---
title: "AC Repair"
seoDescription: "Professional AC repair in Greater Philadelphia..."
heroHeading: "AC Repair Services"
heroSubheading: "Fast, reliable cooling repairs"
---

Your page content goes here in Markdown format...
```

Update the frontmatter fields and body content for each service page. Pay special attention to location references and phone numbers in the descriptions.

---

## Step 5: Update the Site URL

### astro.config.mjs

**File:** `astro.config.mjs` (in the project root)

Find this line and change it to the client's actual domain:

```javascript
site: 'https://example.com',
```

For example:

```javascript
site: 'https://www.smithhvac.com',
```

This URL is used for:
- **Sitemap generation** — tells search engines the correct URLs for all pages
- **Canonical URLs** — prevents duplicate content issues in search rankings
- **OG image URLs** — ensures social media previews link to the correct image

> **Note:** If you don't have a domain yet, leave it as `https://example.com` and update it later before deploying.

---

## Verification Checklist

After completing all the steps above, run through this checklist to make sure nothing was missed:

- [ ] **Company name** appears correctly in the header, footer, and page titles
- [ ] **Phone number** is correct and clickable (opens phone dialer on mobile)
- [ ] **Email address** is correct and clickable (opens email client)
- [ ] **Physical address** displays correctly on the Contact page
- [ ] **Colors** look correct throughout — buttons, links, headings, hover states
- [ ] **Logos** display properly in the header and footer
- [ ] **Favicon** appears in the browser tab
- [ ] **Social media links** work (or are hidden if left empty)
- [ ] **Contact form** submits successfully (test with `activeProfile: "test"` in `form-config.yaml` before switching to `production`)
- [ ] **SEO titles** are correct (view the browser tab text on each page)
- [ ] **No placeholder text** remains — search the site for "Acme" or "555" to find any missed references
- [ ] **Build succeeds** — run `pnpm build` and confirm no errors

---

## Quick Reference

| File | What to Update | Priority |
|------|---------------|----------|
| `src/data/branding.yaml` | Company name, contact, SEO | Required |
| `src/data/form-config.yaml` | Contact-form email routing (to/from addresses) | Required |
| `src/styles/global.css` | Brand colors in `@theme` block | Required |
| `src/assets/logos/` | Logo image files (3 files) | Required |
| `public/favicon.*` | Browser tab icons (3 files) | Required |
| `astro.config.mjs` | Site URL | Required |
| `src/data/ctas.yaml` | Call-to-action copy | Required |
| `src/data/navigation.yaml` | Nav labels, utility bar phone/email | Required |
| `src/data/faqs.yaml` | FAQ questions and answers | Recommended |
| `src/data/service-areas.yaml` | Cities and regions served | Recommended |
| `src/assets/images/hero/` | Hero banner images | Recommended |
| `src/assets/images/team/` | Team/staff photos | Recommended |
| `src/content/services/` | Service page content | Optional |

---

## Next Steps

- **Adding Services** — How to create and edit service pages *(coming soon)*
- **Deployment** — How to deploy the site to production *(coming soon)*
