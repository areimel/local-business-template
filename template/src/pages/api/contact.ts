import type { APIRoute } from 'astro';
import sgMail from '@sendgrid/mail';
import { load as parseYaml } from 'js-yaml';
// Vite inlines YAML content at build time — safe for Netlify serverless
import brandingRaw from '../../data/branding.yaml?raw';
import formConfigRaw from '../../data/form-config.yaml?raw';

const { companyName, website } = parseYaml(brandingRaw) as {
  companyName: string;
  website: string;
};

const formConfig = parseYaml(formConfigRaw) as {
  activeProfile: string;
  profiles: Record<string, { toEmail: string | string[]; fromEmail: string; fromName: string }>;
};
const sg = formConfig.profiles[formConfig.activeProfile];

export const prerender = false;

function buildEmailHtml(fields: Record<string, string>): string {
  const rows = Object.entries(fields)
    .map(([k, v]) => {
      const label = k
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
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
            <p style="margin:6px 0 0;color:rgba(255,255,255,.75);font-size:14px">${companyName}</p>
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
              This message was sent from the contact form at ${website}.
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

function buildEmailText(fields: Record<string, string>): string {
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

export const POST: APIRoute = async ({ request }) => {
  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Honeypot: bots check the checkbox ("on"); humans leave it unchecked (null)
  if (data.get('botcheck')) {
    return new Response(JSON.stringify({ success: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const name = (data.get('name') as string | null)?.trim() ?? '';
  const email = (data.get('email') as string | null)?.trim() ?? '';

  if (!name) {
    return new Response(JSON.stringify({ success: false, error: 'Name is required' }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid email address' }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const fields: Record<string, string> = {};

  // Security: only fields explicitly listed here will appear in the notification email.
  // To add a new form field, add its name= attribute to the form component AND add the
  // field name to this array. See FORM_SETUP_README.md for the complete field reference.
  const fieldOrder = ['name', 'email', 'phone', 'service', 'message', 'preferred_date', 'consent'];
  for (const key of fieldOrder) {
    const val = data.get(key);
    if (val !== null && typeof val === 'string' && val.trim()) {
      fields[key] = val;
    }
  }

  const apiKey = import.meta.env.SENDGRID_API_KEY;

  if (!apiKey) {
    console.error('[contact] Missing SENDGRID_API_KEY environment variable');
    return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  sgMail.setApiKey(apiKey);

  if (!sg) {
    console.error(`[contact] Unknown SendGrid profile: "${formConfig.activeProfile}"`);
    return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const msg = {
    to: sg.toEmail,
    from: { email: sg.fromEmail, name: sg.fromName },
    ...(email ? { replyTo: { email, name } } : {}),
    subject: `New Contact Form Submission - ${companyName}`,
    text: buildEmailText(fields),
    html: buildEmailHtml(fields),
  };

  try {
    await sgMail.send(msg);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[contact] SendGrid error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Failed to send email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
