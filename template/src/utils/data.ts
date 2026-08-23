import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { FeatureName } from './features';

// ===== Type Definitions =====

export interface Address {
  street: string;
  suite: string;
  city: string;
  state: string;
  zip: string;
  full: string;
}

export interface SocialMedia {
  facebook: string;
  instagram: string;
  youtube: string;
  nextdoor: string;
}

export interface SEODefaults {
  titleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  locale: string;
}

export interface ServiceAreaMapConfig {
  centerLat: number;
  centerLon: number;
  zoom: number;
}

export interface ServiceArea {
  primary: string;
  regions: string[];
  map?: ServiceAreaMapConfig;
}

export interface BusinessHoursSpec {
  days: string[];
  opens: string;
  closes: string;
}

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  neutral: string;
  neutralLight: string;
  white: string;
}

export interface Credit {
  enabled: boolean;
  text: string;
  url: string;
}

export interface SendGridProfile {
  toEmail: string | string[];
  fromEmail: string;
  fromName: string;
}

export interface FormConfig {
  activeProfile: string;
  profiles: Record<string, SendGridProfile>;
}

export interface Branding {
  companyName: string;
  companyNameShort: string;
  tagline: string;
  headerTagline?: string;
  yearEstablished: number;
  phone: string;
  phoneRaw: string;
  email: string;
  address: Address;
  businessHours?: BusinessHoursSpec[];
  priceRange?: string;
  website: string;
  googleMapsUrl: string;
  googleReviewUrl: string;
  socialMedia: SocialMedia;
  logo: string;
  logoIcon: string;
  logoText: string;
  seo: SEODefaults;
  serviceArea: ServiceArea;
  licenses?: {
    plumbing?: string;
    gas?: string;
    gasPlumbing?: string;
    electrical?: string;
    ac?: string;
  };
  theme: ThemeColors;
  credit?: Credit;
}

export interface CTAButton {
  text: string;
  url: string;
}

export interface TrustSignal {
  icon: string;
  text: string;
}

export interface HeroCTA {
  heading: string;
  headingAccent?: string;
  headingMain?: string;
  subheading: string;
  trustSignals?: TrustSignal[];
  primaryButton: CTAButton;
  secondaryButton: CTAButton;
}

export interface ServicesCTA {
  heading: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
}

export interface MaintenancePlanCTA {
  eyebrow: string;
  heading: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
  disclaimer?: string;
}

export interface EmergencyCTA {
  heading: string;
  body: string;
  buttonText: string;
  phone: string;
  phoneRaw: string;
}

export interface FooterCTA {
  heading: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
}

export interface CTAs {
  hero: HeroCTA;
  servicesCta: ServicesCTA;
  maintenancePlanCta?: MaintenancePlanCTA;
  emergencyCta: EmergencyCTA;
  footerCta: FooterCTA;
}

export interface FAQQuestion {
  question: string;
  answer: string;
}

export interface FAQCategory {
  name: string;
  slug: string;
  questions: FAQQuestion[];
}

export interface FAQs {
  categories: FAQCategory[];
}

export interface NavChild {
  label: string;
  url: string;
}

export interface NavItem {
  label: string;
  url: string;
  children?: NavChild[];
  /** Optional feature flag — item is hidden by getVisibleNavigation() when the flag is off. */
  flag?: FeatureName;
}

export interface UtilityNavItem {
  label: string;
  url: string;
  icon: string;
}

export interface Navigation {
  mainNav: NavItem[];
  utilityNav: UtilityNavItem[];
}

export interface ServiceAreaRegion {
  name: string;
  description: string;
  cities: string[];
}

export interface LocalBenefit {
  icon: string;
  title: string;
  description: string;
}

export interface Headquarters {
  lat: number;
  lng: number;
  label: string;
}

export interface ServiceAreasData {
  badge: string;
  heading: string;
  subheading: string;
  cities: string[];
  ctaText: string;
  ctaUrl: string;
  pageHeading?: string;
  pageSubheading?: string;
  pageIntro?: string;
  coverageRadius?: number;
  coverageUnit?: string;
  headquarters?: Headquarters;
  regions?: ServiceAreaRegion[];
  localBenefits?: LocalBenefit[];
}

