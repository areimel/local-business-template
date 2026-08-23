import { load as parseYaml } from 'js-yaml';
import fallbackRaw from '../data/reviews_fallback.yaml?raw';
import reviewsConfigRaw from '../data/reviews_config.yaml?raw';

// ponytail: self-contained type defs (data.ts also exports Reviews* types). Kept
// independent so this provider module has no coupling to the YAML getters; dedupe
// only if the shapes ever drift and need a single source of truth.

export type ReviewProvider = 'google_places' | 'outscraper' | 'static_fallback';

export interface NormalizedReview {
  authorName: string;
  authorPhotoUrl: string;
  rating: number;
  text: string;
  relativeDate: string;
  publishDate: string;
}

export interface ReviewsData {
  provider: ReviewProvider;
  reviewUrl: string;
  generatedAt: string;
  averageRating: number;
  overallRating: number;
  totalReviewCount: number;
  reviews: NormalizedReview[];
}

export interface PlatformBadgeConfig {
  overallRating: number;
  totalReviewCount: number | null;
  reviewUrl: string;
}

export interface ReviewsBadgeData {
  google: PlatformBadgeConfig;
  facebook: PlatformBadgeConfig;
}

interface ReviewsConfig {
  mode: 'auto';
  providerOrder: ReviewProvider[];
  reviewUrl: string;
  placeId: string;
  display: {
    maxReviews: number;
  };
  cacheTtlMinutes: number;
  googlePlaces: {
    enabled: boolean;
  };
  outscraper: {
    enabled: boolean;
  };
  staticFallback: {
    enabled: boolean;
  };
}

interface FallbackReviewsYaml {
  generatedAt?: string;
  generatedBy?: string;
  sourceProvider?: string;
  reviewUrl?: string;
  placeId?: string;
  overallRating?: number;
  totalReviewCount?: number;
  reviews?: NormalizedReview[];
}

interface PlacesApiReview {
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
  };
  rating?: number;
  text?: {
    text?: string;
  };
  relativePublishTimeDescription?: string;
  publishTime?: string;
}

interface PlacesApiResponse {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesApiReview[];
}

interface OutscraperReviewItem {
  author_title?: string;
  author_image?: string;
  review_rating?: number;
  review_text?: string;
  review_datetime_utc?: string;
  review_timestamp?: number;
}

interface OutscraperPlaceResult {
  rating?: number;
  reviews?: number;
  reviews_count?: number;
  total_reviews?: number;
  review_url?: string;
  google_id?: string;
  reviews_data?: OutscraperReviewItem[];
}

interface CachedReviews {
  expiresAt: number;
  data: ReviewsData;
}

const reviewsConfig = parseYaml(reviewsConfigRaw) as ReviewsConfig;
const fallbackData = parseYaml(fallbackRaw) as FallbackReviewsYaml;
let reviewsCache: CachedReviews | null = null;

function isProviderEnabled(config: ReviewsConfig, provider: ReviewProvider): boolean {
  switch (provider) {
    case 'google_places':
      return config.googlePlaces.enabled;
    case 'outscraper':
      return config.outscraper.enabled;
    case 'static_fallback':
      return config.staticFallback.enabled;
  }
}

function getProviderOrder(config: ReviewsConfig): ReviewProvider[] {
  const validProviders: ReviewProvider[] = ['google_places', 'outscraper', 'static_fallback'];
  const configuredOrder = Array.isArray(config.providerOrder) ? config.providerOrder : [];
  const deduped = configuredOrder.filter(
    (provider, index): provider is ReviewProvider =>
      validProviders.includes(provider) && configuredOrder.indexOf(provider) === index,
  );

  return deduped.length ? deduped : validProviders;
}

function trimReviews(reviews: NormalizedReview[], maxReviews: number): NormalizedReview[] {
  return reviews
    .filter((review) => review.text.trim())
    .slice(0, Math.max(maxReviews, 1));
}

function getFiniteNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function getPositiveInteger(value: unknown): number | null {
  const numeric = getFiniteNumber(value);
  if (numeric === null || numeric < 0) {
    return null;
  }

  return Math.round(numeric);
}

function buildReviewsData(
  provider: ReviewProvider,
  reviews: NormalizedReview[],
  generatedAt: string,
  options: {
    reviewUrl?: string;
    overallRating?: number;
    totalReviewCount?: number;
  } = {},
): ReviewsData {
  const normalizedReviews = trimReviews(reviews, reviewsConfig.display.maxReviews);

  if (!normalizedReviews.length) {
    throw new Error(`[reviews] ${provider} returned no usable reviews`);
  }

  const averageRating = getAverageRating(normalizedReviews);
  const overallRating = getFiniteNumber(options.overallRating) ?? averageRating;
  const totalReviewCount = getPositiveInteger(options.totalReviewCount) ?? normalizedReviews.length;

  return {
    provider,
    reviewUrl: options.reviewUrl ?? reviewsConfig.reviewUrl ?? '',
    generatedAt,
    averageRating,
    overallRating,
    totalReviewCount,
    reviews: normalizedReviews,
  };
}

function loadStaticFallback(): ReviewsData {
  return buildReviewsData(
    'static_fallback',
    fallbackData.reviews ?? [],
    fallbackData.generatedAt ?? new Date().toISOString(),
    {
      reviewUrl: reviewsConfig.reviewUrl || fallbackData.reviewUrl,
      overallRating: fallbackData.overallRating,
      totalReviewCount: fallbackData.totalReviewCount,
    },
  );
}

async function fetchGooglePlacesReviews(): Promise<ReviewsData> {
  const apiKey = import.meta.env.GOOGLE_PLACES_API_KEY ?? '';

  if (!reviewsConfig.placeId) {
    throw new Error('Google Places provider requires reviews_config.yaml placeId');
  }

  if (!apiKey) {
    throw new Error('Google Places provider requires GOOGLE_PLACES_API_KEY');
  }

  const response = await fetch(`https://places.googleapis.com/v1/places/${reviewsConfig.placeId}`, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'reviews,rating,userRatingCount,googleMapsUri',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Places API error ${response.status}: ${body}`);
  }

  const data = (await response.json()) as PlacesApiResponse;
  const reviews = (data.reviews ?? []).map((review) => ({
    authorName: review.authorAttribution?.displayName ?? 'Anonymous',
    authorPhotoUrl: review.authorAttribution?.photoUri ?? '',
    rating: review.rating ?? 5,
    text: review.text?.text ?? '',
    relativeDate: review.relativePublishTimeDescription ?? '',
    publishDate: review.publishTime ?? '',
  }));

  return buildReviewsData('google_places', reviews, new Date().toISOString(), {
    reviewUrl: data.googleMapsUri || reviewsConfig.reviewUrl,
    overallRating: data.rating,
    totalReviewCount: data.userRatingCount,
  });
}

function flattenOutscraperPayload(payload: unknown): OutscraperPlaceResult[] {
  if (Array.isArray(payload)) {
    return payload.flatMap((item) => flattenOutscraperPayload(item));
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;

  if (Array.isArray(record.data)) {
    return flattenOutscraperPayload(record.data);
  }

  if (Array.isArray(record.reviews_data)) {
    return [record as unknown as OutscraperPlaceResult];
  }

  return [];
}

async function fetchOutscraperReviews(): Promise<ReviewsData> {
  const apiKey = import.meta.env.OUTSCRAPER_API_KEY ?? '';

  if (!apiKey) {
    throw new Error('Outscraper provider requires OUTSCRAPER_API_KEY');
  }

  if (!reviewsConfig.placeId && !reviewsConfig.reviewUrl) {
    throw new Error('Outscraper provider requires either placeId or reviewUrl in reviews_config.yaml');
  }

  const url = new URL('https://api.app.outscraper.com/maps/reviews-v2');
  url.searchParams.set('query', reviewsConfig.placeId || reviewsConfig.reviewUrl);
  url.searchParams.set('async', 'false');
  url.searchParams.set('reviewsLimit', String(reviewsConfig.display.maxReviews));
  url.searchParams.set('sort', 'most_relevant');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-API-KEY': apiKey,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Outscraper API error ${response.status}: ${body}`);
  }

  const payload = (await response.json()) as unknown;
  const placeResults = flattenOutscraperPayload(payload);
  const primaryPlace = placeResults.find((place) => Array.isArray(place.reviews_data) && place.reviews_data.length) ?? placeResults[0];
  const reviews = placeResults
    .flatMap((place) => place.reviews_data ?? [])
    .map((review) => ({
      authorName: review.author_title ?? 'Anonymous',
      authorPhotoUrl: review.author_image ?? '',
      rating: review.review_rating ?? 5,
      text: review.review_text ?? '',
      relativeDate: '',
      publishDate: review.review_datetime_utc ?? (review.review_timestamp ? new Date(review.review_timestamp * 1000).toISOString() : ''),
    }));

  return buildReviewsData('outscraper', reviews, new Date().toISOString(), {
    reviewUrl: primaryPlace?.review_url || reviewsConfig.reviewUrl,
    overallRating: primaryPlace?.rating,
    totalReviewCount: primaryPlace?.reviews_count ?? primaryPlace?.total_reviews ?? primaryPlace?.reviews,
  });
}

