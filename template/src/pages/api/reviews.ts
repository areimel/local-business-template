import type { APIRoute } from 'astro';
import { getReviewsData } from '@/utils/reviews';

// Runtime endpoint (Netlify serverless) — returns the resolved reviews payload.
// With the default static_fallback config it serves reviews_fallback.yaml; with
// API keys set it fetches live from Google Places / Outscraper. In-memory TTL
// caching lives in getReviewsData().
export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const reviewsData = await getReviewsData();
    return new Response(JSON.stringify(reviewsData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[reviews] Failed to resolve reviews payload:', error);
    return new Response(JSON.stringify({ error: 'Unable to load reviews' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
