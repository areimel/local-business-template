# Contact Form System — Developer Reference

This document covers how the contact form system works, how to add or modify form fields, and what to watch out for when making changes.

---

## Overview

All contact forms POST to a single server-side endpoint: `/api/contact` (`src/pages/api/contact.ts`). This endpoint runs as a Netlify serverless function and sends a notification email to the business owner via SendGrid.

```
Browser form submit (multipart/form-data)
        │
        ▼
POST /api/contact  (Netlify function)
        │
        ├─ Honeypot check (botcheck field)
        ├─ Required field validation (name)
        ├─ Email format validation (if provided)
        ├─ Field allowlist filter (fieldOrder array)
        │
        ▼
SendGrid API → notification email → business inbox
```

---

## Forms in This Project

| Component | File | Used On | Fields |
|---|---|---|---|
| **ContactForm** | `src/components/FormComponents/ContactForm.astro` | `/contact` page | name, email, phone, service, message, consent |
| **QuickContactForm** | `src/components/FormComponents/QuickContactForm.astro` | Sidebar widgets | name, phone, service, consent |
| **HeroSlider** | `src/components/HomePageComponents/HeroSlider.astro` | Homepage hero | name, phone, service, preferred_date, consent |
| **CompactHeroWithForm** | `src/components/HomeAlt2Components/CompactHeroWithForm.astro` | Alt homepage hero | name, phone, service, preferred_date |
| **ServiceHero** | `src/components/InnerPageComponents/ServiceHero.astro` | Service page hero | name, phone, email, service |

