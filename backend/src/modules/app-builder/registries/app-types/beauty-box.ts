/**
 * Beauty Box App Type Definition
 *
 * Complete definition for beauty box subscription services.
 * Essential for beauty boxes, cosmetics subscriptions, and skincare delivery.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BEAUTY_BOX_APP_TYPE: AppTypeDefinition = {
  id: 'beauty-box',
  name: 'Beauty Box',
  category: 'subscription',
  description: 'Beauty box platform with beauty profiles, product preferences, skincare quizzes, and sample ratings',
  icon: 'sparkles',

  keywords: [
    'beauty box',
    'cosmetics subscription',
    'beauty box software',
    'skincare delivery',
    'makeup samples',
    'beauty box management',
    'beauty profiles',
    'beauty box practice',
    'beauty box scheduling',
    'product preferences',
    'beauty box crm',
    'skincare quizzes',
    'beauty box business',
    'sample ratings',
    'beauty box pos',
    'full-size products',
    'beauty box operations',
    'clean beauty',
    'beauty box platform',
    'luxury samples',
  ],

  synonyms: [
    'beauty box platform',
    'beauty box software',
    'cosmetics subscription software',
    'skincare delivery software',
    'makeup samples software',
    'beauty profiles software',
    'beauty box practice software',
    'product preferences software',
    'skincare quizzes software',
    'luxury samples software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'automotive'],

  sections: [
    { id: 'frontend', name: 'Subscriber Portal', enabled: true, basePath: '/', layout: 'public', description: 'Boxes and ratings' },
    { id: 'admin', name: 'Beauty Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Subscribers and products' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'curator', name: 'Beauty Curator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/selections' },
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

  incompatibleFeatures: ['property-listings', 'car-inventory', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'beauty',

  defaultColorScheme: 'rose',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build a beauty box subscription platform',
    'Create a cosmetics subscription portal',
    'I need a skincare sample delivery system',
    'Build a makeup subscription platform',
    'Create a beauty profile and rating app',
  ],
};
