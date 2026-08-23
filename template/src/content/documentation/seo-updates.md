---
title: "SEO Updates"
description: "Managing SEO settings including meta tags, structured data, and sitemaps"
order: 6
---

# SEO Updates Guide

**SEO** (Search Engine Optimization) controls how your site appears in search engine results and on social media when someone shares a link. Good SEO helps potential customers find the business when they search for things like "AC repair near me" or "HVAC company in Philadelphia."

This guide explains where SEO data lives in this project and how to update it — from global defaults that apply to every page, to individual page-level settings.

> **Prerequisites:**
> - You've completed the [Initial Setup Guide](/docs/initial-setup/) and the project runs locally
> - You're familiar with the project's data files (see [Project Rebranding Guide](/docs/project-rebranding/))

---

## How SEO Works in This Project

When a search engine like Google visits a page on your site, it reads invisible **meta tags** in the page's HTML to understand what the page is about. These tags control:

- **The title** that appears in search results and the browser tab
- **The description** that appears below the title in search results
- **The image** that appears when someone shares the link on social media
- **The canonical URL** that tells search engines the "official" address of the page

This project generates all of these tags automatically from data you provide. Here's the flow:

```
branding.yaml (global defaults)
       ↓
  Pages set their own title + description
       ↓
  PageLayout passes them to BaseLayout
       ↓
  Head.astro generates all meta tags
       ↓
  <title>, <meta description>, Open Graph tags, Twitter Card tags
```

There are **three levels** where you can control SEO:

| Level | What It Covers | Where to Edit |
|-------|---------------|---------------|
| **Global defaults** | Fallback values used when a page doesn't set its own | `src/data/branding.yaml` |
| **Static pages** | Individual pages like About, Contact, FAQs | `src/pages/*.astro` files |
| **Service pages** | Service hub and detail pages | `src/content/services/**/*.md` files |

---

## Global SEO Defaults

### branding.yaml

**File:** `src/data/branding.yaml`

The `seo` section in this file provides the default values used across the entire site:

```yaml
seo:
  titleTemplate: "%s | Acme Heating & Cooling"
  defaultTitle: "Acme Heating & Cooling | Philadelphia's Trusted HVAC Experts"
  defaultDescription: "Family-owned HVAC company serving Greater Philadelphia since 2000. AC repair, heating, and more. Call (555) 123-4567."
  defaultImage: "/images/og-default.jpg"
  locale: "en_US"
```

Here's what each field does:

#### titleTemplate

```yaml
titleTemplate: "%s | Acme Heating & Cooling"
```

This is the **pattern** used to build every page's title. The `%s` is a placeholder that gets replaced with the page's specific title.

For example, if a page sets its title to "About Us", the final browser tab title becomes:

```
About Us | Acme Heating & Cooling
```

Update this to include the new company name.

#### defaultTitle

```yaml
defaultTitle: "Acme Heating & Cooling | Philadelphia's Trusted HVAC Experts"
```

This is the title used for the **homepage** and as a fallback for any page that doesn't set its own title. It appears in:

- The browser tab
- Google search results (the blue clickable link)
- Social media shares

**Best practices:**
- Include the company name
- Include the primary location or service area
- Keep it under 60 characters (Google truncates longer titles)

#### defaultDescription

```yaml
defaultDescription: "Family-owned HVAC company serving Greater Philadelphia since 2000. AC repair, heating, and more. Call (555) 123-4567."
```

This is the fallback description used when a page doesn't provide its own. It appears as the snippet text below the title in search results.

**Best practices:**
- Summarize what the business does and where
- Include the phone number (makes it easy for searchers to call directly)
- Keep it between 120–160 characters

#### defaultImage

```yaml
defaultImage: "/images/og-default.jpg"
```

This is the image that appears when someone shares a link to the site on Facebook, LinkedIn, X (Twitter), or in a messaging app. It's called an **OG image** (Open Graph image).

- **Recommended size:** 1200x630 pixels
- **Format:** JPG
- **Location:** Save the file to `public/images/og-default.jpg` — it's referenced as a plain root-relative path (`/images/og-default.jpg`), so it belongs in `public/` rather than `src/assets/` (which is reserved for images Astro's build pipeline processes/optimizes)

