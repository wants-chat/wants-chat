/**
 * E-commerce App Type Definition
 *
 * Complete definition for e-commerce/online store applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ECOMMERCE_APP_TYPE: AppTypeDefinition = {
  id: 'ecommerce',
  name: 'E-commerce Store',
  category: 'commerce',
  description: 'Online store with product catalog, shopping cart, checkout, and order management',
  icon: 'shopping-bag',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'ecommerce',
    'e-commerce',
    'online store',
    'shop',
    'store',
    'product',
    'sell',
    'buy',
    'purchase',
    'shopping',
    'retail',
    'storefront',
    'webshop',
    'commerce',
    'bookstore',
    'marketplace',
    'cart',
    'checkout',
  ],

  synonyms: [
    'online shop',
    'web store',
    'internet shop',
    'digital store',
    'retail website',
    'shopping site',
    'merchandise store',
  ],

  negativeKeywords: [
    'blog only',
    'portfolio',
    'landing page',
    'documentation',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Storefront',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public-facing store for customers to browse and buy',
    },
    {
      id: 'admin',
      name: 'Admin Panel',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'admin',
      layout: 'admin',
      description: 'Store management for administrators',
    },
    {
      id: 'vendor',
      name: 'Vendor Dashboard',
      enabled: false, // Disabled by default, enabled for marketplace
      basePath: '/vendor',
      requiredRole: 'vendor',
      layout: 'vendor',
      description: 'Vendor management for multi-vendor setups',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'customer',
      name: 'Customer',
      level: 10,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'landing-page',
    'user-auth',
    'product-catalog',
    'shopping-cart',
    'checkout',
    'orders',
    'search',
    'categories',
  ],

  optionalFeatures: [
    'payments',
    'reviews',
    'wishlist',
    'inventory',
    'shipping',
    'discounts',
    'notifications',
    'analytics',
    'invoicing',
    'subscriptions',
  ],

  incompatibleFeatures: [
    'appointments', // Different app type
    'course-management',   // Different app type
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,      // Customers need accounts
  requiresPayment: true,   // Need payment processing
  multiTenant: false,      // Single store by default
  complexity: 'complex',
  industry: 'retail',

  // Landing page is public - both guests and authenticated users see it
  defaultRoute: '/',
  guestRoute: '/',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'blue',
  defaultDesignVariant: 'minimal',

  examplePrompts: [
    'Build an online store for selling electronics',
    'Create an e-commerce website for fashion',
    'I want to sell products online',
    'Build a shop to sell handmade crafts',
    'Create a storefront for my bakery',
  ],

  // ─────────────────────────────────────────────────────────────
  // LANDING PAGE COMPONENTS
  // ─────────────────────────────────────────────────────────────
  landingPageComponents: [
    'hero-section',
    'featured-products',
    'category-showcase',
    'promotional-banner',
    'testimonial-grid',
    'newsletter-signup',
    'cta-block',
  ],
};
