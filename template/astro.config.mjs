// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  adapter: netlify(),
  site: 'https://example.com',
  integrations: [
    sitemap({
      // Keep non-canonical / noindexed routes out of the sitemap. This mirrors
      // (but is independent of) the `devPages`/`demoPages` feature flags in
      // src/data/features.yaml — when those flags are off the routes aren't
      // built at all, but when they're on for internal review, this filter
      // still keeps them out of the sitemap.
      filter: (page) =>
        !page.includes('/styleguide') &&
        !page.includes('/docs/') &&
        !page.includes('/animation-examples') &&
        !page.includes('/home-') &&
        !page.includes('/autorepair-about') &&
        !page.includes('/dental-booking') &&
        !page.includes('/gym-membership') &&
        !page.includes('/lawfirm-team') &&
        !page.includes('/restaurant-menu') &&
        !page.includes('/salon-gallery') &&
        !page.includes('/landing/') &&
        !page.includes('/offers/'),
    }),
    icon({
      include: {
        'material-symbols': ['*'],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
