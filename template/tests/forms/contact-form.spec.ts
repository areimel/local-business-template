import { test, expect } from '@playwright/test';

// ─── Contact page tests (has redirectUrl="/thank-you/") ─────────────

test.describe('Contact Form — /contact/ (with redirect)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact/', { waitUntil: 'networkidle' });
  });

  test('required fields trigger HTML5 validation on empty submit', async ({ page }) => {
    await page.click('#contact-submit-btn');
    // Form should NOT have navigated — still on /contact/
    expect(page.url()).toContain('/contact');

    // Check that required fields exist with required attribute
    const name = page.locator('#contact-form input[name="name"]');
    const email = page.locator('#contact-form input[name="email"]');
    const service = page.locator('#contact-form select[name="service"]');

    await expect(name).toHaveAttribute('required', '');
    await expect(email).toHaveAttribute('required', '');
    await expect(service).toHaveAttribute('required', '');
  });

  test('phone field is NOT required', async ({ page }) => {
    const phone = page.locator('#contact-form input[name="phone"]');
    await expect(phone).not.toHaveAttribute('required', '');
  });

  test('email field validates format', async ({ page }) => {
    const emailInput = page.locator('#contact-form input[name="email"]');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('honeypot field exists, is checkbox, and is hidden', async ({ page }) => {
    const honeypot = page.locator('#contact-form input[name="botcheck"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toHaveAttribute('type', 'checkbox');
    await expect(honeypot).not.toBeVisible();
  });

  test('redirect URL is set in form data attribute', async ({ page }) => {
    const form = page.locator('#contact-form');
    await expect(form).toHaveAttribute('data-redirect', '/thank-you/');
  });

  test('successful submission redirects to /thank-you/', async ({ page }) => {
    // Mock Web3Forms API
    await page.route('**/api/contact', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Fill the form
    await page.fill('#contact-form input[name="name"]', 'John Smith');
    await page.fill('#contact-form input[name="email"]', 'john@example.com');
    await page.fill('#contact-form input[name="phone"]', '(555) 123-4567');
    await page.selectOption('#contact-form select[name="service"]', 'ac-repair');
    await page.fill('#contact-form textarea[name="message"]', 'Test message');

    await page.check('#contact-form input[name="consent"]');
    await page.click('#contact-submit-btn');
    await page.waitForURL('**/thank-you/');

    expect(page.url()).toContain('/thank-you');
  });

  test('failed submission shows error message', async ({ page }) => {
    // Mock Web3Forms API with error
    await page.route('**/api/contact', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false }),
      });
    });

    await page.fill('#contact-form input[name="name"]', 'John Smith');
    await page.fill('#contact-form input[name="email"]', 'john@example.com');
    await page.selectOption('#contact-form select[name="service"]', 'ac-repair');

    await page.check('#contact-form input[name="consent"]');
    await page.click('#contact-submit-btn');

    const errorMsg = page.locator('#contact-form-message-error');
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
  });

  test('loading state shows "Sending..." and disables button', async ({ page }) => {
    // Mock with a delayed response
    await page.route('**/api/contact', async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.fill('#contact-form input[name="name"]', 'John Smith');
    await page.fill('#contact-form input[name="email"]', 'john@example.com');
    await page.selectOption('#contact-form select[name="service"]', 'ac-repair');

    await page.check('#contact-form input[name="consent"]');
    await page.click('#contact-submit-btn');

    const btn = page.locator('#contact-submit-btn');
    await expect(btn).toBeDisabled();
    await expect(btn).toContainText('Sending...');
  });
});

// ─── Homepage tests (inline success, no redirect) ───────────────────

test.describe('Contact Form — / (inline success)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('successful submission shows inline success message', async ({ page }) => {
    // Mock Web3Forms API
    await page.route('**/api/contact', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.fill('#contact-form input[name="name"]', 'Jane Doe');
    await page.fill('#contact-form input[name="email"]', 'jane@example.com');
    await page.selectOption('#contact-form select[name="service"]', 'heating');

    await page.check('#contact-form input[name="consent"]');
    await page.click('#contact-submit-btn');

    const successMsg = page.locator('#contact-form-message-success');
    await expect(successMsg).toBeVisible({ timeout: 5000 });

    // Should still be on homepage
    expect(page.url()).toMatch(/\/$/);
  });
});