All five forms share the same `/api/contact` endpoint. Every form must include the hidden `botcheck` honeypot field (see [Spam Protection](#spam-protection)).

---

## Field Reference

| Field name | Type | Required | Which forms | Notes |
|---|---|---|---|---|
| `name` | `text` | Yes (server-enforced) | All forms | Full name. Returns 422 if missing. |
| `email` | `email` | No | ContactForm, ServiceHero, HeroSlider | If provided, validated against basic format regex. Used as Reply-To address. |
| `phone` | `tel` | No (client-enforced on some forms) | All forms | No server-side format validation. |
| `service` | `select` | No | All forms | Values: `ac-repair`, `heating`, `other`. |
| `message` | `textarea` | No | ContactForm only | Free-form inquiry text. |
| `preferred_date` | `date` | No | HeroSlider, CompactHeroWithForm | HTML5 date input. Surfaces as `YYYY-MM-DD`. |
| `consent` | `checkbox` | No (client-enforced on some forms) | ContactForm, QuickContactForm, HeroSlider | SMS/text consent. Value is `on` when checked. Appears in email as "Consent: on". |
| `botcheck` | `checkbox` | — | All forms | Honeypot. Never appears in email (filtered by API). See [Spam Protection](#spam-protection). |

---

## The Field Allowlist

The endpoint uses an explicit allowlist to determine which submitted fields appear in the notification email:

```typescript
// src/pages/api/contact.ts
const fieldOrder = ['name', 'email', 'phone', 'service', 'message', 'preferred_date', 'consent'];
```

**Only fields named in this array will ever be included in the email.** Any other field submitted with the form is silently ignored. The order in this array also determines the order rows appear in the email.

This is a security measure: it prevents an attacker from submitting arbitrary field names containing HTML or other injection payloads that would be rendered in the business owner's email client.

---

## Adding a New Form Field

Follow these steps every time you add a new input to any form:

### Step 1 — Add the input to the form component

Add your new field to the relevant `.astro` form component(s). Use the existing form input components where possible:

```astro
<!-- TextInput example -->
<TextInput name="company" label="Company Name" type="text" />

<!-- SelectInput example -->
<SelectInput
  name="urgency"
  label="How urgent is this?"
  options={[
    { value: 'emergency', label: 'Emergency — same day' },
    { value: 'soon', label: 'Within a week' },
    { value: 'flexible', label: 'Flexible' },
  ]}
/>
```

The `name` attribute value is what gets submitted to the API and what you'll add to `fieldOrder` in Step 2.

### Step 2 — Add the field name to `fieldOrder` in `contact.ts`

Open `src/pages/api/contact.ts` and add your new field name to the `fieldOrder` array at the position you want it to appear in the email:

```typescript
const fieldOrder = [
  'name',
  'email',
  'phone',
  'service',
  'company',        // ← add your new field here
  'message',
  'preferred_date',
  'consent',
];
```

### Step 3 — Update this file

Add the new field to the tables in [Forms in This Project](#forms-in-this-project) and [Field Reference](#field-reference) above so future developers have accurate documentation.

> If you skip Step 2, the field will be silently ignored by the API and will never appear in the email.

---

## Spam Protection

Every form must include a hidden honeypot checkbox named `botcheck`:

```astro
<input type="checkbox" name="botcheck" class="hidden" tabindex="-1" aria-hidden="true" />
```

When a bot auto-fills all fields including hidden ones, `botcheck` will have the value `on`. The API checks for this and silently returns a `200 success` response without sending any email — the bot sees a success but no email is sent.

Human users never see or interact with this field, so it remains unchecked (null value), and the API proceeds normally.

**Never remove `botcheck` from a form.** Without it, bots will immediately start sending spam emails to the business owner's inbox.

---

## Server-Side Validation

The API enforces these rules:

| Rule | Field | Behaviour on failure |
|---|---|---|
| Required | `name` | Returns HTTP 422 with `{ success: false, error: 'Name is required' }` |
| Format | `email` | Returns HTTP 422 if provided and doesn't match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |

All other field validation (required phone, required service, etc.) is handled client-side in the form components via the `required` attribute and JavaScript. The API does not enforce these.

The form's submit button is disabled and a loading indicator is shown while the request is in flight. On a `200` response with `success: true`, a success message is shown. On any error, an error message is shown.

---

## Environment & Configuration

### API key (secret)

```bash
# .env (local development — gitignored)
SENDGRID_API_KEY=SG.your_key_here

# Netlify dashboard → Site configuration → Environment variables (production)
SENDGRID_API_KEY=SG.your_key_here
```

### Email addresses (non-secret, in form_config.yaml)

Email delivery settings use a profile system, allowing easy switching between test and production recipients:

```yaml
# src/data/form_config.yaml
activeProfile: "test"          # Switch to "production" before go-live

profiles:
  test:
    toEmail:
      - "you@example.com"
    fromEmail: "noreply@example.com"
    fromName: "Your Company Name [TEST]"

  production:
    toEmail:
      - "info@example.com"
    fromEmail: "noreply@example.com"
    fromName: "Your Company Name"
```

- **`activeProfile`**: Set to `"test"` during development, `"production"` before go-live.
- **`toEmail`**: One or more recipients for form submissions.
- **`fromEmail`**: Must be verified via SendGrid Sender Authentication before emails will be delivered. See [README.md](README.md#sendgrid-setup) for the full setup walkthrough.
- **`fromName`**: Display name shown in the recipient's email client.

---

## Testing

### Verify API key and sender address

Run the standalone verification script to confirm your SendGrid key is valid and the sender address is verified:

```bash
node --env-file=.env sendgrid-verify.mjs
```

This sends a test email to `sendgrid.toEmail` and prints a pass/fail result.

### Test a full form submission in development

1. Start the dev server: `pnpm dev`
2. Open `http://localhost:4321/contact`
3. Fill in the form and submit
4. Check the `sendgrid.toEmail` inbox for the notification email

The dev server uses the `SENDGRID_API_KEY` from your local `.env` file, so real emails are sent even in development.

### Verify the allowlist is working

To confirm the allowlist blocks arbitrary field names, you can test directly with curl:

```bash
# The injected field name should NOT appear in the received email
curl -X POST http://localhost:4321/api/contact \
  -F 'name=Test User' \
  -F 'phone=8135551234' \
  -F '<img src=x onerror=alert(1)>=should-be-blocked'
```

The response will be `{ "success": true }` (because name is provided), but the injected field will be absent from the email.
