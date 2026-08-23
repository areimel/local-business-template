---
title: "Astro vs WordPress"
description: "Comparison of Astro and WordPress approaches for local business websites"
order: 9
---

# Astro vs. WordPress: Why We Use a Modern Framework

If you've built websites before, there's a good chance you've used WordPress. It powers a massive portion of the web, and tools like Elementor make it accessible to non-developers. So why does this project use Astro instead?

This document explains the fundamental differences between the two approaches, why modern Node-based frameworks like Astro offer significant advantages for this type of project, and when WordPress still has a role to play.

---

## The Two Approaches

At a high level, these are two fundamentally different ways to build a website:

**Traditional WordPress**
- A PHP-based CMS (Content Management System) running on a web server
- Content stored in a MySQL database
- Visual page builders like Elementor for drag-and-drop design
- Relies on themes and plugins for functionality
- Every page is assembled on the server each time a visitor requests it

**Modern Node Frameworks (Astro, Next.js, React, etc.)**
- JavaScript/TypeScript-based frameworks running on Node.js
- Content stored in files (Markdown, YAML, JSON) managed through Git
- Code-based design with full control over every element
- Built at compile time — the output is static HTML, CSS, and minimal JavaScript
- Pages are pre-built and served instantly from a CDN

---

## Comparison

### Performance & Speed

**WordPress:** Every page request triggers PHP execution and database queries on the server. The server assembles the HTML, applies the theme, loads plugin assets, and sends it to the browser. This takes time — typically 500ms to several seconds, depending on hosting quality, number of plugins, and caching configuration. You can improve this with caching plugins (WP Super Cache, W3 Total Cache), but you're adding complexity to compensate for an inherently slow architecture.

**Astro:** Pages are pre-built into static HTML during the build step. When a visitor requests a page, the server simply hands them a file — no PHP, no database queries, no server-side processing. Load times are typically under 100ms. There's nothing to cache because the pages are already built.

**Why this matters:** Google uses page speed as a ranking signal. Faster sites rank higher in search results and convert more visitors into customers. For a local business site where the goal is phone calls and form submissions, every millisecond counts.

---

### Security

**WordPress:** WordPress is the most targeted CMS on the internet. Its popularity makes it a prime target for automated attacks. Common vulnerabilities include:

- **Plugin vulnerabilities** — Third-party plugins are the #1 attack vector. A single outdated plugin can expose the entire site.
- **Login page attacks** — The `/wp-admin` login page is a known target for brute-force attacks.
- **Database injection** — SQL injection attacks target the MySQL database.
- **Theme exploits** — Nulled (pirated) themes often contain backdoors.
- Ongoing maintenance is required: WordPress core updates, plugin updates, PHP updates, database backups, security plugins, firewall rules.

**Astro (static site):** A static site has an extremely small attack surface:

- **No database** — Nothing to inject into.
- **No login page** — No admin panel to brute-force.
- **No server-side code** — No PHP or dynamic scripts to exploit.
- **No plugins with server access** — All functionality is baked in at build time.

The only server involved is a CDN serving static files. There's essentially nothing to hack.

> **Bottom line:** A static Astro site eliminates entire categories of security vulnerabilities that WordPress site owners spend significant time and money defending against.

---

### Scalability

**WordPress:** As traffic grows, the server needs to handle more PHP execution and database queries simultaneously. This means upgrading to more expensive hosting, adding database replicas, configuring load balancers, and managing server infrastructure. A traffic spike (like a viral social media post or a seasonal rush) can bring down a WordPress site if the server can't keep up.

**Astro:** Static files are served from a CDN (Content Delivery Network) — a global network of servers that deliver files from the location closest to the visitor. Serving static files is trivially cheap and fast. A CDN can handle millions of requests without any performance degradation. There's no database bottleneck, no server processing, and no scaling concerns.

A static site on Netlify's free tier can handle more traffic than a WordPress site on premium managed hosting.

---

### Customization & Control

**WordPress + Elementor:** Page builders give you a visual, drag-and-drop interface. This is great for getting something up quickly, but the trade-offs become apparent as you push further:

- **Constrained by the builder** — You can only do what the page builder and its widgets support. Unique layouts or interactions often require workarounds or custom CSS hacks.
- **Bloated output** — Page builders generate excessive HTML, inline styles, and JavaScript. A simple page might produce thousands of lines of unnecessary code.
- **Plugin dependency** — Features like forms, sliders, and animations each require separate plugins, creating dependency chains and potential conflicts.
- **Theme lock-in** — Switching themes often means rebuilding significant portions of the site.

**Astro:** You have complete control over every line of HTML, CSS, and JavaScript. There are no constraints from a page builder or theme system:

- **Clean output** — The built HTML is exactly what you wrote, with no bloat.
- **Any design is possible** — If you can design it, you can build it. No widget limitations.
- **Integrated tooling** — Tailwind CSS for styling, anime.js for animations, Astro components for reusable UI pieces — all working together natively, not as bolted-on plugins.
- **Consistency** — A component-based architecture ensures every page uses the same design patterns.

---

### Templatization & Rebranding

This is where the architectural difference really shines for an agency or developer building sites for multiple clients.

**WordPress:** Creating a truly reusable template is difficult:

- **Child themes** are fragile and tightly coupled to the parent theme. Updates to the parent can break the child.
- **Elementor templates** can be exported/imported, but they carry plugin-specific settings and often break across different WordPress installations.
- **Plugin configurations** don't transfer cleanly between sites. Each new site requires reconfiguring forms, SEO plugins, caching, security, etc.
- **Database-dependent** — Content is trapped in a MySQL database, making it hard to version-control or replicate programmatically.