See the [Project Rebranding Guide](/docs/project-rebranding/#og-social-sharing-image) for details on creating this image.

#### locale

```yaml
locale: "en_US"
```

The language and region code. `en_US` means English (United States). You typically don't need to change this unless the site is for a non-US or non-English audience.

### Other Branding Fields That Affect SEO

Several other fields in `branding.yaml` are used by pages when building their descriptions:

| Field | How It's Used in SEO |
|-------|---------------------|
| `companyName` | Appears in OG site name and page descriptions |
| `phone` | Included in descriptions for click-to-call in search results |
| `serviceArea.primary` | Used in phrases like "serving Greater Philadelphia" |
| `yearEstablished` | Used in phrases like "since 2000" to build trust |

When you update these values (as covered in the [Rebranding Guide](/docs/project-rebranding/)), the SEO descriptions across the site update automatically.

### Site URL

**File:** `astro.config.mjs`

```javascript
site: 'https://example.com',
```

The site URL is critical for SEO because it's used to generate:

- **Canonical URLs** — Tells search engines the official address of each page, preventing duplicate content penalties
- **Sitemap URLs** — The auto-generated sitemap uses this to build full URLs for every page
- **OG image URLs** — Social media platforms need absolute URLs (e.g., `https://www.smithhvac.com/images/og-default.jpg`) to load preview images

Always update this to the actual domain before deploying.

---

## Page-Level SEO

### How Static Pages Set Their SEO

Each page in `src/pages/` passes a custom `title` and `description` to the layout component. These override the global defaults for that specific page.

Here's the pattern, using the About page as an example:

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import { getBranding } from '@/utils/data';
const branding = getBranding();
---

<PageLayout
  title="About Us"
  description={`Learn about ${branding.companyName} — proudly serving ${branding.serviceArea.primary} since ${branding.yearEstablished}. Family-owned, licensed, and insured.`}
>
  <!-- page content -->
</PageLayout>
```

Notice how the description **dynamically references branding data** — it pulls the company name, service area, and year from `branding.yaml`. This means when you update `branding.yaml`, the SEO descriptions update automatically on the next build.

Here's how other pages do it:

| Page | Title | Description Pattern |
|------|-------|-------------------|
| About | `"About Us"` | Company name + service area + year established |
| Contact | `"Contact Us"` | Company name + service area + phone number |
| FAQs | `"FAQs"` | Company name + service area + "Find answers about..." |

The `title` value is automatically combined with the `titleTemplate` from `branding.yaml`. So a title of `"About Us"` becomes:

```
About Us | Acme Heating & Cooling
```

### What Gets Generated in the HTML

When a page sets its title and description, the `Head.astro` component generates the following HTML tags:

```html
<!-- Title (browser tab + search results) -->
<title>About Us | Acme Heating & Cooling</title>

<!-- Description (search result snippet) -->
<meta name="description" content="Learn about Acme Heating & Cooling — proudly serving Greater Philadelphia since 2000." />

<!-- Canonical URL (official page address) -->
<link rel="canonical" href="https://www.smithhvac.com/about/" />

<!-- Open Graph (social media sharing) -->
<meta property="og:title" content="About Us | Acme Heating & Cooling" />
<meta property="og:description" content="Learn about Acme Heating & Cooling..." />
<meta property="og:image" content="https://www.smithhvac.com/images/og-default.jpg" />
<meta property="og:url" content="https://www.smithhvac.com/about/" />
<meta property="og:site_name" content="Acme Heating & Cooling" />

<!-- Twitter Card (X/Twitter sharing) -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="About Us | Acme Heating & Cooling" />
<meta name="twitter:description" content="Learn about Acme Heating & Cooling..." />
<meta name="twitter:image" content="https://www.smithhvac.com/images/og-default.jpg" />
```

You don't need to write any of this HTML yourself — it's all generated automatically from the data you provide.

> **Tip:** To verify the actual meta tags on any page, open the page in your browser, right-click, and select **"View Page Source."** Search for `<title>` or `og:title` to find the generated tags.

---

## Service Page SEO

Service pages use **Markdown files** with frontmatter fields for SEO, rather than Astro component props.

### Frontmatter SEO Fields

Each service page markdown file has these SEO-relevant fields:

```yaml
---
title: "AC Repair"
seoTitle: "Professional AC Repair Services"    # optional
seoDescription: "Professional AC repair services in Greater Philadelphia. Fast diagnosis, transparent pricing, and expert repairs. Call (555) 123-4567."
ogImage: "/images/ac-repair-og.jpg"            # optional
---
```

| Field | Required? | What It Does |
|-------|-----------|-------------|
| `title` | Yes | The page heading. Also used as the SEO title if `seoTitle` is not set. |
| `seoTitle` | No | Overrides `title` for the browser tab and search results. Use this when you want a more descriptive search title than the page heading. |
| `seoDescription` | Yes | The meta description for search results. Every service page **must** have one — there is no automatic fallback. |
| `ogImage` | No | A custom social sharing image for this specific page. Falls back to the global `defaultImage` if not set. |

### How to Update a Service Page's SEO

1. Open the service page's markdown file (e.g., `src/content/services/air-conditioning/ac-repair.md`)
2. Edit the frontmatter fields between the `---` markers at the top of the file
3. Save the file — the dev server will rebuild automatically

**Example — before:**

```yaml
---
title: "AC Repair"
seoDescription: "Professional AC repair services in Greater Philadelphia. Fast diagnosis, transparent pricing, and expert repairs for all major brands. Call (555) 123-4567."
---
```

**Example — after (rebranded):**

```yaml
---
title: "AC Repair"
seoDescription: "Expert AC repair in the Dallas-Fort Worth area. Same-day service, upfront pricing, all brands. Call (972) 555-0199 for fast repairs."
---
```

**Best practices for service page descriptions:**
- Include the service name ("AC repair," "heating installation")
- Include the location or service area
- Include the phone number
- Mention a key differentiator (same-day service, free estimates, etc.)
- Keep it between 120–160 characters

### Hub Pages vs. Service Pages

The service content is organized into two types:

| Type | File Pattern | Example |
|------|-------------|---------|
| **Hub** (category landing) | `_hub.md` | `src/content/services/air-conditioning/_hub.md` |
| **Service** (individual page) | `slug.md` | `src/content/services/air-conditioning/ac-repair.md` |

Both types use the same SEO frontmatter fields (`seoDescription`, `seoTitle`, `ogImage`). When rebranding, update the `seoDescription` in **every** service file — hubs and individual pages alike.

> **Tip:** The quickest way to find all descriptions that need updating is to search the `src/content/services/` folder for the old company name or phone number. In VS Code, press `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac), enter the search term, and restrict the search to `src/content/services/`.

