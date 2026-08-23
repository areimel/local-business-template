import { test, chromium } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';
import * as path from 'node:path';
import * as fs from 'node:fs';
import lighthouseTargets from '../config/lighthouse-targets.json' with { type: 'json' };
import { getRunTimestamp, pathToFilename } from '../helpers/timestamps';

const PREVIEW_PORT = 4321;
const CDP_PORT = 9222;

for (const target of lighthouseTargets) {
  test(`lighthouse: ${target.label} (${target.path})`, async () => {
    const timestamp = getRunTimestamp();
    const outDir = path.join('test-results', 'lighthouse', timestamp);
    fs.mkdirSync(outDir, { recursive: true });

    // Launch Chromium with remote debugging for Lighthouse CDP access
    const browser = await chromium.launch({
      args: [`--remote-debugging-port=${CDP_PORT}`],
    });

    const page = await browser.newPage();
    await page.goto(`http://localhost:${PREVIEW_PORT}${target.path}`, {
      waitUntil: 'networkidle',
    });

    await playAudit({
      page,
      port: CDP_PORT,
      thresholds: {
        performance: 70,
        accessibility: 80,
        'best-practices': 80,
        seo: 80,
      },
      reports: {
        formats: { html: true },
        name: pathToFilename(target.path),
        directory: outDir,
      },
    });

    await browser.close();
  });
}
