---
title: "File Types Explained"
description: "Guide to all file types used in this project including HTML, CSS, JS, TypeScript, YAML, and Astro"
order: 3
---

# File Types Explained

This project uses several different file types, each with its own purpose and syntax. You don't need to master all of them — this is a quick reference so you know what you're looking at when you open a file.

---

## The Web Fundamentals

These are the core technologies that all websites are built on. Understanding them at a high level helps you make sense of the project's source code.

### HTML (.html)

**HTML** (HyperText Markup Language) is the **structure** of a web page. It defines what's on the page — headings, paragraphs, images, links, forms, and so on — using **tags**:

```html
<h1>Welcome to Our Company</h1>
<p>We provide reliable HVAC services.</p>
<a href="/contact/">Contact Us</a>
```

Tags come in pairs: an opening tag (`<h1>`) and a closing tag (`</h1>`), with content in between.

**In this project:** You won't edit `.html` files directly. Astro generates all the HTML for you at build time from `.astro` component files. But understanding HTML helps you read the template markup inside `.astro` files, since it looks very similar.

---

### CSS (.css)

**CSS** (Cascading Style Sheets) controls the **appearance** of a web page — colors, fonts, spacing, layout, animations, and responsive behavior.

```css
h1 {
  color: #0066CC;
  font-size: 2rem;
  font-weight: bold;
}
```

This says: "Make all `<h1>` headings blue, 2rem in size, and bold."