// ===== Coupons =====

export interface Coupon {
  id: string;
  title: string;
  description: string;
  discountType: 'fixed' | 'percentage' | 'free';
  discountValue: number;
  code: string;
  validUntil: string;
  terms: string;
  category: string;
  featured: boolean;
  active: boolean;
}

export interface CouponsData {
  coupons: Coupon[];
}

// ===== Analytics =====

export interface GTMConfig {
  id: string;
}

export interface AnalyticsConfig {
  gtm: GTMConfig;
}

// ===== Modals =====

export interface ModalButton {
  text: string;
  url?: string;
}

export interface ExitIntentModalConfig {
  heading: string;
  subheading: string;
  secondaryButton: ModalButton;
  activationDelay: number;
  excludePaths: string[];
}

export interface ThankYouModalConfig {
  heading: string;
  subheading: string;
  body: string;
  icon: string;
  primaryButton: ModalButton;
  secondaryButton: ModalButton;
}

export interface ModalsConfig {
  exitIntent: ExitIntentModalConfig;
  thankYou: ThankYouModalConfig;
}

// ===== Floating Contact =====

export interface FloatingContactSpeechBubble {
  enabled: boolean;
  intervalMs: number;
  displayMs: number;
  initialDelayMs: number;
  messages: string[];
}

export interface FloatingContactButtonConfig {
  ariaLabel: string;
  icon: string;
  closeIcon: string;
}

export interface FloatingContactFormConfig {
  heading: string;
  subtitle: string;
  submitText: string;
}

export interface FloatingContactConfig {
  button: FloatingContactButtonConfig;
  speechBubble: FloatingContactSpeechBubble;
  form: FloatingContactFormConfig;
  hideOnPaths: string[];
}

// ===== Blog =====

export interface BlogConfig {
  indexHeading: string;
  indexSubheading: string;
  indexBadge: string;
  postsPerPage: number;
  defaultAuthor: string;
  categories: string[];
}

// ===== Careers =====

export interface CareersConfig {
  indexHeading: string;
  indexSubheading: string;
  indexBadge: string;
  departments: string[];
}

// ===== Reviews =====

export type ReviewProvider = 'google_places' | 'outscraper' | 'static_fallback';

export interface ReviewsProviderDisplay {
  maxReviews: number;
}

export interface ReviewsProviderFlag {
  enabled: boolean;
}

export interface ReviewsPlatformBadge {
  overallRating: number;
  totalReviewCount: number | null;
  reviewUrl: string;
}

export interface ReviewsConfig {
  mode: string;
  providerOrder: ReviewProvider[];
  reviewUrl: string;
  scrapeUrl?: string;
  placeId: string;
  display: ReviewsProviderDisplay;
  cacheTtlMinutes: number;
  googlePlaces: ReviewsProviderFlag;
  outscraper: ReviewsProviderFlag;
  staticFallback: ReviewsProviderFlag;
  google: ReviewsPlatformBadge;
  facebook: ReviewsPlatformBadge;
}

export interface NormalizedReview {
  authorName: string;
  authorPhotoUrl: string;
  rating: number;
  text: string;
  relativeDate: string;
  publishDate: string;
}

export interface ReviewsFallback {
  generatedAt?: string;
  generatedBy?: string;
  sourceProvider?: string;
  reviewUrl?: string;
  placeId?: string;
  overallRating: number;
  totalReviewCount: number;
  reviews: NormalizedReview[];
}

// ===== Schema Config =====

export interface SchemaConfig {
  schemaData: string;
  notes?: string;
}

// ===== Data Loading Helpers =====

const dataDir = path.resolve(process.cwd(), 'src/data');

export function loadYaml<T>(filename: string): T {
  const filePath = path.join(dataDir, filename);
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  return yaml.load(fileContents) as T;
}

