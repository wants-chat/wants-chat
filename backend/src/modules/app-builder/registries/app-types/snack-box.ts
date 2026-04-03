/**
 * Snack Box App Type Definition
 *
 * Complete definition for snack box subscription services.
 * Essential for snack boxes, treat subscriptions, and curated snacks.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SNACK_BOX_APP_TYPE: AppTypeDefinition = {
  id: 'snack-box',
  name: 'Snack Box',
  category: 'subscription',
  description: 'Snack box platform with taste profiles, dietary filters, snack ratings, and discovery features',
  icon: 'package',

  keywords: [
    'snack box',
    'treat subscription',
    'snack box software',
    'curated snacks',
    'snack delivery',
    'snack box management',
    'taste profiles',
    'snack box practice',
    'snack box scheduling',
    'dietary filters',
    'snack box crm',
    'snack ratings',
    'snack box business',
    'discovery features',
    'snack box pos',
    'international snacks',
    'snack box operations',
    'healthy snacks',
    'snack box platform',
    'office snacks',
  ],

  synonyms: [
    'snack box platform',
    'snack box software',
    'treat subscription software',
    'curated snacks software',
    'snack delivery software',
    'taste profiles software',
    'snack box practice software',
    'dietary filters software',
    'snack ratings software',
    'office snacks software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'automotive'],

  sections: [
    { id: 'frontend', name: 'Subscriber Portal', enabled: true, basePath: '/', layout: 'public', description: 'Snacks and ratings' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Orders and curation' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'curator', name: 'Snack Curator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/selections' },
    { id: 'staff', name: 'Fulfillment Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/packing' },
    { id: 'subscriber', name: 'Subscriber', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'car-inventory', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'food',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a snack box subscription platform',
    'Create a treat subscription portal',
    'I need a curated snacks delivery system',
    'Build a snack discovery platform',
    'Create a taste profile and rating app',
  ],
};