**In this project:** The main CSS file is `src/styles/global.css`. It defines the brand colors, fonts, spacing, and reusable styles using Tailwind CSS v4. Most styling is done through **utility classes** directly in the HTML markup (e.g., `class="text-primary bg-white p-4"`) rather than writing traditional CSS rules. See the [Project Rebranding Guide](/docs/project-rebranding/#step-2-customize-the-color-scheme) for details on editing the color scheme.

---

### JavaScript (.js)

**JavaScript** (JS) adds **interactivity and logic** to web pages. It's a programming language that runs in the browser — handling things like button clicks, form validation, animations, and dynamic content updates.

```javascript
const button = document.querySelector('#submit-btn');
button.addEventListener('click', () => {
  console.log('Button clicked!');
});
```

**In this project:** JavaScript is used for animations (anime.js), build tooling, and configuration files like `astro.config.mjs` (the `.mjs` extension stands for "module JavaScript" — it's still just JavaScript).

---

### TypeScript (.ts)

**TypeScript** is JavaScript with **type safety**. It's the same language at its core, but adds the ability to define what **type** of data a variable, function, or object should contain. This helps catch mistakes before the code runs.

Here's the difference:

```javascript
// JavaScript — no type checking
function getPhoneNumber(company) {
  return company.phone;
}

// TypeScript — catches errors if you pass the wrong type
function getPhoneNumber(company: Branding): string {
  return company.phone;
}
```

In the TypeScript version, if you accidentally passed a number instead of a `Branding` object, the editor would show an error immediately — before you even run the code. In plain JavaScript, it would fail silently or crash at runtime.

**Key differences from JavaScript:**

| JavaScript | TypeScript |
|-----------|------------|
| `.js` file extension | `.ts` file extension |
| No type annotations | Variables, functions, and objects have declared types |
| Errors found at runtime (when code runs) | Errors found at build time (before code runs) |
| Runs directly in browsers | Must be compiled to JavaScript first |

**In this project:** TypeScript is used for utility functions (`src/utils/data.ts`), the content collection schema (`src/content.config.ts`), and form handling logic. Astro supports TypeScript out of the box — the project has strict mode enabled, meaning it enforces type checking rigorously.

> **Note:** You generally don't need to edit `.ts` files for content updates. They're used for the project's internal logic and type definitions.

---

## Data & Content Formats

These are the formats used to store the site's content and configuration data. You'll work with these files frequently.

### JSON (.json)

**JSON** (JavaScript Object Notation) is a format for storing **structured data**. It uses curly braces `{}` for objects, square brackets `[]` for lists, and requires all strings to be wrapped in double quotes:

```json
{
  "name": "Acme Heating & Cooling",
  "yearEstablished": 2000,
  "services": ["AC Repair", "Heating", "Maintenance"],
  "isLicensed": true
}
```

JSON is strict about syntax — every string needs double quotes, no trailing commas, and no comments are allowed.

**In this project:** JSON is used for **tooling configuration** files:

| File | Purpose |
|------|---------|
| `package.json` | Lists the project's dependencies and scripts |
| `tsconfig.json` | TypeScript compiler settings |

You'll rarely edit these files directly. The project's actual content uses YAML instead of JSON because YAML is easier to read and write by hand.

---

### YAML (.yaml)

**YAML** (YAML Ain't Markup Language) stores **structured data** — similar to JSON, but designed to be more human-friendly. Instead of braces and brackets, it uses **indentation** to show structure:

```yaml
# Company info
companyName: "Acme Heating & Cooling"
yearEstablished: 2000
services:
  - "AC Repair"
  - "Heating"
  - "Maintenance"
isLicensed: true
address:
  street: "1234 Market Street"
  city: "Philadelphia"
  state: "PA"
```

Compare the same data in JSON and YAML:

| Feature | JSON | YAML |
|---------|------|------|
| Objects | `{ "key": "value" }` | `key: value` (indentation) |
| Lists | `["a", "b", "c"]` | `- a` / `- b` / `- c` (dashes) |
| Comments | Not allowed | `# This is a comment` |
| Quotes | Always required on strings | Only needed for special characters |
| Readability | Dense, harder to scan | Clean, easy to read |

**In this project:** YAML is the **primary format for all site content and configuration:**

| File | What It Stores |
|------|---------------|
| `src/data/branding.yaml` | Company name, contact info, SEO defaults |
| `src/data/ctas.yaml` | Call-to-action text across the site |
| `src/data/faqs.yaml` | FAQ questions and answers |
| `src/data/navigation.yaml` | Navigation menu structure |
| `src/data/service-areas.yaml` | Cities and regions served |
| `src/data/form-config.yaml` | Contact form email routing (test/production profiles) |

**Essential YAML rules:**

- Use **2 spaces** for indentation (never tabs — tabs will cause build errors)
- **Wrap strings in quotes** if they contain colons, hashes, or brackets: `heading: "AC Emergency: We're Here"`
- List items start with a **dash and space**: `- "Item"`
- Comments start with `#`

---

### Markdown (.md)

**Markdown** is a lightweight format for **writing formatted text**. Instead of complex HTML tags, it uses simple symbols for formatting:

```markdown
# Main Heading

## Subheading

Regular paragraph text. You can make text **bold** or *italic*.

### Smaller Heading

- Bullet point one
- Bullet point two
- Bullet point three

1. Numbered item
2. Another item

[Link text](https://example.com)

![Image description](path/to/image.jpg)

> This is a blockquote — used for callouts or quotes.

Inline `code` looks like this.
```

Here's a quick reference of the most common Markdown syntax:

| Syntax | Result |
|--------|--------|
| `# Heading` | Main heading (H1) |
| `## Heading` | Section heading (H2) |
| `### Heading` | Subsection heading (H3) |
| `**bold text**` | **bold text** |
| `*italic text*` | *italic text* |
| `[link text](url)` | Clickable link |
| `![alt text](image.jpg)` | Image |
| `- item` | Bullet list |
| `1. item` | Numbered list |
| `> quote` | Blockquote |
| `` `code` `` | Inline code |

#### Frontmatter

In this project, Markdown files have a special section at the top called **frontmatter** — structured data in YAML format, wrapped between triple dashes:

```markdown
---
title: "AC Repair"
category: "air-conditioning"
seoDescription: "Professional AC repair in Greater Philadelphia."
---

# AC Repair Services

The page's main content starts here, written in regular Markdown...
```

The frontmatter provides data that the page template uses (title, description, category, etc.). The content below the frontmatter is the actual page text.

**In this project:** Markdown is used for all **content collection pages:**

| Collection | Location | What It Contains |
|-----------|----------|-----------------|
| Services | `src/content/services/` | Service hub and detail pages |
| Locations | `src/content/locations/` | Service area pages |
| Campaigns | `src/content/campaigns/` | Landing pages for marketing campaigns |
| Blog | `src/content/blog/` | Blog posts |
| Careers | `src/content/careers/` | Job listings |
| Pages | `src/content/pages/` | Standalone pages (privacy policy, terms, etc.) |
| Documentation | `src/content/documentation/` | Internal docs (this page's collection) |

See the [Content Updates Guide](/docs/content-updates/) for detailed instructions on editing these files.

---

## The Astro Format

### Astro (.astro)

**Astro** is this project's framework, and `.astro` files are its custom component format. An Astro file combines HTML-like markup, CSS, and JavaScript into a **single reusable component**. It's the format used for pages, layouts, and UI components.

Every `.astro` file has two sections:

```astro
---
// FRONTMATTER (JavaScript/TypeScript)
// Runs at build time — imports, data fetching, logic
import PageLayout from '@/layouts/PageLayout.astro';
import { getBranding } from '@/utils/data';

const branding = getBranding();
const currentYear = new Date().getFullYear();
---

<!-- TEMPLATE (HTML-like markup) -->
<!-- Defines what the component renders -->
<PageLayout title="About Us">
  <h1>About {branding.companyName}</h1>
  <p>Serving the community since {branding.yearEstablished}.</p>
  <p>&copy; {currentYear} All rights reserved.</p>
</PageLayout>
```

**The frontmatter section** (between `---` markers) is where you import other components, load data, and write any logic. This code runs once at build time — not in the browser.

**The template section** (below the frontmatter) is the HTML-like markup that defines what appears on the page. It can include:

- **Standard HTML tags** — `<h1>`, `<p>`, `<div>`, `<a>`, etc.
- **Expressions** — `{branding.companyName}` inserts dynamic values
- **Other components** — `<PageLayout>`, `<Header />`, `<ContactForm />` (capitalized names are components)
- **Conditional rendering** — `{showForm && <ContactForm />}` (show a component only when a condition is true)

**How it differs from plain HTML:**

| HTML | Astro |
|------|-------|
| Static content only | Can include dynamic expressions (`{variable}`) |
| No imports | Import and use other components |
| All code runs in the browser | Frontmatter runs at build time (generates static HTML) |
| One file per page | Reusable components composed together |

**In this project:** Astro files are the building blocks of the site:

| Type | Location | Examples |
|------|----------|---------|
| **Pages** | `src/pages/` | `index.astro`, `about.astro`, `contact.astro` |
| **Layouts** | `src/layouts/` | `BaseLayout.astro`, `PageLayout.astro` |
| **Components** | `src/components/` | `Header.astro`, `ContactForm.astro`, `HeroSection.astro` |

**When do you edit `.astro` files vs. Markdown/YAML?**

- **Edit YAML** when changing site-wide data (company name, phone, CTAs, FAQs)
- **Edit Markdown** when changing service pages, blog posts, locations, or careers
- **Edit `.astro` files** only when changing the **structure or layout** of a page — for example, adding a new section to the About page or rearranging page components

For most day-to-day content updates, you'll work with YAML and Markdown. Astro files are for structural changes.

---

## Quick Reference

| Extension | What It Is | Where You'll Find It | How Often You'll Edit It |
|-----------|-----------|---------------------|------------------------|
| `.yaml` | Structured data (content and config) | `src/data/` | Frequently |
| `.md` | Formatted text with frontmatter | `src/content/` | Frequently |
| `.astro` | Page/component (HTML + JS combined) | `src/pages/`, `src/layouts/`, `src/components/` | Occasionally |
| `.css` | Styles and design tokens | `src/styles/` | Rarely (only for rebranding colors) |
| `.ts` | TypeScript (typed JavaScript) | `src/utils/`, `src/content.config.ts` | Rarely |
| `.js` / `.mjs` | JavaScript (config and tooling) | Project root (`astro.config.mjs`) | Rarely |
| `.json` | Tooling config | Project root (`package.json`, `tsconfig.json`) | Almost never |
| `.html` | Generated web pages | `dist/` (build output) | Never (auto-generated) |

---

## Next Steps

- [Content Updates Guide](/docs/content-updates/) — How to edit YAML and Markdown content files
- [Project Rebranding Guide](/docs/project-rebranding/) — How to update the CSS theme and branding data
