import { test, expect } from '@playwright/test';

test.describe('Quick Contact Form — /faqs/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/faqs/', { waitUntil: 'networkidle' });
  });

  test('name and phone are required, service is NOT required', async ({ page }) => {
    const name = page.locator('#quick-contact-form input[name="name"]');
    const phone = page.locator('#quick-contact-form input[name="phone"]');
    const service = page.locator('#quick-contact-form select[name="service"]');

    await expect(name).toHaveAttribute('required', '');
    await expect(phone).toHaveAttribute('required', '');
    await expect(service).not.toHaveAttribute('required', '');
  });

  test('honeypot field exists, is checkbox, and is hidden', async ({ page }) => {
    const honeypot = page.locator('#quick-contact-form input[name="botcheck"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toHaveAttribute('type', 'checkbox');
    await expect(honeypot).not.toBeVisible();
  });

  test('successful submission shows inline success message', async ({ page }) => {
    await page.route('**/api/contact', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.fill('#quick-contact-form input[name="name"]', 'Jane Doe');
    await page.fill('#quick-contact-form input[name="phone"]', '(555) 987-6543');

    await page.check('#quick-contact-form input[name="consent"]');
    await page.click('#quick-submit-btn');

    const successMsg = page.locator('#quick-form-message-success');
    await expect(successMsg).toBeVisible({ timeout: 5000 });

    // Should still be on FAQs page
    expect(page.url()).toContain('/faqs');
  });

  test('failed submission shows error message', async ({ page }) => {
    await page.route('**/api/contact', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false }),
      });
    });

    await page.fill('#quick-contact-form input[name="name"]', 'Jane Doe');
    await page.fill('#quick-contact-form input[name="phone"]', '(555) 987-6543');

    await page.check('#quick-contact-form input[name="consent"]');
    await page.click('#quick-submit-btn');

    const errorMsg = page.locator('#quick-form-message-error');
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
  });
});
