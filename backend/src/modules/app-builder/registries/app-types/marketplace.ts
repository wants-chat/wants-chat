/**
 * Marketplace (Multi-Vendor) App Type Definition
 *
 * Complete definition for multi-vendor marketplace applications.
 * Essential for platforms like Amazon, Etsy, and eBay.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MARKETPLACE_APP_TYPE: AppTypeDefinition = {
  id: 'marketplace',
  name: 'Multi-Vendor Marketplace',
  category: 'commerce',
  description: 'Multi-vendor marketplace with seller storefronts, commissions, and order management',
  icon: 'store',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'marketplace',
    'multi-vendor',
    'multivendor',
    'multi vendor',
    'seller marketplace',
    'vendor marketplace',
    'amazon',
    'etsy',
    'ebay',
    'alibaba',
    'shopify marketplace',
    'seller portal',
    'vendor portal',
    'third party sellers',
    'commission',
    'seller management',
    'vendor management',
    'peer to peer',
    'p2p marketplace',
    'c2c marketplace',
    'b2b marketplace',
    'handmade marketplace',
    'craft marketplace',
    'service marketplace',
    'freelance marketplace',
    'fiverr',
    'upwork',
  ],

  synonyms: [
    'multi-seller platform',
    'vendor platform',
    'seller platform',
    'marketplace platform',
    'online marketplace',
    'ecommerce marketplace',
    'digital marketplace',
    'trading platform',
    'buyer seller platform',
    'merchant platform',
  ],

  negativeKeywords: [
    'single store',
    'blog',
    'portfolio',
    'landing page',
    'single vendor',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Marketplace',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public marketplace for browsing and purchasing',
    },
    {
      id: 'admin',
      name: 'Admin Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'admin',
      layout: 'admin',
      description: 'Platform administration and seller management',
    },
    {
      id: 'vendor',
      name: 'Seller Dashboard',
      enabled: true,
      basePath: '/seller',
      requiredRole: 'seller',
      layout: 'admin',
      description: 'Seller storefront and product management',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Platform Admin',
      level: 100,
      isDefault: false,
      accessibleSections: ['frontend', 'admin', 'vendor'],
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'moderator',
      name: 'Moderator',
      level: 70,
      isDefault: false,
      accessibleSections: ['frontend', 'admin'],
      defaultRoute: '/admin/products',
    },
    {
      id: 'seller',
      name: 'Seller',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend', 'vendor'],
      defaultRoute: '/seller/dashboard',
    },
    {
      id: 'buyer',
      name: 'Buyer',
      level: 20,
      isDefault: true,
      accessibleSections: ['frontend'],
      defaultRoute: '/',
    },
  ],

  // ─────────────────────────────────────────────────────────────
  // FEATURES - Default and optional
  // ─────────────────────────────────────────────────────────────
  defaultFeatures: [
    'user-auth',
    'product-catalog',
    'shopping-cart',
    'checkout',
    'orders',
    'search',
    'notifications',
    'categories',
  ],

  optionalFeatures: [
    'payments',
    'reviews',
    'messaging',
    'shipping',
    'inventory',
    'analytics',
    'wishlist',
    'subscriptions',
    'invoicing',
    'discounts',
    'team-management',
  ],

  incompatibleFeatures: [
    'course-management',
    'appointments',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'commerce',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'amber',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a multi-vendor marketplace',
    'Create an Etsy-like platform',
    'I need a marketplace for sellers',
    'Build a platform where vendors can sell products',
    'Create a marketplace with seller storefronts',
    'I want to build a multi-seller ecommerce platform',
    'Make a marketplace app like Amazon',
  ],
};