let brandingCache: Branding | null = null;
let ctasCache: CTAs | null = null;
let faqsCache: FAQs | null = null;
let navigationCache: Navigation | null = null;
let serviceAreasCache: ServiceAreasData | null = null;
let formConfigCache: FormConfig | null = null;
let couponsCache: CouponsData | null = null;
let analyticsConfigCache: AnalyticsConfig | null = null;
let modalsCache: ModalsConfig | null = null;
let floatingContactCache: FloatingContactConfig | null = null;
let blogConfigCache: BlogConfig | null = null;
let careersConfigCache: CareersConfig | null = null;
let reviewsConfigCache: ReviewsConfig | null = null;
let reviewsFallbackCache: ReviewsFallback | null = null;
let schemaConfigCache: SchemaConfig | null = null;

export function getBranding(): Branding {
  if (!brandingCache) {
    brandingCache = loadYaml<Branding>('branding.yaml');
  }
  return brandingCache;
}

export function getCtas(): CTAs {
  if (!ctasCache) {
    ctasCache = loadYaml<CTAs>('ctas.yaml');
  }
  return ctasCache;
}

export function getFaqs(): FAQs {
  if (!faqsCache) {
    faqsCache = loadYaml<FAQs>('faqs.yaml');
  }
  return faqsCache;
}

export function getNavigation(): Navigation {
  if (!navigationCache) {
    navigationCache = loadYaml<Navigation>('navigation.yaml');
  }
  return navigationCache;
}

export function getServiceAreas(): ServiceAreasData {
  if (!serviceAreasCache) {
    serviceAreasCache = loadYaml<ServiceAreasData>('service-areas.yaml');
  }
  return serviceAreasCache;
}

export function getFormConfig(): FormConfig {
  if (!formConfigCache) {
    formConfigCache = loadYaml<FormConfig>('form-config.yaml');
  }
  return formConfigCache;
}

export function getCoupons(): CouponsData {
  if (!couponsCache) {
    couponsCache = loadYaml<CouponsData>('coupons.yaml');
  }
  return couponsCache;
}

export function getActiveCoupons(): Coupon[] {
  const { coupons } = getCoupons();
  return coupons.filter((coupon) => coupon.active);
}

export function getFeaturedCoupons(): Coupon[] {
  return getActiveCoupons().filter((coupon) => coupon.featured);
}

export function getActiveSendGridProfile(config?: FormConfig): SendGridProfile {
  const cfg = config ?? getFormConfig();
  const profile = cfg.profiles[cfg.activeProfile];
  if (!profile) {
    throw new Error(
      `Unknown SendGrid profile "${cfg.activeProfile}". Available: ${Object.keys(cfg.profiles).join(', ')}`
    );
  }
  return profile;
}

export function getAnalyticsConfig(): AnalyticsConfig {
  if (!analyticsConfigCache) {
    analyticsConfigCache = loadYaml<AnalyticsConfig>('analytics-config.yaml');
  }
  return analyticsConfigCache;
}

export function getModals(): ModalsConfig {
  if (!modalsCache) {
    modalsCache = loadYaml<ModalsConfig>('modals.yaml');
  }
  return modalsCache;
}

export function getFloatingContact(): FloatingContactConfig {
  if (!floatingContactCache) {
    floatingContactCache = loadYaml<FloatingContactConfig>('floating-contact.yaml');
  }
  return floatingContactCache;
}

export function getBlogConfig(): BlogConfig {
  if (!blogConfigCache) {
    blogConfigCache = loadYaml<BlogConfig>('blog-config.yaml');
  }
  return blogConfigCache;
}

export function getCareersConfig(): CareersConfig {
  if (!careersConfigCache) {
    careersConfigCache = loadYaml<CareersConfig>('careers-config.yaml');
  }
  return careersConfigCache;
}

export function getReviewsConfig(): ReviewsConfig {
  if (!reviewsConfigCache) {
    reviewsConfigCache = loadYaml<ReviewsConfig>('reviews_config.yaml');
  }
  return reviewsConfigCache;
}

export function getReviewsFallback(): ReviewsFallback {
  if (!reviewsFallbackCache) {
    reviewsFallbackCache = loadYaml<ReviewsFallback>('reviews_fallback.yaml');
  }
  return reviewsFallbackCache;
}

