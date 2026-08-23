import type { APIRoute } from 'astro';

// Dynamic so the Sitemap line tracks the configured `site` (astro.config.mjs) —
// no hardcoded domain for a cloner to forget to update.
export const GET: APIRoute = ({ site }) => {
  const body = `User-agent: *
Allow: /

Sitemap: ${new URL('sitemap-index.xml', site).href}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
