import {
  getBranding,
  getReviewsConfig,
  getReviewsFallback,
  type Branding,
} from '@/utils/data';

// ===== Type Definitions =====

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BlogPostSeoData {
  title: string;
  description: string;
  slug: string;
  publishDate: Date;
  updatedDate?: Date;
  image?: string;
  author?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ServiceSeoData {
  name: string;
  description: string;
  /** Site-relative path, e.g. "/air-conditioning/ac-repair/" */
  url: string;
  serviceType?: string;
}

export interface LocationSeoData {
  title: string;
  slug: string;
  region?: string;
  seoDescription: string;
}

export interface JobPostingSeoData {
  title: string;
  description: string;
  jobType: string;
  location: string;
  salary?: string;
  publishDate: Date;
  closingDate?: Date;
}

// ===== Internal helpers =====

const OG_IMAGE = (branding: Branding) => `${branding.website}/images/og-default.jpg`;

/** Map branding.businessHours → schema.org OpeningHoursSpecification[] (undefined when not configured). */
function getOpeningHoursSpecification(branding: Branding) {
  if (!branding.businessHours?.length) return undefined;
  return branding.businessHours.map((spec) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: spec.days,
    opens: spec.opens,
    closes: spec.closes,
  }));
}

/** Non-empty social profile URLs for schema.org `sameAs`. */
function getSameAs(branding: Branding) {
  return Object.values(branding.socialMedia ?? {}).filter(Boolean);
}

function getPostalAddress(branding: Branding) {
  return {
    '@type': 'PostalAddress',
    streetAddress: branding.address.street,
    addressLocality: branding.address.city,
    addressRegion: branding.address.state,
    postalCode: branding.address.zip,
    addressCountry: 'US',
  };
}

// JSON-LD objects are heterogeneous; a loose record keeps optional keys tidy.
type JsonLd = Record<string, unknown>;

// ===== JSON-LD Helpers =====

export function getOrganizationJsonLd(): JsonLd {
  const branding = getBranding();
  const schema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: branding.companyName,
    url: branding.website,
    logo: OG_IMAGE(branding),
    image: OG_IMAGE(branding),
    description: branding.seo.defaultDescription,
    telephone: branding.phone,
    email: branding.email,
    foundingDate: String(branding.yearEstablished),
    address: getPostalAddress(branding),
    areaServed: branding.serviceArea.regions.map((region: string) => ({
      '@type': 'AdministrativeArea',
      name: region,
    })),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: branding.phone,
      contactType: 'customer service',
      availableLanguage: 'English',
    },
  };

  const sameAs = getSameAs(branding);
  if (sameAs.length) schema.sameAs = sameAs;
  if (branding.priceRange) schema.priceRange = branding.priceRange;

  const hours = getOpeningHoursSpecification(branding);
  if (hours) schema.openingHoursSpecification = hours;

  return schema;
}

export function getContactPageJsonLd(): JsonLd {
  const branding = getBranding();
  const hours = getOpeningHoursSpecification(branding);
  const contactPoint: JsonLd = {
    '@type': 'ContactPoint',
    telephone: branding.phone,
    contactType: 'customer service',
    availableLanguage: 'English',
  };
  if (hours) contactPoint.hoursAvailable = hours;

  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${branding.companyName}`,
    url: `${branding.website}/contact/`,
    mainEntity: {
      '@type': 'LocalBusiness',
      name: branding.companyName,
      telephone: branding.phone,
      email: branding.email,
      address: getPostalAddress(branding),
      contactPoint,
    },
  };
}

export function getServiceJsonLd(service: ServiceSeoData): JsonLd {
  const branding = getBranding();
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    serviceType: service.serviceType ?? service.name,
    url: `${branding.website}${service.url}`,
    areaServed: branding.serviceArea.regions.map((region: string) => ({
      '@type': 'AdministrativeArea',
      name: region,
    })),
    provider: {
      '@type': 'LocalBusiness',
      name: branding.companyName,
      telephone: branding.phone,
      url: branding.website,
    },
  };
}

export function getLocationBusinessJsonLd(location: LocationSeoData): JsonLd {
  const branding = getBranding();
  const schema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${branding.companyName} – ${location.title}`,
    description: location.seoDescription,
    url: `${branding.website}/service-areas/${location.slug}/`,
    telephone: branding.phone,
    image: OG_IMAGE(branding),
    address: getPostalAddress(branding),
    areaServed: { '@type': 'City', name: location.title },
    parentOrganization: {
      '@type': 'Organization',
      name: branding.companyName,
      url: branding.website,
    },
  };
  if (branding.priceRange) schema.priceRange = branding.priceRange;
  const hours = getOpeningHoursSpecification(branding);
  if (hours) schema.openingHoursSpecification = hours;
  return schema;
}

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  'Full-Time': 'FULL_TIME',
  'Part-Time': 'PART_TIME',
  Contract: 'CONTRACTOR',
  Seasonal: 'SEASONAL',
};

