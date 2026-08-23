# Repository Guidelines

## Project Structure & Module Organization

This is an Astro 5 local services website template. Source code lives in `src/`: pages in `src/pages/`, layouts in `src/layouts/`, reusable Astro components in `src/components/`, utilities in `src/utils/`, global styles in `src/styles/global.css`, and YAML site configuration in `src/data/`. Service pages are content-driven from Markdown under `src/content/services/`. Optimized images and logos live in `src/assets/`; static public files belong in `public/`. Tests are grouped by purpose under `tests/unit/`, `tests/forms/`, `tests/accessibility/`, `tests/screenshots/`, and `tests/lighthouse/`.

## Build, Test, and Development Commands

Use `pnpm` for dependency and script execution.

- `pnpm install` installs dependencies from `pnpm-lock.yaml`.
- `pnpm dev` starts the Astro dev server at `localhost:4321`.
- `pnpm build` creates the production build in `dist/`.
- `pnpm preview` serves the built site locally.
- `pnpm astro check` runs Astro and TypeScript validation.
- `pnpm test:unit` runs Vitest unit tests.
- `pnpm test:all` runs the full Playwright suite; targeted scripts include `test:forms`, `test:a11y`, `test:screenshots`, and `test:lighthouse`.

## Coding Style & Naming Conventions

Use TypeScript/ES modules and Astro single-file components. Follow existing formatting: two-space indentation, single quotes in TypeScript, and descriptive PascalCase component names such as `ContactForm.astro` or `ServiceHero.astro`. Keep route files lowercase and URL-oriented. Prefer the `@/*` alias for imports from `src/`. Tailwind CSS v4 tokens are defined in `src/styles/global.css`; reuse existing tokens and component patterns before adding new styling conventions.

## Testing Guidelines

Vitest runs Node-based unit tests matching `tests/unit/**/*.test.ts`. Playwright tests cover forms, accessibility, screenshots, and Lighthouse checks, with desktop, tablet, and mobile projects configured in `playwright.config.ts`. Add focused tests near the affected workflow, using `*.test.ts` for Vitest and `*.spec.ts` for Playwright. Run the narrowest relevant script before broad suites; run `pnpm build` when changing routing, content collections, or Netlify API behavior.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit-style messages such as `feat(popups): ...`, `docs(icons): ...`, and `Merge feat/...`. Keep commits scoped and imperative. Pull requests should summarize the user-facing change, list verification commands, link related issues, and include screenshots for visual changes across relevant breakpoints.

## Security & Configuration Tips

Do not commit secrets. Copy `.env.example` to `.env` locally and set `SENDGRID_API_KEY` there or in Netlify environment variables. Business identity, SendGrid sender details, navigation, CTAs, and service content are configured through YAML and Markdown files, so prefer data updates over hardcoding client-specific content in components.

## Pages CMS

Content editors manage the site through [Pages CMS](https://pagescms.org); `.pages.yml` at the repo root is the contract that defines which `src/data/*.yaml` files and content collections are editable and their field schemas. It is read only by the CMS app, not by the Astro build. **When you add or rename a data-file key or a `src/content.config.ts` field, update the matching model in `.pages.yml`** so the CMS stays in sync — fields not declared in the Astro schema are dropped at build, and data keys missing from `.pages.yml` are invisible to editors. See the "Pages CMS Integration" section of `README.md` for setup.
