/**
 * Classified Ads App Type Definition
 *
 * Complete definition for classified ads and listing platform applications.
 * Essential for classifieds sites, buy/sell marketplaces, and local listings.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CLASSIFIED_ADS_APP_TYPE: AppTypeDefinition = {
  id: 'classified-ads',
  name: 'Classified Ads',
  category: 'marketplace',
  description: 'Classified ads platform with listings, messaging, categories, and location-based search',
  icon: 'newspaper',

  keywords: [
    'classified ads',
    'classifieds',
    'buy sell',
    'craigslist',
    'facebook marketplace',
    'offerup',
    'letgo',
    'local listings',
    'for sale',
    'free ads',
    'buy and sell',
    'online classifieds',
    'local marketplace',
    'community marketplace',
    'garage sale',
    'yard sale',
    'swap meet',
    'trade platform',
    'used items',
    'secondhand',
    'peer to peer',
  ],

  synonyms: [
    'classified ads platform',
    'classifieds software',
    'classified listing site',
    'buy sell platform',
    'local marketplace software',
    'classified ads website',
    'online classifieds platform',
    'listing marketplace',
    'p2p marketplace',
    'community marketplace app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Marketplace', enabled: true, basePath: '/', layout: 'public', description: 'Browse and post listings' },
    { id: 'admin', name: 'Admin Dashboard', enabled: true, basePath: '/admin', requiredRole: 'moderator', layout: 'admin', description: 'Moderate listings and users' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'moderator', name: 'Moderator', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/listings' },
    { id: 'seller', name: 'Seller', level: 30, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/my-listings' },
    { id: 'user', name: 'User', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'messaging',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['medical-records', 'course-management', 'workout-plans'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'marketplace',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'clean',

  examplePrompts: [
    'Build a classified ads platform',
    'Create a local buy/sell marketplace',
    'I need a Craigslist-style classifieds site',
    'Build a community marketplace for listings',
    'Create a peer-to-peer selling platform',
  ],
};
