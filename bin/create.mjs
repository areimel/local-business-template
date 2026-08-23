#!/usr/bin/env node
/**
 * create.mjs — interactive scaffolder for the astro-local-business-template.
 *
 * Copies `template/` into a new project directory, then personalizes the
 * copy from interactive prompts (company info + a color theme). See
 * `bin/themes.mjs` for the theme preset data/contract this script relies on.
 *
 * Usage:
 *   npx @areimel/create-localbiz <target-dir> [flags]
 *
 * Flags (all optional — anything not supplied via flag falls back to a
 * prompt, unless --yes is passed and a default is available):
 *   --name=<company name>       --short=<short name>       --phone=<phone>
 *   --email=<email>             --city=<city>              --state=<state>
 *   --website=<https://...>     --theme=<slug|custom>
 *   --no-install (skip install) --yes (accept defaults)    --help, -h
 */

import * as fs from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import process from 'node:process';

import * as clack from '@clack/prompts';
import * as yaml from 'js-yaml';
import pc from 'picocolors';

import { themeChoices, themes, customThemeFromPrimary } from './themes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.resolve(__dirname, '../template');

// Directories/files excluded from the copy, matched by basename at any depth.
const EXCLUDED_NAMES = new Set([
  'node_modules', 'dist', '.astro', '.netlify', '.git', 'test-results', 'playwright-report',
]);

/* ------------------------------------------------------------------ */
/* Arg parsing                                                         */
/* ------------------------------------------------------------------ */

function printHelp() {
  console.log(`
Usage: create-astro-local-business <target-dir> [options]

Options:
  --name=<company name>       Company name
  --short=<short name>        Short company name (defaults to a derived form of --name)
  --phone=<phone number>      Contact phone, e.g. "(555) 123-4567"
  --email=<email address>     Contact email
  --city=<city>               Service area city
  --state=<state>             Service area state (e.g. "CA")
  --website=<url>             Company website, e.g. "https://acme.com"
  --theme=<slug|custom>       Color theme preset slug (or "custom")
  --no-install                Skip installing dependencies
  --yes                       Accept defaults / skip prompts where a value exists
  -h, --help                  Show this help message
`);
}

function parseArgs(argv) {
  const args = { _: [], flags: {} };
  for (const raw of argv) {
    if (raw === '-h' || raw === '--help') { args.flags.help = true; continue; }
    if (raw === '--no-install') { args.flags.noInstall = true; continue; }
    if (raw === '--yes') { args.flags.yes = true; continue; }
    const match = /^--([^=]+)=(.*)$/.exec(raw);
    if (match) args.flags[match[1]] = match[2];
    else if (!raw.startsWith('-')) args._.push(raw);
  }
  return args;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Bail out of a cancelled clack prompt. */
function bailIfCancel(value) {
  if (clack.isCancel(value)) {
    clack.cancel('Operation cancelled.');
    process.exit(0);
  }
  return value;
}

/**
 * Resolve one prompt value: use the flag if supplied, otherwise prompt via
 * clack.text (unless --yes is set and a default exists, in which case the
 * default is used silently). Handles cancellation itself.
 */
async function promptField(flags, { flagValue, message, placeholder, required = false, defaultValue }) {
  if (flagValue !== undefined) return flagValue;
  if (flags.yes && defaultValue !== undefined) return defaultValue;
  const answer = await clack.text({
    message,
    placeholder,
    defaultValue,
    validate: required ? (value) => { if (!value || !value.trim()) return 'This field is required.'; } : undefined,
  });
  const value = bailIfCancel(answer);
  return value || defaultValue || '';
}

/** Derive a short company name from the full name (first two words). */
function deriveShortName(name) {
  const words = name.trim().split(/\s+/);
  return words.length <= 2 ? name.trim() : words.slice(0, 2).join(' ');
}

/** Digits-only phone number for phoneRaw / tel: links. */
function digitsOnly(phone) {
  return phone.replace(/\D/g, '');
}

/** Recursive directory-emptiness check. */
function isDirNonEmpty(dir) {
  return fs.existsSync(dir) && fs.readdirSync(dir).length > 0;
}

/** Detect an available package manager, preferring pnpm. */
function detectPackageManager() {
  const has = (cmd) =>
    spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { stdio: 'ignore' }).status === 0;
  return has('pnpm') ? 'pnpm' : 'npm';
}

/* ------------------------------------------------------------------ */
/* Main                                                                 */
/* ------------------------------------------------------------------ */