export function getSchemaConfig(): SchemaConfig {
  if (!schemaConfigCache) {
    schemaConfigCache = loadYaml<SchemaConfig>('schema-config.yaml');
  }
  return schemaConfigCache;
}

// ===== Home Page Variants =====

export type HomeVariantType = 'restaurant' | 'lawfirm' | 'dental' | 'gym' | 'salon' | 'autorepair';

export interface TrustPill {
  icon: string;
  label: string;
}

export interface VariantHeroData {
  eyebrow?: string;
  heading: string;
  headingAccent?: string;
  subheading: string;
  primaryCta: CTAButton;
  secondaryCta?: CTAButton;
  trustPills?: TrustPill[];
}

export interface VariantStat {
  value: number;
  suffix?: string;
  label: string;
  icon: string;
  counter?: boolean;
}

export interface VariantFeature {
  icon: string;
  title: string;
  description: string;
}

export interface PricingItem {
  name: string;
  description?: string;
  price: string;
  badge?: string;
  featured?: boolean;
}

export interface PricingGroup {
  name?: string;
  items: PricingItem[];
}

export interface PricingData {
  badge?: string;
  heading: string;
  subheading?: string;
  layout: 'list' | 'cards';
  groups: PricingGroup[];
}

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  icon?: string;
}

export interface TeamData {
  badge?: string;
  heading: string;
  subheading?: string;
  members: TeamMember[];
}

export interface GalleryItem {
  icon: string;
  caption: string;
}

export interface GalleryData {
  heading: string;
  subheading?: string;
  items: GalleryItem[];
}

export interface VariantStep {
  step: number;
  title: string;
  description: string;
}

export interface VariantTestimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
}

export interface VariantCTA {
  heading: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
  variant?: string;
}

export interface HomeVariant {
  meta: { title: string; description: string };
  hero: VariantHeroData;
  stats?: VariantStat[];
  features?: VariantFeature[];
  featuresHeading?: string;
  featuresSubheading?: string;
  pricing?: PricingData;
  team?: TeamData;
  gallery?: GalleryData;
  steps?: VariantStep[];
  stepsHeading?: string;
  stepsSubheading?: string;
  testimonial?: VariantTestimonial;
  faqs?: FAQQuestion[];
  cta?: VariantCTA;
}

const homeVariantCache = new Map<HomeVariantType, HomeVariant>();

export function getHomeVariant(type: HomeVariantType): HomeVariant {
  if (!homeVariantCache.has(type)) {
    homeVariantCache.set(type, loadYaml<HomeVariant>(`home-variants/${type}.yaml`));
  }
  return homeVariantCache.get(type)!;
}

// ===== Business-Type Inner Pages =====
// One inner page per business type. Reuses the variant interfaces above so
// pages are pure composition of existing components.

export interface InnerPageHero {
  heading: string;
  subheading?: string;
  badge?: string;
}

export interface StorySection {
  badge?: string;
  heading: string;
  paragraphs: string[];
}

export interface BookingConfig {
  formHeading?: string;
  serviceOptions: { value: string; label: string }[];
}

export interface InnerPage {
  meta: { title: string; description: string };
  hero: InnerPageHero;
  story?: StorySection;
  intro?: StorySection;
  stats?: VariantStat[];
  statsBackground?: 'dark' | 'primary';
  values?: VariantFeature[];
  valuesHeading?: string;
  pricing?: PricingData;
  features?: VariantFeature[];
  featuresHeading?: string;
  team?: TeamData;
  gallery?: GalleryData;
  steps?: VariantStep[];
  stepsHeading?: string;
  booking?: BookingConfig;
  testimonial?: VariantTestimonial;
  faqs?: FAQQuestion[];
  faqsHeading?: string;
  cta?: VariantCTA;
  contactVariant?: 'alt1' | 'alt2' | 'none';
}

const innerPageCache = new Map<HomeVariantType, InnerPage>();

export function getInnerPage(type: HomeVariantType): InnerPage {
  if (!innerPageCache.has(type)) {
    innerPageCache.set(type, loadYaml<InnerPage>(`inner-pages/${type}.yaml`));
  }
  return innerPageCache.get(type)!;
}

export function cityToSlug(city: string): string {
  return city
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
