import { describe, it, expect } from 'vitest';
import {
  validateName,
  validateEmail,
  isBot,
  filterFields,
  buildEmailHtml,
  buildEmailText,
  FIELD_ORDER,
} from '@/utils/contact-helpers';

// ─── Validation ─────────────────────────────────────────────────────────────

describe('validateName()', () => {
  it('returns error for empty string', () => {
    expect(validateName('')).toBe('Name is required');
  });

  it('returns error for whitespace-only', () => {
    expect(validateName('   ')).toBe('Name is required');
  });

  it('returns error for null', () => {
    expect(validateName(null)).toBe('Name is required');
  });

  it('returns error for undefined', () => {
    expect(validateName(undefined)).toBe('Name is required');
  });

  it('returns null for valid name', () => {
    expect(validateName('John Smith')).toBeNull();
  });
});

describe('validateEmail()', () => {
  it('returns null for empty string (email is optional)', () => {
    expect(validateEmail('')).toBeNull();
  });

  it('returns null for null', () => {
    expect(validateEmail(null)).toBeNull();
  });

  it('returns null for valid email', () => {
    expect(validateEmail('john@example.com')).toBeNull();
  });

  it('returns error for invalid email without @', () => {
    expect(validateEmail('not-an-email')).toBe('Invalid email address');
  });

  it('returns error for email without domain', () => {
    expect(validateEmail('user@')).toBe('Invalid email address');
  });

  it('returns error for email without TLD', () => {
    expect(validateEmail('user@domain')).toBe('Invalid email address');
  });

  it('returns error for email with spaces', () => {
    expect(validateEmail('user @example.com')).toBe('Invalid email address');
  });
});

// ─── Honeypot ───────────────────────────────────────────────────────────────

describe('isBot()', () => {
  it('returns true when botcheck has a value', () => {
    expect(isBot('on')).toBe(true);
  });

  it('returns false when botcheck is null', () => {
    expect(isBot(null)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isBot('')).toBe(false);
  });
});

// ─── Field Filtering ────────────────────────────────────────────────────────

describe('filterFields()', () => {
  function makeFormData(entries: Record<string, string>): FormData {
    const fd = new FormData();
    for (const [k, v] of Object.entries(entries)) {
      fd.append(k, v);
    }
    return fd;
  }

  it('returns only allowlisted fields', () => {
    const fd = makeFormData({
      name: 'John',
      email: 'john@example.com',
      injected_field: 'malicious',
      __proto__: 'hack',
    });
    const result = filterFields(fd);
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('email');
    expect(result).not.toHaveProperty('injected_field');
    expect(result).not.toHaveProperty('__proto__');
  });

  it('preserves field order', () => {
    const fd = makeFormData({
      message: 'Hello',
      name: 'John',
      email: 'john@example.com',
      phone: '555-1234',
    });
    const result = filterFields(fd);
    const keys = Object.keys(result);
    expect(keys.indexOf('name')).toBeLessThan(keys.indexOf('email'));
    expect(keys.indexOf('email')).toBeLessThan(keys.indexOf('phone'));
    expect(keys.indexOf('phone')).toBeLessThan(keys.indexOf('message'));
  });

  it('skips empty/whitespace-only values', () => {
    const fd = makeFormData({ name: 'John', email: '   ', phone: '' });
    const result = filterFields(fd);
    expect(result).toHaveProperty('name');
    expect(result).not.toHaveProperty('email');
    expect(result).not.toHaveProperty('phone');
  });

  it('accepts custom field order', () => {
    const fd = makeFormData({ name: 'John', custom: 'value' });
    const result = filterFields(fd, ['custom', 'name']);
    expect(Object.keys(result)).toEqual(['custom', 'name']);
  });

  it('FIELD_ORDER matches the API endpoint allowlist', () => {
    expect(FIELD_ORDER).toEqual([
      'name', 'email', 'phone', 'service', 'message', 'preferred_date', 'consent',
    ]);
  });
});

// ─── Email Construction ─────────────────────────────────────────────────────

describe('buildEmailHtml()', () => {
  const fields = { name: 'John', email: 'john@example.com' };
  const company = 'Test Co';
  const site = 'https://test.com';

  it('contains the company name', () => {
    const html = buildEmailHtml(fields, company, site);
    expect(html).toContain('Test Co');
  });

  it('contains the website URL', () => {
    const html = buildEmailHtml(fields, company, site);
    expect(html).toContain('https://test.com');
  });

  it('contains field labels and values', () => {
    const html = buildEmailHtml(fields, company, site);
    expect(html).toContain('Name');
    expect(html).toContain('John');
    expect(html).toContain('Email');
    expect(html).toContain('john@example.com');
  });

  it('escapes HTML special characters in values', () => {
    const xssFields = { name: '<script>alert("xss")</script>' };
    const html = buildEmailHtml(xssFields, company, site);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('escapes HTML in company name', () => {
    const html = buildEmailHtml(fields, 'A & B "Heating"', site);
    expect(html).toContain('A &amp; B &quot;Heating&quot;');
  });

  it('converts underscore field names to title case', () => {
    const html = buildEmailHtml({ preferred_date: '2025-01-01' }, company, site);
    expect(html).toContain('Preferred Date');
  });

  it('returns valid HTML document', () => {
    const html = buildEmailHtml(fields, company, site);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
  });
});

describe('buildEmailText()', () => {
  const fields = { name: 'John', email: 'john@example.com', message: 'Hello there' };
  const company = 'Test Co';
  const site = 'https://test.com';

  it('contains the company name', () => {
    const text = buildEmailText(fields, company, site);
    expect(text).toContain('Test Co');
  });

  it('contains the website URL', () => {
    const text = buildEmailText(fields, company, site);
    expect(text).toContain('https://test.com');
  });

  it('contains all field values', () => {
    const text = buildEmailText(fields, company, site);
    expect(text).toContain('Name: John');
    expect(text).toContain('Email: john@example.com');
    expect(text).toContain('Message: Hello there');
  });

  it('contains header and separator', () => {
    const text = buildEmailText(fields, company, site);
    expect(text).toContain('NEW CONTACT FORM SUBMISSION');
    expect(text).toContain('='.repeat(40));
  });

  it('converts underscore field names to title case', () => {
    const text = buildEmailText({ preferred_date: '2025-01-01' }, company, site);
    expect(text).toContain('Preferred Date: 2025-01-01');
  });
});
