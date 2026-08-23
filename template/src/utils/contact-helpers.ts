/**
 * Pure helper functions for the contact form API endpoint.
 * Extracted for unit testability — no Vite, Astro, or SendGrid imports.
 */

/** Field allowlist and order for notification emails. */
export const FIELD_ORDER = ['name', 'email', 'phone', 'service', 'message', 'preferred_date', 'consent'];

/** Returns an error string if the name is empty/missing, or null if valid. */
export function validateName(name: string | null | undefined): string | null {
  const trimmed = (name ?? '').trim();
  return trimmed ? null : 'Name is required';
}

/** Returns an error string if the email format is invalid, or null if valid/empty. */
export function validateEmail(email: string | null | undefined): string | null {
  const trimmed = (email ?? '').trim();
  if (!trimmed) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? null : 'Invalid email address';
}

/** Returns true if the honeypot was triggered (bot detected). */
export function isBot(botcheckValue: FormDataEntryValue | null): boolean {
  return !!botcheckValue;
}

/** Filters FormData to only include allowed fields, in order. */
export function filterFields(
  data: FormData,
  fieldOrder: string[] = FIELD_ORDER,
): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const key of fieldOrder) {
    const val = data.get(key);
    if (val !== null && typeof val === 'string' && val.trim()) {
      fields[key] = val;
    }
  }
  return fields;
}

/** Escapes HTML special characters. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Builds the HTML email body from filtered fields. */
export function buildEmailHtml(
  fields: Record<string, string>,
  companyName: string,
  website: string,
): string {
  const rows = Object.entries(fields)
    .map(([k, v]) => {
      const label = escapeHtml(
        k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      );
      const safe = v
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<tr>
        <td style="padding:10px 16px;font-weight:600;background:#f9fafb;border-bottom:1px solid #e5e7eb;width:35%;vertical-align:top">${label}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb">${safe}</td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;width:100%;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.12)">
        <tr>
          <td colspan="2" style="background:#ff1100;padding:28px 32px;text-align:center">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">New Contact Form Submission</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,.75);font-size:14px">${escapeHtml(companyName)}</p>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="background:#e6f7fd;border-left:4px solid #02c0f3;padding:14px 32px">
            <p style="margin:0;color:#0a6e8a;font-size:14px;font-weight:600">
              A new inquiry has been submitted via the website contact form. Please respond promptly.
            </p>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:8px 16px 24px">
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-top:16px">
              ${rows}
            </table>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center">
            <p style="margin:0;color:#6b7280;font-size:12px">
              This message was sent from the contact form at ${escapeHtml(website)}.
              Do not reply directly — use the Reply-To address to respond to the customer.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Builds the plain-text email body from filtered fields. */
export function buildEmailText(
  fields: Record<string, string>,
  companyName: string,
  website: string,
): string {
  const lines = Object.entries(fields).map(([k, v]) => {
    const label = k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `${label}: ${v}`;
  });
  return [
    'NEW CONTACT FORM SUBMISSION',
    companyName,
    '='.repeat(40),
    '',
    ...lines,
    '',
    '='.repeat(40),
    `Sent from ${website} contact form.`,
  ].join('\n');
}
