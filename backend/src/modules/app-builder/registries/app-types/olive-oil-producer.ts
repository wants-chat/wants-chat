/**
 * Olive Oil Producer App Type Definition
 *
 * Complete definition for olive oil producers and specialty oil retailers.
 * Essential for olive growers, artisan oil makers, and specialty oil shops.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OLIVE_OIL_PRODUCER_APP_TYPE: AppTypeDefinition = {
  id: 'olive-oil-producer',
  name: 'Olive Oil Producer',
  category: 'food-production',
  description: 'Olive oil platform with harvest tracking, tasting notes, vintage management, and direct-to-consumer sales',
  icon: 'droplet',

  keywords: [
    'olive oil producer',
    'olive farm',
    'olive oil producer software',
    'extra virgin',
    'artisan oil',
    'olive oil producer management',
    'harvest tracking',
    'olive oil producer practice',
    'olive oil producer scheduling',
    'tasting notes',
    'olive oil producer crm',
    'vintage oils',
    'olive oil producer business',
    'mill production',
    'olive oil producer pos',
    'specialty oils',
    'olive oil producer operations',
    'olive grove',
    'olive oil producer services',
    'premium oils',
  ],

  synonyms: [
    'olive oil producer platform',
    'olive oil producer software',
    'olive farm software',
    'extra virgin software',
    'artisan oil software',
    'harvest tracking software',
    'olive oil producer practice software',
    'tasting notes software',
    'mill production software',
    'premium oils software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'technology'],

  sections: [
    { id: 'frontend', name: 'Shop Portal', enabled: true, basePath: '/', layout: 'public', description: 'Oils and tastings' },
    { id: 'admin', name: 'Producer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Production and sales' },
  ],

  roles: [
    { id: 'admin', name: 'Producer Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'producer', name: 'Oil Producer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/production' },
    { id: 'staff', name: 'Farm Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/harvest' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'automotive-repair'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'food-production',

  defaultColorScheme: 'olive',
  defaultDesignVariant: 'rustic',

  examplePrompts: [
    'Build an olive oil producer platform',
    'Create an artisan oil shop portal',
    'I need an olive farm management system',
    'Build an olive oil business platform',
    'Create an olive oil tasting and sales app',
  ],
};
