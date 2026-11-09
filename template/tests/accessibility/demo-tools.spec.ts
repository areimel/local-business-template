import { test, expect, type Page, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PANEL_ID = 'demo-tools-panel';
const THEME_KEY = 'demo-tools:theme';
const THEME_VARS_KEY = 'demo-tools:theme-vars';
const PRIMARY = '--color-primary';
const FOREST_GREEN_PRIMARY = '#2d6a4f';
const SITE_PRIMARY = '#ff1100';

const openButton = (page: Page) =>
  page.getByRole('button', { name: 'Open Demo Mode Tools' });

const panel = (page: Page) => page.locator(`#${PANEL_ID}`);

const sectionFor = (page: Page, href: string) =>
  page.locator('details.dmt-section', { has: page.locator(`a[href="${href}"]`) });

async function openPanel(page: Page) {
  await openButton(page).click();
  await expect(panel(page)).toBeVisible();
}

async function isPopoverOpen(locator: Locator) {
  return locator.evaluate((el) => el.matches(':popover-open'));
}

async function primaryVar(page: Page) {
  return page.evaluate(
    (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
    PRIMARY,
  );
}

test.describe('Demo Mode Tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('opens from the button and closes on Escape, returning focus to the button', async ({ page }) => {
    const button = openButton(page);
    await expect(button).toBeVisible();

    await button.click();
    expect(await isPopoverOpen(panel(page))).toBe(true);

    await page.keyboard.press('Escape');
    await expect(panel(page)).toBeHidden();
    expect(await isPopoverOpen(panel(page))).toBe(false);
    await expect(button).toBeFocused();
  });

  test('marks the current page and opens only its section', async ({ page }) => {
    await page.goto('/home-alt1/');
    await openPanel(page);

    const current = sectionFor(page, '/home-alt1/');
    await expect(current).toHaveAttribute('open', '');
    await expect(current.locator('a[href="/home-alt1/"]')).toHaveAttribute('aria-current', 'page');

    const other = sectionFor(page, '/landing/promo/');
    await expect(other).toHaveCount(1);
    await expect(other).not.toHaveAttribute('open', '');
  });

  test('clicking a closed section opens it without closing the open one', async ({ page }) => {
    await page.goto('/home-alt1/');
    await openPanel(page);

    const openSection = sectionFor(page, '/home-alt1/');
    const closedSection = sectionFor(page, '/landing/promo/');
    await expect(openSection).toHaveAttribute('open', '');
    await expect(closedSection).not.toHaveAttribute('open', '');

    await closedSection.locator('summary').click();

    await expect(closedSection).toHaveAttribute('open', '');
    await expect(openSection).toHaveAttribute('open', '');
  });

  test('Tools tab is selected with ArrowRight from the Pages tab', async ({ page }) => {
    await openPanel(page);

    const pagesTab = page.getByRole('tab', { name: 'Pages' });
    const toolsTab = page.getByRole('tab', { name: 'Tools' });

    await pagesTab.focus();
    await page.keyboard.press('ArrowRight');

    await expect(toolsTab).toHaveAttribute('aria-selected', 'true');
    await expect(toolsTab).toBeFocused();
    await expect(pagesTab).toHaveAttribute('aria-selected', 'false');
    await expect(page.locator('#dmt-tabpanel-tools')).toBeVisible();
    await expect(page.locator('#dmt-tabpanel-pages')).toBeHidden();
  });

  test('theme preset persists across reload and reset restores the site theme', async ({ page }) => {
    await openPanel(page);
    await page.getByRole('tab', { name: 'Tools' }).click();

    // Swatch radios are visually hidden; click the label that wraps them.
    await page.locator('label', { hasText: 'Forest Green' }).click();
    await expect(page.getByRole('radio', { name: 'Forest Green' })).toBeChecked();
    expect(await primaryVar(page)).toBe(FOREST_GREEN_PRIMARY);
    expect(await page.evaluate((k) => localStorage.getItem(k), THEME_VARS_KEY)).not.toBeNull();

    // Reload: the head script must apply the saved theme before the panel is opened.
    await page.reload();
    expect(await primaryVar(page)).toBe(FOREST_GREEN_PRIMARY);

    await openPanel(page);
    await page.getByRole('tab', { name: 'Tools' }).click();
    await page.getByRole('button', { name: 'Reset to site theme' }).click();

    expect(await primaryVar(page)).toBe(SITE_PRIMARY);
    expect(await page.evaluate((k) => localStorage.getItem(k), THEME_VARS_KEY)).toBeNull();
    expect(await page.evaluate((k) => localStorage.getItem(k), THEME_KEY)).toBeNull();
  });

  test('has no critical or serious WCAG A/AA violations in either tab', async ({ page }) => {
    await openPanel(page);

    const audit = async (label: string) => {
      const results = await new AxeBuilder({ page })
        .include(`#${PANEL_ID}`)
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const blocking = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      );
      if (results.violations.length > 0) {
        console.log(
          `[demo-tools a11y] ${label}: ${results.violations.length} violation(s)\n` +
            results.violations
              .map((v) => `  [${v.impact}] ${v.id}: ${v.nodes.length} node(s) — ${v.help}`)
              .join('\n'),
        );
      }
      return blocking;
    };

    const pagesBlocking = await audit('Pages tab');

    await page.getByRole('tab', { name: 'Tools' }).click();
    const toolsBlocking = await audit('Tools tab');

    expect(
      [...pagesBlocking, ...toolsBlocking].map((v) => `[${v.impact}] ${v.id}: ${v.description}`),
    ).toEqual([]);
  });
});
