import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { ALL_PAGES } from '../config/pages';
import { getRunTimestamp, pathToFilename } from '../helpers/timestamps';

for (const entry of ALL_PAGES) {
  test(`a11y: ${entry.label} (${entry.path})`, async ({ page }) => {
    const timestamp = getRunTimestamp();
    const outDir = path.join('test-results', 'accessibility', timestamp);
    fs.mkdirSync(outDir, { recursive: true });

    await page.goto(entry.path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Save full JSON report
    const jsonFile = path.join(outDir, `${pathToFilename(entry.path)}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(results, null, 2));

    // Save human-readable summary if there are violations
    if (results.violations.length > 0) {
      const summary = results.violations.map((v) => {
        const nodes = v.nodes.map((n) => `    - ${n.html}`).join('\n');
        return `[${v.impact}] ${v.id}: ${v.description}\n  Help: ${v.helpUrl}\n  Affected nodes:\n${nodes}`;
      }).join('\n\n');

      const summaryFile = path.join(outDir, `${pathToFilename(entry.path)}-summary.txt`);
      fs.writeFileSync(summaryFile, `Accessibility Violations — ${entry.label} (${entry.path})\n${'='.repeat(60)}\n\n${summary}\n`);
    }

    // Only fail on critical or serious violations
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(
      criticalViolations,
      `Found ${criticalViolations.length} critical/serious a11y violations on ${entry.path}:\n` +
        criticalViolations.map((v) => `  [${v.impact}] ${v.id}: ${v.description}`).join('\n'),
    ).toHaveLength(0);
  });
}
