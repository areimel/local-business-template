---
title: "Project Hosting"
description: "Netlify deployment, environment variables, custom domains, and DNS setup"
order: 8
---

# Project Hosting Guide

This guide walks you through deploying the site to **Netlify**, connecting a custom domain, and configuring the environment variables needed for production.

> **Prerequisites:**
> - You've completed the [Initial Setup Guide](/docs/initial-setup/) and the project runs locally
> - The project code is pushed to a **GitHub repository**
> - You have (or will register) a domain name for the site

---

## Overview

**Netlify** is a web hosting platform that connects directly to your GitHub repository. Once connected, the workflow is:

1. You push code changes to GitHub
2. Netlify automatically detects the push, builds the site, and deploys it
3. The updated site is live within a couple of minutes

This project is already pre-configured for Netlify — the `@astrojs/netlify` adapter is installed and set up in the project config. You don't need to install or configure anything extra in the code.

---

## Step 1: Create a Netlify Account

1. Go to [https://www.netlify.com](https://www.netlify.com)
2. Click **Sign up**
3. Choose **Sign up with GitHub** — this is the easiest option because it links your GitHub account automatically, which you'll need in the next step

> **Tip:** Netlify's free tier is more than sufficient for most small business sites. You don't need a paid plan to get started.

---

## Step 2: Connect Your GitHub Repository

Once you're logged into Netlify:

1. Click **Add new site** from the dashboard
2. Select **Import an existing project**
3. Choose **GitHub** as the Git provider
4. If prompted, **authorize Netlify** to access your GitHub repositories
5. Find and select your project's repository from the list

### Configure Build Settings

Netlify will show you a build configuration screen. It usually auto-detects the correct settings for Astro projects, but verify these values:

| Setting | Value |
|---------|-------|
| **Branch to deploy** | `main` (or your primary branch) |
| **Build command** | `pnpm build` |
| **Publish directory** | `dist` |

> **Note:** Netlify automatically detects that this project uses **pnpm** from the lock file (`pnpm-lock.yaml`). You don't need to install pnpm separately on Netlify — it handles this for you.

6. Click **Deploy site**

The first build will take a minute or two. Once it finishes, Netlify assigns your site a temporary URL like `random-name-12345.netlify.app`. Click it to verify the site loads.

> **If the build fails:** Click into the failed deploy to view the build logs. The most common issue is missing environment variables — which we'll set up in the next step. Check the [Troubleshooting](#troubleshooting) section at the bottom for more help.

---

## Step 3: Set Up Environment Variables

Environment variables are settings that live outside your code — things like API keys and mode switches that may differ between your local development setup and the live production site. They're kept out of the code for security (so API keys aren't exposed in your GitHub repository).

### Where to Find Them in Netlify

1. Go to your site in the Netlify dashboard
2. Click **Site configuration** (in the left sidebar)
3. Click **Environment variables**
4. Click **Add a variable**

### Variables to Set

The project uses a `.env.example` file as a reference for all available variables. Here's what each one does:

#### FORM_MODE (Required)

| Key | Value |
|-----|-------|
| `FORM_MODE` | `production` |

This controls which email profile the contact forms use. When set to `test`, form submissions go to a developer test inbox. When set to `production`, they go to the client's real inbox.

- **On your local machine** (in your `.env` file): Keep this as `test` so form submissions during development don't reach the client.
- **On Netlify**: Set this to `production` so real visitors' form submissions are delivered properly.

> **Important:** This variable is evaluated at **build time** — if you change it, you need to trigger a new deploy for the change to take effect.

#### SENDGRID_API_KEY (Required for forms)