---

## Structured Data (FAQ Schema)

**Structured data** is a special format (called JSON-LD) that helps search engines understand the content on a page in more detail. When Google recognizes structured data, it can display **rich snippets** — enhanced search results with extra information like FAQ dropdowns directly in the search results page.

This project includes structured data on the **FAQs page** (`src/pages/faqs/[...index].astro`). It automatically pulls all questions and answers from `src/data/faqs.yaml` (via `getFaqs()`) and passes them to the shared `getFaqPageJsonLd()` helper in `src/utils/seo.ts`, which formats them as a `FAQPage` schema that Google understands.

**You don't need to do anything special here.** When you update the questions and answers in `faqs.yaml`, the structured data updates automatically on the next build. Just make sure the FAQ content is accurate and relevant to the new brand.

---

## Sitemap

A **sitemap** is an XML file that lists every page on the site, helping search engines discover and index all your content. This project generates one automatically — no manual maintenance required.

- **URL:** `yourdomain.com/sitemap-index.xml`
- **Generated by:** The `@astrojs/sitemap` integration (already configured in `astro.config.mjs`)
- **Includes:** All static pages and dynamically generated service pages
- **Excludes:** Internal-only routes are filtered out via the integration's `filter` option in `astro.config.mjs` — currently `/styleguide`, `/docs/`, `/home-alt`, `/home-original`, and `/offers/`
- **Requires:** The correct `site` URL in `astro.config.mjs`

After deploying, you can submit the sitemap URL to Google Search Console to speed up indexing.

---

## SEO Checklist

When rebranding or updating SEO, work through this checklist:

- [ ] **Update `branding.yaml` SEO section** — title template, default title, default description, locale
- [ ] **Update site URL** in `astro.config.mjs` to the actual domain
- [ ] **Create an OG image** — 1200x630px JPG with company branding
- [ ] **Review all service page descriptions** — update `seoDescription` in every `*.md` file in `src/content/services/`
- [ ] **Update FAQ content** in `src/data/faqs.yaml` — this feeds into the structured data
- [ ] **Build and verify** — run `pnpm build`, then check page source for correct meta tags
- [ ] **Test social sharing** — paste the live URL into Facebook's [Sharing Debugger](https://developers.facebook.com/tools/debug/) or LinkedIn's [Post Inspector](https://www.linkedin.com/post-inspector/) to verify OG tags

---

## Quick Reference

| What to Update | File | Fields |
|---------------|------|--------|
| Global title pattern | `src/data/branding.yaml` | `seo.titleTemplate` |
| Homepage / fallback title | `src/data/branding.yaml` | `seo.defaultTitle` |
| Global fallback description | `src/data/branding.yaml` | `seo.defaultDescription` |
| Social sharing image | `src/data/branding.yaml` | `seo.defaultImage` |
| Site URL (canonical + sitemap) | `astro.config.mjs` | `site` |
| Static page SEO (About, Contact, etc.) | `src/pages/*.astro` | `title` and `description` props on PageLayout |
| Service page SEO | `src/content/services/**/*.md` | `seoTitle`, `seoDescription`, `ogImage` frontmatter |
| FAQ structured data | `src/data/faqs.yaml` | Question/answer content |

---

## Next Steps

- [Project Rebranding Guide](/docs/project-rebranding/) — Full rebranding walkthrough including colors, logos, and content
- [Git & GitHub Guidelines](/docs/git-guidelines/) — How to branch, commit, and deploy changes safely
