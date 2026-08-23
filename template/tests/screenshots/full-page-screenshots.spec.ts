import { test } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { ALL_PAGES } from '../config/pages';
import { getRunTimestamp, pathToFilename } from '../helpers/timestamps';

for (const page of ALL_PAGES) {
  test(`screenshot: ${page.label} (${page.path})`, async ({ page: pwPage }, testInfo) => {
    const projectName = testInfo.project.name;
    const timestamp = getRunTimestamp();
    const outDir = path.join('test-results', 'screenshots', timestamp, projectName);
    fs.mkdirSync(outDir, { recursive: true });

    // Disable animations so elements render in their final state
    await pwPage.emulateMedia({ reducedMotion: 'reduce' });

    await pwPage.goto(page.path, { waitUntil: 'networkidle' });

    // Wait for self-hosted fonts to load (affects layout)
    await pwPage.evaluate(() => document.fonts.ready);

    const filename = `${pathToFilename(page.path)}.png`;
    await pwPage.screenshot({
      path: path.join(outDir, filename),
      fullPage: true,
    });
  });
}
