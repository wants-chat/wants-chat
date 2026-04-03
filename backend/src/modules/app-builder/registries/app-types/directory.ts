/**
 * Directory & Listings App Type Definition
 *
 * Complete definition for directory and listing applications.
 * Essential for business directories, service listings, and local search.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DIRECTORY_APP_TYPE: AppTypeDefinition = {
  id: 'directory',
  name: 'Directory & Listings',
  category: 'commerce',
  description: 'Business directory with listings, search, reviews, and local discovery',
  icon: 'building-columns',

  // ─────────────────────────────────────────────────────────────
  // DETECTION - Keywords and synonyms for matching
  // ─────────────────────────────────────────────────────────────
  keywords: [
    'directory',
    'business directory',
    'listing',
    'listings',
    'local directory',
    'service directory',
    'yellow pages',
    'yelp',
    'google maps',
    'tripadvisor',
    'foursquare',
    'local business',
    'local search',
    'business listings',
    'service listings',
    'company directory',
    'vendor directory',
    'supplier directory',
    'professional directory',
    'member directory',
    'place listings',
    'location listings',
    'classified',
    'classifieds',
    'local guide',
  ],

  synonyms: [
    'listing platform',
    'directory platform',
    'business finder',
    'local finder',
    'directory app',
    'listing app',
    'business search',
    'service finder',
    'directory site',
    'listing site',
  ],

  negativeKeywords: [
    'blog',
    'portfolio',
    'landing page',
    'single store',
  ],

  // ─────────────────────────────────────────────────────────────
  // STRUCTURE - Sections and roles
  // ─────────────────────────────────────────────────────────────
  sections: [
    {
      id: 'frontend',
      name: 'Directory',
      enabled: true,
      basePath: '/',
      layout: 'public',
      description: 'Public directory for browsing and searching listings',
    },
    {
      id: 'admin',
      name: 'Admin Dashboard',
      enabled: true,
      basePath: '/admin',
      requiredRole: 'admin',
      layout: 'admin',
      description: 'Directory administration and moderation',
    },
    {
      id: 'vendor',
      name: 'Business Dashboard',
      enabled: true,
      basePath: '/business',
      requiredRole: 'business',
      layout: 'admin',
      description: 'Business owner listing management',
    },
  ],

  roles: [
    {
      id: 'admin',
      name: 'Administrator',
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
      defaultRoute: '/admin/listings',
    },
    {
      id: 'business',
      name: 'Business Owner',
      level: 50,
      isDefault: false,
      accessibleSections: ['frontend', 'vendor'],
      defaultRoute: '/business/listing',
    },
    {
      id: 'user',
      name: 'User',
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
    'categories',
    'search',
    'notifications',
  ],

  optionalFeatures: [
    'reviews',
    'tags',
    'payments',
    'messaging',
    'analytics',
  ],

  incompatibleFeatures: [
    'shopping-cart',
    'course-management',
  ],

  // ─────────────────────────────────────────────────────────────
  // CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'commerce',

  // ─────────────────────────────────────────────────────────────
  // TEMPLATE CONFIGURATION
  // ─────────────────────────────────────────────────────────────
  defaultColorScheme: 'red',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a business directory',
    'Create a local listings platform',
    'I need a directory app like Yelp',
    'Build a service directory for my area',
    'Create a professional directory',
    'I want to build a business finder app',
    'Make a directory with reviews and maps',
  ],
};
