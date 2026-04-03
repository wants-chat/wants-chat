/**
 * Seafood Market App Type Definition
 *
 * Complete definition for seafood markets and fish shops.
 * Essential for fishmongers, seafood retailers, and fresh fish markets.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SEAFOOD_MARKET_APP_TYPE: AppTypeDefinition = {
  id: 'seafood-market',
  name: 'Seafood Market',
  category: 'food-production',
  description: 'Seafood market platform with daily catch updates, freshness tracking, sustainability sourcing, and restaurant wholesale',
  icon: 'fish',

  keywords: [
    'seafood market',
    'fish market',
    'seafood market software',
    'fishmonger',
    'fresh seafood',
    'seafood market management',
    'daily catch',
    'seafood market practice',
    'seafood market scheduling',
    'sustainable seafood',
    'seafood market crm',
    'shellfish',
    'seafood market business',
    'wholesale fish',
    'seafood market pos',
    'sushi grade',
    'seafood market operations',
    'oyster bar',
    'seafood market services',
    'fish retail',
  ],

  synonyms: [
    'seafood market platform',
    'seafood market software',
    'fish market software',
    'fishmonger software',
    'fresh seafood software',
    'daily catch software',
    'seafood market practice software',
    'sustainable seafood software',
    'wholesale fish software',
    'fish retail software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Market Portal', enabled: true, basePath: '/', layout: 'public', description: 'Fresh catch and orders' },
    { id: 'admin', name: 'Market Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Market Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'fishmonger', name: 'Fishmonger', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'staff', name: 'Market Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/orders' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'subscriptions',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'automotive-repair'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'food-production',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'fresh',

  examplePrompts: [
    'Build a seafood market platform',
    'Create a fish market ordering portal',
    'I need a fresh seafood shop management system',
    'Build a seafood market business platform',
    'Create a daily catch and ordering app',
  ],
};