| Key | Value |
|-----|-------|
| `SENDGRID_API_KEY` | Your API key from [SendGrid](https://app.sendgrid.com/settings/api_keys) |

This is the API key that authorizes the site to send form submissions through SendGrid. To get a key:

1. Go to [https://app.sendgrid.com/settings/api_keys](https://app.sendgrid.com/settings/api_keys)
2. Create a new API key with "Mail Send" permissions
3. Copy the key and paste it as the value in Netlify environment variables

> **Note:** The actual email addresses (where forms are sent, who they're from, etc.) are configured separately in `src/data/form-config.yaml` — see the section below.

#### Configuring Form Delivery with form-config.yaml

Email delivery is controlled by `src/data/form-config.yaml`, which uses a profile system to switch between test and production settings:

```yaml
# src/data/form-config.yaml
activeProfile: "test"          # Switch to "production" before go-live

profiles:
  test:
    toEmail:
      - "dev@example.com"     # During development, forms go here
    fromEmail: "noreply@example.com"
    fromName: "Your Company Name [TEST]"

  production:
    toEmail:
      - "info@example.com"    # In production, forms go here
    fromEmail: "noreply@example.com"
    fromName: "Your Company Name"
```

**Key settings:**
- **`activeProfile`**: Set to `"test"` during development to send forms to your test inbox. Switch to `"production"` before going live so visitor submissions reach the client's real inbox.
- **`toEmail`**: One or more email addresses that will receive form submissions
- **`fromEmail`**: The "from" address for notification emails (must be verified in SendGrid Sender Authentication)
- **`fromName`**: The display name shown in the recipient's email client

When you change `activeProfile`, you need to **trigger a new deploy** for it to take effect (just like any environment variable change).

### After Adding Variables

After adding your environment variables, you need to **trigger a new deploy** for them to take effect:

1. Go to **Deploys** in the Netlify dashboard
2. Click **Trigger deploy** → **Deploy site**

The site will rebuild with the new variables applied.

### Local Development

For local development, create a `.env` file in the project root (it's already in `.gitignore`, so it won't be committed):

```bash
# Copy the example file
cp .env.example .env
```

Then fill in the values in your `.env` file. Use `FORM_MODE=test` locally to avoid sending real form submissions during development.

---

## Step 4: Connect a Custom Domain

By default, your site is accessible at a `*.netlify.app` URL. To use your own domain (e.g., `www.smithhvac.com`), you need to add it in Netlify and configure your domain's DNS records.

### Add the Domain in Netlify

1. In the Netlify dashboard, go to **Site configuration** → **Domain management**
2. Click **Add a domain**
3. Enter your domain (e.g., `smithhvac.com`)
4. Netlify will check if the domain is available and prompt you to confirm

### Configure DNS Records

**DNS** (Domain Name System) is what tells browsers where to find your website when someone types in your domain name. You need to point your domain's DNS to Netlify's servers.

There are two approaches:

---

#### Option A: Use Netlify DNS (Recommended)

This is the simplest option — you hand over DNS management to Netlify entirely. Netlify manages all the DNS records for you, including automatic HTTPS.

**Steps:**

1. After adding your domain in Netlify, it will display **nameserver addresses** — they look like:
   ```
   dns1.p03.nsone.net
   dns2.p03.nsone.net
   dns3.p03.nsone.net
   dns4.p03.nsone.net
   ```

2. Log into your **domain registrar** — this is wherever you purchased the domain (e.g., GoDaddy, Namecheap, Google Domains, Cloudflare, Squarespace Domains)

3. Find the **nameserver settings** for your domain. This is usually under:
   - GoDaddy: My Products → DNS → Nameservers → Change
   - Namecheap: Domain List → Manage → Nameservers → Custom DNS
   - Cloudflare: Select domain → DNS → (you'll need to remove from Cloudflare DNS first)
   - Squarespace Domains: Domains → Manage → Nameservers

4. Replace the existing nameservers with the four Netlify nameservers from step 1

5. Save the changes

> **Note:** After changing nameservers, your domain registrar only handles domain renewal — Netlify handles everything else (DNS records, HTTPS certificates, etc.).

---

#### Option B: Use External DNS (Advanced)

If you want to keep managing DNS at your current provider (e.g., you're using Cloudflare for other features), you can point specific records to Netlify instead.

**For the root domain** (e.g., `smithhvac.com`):

Add an **A record** pointing to Netlify's load balancer:

| Type | Name | Value |
|------|------|-------|
| A | @ | `75.2.60.5` |

**For the www subdomain** (e.g., `www.smithhvac.com`):

Add a **CNAME record** pointing to your Netlify site:

| Type | Name | Value |
|------|------|-------|
| CNAME | www | `your-site-name.netlify.app` |

Replace `your-site-name.netlify.app` with your actual Netlify site URL (visible in the Netlify dashboard).

> **Tip:** If your DNS provider supports **ALIAS** or **ANAME** records (Cloudflare calls it "flattened CNAME"), you can use that instead of an A record for the root domain. This is preferred because it follows Netlify's load balancing automatically.

---

### Wait for DNS Propagation

After updating DNS records or nameservers, the changes need to **propagate** across the internet. This is like updating an address book that the entire internet shares — it takes time for every server to get the update.

- **Typical wait time:** 5 minutes to a few hours
- **Maximum:** Up to 48 hours (rare)

You can check propagation status at [https://www.whatsmydns.net](https://www.whatsmydns.net) — enter your domain and check if it resolves to Netlify's servers.

### HTTPS / SSL Certificate

Once your domain is verified and DNS has propagated, Netlify automatically provisions a **free SSL certificate** (via Let's Encrypt). This enables HTTPS — the padlock icon in the browser's address bar.

- This usually activates **within minutes** of DNS verification
- You don't need to do anything — it's automatic
- If it hasn't activated after an hour, go to **Site configuration** → **Domain management** → **HTTPS** and click **Verify DNS configuration**

---

## Step 5: Update the Site URL in Code

Now that your site has a live domain, update the project code to use it.

Open `astro.config.mjs` and change the `site` value:

```javascript
// Before
site: 'https://example.com',

// After
site: 'https://www.smithhvac.com',
```

Then commit and push the change:

```bash
git add astro.config.mjs
git commit -m "Update site URL to production domain"
git push
```

Netlify will automatically detect the push and rebuild the site.

**Why this matters:**

- **Sitemap** — The auto-generated sitemap (`/sitemap-index.xml`) uses this URL. Search engines need the correct URLs to index your pages.
- **Canonical URLs** — Prevents search engines from treating the `*.netlify.app` URL and your custom domain as duplicate content.
- **OG images** — Social media previews use the full URL to load the sharing image.
- **Form security** — The form submission handler validates that requests come from this origin.

---

## Verification Checklist

After completing all steps, verify everything is working:

- [ ] **Netlify URL** — Site loads at `your-site-name.netlify.app`
- [ ] **Custom domain** — Site loads at your custom domain (e.g., `www.smithhvac.com`)
- [ ] **HTTPS** — Padlock icon appears in the browser address bar
- [ ] **Contact form** — Submit a test form and confirm the email arrives
- [ ] **All pages** — Click through the major pages (Home, About, Services, Contact) to check for errors
- [ ] **Sitemap** — Visit `yourdomain.com/sitemap-index.xml` and confirm it loads with correct URLs
- [ ] **Auto-deploy** — Make a small change, push to GitHub, and verify Netlify rebuilds automatically

---

## Troubleshooting

### Build Fails

1. Go to **Deploys** in the Netlify dashboard
2. Click the failed deploy to view the **build log**
3. Scroll to the red error messages near the bottom
4. Common causes:
   - **Missing environment variable** — Add it in Site configuration → Environment variables
   - **Node version mismatch** — Netlify defaults to a recent Node version, which should work. If needed, you can set `NODE_VERSION` as an environment variable (e.g., `22`)
   - **Dependency install error** — Check that `pnpm-lock.yaml` is committed to the repository

### Forms Not Working

- Verify `SENDGRID_API_KEY` is set in Netlify environment variables (Site configuration → Environment variables)
- Verify `activeProfile` in `src/data/form-config.yaml` is set correctly (`"test"` for development, `"production"` for live)
- Verify the `fromEmail` address in `form-config.yaml` is verified in SendGrid's Sender Authentication
- Make sure you triggered a **new deploy** after adding or changing environment variables or `form-config.yaml`
- Check the browser's developer console (`F12`) for any error messages when submitting
- You can test the SendGrid connection locally by running: `node --env-file=.env sendgrid-verify.mjs`

### Domain Not Resolving

- Check [https://www.whatsmydns.net](https://www.whatsmydns.net) to see if DNS has propagated
- Verify your nameserver or DNS record changes were saved at your domain registrar
- If using external DNS (Option B), double-check the A record IP and CNAME value

### SSL Certificate Not Activating

- Go to **Site configuration** → **Domain management** → **HTTPS**
- Click **Verify DNS configuration** to retry
- Make sure DNS has fully propagated first — the certificate can't be issued until Netlify can verify domain ownership
- If using Cloudflare with proxy enabled (orange cloud), try switching to DNS-only (gray cloud) temporarily to allow Netlify to verify

---

## Next Steps

- [Project Rebranding Guide](/docs/project-rebranding/) — How to customize the site's branding, colors, and content
- **Ongoing Maintenance** — How to make updates and manage the deployed site *(coming soon)*