export function getJobPostingJsonLd(job: JobPostingSeoData): JsonLd {
  const branding = getBranding();
  const schema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.publishDate.toISOString(),
    employmentType: EMPLOYMENT_TYPE_MAP[job.jobType] ?? 'OTHER',
    hiringOrganization: {
      '@type': 'Organization',
      name: branding.companyName,
      sameAs: branding.website,
      logo: OG_IMAGE(branding),
    },
    jobLocation: {
      '@type': 'Place',
      address: getPostalAddress(branding),
    },
  };
  // ponytail: salary is free-form text in frontmatter — skip baseSalary parsing until a structured field exists.
  if (job.closingDate) schema.validThrough = job.closingDate.toISOString();
  return schema;
}

export function getBlogPostingJsonLd(post: BlogPostSeoData): JsonLd {
  const branding = getBranding();
  const authorName = post.author ?? branding.companyName;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishDate.toISOString(),
    dateModified: (post.updatedDate ?? post.publishDate).toISOString(),
    author: {
      '@type': 'Organization',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: branding.companyName,
      logo: {
        '@type': 'ImageObject',
        url: OG_IMAGE(branding),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${branding.website}/blog/${post.slug}/`,
    },
    image: post.image
      ? `${branding.website}${post.image}`
      : OG_IMAGE(branding),
    url: `${branding.website}/blog/${post.slug}/`,
  };
}

export function getFaqPageJsonLd(faqs: FaqItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function getBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * AggregateRating + Review markup for displayed reviews.
 * ponytail: gated on a real provider — returns [] for static_fallback so we never
 * mark up the sample/placeholder reviews (Google penalizes fake review markup).
 * Activates automatically once reviews_config.mode points at a live provider.
 */
export function getReviewSchema(): JsonLd[] {
  const config = getReviewsConfig();
  if (config.mode === 'static_fallback') return [];

  const fallback = getReviewsFallback();
  if (!fallback.reviews?.length) return [];

  const branding = getBranding();
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: branding.companyName,
      url: branding.website,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: fallback.overallRating,
        reviewCount: fallback.totalReviewCount,
        bestRating: 5,
      },
      review: fallback.reviews.map((review) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: review.authorName },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
        },
        reviewBody: review.text,
        datePublished: review.publishDate,
      })),
    },
  ];
}

/**
 * Normalize a raw JSON-LD schema string for injection into <head>.
 * Pass through if it is already a script tag; otherwise wrap the bare JSON so it
 * renders as an invisible head script instead of visible plaintext.
 *
 * Lives here (a .ts file), NOT in BaseLayout frontmatter: a literal script-tag
 * substring in .astro frontmatter is mis-parsed by the Astro compiler as a real
 * client script and breaks the build.
 */
export function normalizeRawSchema(raw?: string): string | undefined {
  const s = raw?.trim();
  if (!s) return undefined;
  return s.toLowerCase().startsWith('<script')
    ? s
    : `<script type="application/ld+json">${s}</script>`;
}
