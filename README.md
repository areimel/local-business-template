# @areimel/create-localbiz

Scaffold a brand-new local-business website from the bundled Astro template with a
single command. The CLI copies the template, prompts you for the client's brand basics and
a color theme, writes them into the new project, and installs dependencies — leaving a
ready-to-run Astro site.

---

## Usage

```bash
npx @areimel/create-localbiz my-client-site
```

You'll be prompted for:

| Prompt | Writes into |
| --- | --- |
| Company name | `branding.yaml` (name, SEO defaults), `form-config.yaml` (sender name) |
| Short company name | `branding.yaml` (used in tight header/logo spaces) |
| Phone number | `branding.yaml` (`phone` + digits-only `phoneRaw` for `tel:` links) |
| Contact email | `branding.yaml` + `form-config.yaml` production profile |
| City / State | `branding.yaml` address + SEO description |
| Website URL | `branding.yaml` |
| **Color theme** | `src/styles/global.css` `@theme` tokens (+ mirrored into `branding.yaml`) |

Then it copies the template, personalizes those files, and (optionally) installs deps.

### Non-interactive / scripted

Every prompt has a matching flag, so it also runs unattended:

```bash
npx @areimel/create-localbiz my-client-site \
  --name="Acme Heating & Air" --short="Acme" \
  --phone="(555) 123-4567" --email="info@acme.com" \
  --city="Springfield" --state="IL" --website="https://acme.com" \
  --theme=cool-blue --yes
```

| Flag | Effect |
| --- | --- |
| `--name` `--short` `--phone` `--email` `--city` `--state` `--website` | Provide a field, skip its prompt |
| `--theme=<slug>` | One of `red-cyan` (default), `cool-blue`, `forest-green`, `slate-navy`, `warm-orange`, or `custom` |
| `--no-install` | Skip installing dependencies |
| `--yes` | Accept defaults / skip prompts where a value or default exists |
| `-h`, `--help` | Show usage |

---

## After scaffolding

```bash
cd my-client-site
cp .env.example .env      # then add your SENDGRID_API_KEY
pnpm dev                  # http://localhost:4321
```

- **Content** is edited through the Pages CMS (`.pages.yml`) or directly in the
  `src/data/*.yaml` and `src/content/**` files. See the template's own `CLAUDE.md` and
  `FORM_SETUP_README.md` (both copied into the new project) for the full guide.
- **Demo / dev pages** (internal docs, styleguide, animation examples, home-design
  variants, industry demos, `/landing/*` one-pagers, and the floating Demo Mode Tools widget)
  ship **disabled**. To browse them while building, flip `devPages` / `demoPages` to
  `true` in `src/data/features.yaml` and restart `pnpm dev`. Leave them `false` for the
  client's production site.

---

## Repository layout

This repo is both the CLI package and the template it ships:

```
.
├── bin/
│   ├── create.mjs        # the interactive scaffolder (package `bin`)
│   └── themes.mjs        # color-theme presets + custom-color derivation
├── template/             # the entire Astro site, copied on scaffold
│   ├── src/  public/  scripts/  tests/
│   ├── _gitignore        # → renamed to .gitignore in the scaffolded project
│   ├── _env.example      # → renamed to .env.example
│   └── package.json      # the site's own dependencies
├── package.json          # the published CLI package (@areimel/create-localbiz)
└── .github/workflows/publish.yml
```

To work on the template itself: `cd template && pnpm install && pnpm dev`.

---

## Publishing a new version

Publishing is automated via GitHub Actions on a version tag:

```bash
# bump the CLI version in package.json (root), commit, then:
git tag v1.0.0
git push origin v1.0.0
```

Pushing a `v*` tag triggers the `.github/workflows/publish.yml` workflow, which builds and
publishes the package to the public npm registry (`registry.npmjs.org`) using an `NPM_TOKEN`
repository secret (an npm **Automation** token). This token must be created on
[npmjs.com](https://www.npmjs.com/) and added once under the repo's **Settings → Secrets and
variables → Actions**. Confirm the new release afterward at
<https://www.npmjs.com/package/@areimel/create-localbiz>.

Adjusting `template/` (the site) does **not** need a version bump on its own, but any change
you want scaffolded going forward must be committed before you tag a new CLI release, since
the template ships inside the CLI package tarball.

---

## License

MIT © [Alec Reimel](https://alecreimel.com)