**Astro (this project):** The entire site is a Git repository designed for cloning and rebranding:

- **Clone the repo** → **Edit YAML files** → **Replace logos** → **Deploy.** A complete rebrand takes 30–60 minutes.
- All content is in **version-controlled files** (Markdown and YAML), not locked in a database.
- **No plugin configurations** to recreate. Everything is in the code.
- The rebranding process is **documented and repeatable** (see [Project Rebranding Guide](/docs/project-rebranding/)).

This project exists specifically because the Astro approach makes templatization practical in a way WordPress never could.

---

### Development Speed

This one is more nuanced.

**WordPress:** Getting a basic site up and running is fast — install WordPress, pick a theme, activate Elementor, drag and drop some blocks, and you have a website in a few hours. For a single, one-off site with standard requirements, WordPress is hard to beat on initial setup speed.

However, speed decreases over time:
- Custom functionality requires PHP development or hunting for the right plugin
- Plugin conflicts create debugging sessions that consume hours
- Performance optimization is an ongoing battle
- Security maintenance is a recurring time cost

**Astro:** The initial learning curve is steeper — you need to understand HTML, CSS, JavaScript, and the Astro framework. Building the first site from scratch takes longer than dragging blocks in Elementor.

However, speed increases over time:
- Once the template exists (like this project), new sites are just rebrands — 30–60 minutes
- No plugin conflicts, no security patches, no performance tuning
- AI coding assistants like Claude Code can generate components, pages, and content rapidly
- Changes are predictable — edit a file, see the result, commit

**For a developer building multiple sites:** Astro is dramatically faster overall. The upfront investment in creating the template pays for itself after the second or third client site.

---

### Content Management

This is WordPress's genuine strength.

**WordPress:** The built-in admin dashboard gives non-technical users a familiar interface to:

- Write and publish blog posts with a visual editor
- Upload and manage images through a media library
- Edit page content without touching code
- Schedule posts, manage user roles, and moderate comments

**Astro:** Content is managed through Markdown files and YAML configs, edited in a code editor, and deployed through Git. This is efficient for developers but presents a barrier for non-technical clients who want to update their own content.

This is WordPress's clearest advantage — and it leads directly to the next section.

---

## The Best of Both Worlds: Headless WordPress

You don't have to choose one or the other entirely. **Headless WordPress** combines WordPress's content management strengths with Astro's frontend performance.

### What "Headless" Means

In a traditional WordPress setup, WordPress handles both the **backend** (content management, database) and the **frontend** (theme, HTML rendering). In a headless setup, you **decouple** these:

- **WordPress** handles the backend only — it's the content management system where clients write blog posts, update pages, and manage media
- **Astro** handles the frontend — it fetches content from WordPress via API and builds the static pages

The client gets the familiar WordPress admin panel. The visitors get a blazing-fast static site.

### How It Works

1. WordPress is installed on a separate server (or a managed WordPress host)
2. Content is created and managed through the standard WordPress admin dashboard
3. Astro fetches content from the **WordPress REST API** (or GraphQL via WPGraphQL plugin) at build time
4. Astro builds the static site with that content and deploys it to a CDN

The WordPress installation doesn't serve the public website — it's only used as a content backend.

### When to Consider It

- The client needs to **frequently update content** without developer involvement
- The client's team is already **familiar with WordPress**
- You want the **performance and security benefits** of a static frontend
- The site has a **blog or news section** with regular publishing

> **Note:** Headless WordPress adds architectural complexity — you're maintaining two systems instead of one. For sites where content changes infrequently (like most local business sites), managing content through Markdown files and a developer workflow is simpler and more cost-effective.

---

## When WordPress Still Makes Sense

Despite the advantages of modern frameworks, WordPress is still the right choice in some situations:

- **The site owner manages their own content** and has no developer available. WordPress's admin UI is purpose-built for non-technical users.
- **Budget is very limited.** A basic WordPress site with a commercial theme can be set up for the cost of hosting alone. No developer needed for basic changes.
- **E-commerce is the primary focus.** WooCommerce is a mature, feature-rich e-commerce platform. While headless commerce solutions exist, WooCommerce's ecosystem is hard to match for small businesses.
- **The project is a one-off site** with no plans for templatization or future client rebrands.

---

## Summary

| Category | WordPress + Elementor | Astro (This Project) |
|----------|----------------------|---------------------|
| **Performance** | Slow without caching plugins; server-rendered per request | Pre-built static HTML; sub-100ms loads |
| **Security** | Large attack surface; requires ongoing maintenance | Minimal attack surface; static files only |
| **Scalability** | Requires server upgrades as traffic grows | CDN serves static files; scales effortlessly |
| **Customization** | Limited by builder widgets and theme constraints | Full control over every line of code |
| **Templatization** | Difficult; themes and plugins don't transfer cleanly | Clone repo, edit YAML, deploy — 30–60 minutes |
| **Dev Speed (first site)** | Fast for basic sites; slows with customization | Steeper learning curve; faster with AI tools |
| **Dev Speed (repeat sites)** | Each site requires significant setup | Rebrand from template in under an hour |
| **Content Management** | Excellent built-in admin UI | File-based; requires developer or Git knowledge |
| **Maintenance** | Ongoing: core, plugin, PHP, and security updates | Minimal: no server-side software to update |
| **Cost** | Hosting + premium theme + premium plugins | Hosting is free or near-free (static CDN) |

---

## Next Steps

- [My Development Setup](/docs/my-setup/) — The tools and services used on this project
- [File Types Explained](/docs/file-types-explained/) — Understanding the file formats in a modern framework
- [Project Rebranding Guide](/docs/project-rebranding/) — See the templatization advantage in action
