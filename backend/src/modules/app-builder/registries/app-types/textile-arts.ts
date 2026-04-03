/**
 * Textile Arts App Type Definition
 *
 * Complete definition for textile art studios and fiber arts workshops.
 * Essential for weaving studios, fiber arts centers, and textile schools.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEXTILE_ARTS_APP_TYPE: AppTypeDefinition = {
  id: 'textile-arts',
  name: 'Textile Arts Studio',
  category: 'creative',
  description: 'Textile arts studio platform with loom reservations, class scheduling, fiber inventory, and project tracking',
  icon: 'scissors',

  keywords: [
    'textile arts',
    'fiber arts',
    'textile arts software',
    'weaving studio',
    'fabric arts',
    'textile arts management',
    'loom reservations',
    'textile arts practice',
    'textile arts scheduling',
    'fiber classes',
    'textile arts crm',
    'dyeing',
    'textile arts business',
    'spinning',
    'textile arts pos',
    'knitting classes',
    'textile arts operations',
    'felting',
    'textile arts services',
    'embroidery',
  ],

  synonyms: [
    'textile arts platform',
    'textile arts software',
    'fiber arts software',
    'weaving studio software',
    'fabric arts software',
    'loom reservations software',
    'textile arts practice software',
    'fiber classes software',
    'spinning software',
    'embroidery software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Artist Portal', enabled: true, basePath: '/', layout: 'public', description: 'Classes and looms' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Students and fibers' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'instructor', name: 'Master Weaver', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/classes' },
    { id: 'assistant', name: 'Studio Assistant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inventory' },
    { id: 'student', name: 'Fiber Artist', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'projects',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'creative',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'artisan',

  examplePrompts: [
    'Build a textile arts studio platform',
    'Create a fiber arts center portal',
    'I need a weaving studio management system',
    'Build a fabric arts school platform',
    'Create a textile class and loom booking app',
  ],
};
