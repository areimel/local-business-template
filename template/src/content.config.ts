import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    // Page identity
    type: z.enum(['hub', 'service']),
    title: z.string(),
    category: z.string(),
    categoryLabel: z.string(),

    // SEO
    seoTitle: z.string().optional(),
    seoDescription: z.string(),
    ogImage: z.string().optional(),
    schemaData: z.string().optional(),

    // Hero section
    heroHeading: z.string(),
    heroSubheading: z.string().optional(),
    heroImage: z.string().optional(),

    // Content sections
    intro: z.string(),
    features: z.array(z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string().optional(),
    })).optional(),

    // Process steps (for service pages)
    processSteps: z.array(z.object({
      step: z.number(),
      title: z.string(),
      description: z.string(),
    })).optional(),

    // Sub-services (for hub pages only)
    subServices: z.array(z.object({
      title: z.string(),
      slug: z.string(),
      description: z.string(),
      icon: z.string().optional(),
    })).optional(),

    // FAQs specific to this page
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).optional(),

    // CTA overrides (falls back to global ctas.yaml)
    ctaHeading: z.string().optional(),
    ctaBody: z.string().optional(),
    ctaButtonText: z.string().optional(),

    // Display options
    showContactForm: z.boolean().default(true),
    showEmergencyCta: z.boolean().default(false),
    freeEstimate: z.boolean().default(false),
    sortOrder: z.number().default(0),
  }),
});

const locations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/locations' }),
  schema: z.object({
    // Page identity
    title: z.string(),
    slug: z.string(),
    region: z.string(),

    // SEO
    seoTitle: z.string().optional(),
    seoDescription: z.string(),

    // Hero
    heroHeading: z.string(),
    heroSubheading: z.string().optional(),

    // Content
    intro: z.string(),

    // Location-specific highlights (reuses features shape)
    highlights: z.array(z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string().optional(),
    })).optional(),

    // Featured services links
    featuredServices: z.array(z.object({
      title: z.string(),
      slug: z.string(),
      description: z.string(),
    })).optional(),

    // Nearby locations for cross-linking (slugs)
    nearbyLocations: z.array(z.string()).optional(),

    // Map
    mapEmbedQuery: z.string().optional(),

    // FAQs
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).optional(),

    // CTA overrides
    ctaHeading: z.string().optional(),
    ctaBody: z.string().optional(),
    ctaButtonText: z.string().optional(),

    // Display options
    showContactForm: z.boolean().default(true),
    showEmergencyCta: z.boolean().default(false),
    sortOrder: z.number().default(0),

    // Schema / Structured Data
    schemaData: z.string().optional(),
  }),
});

const campaigns = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/campaigns' }),
  schema: z.object({
    // Metadata
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    service: z.string().optional(),
    campaign: z.string().optional(),
    status: z.enum(['active', 'paused', 'expired']).default('active'),
    noindex: z.boolean().default(true),
    formType: z.enum(['quote', 'contest']).default('quote'),

    // Component visibility toggles
    showReviews: z.boolean().default(true),
    showEmergencyCta: z.boolean().default(true),
    showStatCounter: z.boolean().default(true),
    heroCompact: z.boolean().default(false),

    // Hero section
    hero: z.object({
      eyebrow: z.string().optional(),
      headline: z.string(),
      headlineAccent: z.string().optional(),
      description: z.string(),
      backgroundImage: z.string().optional(),
      trustSignals: z.array(z.string()).default([]),
    }),

    // Offer / promotion
    offer: z.object({
      badge: z.string(),
      headline: z.string(),
      deadline: z.string().optional(),
      deadlineText: z.string().optional(),
      ctaText: z.string(),
      disclaimer: z.string().optional(),
      couponId: z.string().optional(),
    }),

    // Benefits section
    benefits: z.object({
      eyebrow: z.string().optional(),
      headline: z.string(),
      items: z.array(z.object({
        icon: z.string().optional(),
        title: z.string(),
        description: z.string(),
      })),
    }).optional(),

    // Process steps
    process: z.object({
      eyebrow: z.string().optional(),
      headline: z.string(),
      image: z.string().optional(),
      steps: z.array(z.object({
        title: z.string(),
        description: z.string(),
        isFinal: z.boolean().default(false),
      })),
    }).optional(),

    // FAQ
    faq: z.object({
      eyebrow: z.string().optional(),
      headline: z.string(),
      defaultOpen: z.number().default(0),
      items: z.array(z.object({
        question: z.string(),
        answer: z.string(),
      })),
    }).optional(),

    // Final CTA
    finalCta: z.object({
      urgencyBadge: z.string().optional(),
      headline: z.string(),
      headlineAccent: z.string().optional(),
      description: z.string(),
      formHeading: z.string(),
      formSubheading: z.string().optional(),
      formHeaderVariant: z.enum(['primary', 'dark', 'gradient']).default('gradient'),
      ctaText: z.string(),
      disclaimer: z.string().optional(),
      trustCards: z.array(z.object({
        icon: z.string().optional(),
        title: z.string(),
        subtitle: z.string().optional(),
      })).default([]),
    }).optional(),

    // Sticky mobile bar
    stickyBar: z.object({
      text: z.string(),
      subtext: z.string().optional(),
      ctaText: z.string(),
      scrollTarget: z.string().default('mid-cta'),
    }).optional(),

    // Schema / Structured Data
    schemaData: z.string().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string(),
    ogImage: z.string().optional(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Team'),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    excerpt: z.string(),
    featuredImage: z.string().optional(),
    featuredImageAlt: z.string().optional(),
    readingTime: z.number().optional(),
    heroHeading: z.string().optional(),
    heroSubheading: z.string().optional(),
    ctaHeading: z.string().optional(),
    ctaBody: z.string().optional(),
    ctaButtonText: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),

    // Schema / Structured Data
    schemaData: z.string().optional(),
  }),
});

const careers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/careers' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string(),
    department: z.string(),
    jobType: z.enum(['Full-Time', 'Part-Time', 'Contract', 'Seasonal']),
    location: z.string(),
    salary: z.string().optional(),
    publishDate: z.coerce.date(),
    closingDate: z.coerce.date().optional(),
    excerpt: z.string(),
    featured: z.boolean().default(false),
    active: z.boolean().default(true),
    heroHeading: z.string().optional(),
    heroSubheading: z.string().optional(),
    ctaHeading: z.string().optional(),
    ctaBody: z.string().optional(),
    ctaButtonText: z.string().optional(),
    applyUrl: z.string().optional(),
    sortOrder: z.number().default(0),

    // Schema / Structured Data
    schemaData: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string(),
    ogImage: z.string().optional(),
    noindex: z.boolean().default(false),
    heroHeading: z.string().optional(),
    heroSubheading: z.string().optional(),
    heroImage: z.string().optional(),
    sections: z.array(z.object({
      heading: z.string().optional(),
      body: z.string().optional(),
      items: z.array(z.object({
        title: z.string(),
        description: z.string(),
        icon: z.string().optional(),
      })).optional(),
    })).optional(),
    lastUpdated: z.string().optional(),

    // When true, [slug].astro renders a contact block from branding.yaml below the
    // markdown — keeps email/phone/address config-driven on rebrand (legal pages).
    contactBlock: z.boolean().default(false),

    // Schema / Structured Data
    schemaData: z.string().optional(),
  }),
});

const documentation = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/documentation' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
  }),
});

export const collections = { services, locations, campaigns, blog, careers, pages, documentation };
