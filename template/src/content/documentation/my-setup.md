---
title: "My Setup"
description: "Overview of development tools and services used in this project"
order: 2
---

# My Development Setup

This document describes the tools and services used to develop and maintain this project. New developers should set up the same (or equivalent) tools to ensure a consistent workflow and avoid compatibility issues.

> **Getting started?** See the [Initial Setup Guide](/docs/initial-setup/) for step-by-step installation instructions for Git, Node.js, pnpm, and VS Code.

---

## Code Editor: VS Code

**Visual Studio Code** is a free, open-source code editor with strong support for web development. It's the primary editor used on this project.

**Download:** [https://code.visualstudio.com](https://code.visualstudio.com)

### Required Extensions

Install these from the Extensions panel (`Ctrl+Shift+X`):

| Extension | Why It's Needed |
|-----------|----------------|
| **Astro** | Syntax highlighting, IntelliSense, and formatting for `.astro` files |
| **Tailwind CSS IntelliSense** | Auto-completes Tailwind class names, shows color previews on hover |
| **Prettier** | Automatic code formatting on save — keeps style consistent across the team |

### Recommended Extensions

These aren't required, but they make development faster:

| Extension | What It Does |
|-----------|-------------|
| **Error Lens** | Shows error and warning messages inline, right next to the code |
| **GitLens** | Shows who last edited each line and provides a richer Git history view |
| **YAML** | Syntax highlighting and validation for `.yaml` files |
| **Markdown Preview Enhanced** | Better preview for `.md` files |

### Suggested Settings

For consistency, consider enabling these in VS Code settings (`Ctrl+,`):

- **Format On Save** — Automatically formats files when you save (`editor.formatOnSave: true`)
- **Default Formatter** — Set Prettier as the default (`editor.defaultFormatter: "esbenp.prettier-vscode"`)
- **Tab Size** — Set to 2 spaces (`editor.tabSize: 2`) — matches the project's YAML and code indentation

---

## AI Assistant: Claude Code

**Claude Code** is a CLI-based AI coding assistant made by Anthropic. It's used extensively on this project for code generation, refactoring, debugging, and writing documentation (including these onboarding docs).

**Install:** [https://docs.anthropic.com/en/docs/claude-code](https://docs.anthropic.com/en/docs/claude-code)

### How It's Used on This Project

- **Code generation** — Building new components, pages, and features
- **Refactoring** — Restructuring code, extracting reusable components, enforcing DRY principles
- **Debugging** — Diagnosing build errors, fixing TypeScript issues, resolving styling problems
- **Documentation** — Writing and maintaining docs like CLAUDE.md and these onboarding guides
- **Content creation** — Generating placeholder content for service pages, FAQs, blog posts

### The CLAUDE.md File

The project root contains a `CLAUDE.md` file — this is a set of **project-specific instructions** that Claude Code reads automatically when working in this repository. It contains:

- Project architecture overview
- Coding conventions and naming rules
- Key file locations
- Common gotchas and important constraints

If you update the project's architecture or conventions, update `CLAUDE.md` to keep it in sync. This ensures Claude Code gives accurate suggestions to anyone on the team.

> **Tip:** When using Claude Code, be specific in your requests. Instead of "fix the page," say "fix the phone number link on the Contact page — it's using the wrong format for the `tel:` attribute." The more context you provide, the better the output.

---

## Package Manager: pnpm

**pnpm** is the package manager used for this project. It serves the same purpose as npm (which comes with Node.js), but with key advantages:

- **Faster installs** — pnpm reuses packages across projects, so dependencies install significantly faster
- **Stricter dependency resolution** — Prevents "phantom dependencies" (using a package without explicitly listing it), which can cause hard-to-find bugs
- **Disk-efficient** — Stores one copy of each package version on disk, even across multiple projects

**Install:**

```bash
npm install -g pnpm
```

### Key Commands

| Command | What It Does |
|---------|-------------|
| `pnpm install` | Install all project dependencies |
| `pnpm dev` | Start the local development server at `localhost:4321` |
| `pnpm build` | Create a production build in `./dist/` |
| `pnpm preview` | Preview the production build locally |
| `pnpm astro check` | Run TypeScript and Astro diagnostics |
| `pnpm compress-images` | Compress images larger than 1MB |

> **Important:** Always use `pnpm` for this project — not `npm` or `yarn`. The `pnpm-lock.yaml` lock file ensures everyone gets the exact same dependency versions.

---

## Framework: Astro

**Astro** is the web framework this project is built on. It's a static site generator that takes your components, pages, and content and builds them into fast, pre-rendered HTML at build time — no JavaScript is sent to the browser unless you specifically opt in.

**Version:** 5.x

**Website:** [https://astro.build](https://astro.build)

### Why Astro for This Project

- **Speed** — Pre-rendered static HTML loads instantly, which is critical for local business sites (visitors are often on mobile)
- **Content collections** — Built-in support for Markdown content with typed frontmatter schemas — perfect for service pages, blog posts, and location pages
- **File-based routing** — Files in `src/pages/` automatically become URL routes (e.g., `about.astro` → `/about/`)
- **Component-based** — Reusable `.astro` components keep the codebase organized and DRY
- **Zero JavaScript by default** — Pages ship as pure HTML/CSS unless interactivity is specifically added

### Key Concepts

| Concept | Location | Description |
|---------|----------|-------------|
| **Pages** | `src/pages/` | Each file becomes a route. `index.astro` → `/`, `about.astro` → `/about/` |
| **Layouts** | `src/layouts/` | Shared page shells (header, footer, `<head>` tags). Pages wrap themselves in a layout. |
| **Components** | `src/components/` | Reusable UI pieces (buttons, cards, forms, navigation) |
| **Content Collections** | `src/content/` | Markdown files with validated frontmatter schemas for services, blog, locations, careers |
| **Data Files** | `src/data/` | YAML config files for branding, CTAs, FAQs, navigation |

For more details on Astro's file format, see [File Types Explained](/docs/file-types-explained/#astro-astro).

---

## Styling: Tailwind CSS

**Tailwind CSS** is a utility-first CSS framework. Instead of writing custom CSS rules, you apply small, single-purpose classes directly in the HTML markup:

```html
<!-- Traditional CSS approach -->
<div class="hero-section">...</div>  <!-- then write .hero-section {} in a CSS file -->

<!-- Tailwind approach -->
<div class="bg-primary text-white py-16 px-4">...</div>  <!-- styles applied inline -->
```

**Version:** 4.x (CSS-first configuration)

**Website:** [https://tailwindcss.com](https://tailwindcss.com)

### How Theming Works

Tailwind v4 uses a **CSS-first** approach — there is no `tailwind.config.js` file. All design tokens (colors, fonts, spacing, etc.) are defined in `src/styles/global.css` inside a `@theme` block:

```css
@theme {
  --color-primary: #0066CC;
  --color-primary-dark: #004999;
  --color-secondary: #10B981;
  --font-heading: 'Outfit Variable', sans-serif;
  --font-body: 'Inter', sans-serif;
  /* ... more tokens */
}
```

These CSS custom properties automatically generate Tailwind utility classes. For example, `--color-primary` creates `bg-primary`, `text-primary`, `border-primary`, etc.

**To rebrand the color scheme**, you only need to change the hex values in this one file. See the [Project Rebranding Guide](/docs/project-rebranding/#step-2-customize-the-color-scheme) for details.

---

## Hosting: Netlify

**Netlify** is the hosting platform used to deploy and serve the live site. It connects directly to GitHub and automatically rebuilds the site whenever code is pushed.

**Website:** [https://www.netlify.com](https://www.netlify.com)

### Why Netlify

- **Automatic deployments** — Push to GitHub and the site updates within minutes
- **Free tier** — More than sufficient for small business sites
- **Custom domains** — Easy DNS configuration and free SSL certificates
- **Environment variables** — Securely store API keys and configuration outside the code
- **Deploy previews** — Each pull request gets its own preview URL for testing before merging

### The Deployment Flow

```
Local development
       ↓
  git push to GitHub
       ↓
  Netlify detects the push
       ↓
  Runs `pnpm build` automatically
       ↓
  Deploys the built site
       ↓
  Live at your custom domain
```

For full setup instructions including domain configuration and environment variables, see the [Project Hosting Guide](/docs/project-hosting/).

---

## Quick Reference

| Tool | Purpose | Install / Link |
|------|---------|---------------|
| **VS Code** | Code editor | [code.visualstudio.com](https://code.visualstudio.com) |
| **Claude Code** | AI coding assistant | [docs.anthropic.com](https://docs.anthropic.com/en/docs/claude-code) |
| **pnpm** | Package manager | `npm install -g pnpm` |
| **Astro 5.x** | Web framework / static site generator | Installed via `pnpm install` |
| **Tailwind CSS 4.x** | Utility-first CSS framework | Installed via `pnpm install` |
| **Netlify** | Hosting and deployment | [netlify.com](https://www.netlify.com) |
| **Git** | Version control | [git-scm.com](https://git-scm.com) |
| **Node.js** | JavaScript runtime | [nodejs.org](https://nodejs.org) |

---

## Next Steps

- [Initial Setup Guide](/docs/initial-setup/) — Install Git, Node.js, pnpm, and VS Code step by step
- [File Types Explained](/docs/file-types-explained/) — Understand the file formats used in this project
- [Git & GitHub Guidelines](/docs/git-guidelines/) — Branching strategy and workflow
