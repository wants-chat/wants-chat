/**
 * Agricultural Marketplace App Type Definition
 *
 * Complete definition for agricultural marketplace and farm-to-buyer applications.
 * Essential for farm markets, agricultural exchanges, and direct farm sales.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AGRICULTURAL_MARKETPLACE_APP_TYPE: AppTypeDefinition = {
  id: 'agricultural-marketplace',
  name: 'Agricultural Marketplace',
  category: 'agriculture',
  description: 'Agricultural marketplace with farm listings, product sales, buyer connections, and logistics coordination',
  icon: 'store',

  keywords: [
    'agricultural marketplace',
    'farm marketplace',
    'farm to table',
    'farm products',
    'agricultural exchange',
    'farm sales',
    'crop marketplace',
    'livestock marketplace',
    'farm direct',
    'agri marketplace',
    'farmers market online',
    'wholesale produce',
    'agricultural trading',
    'farm store',
    'commodity trading',
    'farm produce',
    'agricultural products',
    'farm goods',
    'agribusiness marketplace',
    'farm ecommerce',
  ],

  synonyms: [
    'agricultural marketplace platform',
    'farm marketplace software',
    'agricultural exchange software',
    'farm sales platform',
    'agri marketplace software',
    'farm direct software',
    'agricultural trading platform',
    'farm ecommerce software',
    'commodity marketplace software',
    'wholesale produce platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'general marketplace'],

  sections: [
    { id: 'frontend', name: 'Marketplace', enabled: true, basePath: '/', layout: 'public', description: 'Browse farms and products' },
    { id: 'admin', name: 'Seller Dashboard', enabled: true, basePath: '/admin', requiredRole: 'seller', layout: 'admin', description: 'Listings and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Platform Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Market Manager', level: 85, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/listings' },
    { id: 'seller', name: 'Farmer/Seller', level: 60, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/products' },
    { id: 'buyer', name: 'Buyer', level: 30, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'orders',
    'messaging',
    'payments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'reviews',
    'subscriptions',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'agriculture',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build an agricultural marketplace',
    'Create a farm to table platform',
    'I need a farm products marketplace',
    'Build a farmers market online platform',
    'Create an agricultural exchange app',
  ],
};
