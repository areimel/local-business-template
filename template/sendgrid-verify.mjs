/**
 * SendGrid API Key Verification Script
 *
 * Sends a test email using your current branding.yaml configuration to confirm
 * the API key is valid and the sender address is verified in SendGrid.
 *
 * Usage:
 *   node --env-file=.env sendgrid-verify.mjs
 *
 * Requires Node.js 20+ (for the --env-file flag).
 */

import sgMail from '@sendgrid/mail';
import { readFileSync } from 'node:fs';
import { load as parseYaml } from 'js-yaml';

// ── 1. Check API key ────────────────────────────────────────────────────────

const apiKey = process.env.SENDGRID_API_KEY;

if (!apiKey) {
  console.error('ERROR: SENDGRID_API_KEY is not set.');
  console.error('Run this script with:  node --env-file=.env sendgrid-verify.mjs');
  process.exit(1);
}

// ── 2. Load email addresses from form_config.yaml + branding.yaml ───────────

let formConfig;
try {
  formConfig = parseYaml(readFileSync('src/data/form_config.yaml', 'utf-8'));
} catch (err) {
  console.error('ERROR: Could not read src/data/form_config.yaml');
  console.error(err.message);
  process.exit(1);
}

let branding;
try {
  branding = parseYaml(readFileSync('src/data/branding.yaml', 'utf-8'));
} catch (err) {
  console.error('ERROR: Could not read src/data/branding.yaml');
  console.error(err.message);
  process.exit(1);
}

const { companyName } = branding;
const sg = formConfig.profiles[formConfig.activeProfile];

if (!sg) {
  console.error(`ERROR: Unknown profile "${formConfig.activeProfile}" in form_config.yaml`);
  console.error(`Available profiles: ${Object.keys(formConfig.profiles).join(', ')}`);
  process.exit(1);
}

if (!sg.toEmail || !sg.fromEmail) {
  console.error(`ERROR: Profile "${formConfig.activeProfile}" is missing toEmail or fromEmail`);
  process.exit(1);
}

// ── 3. Print config summary ─────────────────────────────────────────────────

console.log('');
console.log('SendGrid Verification');
console.log('─'.repeat(40));
console.log(`  API key : ${apiKey.slice(0, 14)}...`);
console.log(`  From    : ${sg.fromEmail} (${sg.fromName})`);
console.log(`  To      : ${sg.toEmail}`);
console.log(`  Subject : SendGrid Verification — ${companyName}`);
console.log('');
console.log('Sending test email...');

// ── 4. Send the test email ──────────────────────────────────────────────────

sgMail.setApiKey(apiKey);

const msg = {
  to: sg.toEmail,
  from: { email: sg.fromEmail, name: sg.fromName },
  subject: `SendGrid Verification — ${companyName}`,
  text: [
    `This is a test email confirming your SendGrid integration is working correctly.`,
    ``,
    `Configuration:`,
    `  Company : ${companyName}`,
    `  API key : ${apiKey.slice(0, 14)}...`,
    `  From    : ${sg.fromEmail}`,
    `  To      : ${sg.toEmail}`,
    ``,
    `If you received this, your SendGrid setup is ready for production.`,
  ].join('\n'),
  html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:32px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.12)">
    <tr>
      <td style="background:#ff1100;padding:24px 32px;text-align:center">
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700">SendGrid Verification</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,.75);font-size:14px">${companyName}</p>
      </td>
    </tr>
    <tr>
      <td style="background:#e6f7fd;border-left:4px solid #02c0f3;padding:14px 32px">
        <p style="margin:0;color:#0a6e8a;font-size:14px;font-weight:600">
          Your SendGrid API key is working correctly.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 32px">
        <p style="margin:0 0 16px;color:#374151">This test email confirms your integration is ready for production.</p>
        <table style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;width:100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:10px 16px;font-weight:600;background:#f9fafb;border-bottom:1px solid #e5e7eb;width:35%">API Key</td>
            <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:13px">${apiKey.slice(0, 14)}...</td>
          </tr>
          <tr>
            <td style="padding:10px 16px;font-weight:600;background:#f9fafb;border-bottom:1px solid #e5e7eb">From</td>
            <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb">${sg.fromEmail}</td>
          </tr>
          <tr>
            <td style="padding:10px 16px;font-weight:600;background:#f9fafb">To</td>
            <td style="padding:10px 16px">${sg.toEmail}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
};

sgMail
  .send(msg)
  .then(() => {
    console.log(`SUCCESS: Verification email sent to ${sg.toEmail}`);
    console.log('Check your inbox to confirm delivery.');
    console.log('');
  })
  .catch((err) => {
    console.error('FAILED: SendGrid rejected the request.');
    const body = err.response?.body;
    if (body?.errors?.length) {
      body.errors.forEach((e) => console.error(' ', e.message));
    } else {
      console.error(' ', err.message);
    }
    console.error('');
    console.error('Common causes:');
    console.error('  - The sender address is not verified in SendGrid (Settings → Sender Authentication)');
    console.error('  - The API key does not have Mail Send permissions');
    console.error('  - The API key is invalid or has been revoked');
    process.exit(1);
  });
