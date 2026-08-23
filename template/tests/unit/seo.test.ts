import { describe, it, expect } from 'vitest';
import {
  getOrganizationJsonLd,
  getContactPageJsonLd,
  getFaqPageJsonLd,
  getJobPostingJsonLd,
  getReviewSchema,
} from '@/utils/seo';
import { getReviewsConfig } from '@/utils/data';

describe('getReviewSchema() — fake-review safety gate', () => {
  it('emits NO review markup while reviews run on static_fallback', () => {
    // The template ships in static_fallback mode with sample reviews — marking
    // those up would risk a Google manual penalty, so the helper must stay empty.
    expect(getReviewsConfig().mode).toBe('static_fallback');
    expect(getReviewSchema()).toEqual([]);
  });
});

describe('getOrganizationJsonLd()', () => {
  it('is a LocalBusiness with a complete OpeningHoursSpecification', () => {
    const schema = getOrganizationJsonLd() as Record<string, any>;
    expect(schema['@type']).toBe('LocalBusiness');
    const hours = schema.openingHoursSpecification;
    expect(Array.isArray(hours)).toBe(true);
    expect(hours[0]).toMatchObject({
      '@type': 'OpeningHoursSpecification',
    });
    // opens/closes must be present (the old stub had days only)
    expect(hours[0].opens).toBeTruthy();
    expect(hours[0].closes).toBeTruthy();
    expect(Array.isArray(hours[0].dayOfWeek)).toBe(true);
  });

  it('includes social sameAs links', () => {
    const schema = getOrganizationJsonLd() as Record<string, any>;
    expect(Array.isArray(schema.sameAs)).toBe(true);
    expect(schema.sameAs.length).toBeGreaterThan(0);
  });
});

describe('getContactPageJsonLd()', () => {
  it('nests hoursAvailable on the contactPoint', () => {
    const schema = getContactPageJsonLd() as Record<string, any>;
    expect(schema['@type']).toBe('ContactPage');
    expect(schema.mainEntity.contactPoint.hoursAvailable).toBeTruthy();
  });
});

describe('getFaqPageJsonLd()', () => {
  it('maps Q/A pairs to Question/acceptedAnswer', () => {
    const schema = getFaqPageJsonLd([
      { question: 'Q1?', answer: 'A1.' },
    ]) as Record<string, any>;
    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity[0]).toMatchObject({
      '@type': 'Question',
      name: 'Q1?',
      acceptedAnswer: { '@type': 'Answer', text: 'A1.' },
    });
  });
});

describe('getJobPostingJsonLd()', () => {
  it('maps employmentType and validThrough', () => {
    const schema = getJobPostingJsonLd({
      title: 'HVAC Tech',
      description: 'Install systems.',
      jobType: 'Full-Time',
      location: 'Local',
      publishDate: new Date('2026-01-01'),
      closingDate: new Date('2026-03-01'),
    }) as Record<string, any>;
    expect(schema['@type']).toBe('JobPosting');
    expect(schema.employmentType).toBe('FULL_TIME');
    expect(schema.validThrough).toBe(new Date('2026-03-01').toISOString());
  });

  it('omits validThrough when no closingDate', () => {
    const schema = getJobPostingJsonLd({
      title: 'CSR',
      description: 'Answer calls.',
      jobType: 'Part-Time',
      location: 'Local',
      publishDate: new Date('2026-01-01'),
    }) as Record<string, any>;
    expect(schema.employmentType).toBe('PART_TIME');
    expect(schema.validThrough).toBeUndefined();
  });
});
