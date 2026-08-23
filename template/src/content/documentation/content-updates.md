---
title: "Content Updates"
description: "How to edit YAML data files, service pages, blog posts, and other content"
order: 4
---

# Content Updates Guide

This guide covers how to update text, images, and page content across the site. The project is designed so that **content is separated from code** — you edit Markdown files and YAML config files, not the component code that controls how things look.

> **Prerequisites:**
> - You've completed the [Initial Setup Guide](/docs/initial-setup/) and the project runs locally
> - You have a basic understanding of the project's data files (see [Project Rebranding Guide](/docs/project-rebranding/))

---

## Understanding Content Types

Content lives in three places, depending on what it is:

| Source | What It Contains | Format | Location |
|--------|-----------------|--------|----------|
| **YAML data files** | Site-wide content — company info, CTAs, FAQs, navigation | `.yaml` key-value files | `src/data/` |
| **Static pages** | Individual pages like About and Contact | `.astro` component files | `src/pages/` |
| **Content collections** | Services, locations, campaigns, blog posts, careers, legal pages, and documentation guides | `.md` Markdown files | `src/content/` |

Most of the time, you'll be editing **YAML files** and **Markdown files**. You should rarely need to touch `.astro` component files.

---

## Editing YAML Data Files

### What is YAML?

**YAML** is a simple text format for structured data. It uses **indentation** (spaces, not tabs) to show hierarchy, and **colons** to separate keys from values:

```yaml
# This is a comment
companyName: "Acme Heating & Cooling"
address:
  street: "1234 Market Street"
  city: "Philadelphia"
  state: "PA"
```

> **Important rules:**
> - Use **2 spaces** for indentation (never tabs — tabs will cause errors)
> - If a value contains a colon, wrap it in **quotes**: `heading: "AC Emergency? We're Here."`
> - Lists use a dash and space: `- "Item one"`

### branding.yaml — Company Information

**File:** `src/data/branding.yaml`

This file controls company name, contact info, logos, SEO defaults, and service area. Changes here propagate across the entire site automatically.

