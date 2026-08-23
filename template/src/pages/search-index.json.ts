import { getCollection } from 'astro:content';
import { getFaqs } from '@/utils/data';
import { isFeatureEnabled, type FeatureName } from '@/utils/features';

export const prerender = true;

// ===== Types =====

interface SearchRecord {
  id: string;
  type: 'service' | 'location' | 'blog' | 'career' | 'faq' | 'page';
  title: string;
  excerpt: string;
  body: string;
  url: string;
  category: string;
  tags?: string[];
  /** Feature flag controlling this record — stripped before serving. */
  flag?: FeatureName;
}

// ===== Helpers =====

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')           // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')   // links → keep text
    .replace(/#{1,6}\s+/g, '')                  // headings
    .replace(/\*\*|__/g, '')                    // bold
    .replace(/\*|_/g, '')                       // italic
    .replace(/<[^>]+>/g, '')                    // HTML tags
    .replace(/\s{2,}/g, ' ')                    // collapse whitespace
    .trim();
}

function truncate(text: string, max = 160): string {
  if (!text) return '';
  return text.length <= max ? text : text.slice(0, max).trimEnd() + '...';
}

function joinText(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

// ===== Static Pages =====
// Brand-agnostic excerpts — safe to clone/rebrand without edits.

const staticPages: SearchRecord[] = [
  { id: 'page-about', type: 'page', title: 'About Us', excerpt: 'Learn about our company, our team, and our commitment to quality service.', body: '', url: '/about/', category: 'Pages' },
  { id: 'page-contact', type: 'page', title: 'Contact Us', excerpt: 'Get in touch for service, repair, or installation. Request a free quote today.', body: '', url: '/contact/', category: 'Pages' },
  { id: 'page-coupons', type: 'page', title: 'Coupons & Special Offers', excerpt: 'Save with our current coupons and special offers.', body: '', url: '/coupons/', category: 'Pages', flag: 'coupons' },
  { id: 'page-faqs', type: 'page', title: 'Frequently Asked Questions', excerpt: 'Find answers to common questions about our services, repairs, and maintenance.', body: '', url: '/faqs/', category: 'Pages', flag: 'faqs' },
  { id: 'page-service-areas', type: 'page', title: 'Service Areas', excerpt: 'See the cities and neighborhoods we proudly serve.', body: '', url: '/service-areas/', category: 'Pages', flag: 'serviceAreas' },
  { id: 'page-blog', type: 'page', title: 'Blog', excerpt: 'Tips, maintenance advice, and helpful guides for homeowners.', body: '', url: '/blog/', category: 'Pages', flag: 'blog' },
  { id: 'page-careers', type: 'page', title: 'Careers', excerpt: 'Join our team. View open positions and apply today.', body: '', url: '/careers/', category: 'Pages', flag: 'careers' },
];

// ===== GET Handler =====

export async function GET(): Promise<Response> {
  // Prerendered endpoints always emit a file, so "search off" serves an
  // empty index rather than a 404 (the search UI is hidden anyway).
  if (!isFeatureEnabled('search')) {
    return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
  }

  const records: SearchRecord[] = [];

  // --- Services ---
  const serviceEntries = await getCollection('services');
  for (const entry of serviceEntries) {
    const d = entry.data;
    const slug = entry.id.split('/').pop() ?? entry.id;
    const url = d.type === 'hub' ? `/${d.category}/` : `/${d.category}/${slug}/`;

    const bodyParts: string[] = [d.intro];
    for (const f of d.features ?? []) bodyParts.push(f.title, f.description);
    for (const p of d.processSteps ?? []) bodyParts.push(p.title, p.description);
    for (const s of d.subServices ?? []) bodyParts.push(s.title, s.description);
    for (const faq of d.faqs ?? []) bodyParts.push(faq.question, faq.answer);
    if (entry.body) bodyParts.push(stripMarkdown(entry.body));

    records.push({
      id: `service-${entry.id}`,
      type: 'service',
      title: d.title,
      excerpt: truncate(d.intro || d.seoDescription),
      body: joinText(...bodyParts),
      url,
      category: d.categoryLabel,
    });
  }

  // --- Locations ---
  const locationEntries = isFeatureEnabled('serviceAreas') ? await getCollection('locations') : [];
  for (const entry of locationEntries) {
    const d = entry.data;

    const bodyParts: string[] = [d.intro];
    for (const h of d.highlights ?? []) bodyParts.push(h.title, h.description);
    for (const s of d.featuredServices ?? []) bodyParts.push(s.title, s.description);
    for (const faq of d.faqs ?? []) bodyParts.push(faq.question, faq.answer);
    if (entry.body) bodyParts.push(stripMarkdown(entry.body));

    records.push({
      id: `location-${entry.id}`,
      type: 'location',
      title: d.title,
      excerpt: truncate(d.intro || d.seoDescription),
      body: joinText(...bodyParts),
      url: `/service-areas/${d.slug}/`,
      category: d.region,
    });
  }

  // --- Blog ---
  const blogEntries = isFeatureEnabled('blog') ? await getCollection('blog') : [];
  for (const entry of blogEntries) {
    if (entry.data.draft) continue;
    const d = entry.data;

    const bodyParts: string[] = [d.excerpt];
    if (entry.body) bodyParts.push(stripMarkdown(entry.body));

    records.push({
      id: `blog-${entry.id}`,
      type: 'blog',
      title: d.title,
      excerpt: truncate(d.excerpt || d.seoDescription),
      body: joinText(...bodyParts),
      url: `/blog/${d.slug}/`,
      category: d.category,
      tags: d.tags,
    });
  }

  // --- Careers ---
  const careerEntries = isFeatureEnabled('careers') ? await getCollection('careers') : [];
  for (const entry of careerEntries) {
    if (!entry.data.active) continue;
    const d = entry.data;

    const bodyParts: string[] = [d.excerpt, d.department, d.jobType, d.location];
    if (entry.body) bodyParts.push(stripMarkdown(entry.body));

    records.push({
      id: `career-${entry.id}`,
      type: 'career',
      title: d.title,
      excerpt: truncate(d.excerpt || d.seoDescription),
      body: joinText(...bodyParts),
      url: `/careers/${d.slug}/`,
      category: d.department,
    });
  }

  // --- FAQs ---
  const faqs = isFeatureEnabled('faqs') ? getFaqs() : { categories: [] };
  for (const category of faqs.categories) {
    for (const q of category.questions) {
      records.push({
        id: `faq-${category.slug}-${q.question.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 48)}`,
        type: 'faq',
        title: q.question,
        excerpt: truncate(q.answer),
        body: joinText(q.question, q.answer),
        url: `/faqs/#${category.slug}`,
        category: category.name,
      });
    }
  }

  // --- Static Pages ---
  records.push(...staticPages.filter((p) => !p.flag || isFeatureEnabled(p.flag)));

  return new Response(JSON.stringify(records.map(({ flag, ...record }) => record)), {
    headers: { 'Content-Type': 'application/json' },
  });
}