async function main() {
  const { _: positional, flags } = parseArgs(process.argv.slice(2));

  if (flags.help) {
    printHelp();
    process.exit(0);
  }

  clack.intro(pc.bold('Create Astro Local Business Site'));

  // --- Target directory ---
  let targetDir = positional[0];
  if (!targetDir) {
    const answer = await clack.text({
      message: 'Where should we create your project?',
      placeholder: 'my-client-site',
      validate: (value) => { if (!value || !value.trim()) return 'A directory name is required.'; },
    });
    targetDir = bailIfCancel(answer);
  }
  const targetPath = path.resolve(process.cwd(), targetDir);

  if (isDirNonEmpty(targetPath)) {
    clack.log.error(
      `Target directory "${targetDir}" already exists and is not empty. Choose a different directory or remove its contents first.`
    );
    process.exit(1);
  }

  // --- Company info prompts ---
  const companyName = await promptField(flags, {
    flagValue: flags.name,
    message: 'What is your company name?',
    placeholder: 'Acme Heating & Air',
    required: true,
  });

  const companyNameShort = await promptField(flags, {
    flagValue: flags.short,
    message: 'Short company name (used in tight spaces like the header/logo)?',
    placeholder: deriveShortName(companyName),
    defaultValue: deriveShortName(companyName),
  });

  const phone = await promptField(flags, {
    flagValue: flags.phone,
    message: 'What is your company phone number?',
    placeholder: '(555) 123-4567',
    required: true,
  });
  const phoneRaw = digitsOnly(phone);

  const email = await promptField(flags, {
    flagValue: flags.email,
    message: 'What is your company contact email?',
    placeholder: 'info@acme.com',
    required: true,
  });

  const city = await promptField(flags, {
    flagValue: flags.city,
    message: 'What city is the business based in?',
    placeholder: 'Anytown',
  });

  const state = await promptField(flags, {
    flagValue: flags.state,
    message: 'What state (abbreviation)?',
    placeholder: 'ST',
  });

  const website = await promptField(flags, {
    flagValue: flags.website,
    message: 'What is the company website URL?',
    placeholder: 'https://acme.com',
  });

  // --- Theme ---
  let themeSlug = flags.theme;
  if (!themeSlug) {
    const options = [
      ...themeChoices,
      { value: 'custom', label: 'Custom color', hint: 'enter your own primary hex' },
    ];
    const answer = await clack.select({ message: 'Choose a color theme', options });
    themeSlug = bailIfCancel(answer);
  }

  let themeColors;
  if (themeSlug === 'custom') {
    const hexAnswer = await clack.text({
      message: 'Enter a primary hex color (e.g. #ff1100)',
      placeholder: '#ff1100',
      validate: (value) => {
        if (!/^#?[0-9a-fA-F]{6}$/.test(value || '')) return 'Enter a valid 6-digit hex color.';
      },
    });
    const hex = bailIfCancel(hexAnswer);
    themeColors = customThemeFromPrimary(hex.startsWith('#') ? hex : `#${hex}`);
  } else if (themes[themeSlug]) {
    themeColors = themes[themeSlug].colors;
  } else {
    clack.log.warn(`Unknown theme "${themeSlug}" — falling back to the first preset.`);
    themeSlug = themeChoices[0].value;
    themeColors = themes[themeSlug].colors;
  }

  // --- Install confirmation ---
  let shouldInstall = !flags.noInstall;
  if (shouldInstall && !flags.yes) {
    const answer = await clack.confirm({ message: 'Install dependencies now?', initialValue: true });
    shouldInstall = bailIfCancel(answer);
  }

  /* ------------------------------------------------------------------ */
  /* Copy template                                                       */
  /* ------------------------------------------------------------------ */

  const copySpinner = clack.spinner();
  copySpinner.start('Copying template files');
  try {
    await mkdir(targetPath, { recursive: true });
    await fs.promises.cp(TEMPLATE_DIR, targetPath, {
      recursive: true,
      filter: (source) => !EXCLUDED_NAMES.has(path.basename(source)),
    });
    copySpinner.stop('Template files copied.');
  } catch (err) {
    copySpinner.stop('Failed to copy template files.');
    clack.log.error(String(err && err.message ? err.message : err));
    process.exit(1);
  }

  // Rename dotfiles that can't ship as-is in the source tree.
  for (const [from, to] of [['_gitignore', '.gitignore'], ['_env.example', '.env.example']]) {
    const fromPath = path.join(targetPath, from);
    if (fs.existsSync(fromPath)) await fs.promises.rename(fromPath, path.join(targetPath, to));
  }

  /* ------------------------------------------------------------------ */
  /* Personalize branding.yaml / form-config.yaml / global.css           */
  /* ------------------------------------------------------------------ */

  const personalizeSpinner = clack.spinner();
  personalizeSpinner.start('Personalizing project files');

  // branding.yaml
  const brandingPath = path.join(targetPath, 'src/data/branding.yaml');
  const branding = yaml.load(await readFile(brandingPath, 'utf8'));

  branding.companyName = companyName;
  branding.companyNameShort = companyNameShort;
  branding.phone = phone;
  branding.phoneRaw = phoneRaw;
  branding.email = email;
  branding.website = website;

  if (branding.address) {
    if (city) branding.address.city = city;
    if (state) branding.address.state = state;
  }

  if (branding.seo) {
    branding.seo.titleTemplate = `%s | ${companyName}`;
    branding.seo.defaultTitle = `${companyName} | Local HVAC Experts`;
    branding.seo.defaultDescription = `${companyName} provides expert AC repair, installation, and maintenance${
      city ? ` to ${city} and the surrounding area` : ''
    }. Call ${phone}.`;
  }

  if (branding.theme) {
    branding.theme.primary = themeColors.primary;
    branding.theme.primaryDark = themeColors.primaryDark;
    branding.theme.secondary = themeColors.secondary;
    branding.theme.accent = themeColors.accent;
  }

  await writeFile(brandingPath, yaml.dump(branding, { lineWidth: -1, noRefs: true }), 'utf8');

  // form-config.yaml
  const formConfigPath = path.join(targetPath, 'src/data/form-config.yaml');
  const formConfig = yaml.load(await readFile(formConfigPath, 'utf8'));

  if (formConfig.profiles?.test) {
    formConfig.profiles.test.fromName = `${companyName} [TEST]`;
  }
  if (formConfig.profiles?.production) {
    formConfig.profiles.production.toEmail = [email];
    formConfig.profiles.production.fromEmail = email;
    formConfig.profiles.production.fromName = companyName;
  }

  await writeFile(formConfigPath, yaml.dump(formConfig, { lineWidth: -1, noRefs: true }), 'utf8');

  // global.css theme tokens (targeted regex replacement — not YAML)
  const cssPath = path.join(targetPath, 'src/styles/global.css');
  let css = await readFile(cssPath, 'utf8');

  const cssTokenReplacements = [
    ['primary', themeColors.primary],
    ['primary-dark', themeColors.primaryDark],
    ['primary-light', themeColors.primaryLight],
    ['secondary', themeColors.secondary],
    ['secondary-dark', themeColors.secondaryDark],
    ['secondary-light', themeColors.secondaryLight],
    ['accent', themeColors.accent],
    ['accent-dark', themeColors.accentDark],
    ['accent-light', themeColors.accentLight],
  ];
  for (const [token, value] of cssTokenReplacements) {
    // Match "  --color-<token>: #hex;" preserving whitespace, replacing only the value.
    const re = new RegExp(`(--color-${token}:\\s*)#[0-9a-fA-F]{3,8}(\\s*;)`);
    css = css.replace(re, `$1${value}$2`);
  }
  // --shadow-btn is intentionally left as-is (its rgba doesn't map 1:1 to a hex token).

  await writeFile(cssPath, css, 'utf8');

  personalizeSpinner.stop('Project files personalized.');

  /* ------------------------------------------------------------------ */
  /* Install dependencies                                                */
  /* ------------------------------------------------------------------ */

  if (shouldInstall) {
    const pm = detectPackageManager();
    const installSpinner = clack.spinner();
    installSpinner.start(`Installing dependencies with ${pm}`);
    const result = spawnSync(pm, ['install'], { cwd: targetPath, stdio: 'inherit' });
    if (result.status === 0) {
      installSpinner.stop('Dependencies installed.');
    } else {
      installSpinner.stop('Dependency installation failed.');
      clack.log.warn(`"${pm} install" exited with an error. You can retry manually: cd ${targetDir} && ${pm} install`);
    }
  } else {
    clack.log.info('Skipped dependency installation.');
  }

  /* ------------------------------------------------------------------ */
  /* Done                                                                */
  /* ------------------------------------------------------------------ */

  clack.outro(
    [
      pc.bold('Your project is ready!'),
      '',
      'Next steps:',
      `  cd ${targetDir}`,
      '  Add your SENDGRID_API_KEY to .env (copy from .env.example)',
      `  ${detectPackageManager()} dev`,
      '',
      'Then edit remaining content via the Pages CMS or the YAML files in src/data/.',
      'Demo/dev pages (docs, styleguide, animation examples, landing variants) are',
      'disabled by default for client handoff — re-enable them by flipping',
      '`devPages` / `demoPages` to true in src/data/features.yaml.',
    ].join('\n')
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