For a full walkthrough of every field, see the [Project Rebranding Guide](/docs/project-rebranding/#step-1-update-company-information).

### ctas.yaml — Call-to-Action Text

**File:** `src/data/ctas.yaml`

CTAs (Calls to Action) are the prompts that encourage visitors to take action. This file controls all of them:

| Section | Where It Appears |
|---------|-----------------|
| `hero` | Homepage hero banner — main heading, subheading, and buttons |
| `servicesCta` | Below the services overview section |
| `maintenancePlanCta` | Maintenance plan promotion section |
| `emergencyCta` | Emergency service banner (includes phone number) |
| `footerCta` | Above the site footer on every page |

Most sections have a `heading`, `body`, and button text/URL (the `hero` section instead uses nested `primaryButton`/`secondaryButton` objects, each with `text` and `url`). Example:

```yaml
emergencyCta:
  heading: "AC Emergency?"
  body: "We offer same-day emergency repairs. Don't sweat it — help is on the way."
  buttonText: "Call Now"
  phone: "(555) 123-4567"
  phoneRaw: "5551234567"
```

> **Tip:** When updating phone numbers in CTAs, make sure they match the phone number in `branding.yaml`. The `phoneRaw` field should contain digits only.

### faqs.yaml — Frequently Asked Questions

**File:** `src/data/faqs.yaml`

FAQs are organized by category. Each category has a name, a URL-friendly slug, and a list of questions:

```yaml
categories:
  - name: "General Service Questions"
    slug: "general"
    questions:
      - question: "What kinds of services do you offer?"
        answer: "We handle AC and heating services for homeowners throughout the Greater Philadelphia area."
      - question: "How soon can you get here?"
        answer: "We're available 24/7 and offer same-day service for most calls."
```

You can add, remove, or reorder categories and questions. This content also automatically feeds into **Google's FAQ rich snippets** via structured data on the FAQs page (see [SEO Updates Guide](/docs/seo-updates/#structured-data-faq-schema)).

### navigation.yaml — Menu Structure

**File:** `src/data/navigation.yaml`

Controls the main navigation menu and the utility bar (phone/email at the top of the page):

```yaml
mainNav:
  - label: "Air Conditioning"
    url: "/air-conditioning/"
    children:
      - label: "AC Repair"
        url: "/air-conditioning/ac-repair/"
      - label: "AC Maintenance"
        url: "/air-conditioning/ac-maintenance/"

  - label: "About"
    url: "/about/"

utilityNav:
  - label: "(555) 123-4567"
    url: "tel:5551234567"
    icon: "material-symbols:call"
```

To add a new top-level page, add a new item to `mainNav`. To create a dropdown, add a `children` array. URLs must match the actual page paths.

### service-areas.yaml — Cities and Regions

**File:** `src/data/service-areas.yaml`

Controls the list of cities and regions displayed on the homepage and the Service Areas page. Update with the new company's geographic coverage.

---

## Editing Static Pages

### What Are Static Pages?

Static pages are `.astro` files in `src/pages/`. Most of their content is **data-driven** — pulled automatically from YAML files. However, a few pages have some **inline text** that you edit directly in the file.

> **Note:** You don't need to understand Astro's syntax to make basic text edits. Just find the text you want to change and update it. The text is usually inside HTML-like tags.

### About Page

**File:** `src/pages/about.astro`

The About page has more inline content than most pages. Here's what lives where:

**Data-driven** (updates automatically from `branding.yaml`):
- Company name, year established, service area — referenced as `{branding.companyName}`, `{branding.yearEstablished}`, etc.

**Inline content** (edit directly in the file):

| Content | What to Look For |
|---------|-----------------|
| Company story paragraphs | Look for the "Our Story" section — paragraphs of text describing the company's history |
| Mission statement | Look for quoted text in the mission/manifesto section |
| Core values | A `coreValues` array near the top of the file — each item has `title`, `description`, and `icon` |
| Philosophy points | A `philosophyPoints` array — same structure as core values |

To edit the core values, find the array and change the values:

```javascript
const coreValues = [
  {
    title: "Quality First",
    description: "We never cut corners on parts or workmanship.",
    icon: "material-symbols:verified-outline"
  },
  // ... more values
];
```

### Contact Page

**File:** `src/pages/contact.astro`

The Contact page is almost entirely data-driven — phone, email, address, and the emergency CTA all come from `branding.yaml` and `ctas.yaml`. The only inline text to edit is the form section heading and a short supporting paragraph.

### Other Static Pages

Most other pages (FAQs, Service Areas, Thank You) are fully data-driven. Update the corresponding YAML file and the page updates automatically.

---

## Editing Service Pages

### How Service Pages Work

Service pages are **Markdown files** stored in `src/content/services/`. Each file has two parts:

1. **Frontmatter** — structured data between `---` markers at the top (YAML format)
2. **Body content** — free-form text below the frontmatter (Markdown format)

The files are organized by category in subfolders:

```
src/content/services/
├── air-conditioning/
│   ├── _hub.md                    ← Category landing page
│   ├── ac-repair.md               ← Individual service page
│   ├── ac-maintenance.md
│   ├── emergency-ac-repair.md
│   └── ...
└── heating/
    ├── _hub.md                    ← Category landing page
    ├── heating-repair.md
    └── ...
```

**Key rules:**
- The **filename** (without `.md`) becomes the **URL slug** — so `ac-repair.md` becomes `/air-conditioning/ac-repair/`
- The **folder name** must match the `category` field in the frontmatter
- Use **lowercase and hyphens** in filenames — no spaces or special characters

### Hub Pages (_hub.md)

Hub pages are **category landing pages** — they show an overview of all services in a category. They're identified by the `_hub.md` filename (the underscore prefix is important).

**Frontmatter fields:**

```yaml
---
type: hub
title: "Air Conditioning Services"
category: "air-conditioning"
categoryLabel: "Air Conditioning"

seoDescription: "Professional air conditioning services in Greater Philadelphia. AC repair, installation, maintenance, and emergency service. Call (555) 123-4567."

heroHeading: "Air Conditioning Services"
heroSubheading: "Keep your home cool and comfortable year-round"

intro: "From emergency repairs to full system replacements, our certified technicians handle all your cooling needs."

subServices:
  - title: "AC Repair"
    slug: "ac-repair"
    description: "Fast, reliable repairs for all AC brands and models."
    icon: "material-symbols:build-outline"
  - title: "AC Maintenance"
    slug: "ac-maintenance"
    description: "Preventative maintenance to extend system life and reduce breakdowns."
    icon: "material-symbols:tune-outline"

faqs:
  - question: "How often should AC maintenance be done?"
    answer: "Most homes benefit from professional AC maintenance once or twice per year."

showContactForm: true
showEmergencyCta: false
freeEstimate: false
sortOrder: 1
---

## Additional Information

Any markdown content here appears below the sub-services grid and above the FAQs.
Use ## headings to organize sections.
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | Must be `hub` |
| `title` | Yes | Page title (used in navigation and as SEO title fallback) |
| `category` | Yes | URL-safe category slug — must match the folder name |
| `categoryLabel` | Yes | Human-readable category name (used in breadcrumbs and badges) |
| `seoDescription` | Yes | Meta description for search results (120–160 characters) |
| `heroHeading` | Yes | Large heading displayed in the hero section |
| `heroSubheading` | No | Subheading below the hero heading |
| `intro` | Yes | Introductory paragraph displayed below the hero |
| `subServices` | No | Grid of service cards linking to individual service pages |
| `faqs` | No | FAQ accordion section at the bottom of the page |
| `showContactForm` | No | Show a contact form (default: `true`) |
| `showEmergencyCta` | No | Show the emergency CTA banner (default: `false`) |
| `freeEstimate` | No | Swaps CTA button/heading text to "free estimate" wording across the page (default: `false`) |
| `sortOrder` | No | Controls display order (lower numbers appear first) |
| `ctaHeading` | No | Override the default CTA heading |
| `ctaBody` | No | Override the default CTA body text |
| `ctaButtonText` | No | Override the default CTA button text |

### Individual Service Pages

Individual service pages provide detailed information about a specific service. They use a similar frontmatter structure with a few additions:

```yaml
---
type: service
title: "AC Repair"
category: "air-conditioning"
categoryLabel: "Air Conditioning"

seoDescription: "Professional AC repair services in Greater Philadelphia. Fast diagnosis, transparent pricing, and expert repairs. Call (555) 123-4567."

heroHeading: "AC Repair Services"
heroSubheading: "Fast, reliable cooling repairs when you need them most"

intro: "When your AC breaks down, you need a team you can trust to get it fixed fast."

features:
  - title: "Same-Day Service"
    description: "We prioritize urgent repairs and offer same-day appointments."
    icon: "material-symbols:schedule-outline"
  - title: "All Major Brands"
    description: "Our technicians are trained to service all makes and models."
    icon: "material-symbols:verified-outline"
  - title: "Transparent Pricing"
    description: "No hidden fees. We provide upfront estimates before any work begins."
    icon: "material-symbols:receipt-long-outline"

processSteps:
  - step: 1
    title: "Schedule a Visit"
    description: "Call us or fill out our online form to book an appointment."
  - step: 2
    title: "Diagnosis"
    description: "Our technician inspects your system and identifies the issue."
  - step: 3
    title: "Repair"
    description: "We fix the problem on the spot whenever possible."

faqs:
  - question: "How do I know if my AC needs repair?"
    answer: "Common signs include warm air, weak airflow, unusual noises, and high energy bills."

showContactForm: true
showEmergencyCta: false
freeEstimate: false
sortOrder: 1
---

## When to Call for AC Repair

Body content in markdown format appears here. Use headings, lists, bold text,
and other markdown formatting to structure the content.

### Common AC Problems

- **Refrigerant leaks** — causes warm air and ice buildup
- **Compressor failure** — the system runs but doesn't cool
- **Thermostat issues** — incorrect temperature readings
```

The additional fields not in hub pages:

| Field | Required | Description |
|-------|----------|-------------|
| `features` | No | Three-column feature cards (title, description, icon) |
| `processSteps` | No | Numbered steps showing the service process |

### Creating a New Service Page

To add a new service to an existing category:

1. **Create the Markdown file** in the appropriate category folder:
   ```
   src/content/services/air-conditioning/duct-cleaning.md
   ```

2. **Add the frontmatter** with all required fields:
   ```yaml
   ---
   type: service
   title: "Duct Cleaning"
   category: "air-conditioning"
   categoryLabel: "Air Conditioning"
   seoDescription: "Professional duct cleaning in Greater Philadelphia. Improve air quality and system efficiency. Call (555) 123-4567."
   heroHeading: "Duct Cleaning Services"
   intro: "Clean ducts mean cleaner air and a more efficient HVAC system."
   showContactForm: true
   ---
   ```

3. **Add it to the hub page's sub-services** — open `src/content/services/air-conditioning/_hub.md` and add an entry to the `subServices` array:
   ```yaml
   subServices:
     # ... existing services
     - title: "Duct Cleaning"
       slug: "duct-cleaning"
       description: "Professional duct cleaning to improve indoor air quality."
       icon: "material-symbols:air-outline"
   ```

4. **Add it to the navigation** — open `src/data/navigation.yaml` and add the new page under the appropriate dropdown:
   ```yaml
   children:
     # ... existing items
     - label: "Duct Cleaning"
       url: "/air-conditioning/duct-cleaning/"
   ```

5. **Preview** — run `pnpm dev` and visit `http://localhost:4321/air-conditioning/duct-cleaning/`

### Creating a New Service Category

To add an entirely new category (e.g., "Insulation"):

1. **Create the folder:** `src/content/services/insulation/`

2. **Create the hub file:** `src/content/services/insulation/_hub.md` with `type: hub`, `category: "insulation"`, and the required fields

3. **Create individual service files** in the folder (e.g., `attic-insulation.md`, `duct-sealing.md`)

4. **Add to navigation** in `src/data/navigation.yaml`:
   ```yaml
   mainNav:
     - label: "Insulation"
       url: "/insulation/"
       children:
         - label: "Attic Insulation"
           url: "/insulation/attic-insulation/"
   ```

---

## Editing Blog Posts

**Location:** `src/content/blog/`

Blog posts are Markdown files with the following frontmatter:

```yaml
---
title: "10 Energy-Saving Tips for Homeowners"
slug: "10-energy-saving-tips"
excerpt: "Short summary for search results and previews."
seoDescription: "Practical energy-saving tips to reduce your utility bills and keep your home comfortable year-round."
publishDate: "2026-03-01"
author: "Jane Smith"
category: "Energy Savings"
tags: ["energy efficiency", "home tips", "HVAC"]
featuredImage: "@/assets/images/blog/energy-tips.jpg"
featuredImageAlt: "A modern thermostat on a living room wall"
featured: false
draft: false
seoTitle: "Energy-Saving Tips for Your Home"
---

Write your blog post content here in Markdown...
```

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Blog post title |
| `slug` | Yes | URL slug for the post (should match the filename) |
| `excerpt` | Yes | Short summary used for previews and listings |
| `seoDescription` | Yes | Meta description for search results |
| `publishDate` | Yes | Publication date in `YYYY-MM-DD` format |
| `author` | No | Author name (defaults to `"Team"`) |
| `category` | Yes | Category label (e.g., "Energy Savings", "HVAC Tips") |
| `tags` | No | Array of tags for categorization |
| `featuredImage` | No | Path to the hero image |
| `featuredImageAlt` | No | Alt text for the image |
| `featured` | No | Set to `true` to highlight on the homepage (default: `false`) |
| `draft` | No | Set to `true` to hide from the site (default: `false`) |
| `seoTitle` | No | Override the SEO title (falls back to `title`) |

**To create a new blog post:** Create a new `.md` file in `src/content/blog/` (e.g., `summer-ac-tips.md`), add the frontmatter, and write the content below.

> **Draft mode:** Set `draft: true` to write a post without publishing it. The page won't appear on the site until you change it to `false`.

---

## Editing Location Pages

**Location:** `src/content/locations/`

Location pages describe service coverage for specific cities or neighborhoods:

```yaml
---
title: "HVAC Services in Oakdale"
slug: "oakdale"
region: "Oakdale County"
seoDescription: "Professional HVAC services in Oakdale. AC repair, installation, and maintenance for homes and businesses. Fast response, upfront pricing."
heroHeading: "HVAC Services in Oakdale"
heroSubheading: "Fast, reliable air conditioning and heating services for Oakdale homeowners and businesses."
intro: "Oakdale residents depend on their AC systems year-round to stay comfortable. Our licensed technicians provide same-day repairs, professional installation, and preventive maintenance plans."
highlights:
  - title: "Fast Same-Day Response"
    description: "We dispatch technicians quickly across Oakdale."
    icon: "material-symbols:speed-outline"
featuredServices:
  - title: "AC Repair"
    slug: "air-conditioning/ac-repair"
    description: "Fast diagnosis and repair for all makes and models."
nearbyLocations:
  - "lakeside"
  - "hillcrest"
mapEmbedQuery: "Oakdale"
faqs:
  - question: "How quickly can you get a technician to my Oakdale home?"
    answer: "For most service calls in Oakdale, we can dispatch a technician the same day."
showContactForm: true
showEmergencyCta: true
sortOrder: 10
---

Write location-specific content here — local market information,
neighborhood details, directions, etc.
```

**To create a new location page:** Create a `.md` file in `src/content/locations/` (e.g., `oakdale.md`) and fill in the frontmatter with the city's details.

---

## Editing Career Listings

**Location:** `src/content/careers/`

Career pages list job openings:

```yaml
---
title: "HVAC Service Technician"
slug: "hvac-service-technician"
seoDescription: "Join our team as an HVAC Service Technician. Year-round work, weekly pay, company vehicle, and benefits from day one."
department: "Service"
jobType: "Full-Time"
location: "Philadelphia, PA"
salary: "$50,000 - $75,000"
publishDate: "2026-03-01"
closingDate: "2026-06-01"
excerpt: "Join our growing team as a certified HVAC service technician."
featured: true
active: true
applyUrl: "/contact/"
sortOrder: 1
---

Write the full job description here — day-to-day responsibilities, team
environment, and growth opportunities. Requirements and benefits are also
written as markdown sections in the body (e.g. `## Requirements`, `## What We Offer`)
rather than frontmatter fields.
```

| Field | Description |
|-------|-------------|
| `jobType` | Must be `"Full-Time"`, `"Part-Time"`, `"Contract"`, or `"Seasonal"` |
| `featured` | Set to `true` to show prominently at the top of the careers page |
| `active` | Set to `false` to hide the listing without deleting the file |

**To add a new listing:** Create a `.md` file in `src/content/careers/`.

**To close a listing:** Either delete the file or set `active: false`.

---

## Working with Images in Content

### Image Paths

There are two ways to reference images depending on where you're using them:

**In frontmatter** (YAML fields like `featuredImage`):

```yaml
featuredImage: "@/assets/images/blog/my-photo.jpg"
```

The `@/` alias points to the `src/` folder. Astro automatically optimizes these images at build time.

**In Markdown body content** (inline images):

```markdown
![A technician repairing an air conditioner](../../../assets/images/services/ac-repair.jpg)
```

In markdown, use relative paths from the current file's location back to `src/assets/`.

### After Adding New Images

Before adding new images to `src/assets/`, drop the original files into a `temp_images/` folder at the project root and run the optimization script:

```bash
pnpm images:optimize
```

This resizes images to a max width of 2400px and compresses them to roughly 450KB (JPEG, quality ~80), writing the results to `temp_images/optimized/`. Move the optimized files into the appropriate `src/assets/images/` subfolder before committing. Large, uncompressed images cause slow page loads and can create issues with Git.

### Recommended Image Sizes

| Use Case | Recommended Size | Format |
|----------|-----------------|--------|
| Hero / banner images | 1920x1080px max | JPG |
| Blog featured images | 1200x800px | JPG |
| Team / profile photos | 600x800px | JPG |
| Location photos | 1200x800px | JPG |
| OG / social sharing | 1200x630px | JPG |

---

## Common Mistakes & Troubleshooting

### YAML Indentation Error

**Symptom:** Build fails with a YAML parsing error.

**Cause:** YAML requires consistent indentation with spaces. Using tabs or misaligned indentation will break the parser.

```yaml
# Wrong — misaligned
questions:
  - question: "What do you offer?"
  answer: "Full HVAC services."        # ← "answer" should be indented under the list item

# Correct
questions:
  - question: "What do you offer?"
    answer: "Full HVAC services."       # ← aligned with "question"
```

### Missing Required Field

**Symptom:** Build fails with a Zod validation error mentioning a specific field.

**Cause:** A required frontmatter field is missing from a Markdown file. The error message will tell you which field and which file.

**Fix:** Add the missing field to the file's frontmatter.

### Filename / Category Mismatch

**Symptom:** Service page doesn't appear or shows a 404.

**Cause:** The `category` field in the frontmatter doesn't match the folder name.

```
File: src/content/services/air-conditioning/ac-repair.md
                            ^^^^^^^^^^^^^^^^
                            Folder name must match ↓

category: "air-conditioning"    ← Correct
category: "airconditioning"     ← Wrong (missing hyphen)
```

### Forgetting the Underscore on Hub Files

**Symptom:** Hub page doesn't load as a category landing page or shows wrong layout.

**Cause:** Hub files must be named `_hub.md` (with the underscore). Without it, the file is treated as a regular service page.

### Strings with Special Characters

**Symptom:** YAML parsing error on a line with a colon, hash, or bracket.

**Cause:** YAML uses `:`, `#`, `[`, `{` as special characters. If your text contains any of these, wrap the entire value in quotes:

```yaml
# Wrong — colon breaks the parser
heading: AC Emergency: We're Here

# Correct — wrapped in quotes
heading: "AC Emergency: We're Here"
```

---

## Quick Reference

| Content | File Location | Key Fields to Edit |
|---------|--------------|-------------------|
| Company info (name, phone, address) | `src/data/branding.yaml` | `companyName`, `phone`, `email`, `address` |
| Homepage hero text & buttons | `src/data/ctas.yaml` → `hero` | `heading`, `subheading`, button text/URLs |
| Emergency CTA | `src/data/ctas.yaml` → `emergencyCta` | `heading`, `body`, `phone` |
| Footer CTA | `src/data/ctas.yaml` → `footerCta` | `heading`, `body`, button text/URL |
| Navigation menu | `src/data/navigation.yaml` | `mainNav` labels/URLs, `utilityNav` |
| Global FAQs | `src/data/faqs.yaml` | `categories`, `questions`, `answers` |
| Service areas / cities | `src/data/service-areas.yaml` | `cities`, `regions`, `heading` |
| About page text | `src/pages/about.astro` | Story paragraphs, `coreValues` array, mission text |
| Service category page | `src/content/services/{category}/_hub.md` | Frontmatter fields + markdown body |
| Individual service page | `src/content/services/{category}/{slug}.md` | Frontmatter fields + markdown body |
| Blog post | `src/content/blog/{slug}.md` | Frontmatter fields + markdown body |
| Location page | `src/content/locations/{slug}.md` | Frontmatter fields + markdown body |
| Job listing | `src/content/careers/{slug}.md` | Frontmatter fields + markdown body |

---

## Next Steps

- [SEO Updates Guide](/docs/seo-updates/) — How to update meta titles, descriptions, and search engine settings
- [Project Rebranding Guide](/docs/project-rebranding/) — Full rebranding walkthrough including colors, logos, and content
