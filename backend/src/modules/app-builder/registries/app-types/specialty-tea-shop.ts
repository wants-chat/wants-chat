/**
 * Specialty Tea Shop App Type Definition
 *
 * Complete definition for specialty tea shop operations.
 * Essential for tea shops, tea houses, and specialty tea retailers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPECIALTY_TEA_SHOP_APP_TYPE: AppTypeDefinition = {
  id: 'specialty-tea-shop',
  name: 'Specialty Tea Shop',
  category: 'retail',
  description: 'Specialty tea platform with tea catalog, tasting room reservations, subscription boxes, and online sales',
  icon: 'coffee',

  keywords: [
    'specialty tea shop',
    'tea house',
    'specialty tea shop software',
    'tea retailer',
    'loose leaf tea',
    'specialty tea shop management',
    'tea catalog',
    'specialty tea shop practice',
    'specialty tea shop scheduling',
    'tasting room',
    'specialty tea shop crm',
    'subscription boxes',
    'specialty tea shop business',
    'online sales',
    'specialty tea shop pos',
    'tea ceremony',
    'specialty tea shop operations',
    'organic tea',
    'specialty tea shop platform',
    'tea accessories',
  ],

  synonyms: [
    'specialty tea shop platform',
    'specialty tea shop software',
    'tea house software',
    'tea retailer software',
    'loose leaf tea software',
    'tea catalog software',
    'specialty tea shop practice software',
    'tasting room software',
    'subscription boxes software',
    'tea ceremony software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Tea Shop', enabled: true, basePath: '/', layout: 'public', description: 'Teas and tastings' },
    { id: 'admin', name: 'Shop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Inventory and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Shop Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Shop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/inventory' },
    { id: 'sommelier', name: 'Tea Sommelier', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tastings' },
    { id: 'customer', name: 'Tea Lover', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'subscriptions',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'retail',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a specialty tea shop platform',
    'Create a tea house app',
    'I need a tea retailer system',
    'Build a loose leaf tea shop app',
    'Create a specialty tea shop portal',
  ],
};