async function resolveReviewsData(): Promise<ReviewsData> {
  const errors: string[] = [];

  for (const provider of getProviderOrder(reviewsConfig)) {
    if (!isProviderEnabled(reviewsConfig, provider)) {
      continue;
    }

    try {
      switch (provider) {
        case 'google_places':
          return await fetchGooglePlacesReviews();
        case 'outscraper':
          return await fetchOutscraperReviews();
        case 'static_fallback':
          return loadStaticFallback();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${provider}: ${message}`);
      console.warn(`[reviews] Provider "${provider}" failed, trying next provider: ${message}`);
    }
  }

  throw new Error(`[reviews] No review providers succeeded. ${errors.join(' | ')}`);
}

export async function getReviewsData(): Promise<ReviewsData> {
  const now = Date.now();

  if (reviewsCache && reviewsCache.expiresAt > now) {
    return reviewsCache.data;
  }

  const data = await resolveReviewsData();
  reviewsCache = {
    data,
    expiresAt: now + reviewsConfig.cacheTtlMinutes * 60 * 1000,
  };

  return data;
}

export async function getReviews(): Promise<NormalizedReview[]> {
  const data = await getReviewsData();
  return data.reviews;
}

export function getAverageRating(reviews: NormalizedReview[]): number {
  if (!reviews.length) return 5;

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

export function truncateReviewText(text: string, maxLength = 280): string {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const truncated = normalized.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace <= maxLength * 0.6) {
    return `${truncated.trimEnd()}...`;
  }

  return `${truncated.slice(0, lastSpace).trimEnd()}...`;
}

export function getReviewsBadgeData(): ReviewsBadgeData {
  const config = parseYaml(reviewsConfigRaw) as Record<string, unknown>;
  const google = config.google as PlatformBadgeConfig | undefined;
  const facebook = config.facebook as PlatformBadgeConfig | undefined;

  return {
    google: {
      overallRating: google?.overallRating ?? 4.6,
      totalReviewCount: google?.totalReviewCount ?? null,
      reviewUrl: google?.reviewUrl ?? '#',
    },
    facebook: {
      overallRating: facebook?.overallRating ?? 5.0,
      totalReviewCount: facebook?.totalReviewCount ?? null,
      reviewUrl: facebook?.reviewUrl ?? '#',
    },
  };
}
