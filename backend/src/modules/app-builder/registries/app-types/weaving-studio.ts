/**
 * Weaving Studio App Type Definition
 *
 * Complete definition for weaving and textile arts operations.
 * Essential for weaving studios, textile workshops, and fiber arts centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WEAVING_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'weaving-studio',
  name: 'Weaving Studio',
  category: 'artisan',
  description: 'Weaving studio platform with loom scheduling, class booking, commission management, and fiber inventory',
  icon: 'grid',

  keywords: [
    'weaving studio',
    'textile arts',
    'weaving studio software',
    'fiber arts',
    'loom weaving',
    'weaving studio management',
    'loom scheduling',
    'weaving studio practice',
    'weaving studio scheduling',
    'class booking',
    'weaving studio crm',
    'commission management',
    'weaving studio business',
    'fiber inventory',
    'weaving studio pos',
    'tapestry',
    'weaving studio operations',
    'rug weaving',
    'weaving studio platform',
    'handwoven textiles',
  ],

  synonyms: [
    'weaving studio platform',
    'weaving studio software',
    'textile arts software',
    'fiber arts software',
    'loom weaving software',
    'loom scheduling software',
    'weaving studio practice software',
    'class booking software',
    'commission management software',
    'tapestry software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and gallery' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Looms and fiber' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'weaver', name: 'Master Weaver', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/looms' },
    { id: 'staff', name: 'Studio Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'member', name: 'Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'projects',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'artisan',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'artistic',

  examplePrompts: [
    'Build a weaving studio platform',
    'Create a textile arts portal',
    'I need a fiber arts studio system',
    'Build a loom scheduling platform',
    'Create a weaving class app',
  ],
};
