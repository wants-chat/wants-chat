/**
 * Landing Page Feature Definition
 *
 * Public landing page / home page for apps that need a public-facing
 * entry point. Used by ecommerce, blog, and other apps where
 * guests should see content before logging in.
 *
 * IMPORTANT: The actual components used are determined by the app-type's
 * `landingPageComponents` array. Each app-type defines its own combination
 * of components for a type-appropriate landing page.
 *
 * Example (from ecommerce.ts):
 *   landingPageComponents: ['hero-section', 'featured-products', 'testimonials', 'cta-block']
 *
 * Example (from blog.ts):
 *   landingPageComponents: ['hero-section', 'featured-posts', 'category-list', 'newsletter-signup']
 *
 * The components listed below are defaults used when app-type doesn't specify.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const LANDING_PAGE_FEATURE: FeatureDefinition = {
  id: 'landing-page',
  name: 'Landing Page',
  category: 'core',
  description: 'Public landing page - components determined by app-type\'s landingPageComponents',
  icon: 'home',

  // This feature is available to all app types
  // Each app-type that uses it should define its own landingPageComponents
  includedInAppTypes: [],

  activationKeywords: [
    'landing page',
    'home page',
    'homepage',
    'public page',
    'marketing page',
    'front page',
    'welcome page',
  ],

  enabledByDefault: false, // App-type must explicitly include in defaultFeatures
  optional: true,

  dependencies: [],
  conflicts: [],

  pages: [
    {
      id: 'landing',
      route: '/',
      section: 'frontend',
      title: 'Home',
      authRequired: false, // PUBLIC - guests can view
      templateId: 'landing-page',
      // Default components - overridden by app-type's landingPageComponents
      components: [
        'hero-section',
        'cta-block',
      ],
      layout: 'default',
    },
  ],

  // All available landing page components
  // App-types pick from this list via landingPageComponents
  components: [
    // Hero variants
    'hero-section',
    'hero-full-width',
    'hero-centered',
    'hero-split-layout',
    // Product/Content showcases
    'featured-products',
    'product-showcase',
    'featured-posts',
    'recent-posts-grid',
    'category-showcase',
    'category-list',
    // Feature showcases
    'feature-showcase-grid',
    'feature-showcase-alternating',
    // Social proof
    'testimonial-grid',
    'testimonial-slider',
    'partner-client-logos',
    'awards-showcase',
    'author-spotlight',
    // Marketing
    'promotional-banner',
    'newsletter-signup',
    'cta-block',
    // Navigation (always included)
    'navbar',
    'footer',
  ],

  entities: [],
  apiRoutes: [],
  config: [],
};
