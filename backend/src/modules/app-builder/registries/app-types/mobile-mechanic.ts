/**
 * Mobile Mechanic App Type Definition
 *
 * Complete definition for mobile auto repair and roadside services.
 * Essential for mobile mechanics, on-site repair, and roadside assistance.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILE_MECHANIC_APP_TYPE: AppTypeDefinition = {
  id: 'mobile-mechanic',
  name: 'Mobile Mechanic',
  category: 'automotive',
  description: 'Mobile mechanic platform with location-based booking, route optimization, parts ordering, and real-time arrival tracking',
  icon: 'truck',

  keywords: [
    'mobile mechanic',
    'mobile auto repair',
    'mobile mechanic software',
    'on-site repair',
    'mobile service',
    'mobile mechanic management',
    'roadside repair',
    'mobile automotive',
    'mobile mechanic scheduling',
    'house call',
    'mobile mechanic crm',
    'on-location',
    'mobile mechanic business',
    'convenience repair',
    'mobile mechanic pos',
    'fleet service',
    'mobile mechanic operations',
    'driveway repair',
    'mobile mechanic services',
    'at-home repair',
  ],

  synonyms: [
    'mobile mechanic platform',
    'mobile mechanic software',
    'mobile auto repair software',
    'on-site repair software',
    'mobile service software',
    'roadside repair software',
    'mobile automotive software',
    'house call mechanic software',
    'at-home repair software',
    'mobile car service software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'shop-based'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book and track' },
    { id: 'admin', name: 'Dispatch Dashboard', enabled: true, basePath: '/admin', requiredRole: 'mechanic', layout: 'admin', description: 'Routes and jobs' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'dispatcher', name: 'Dispatcher', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dispatch' },
    { id: 'mechanic', name: 'Mobile Mechanic', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'service-scheduling',
    'parts-catalog',
    'vehicle-history',
    'recalls-tracking',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'automotive',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a mobile mechanic platform',
    'Create a mobile auto repair booking app',
    'I need a mobile service dispatch system',
    'Build an on-site repair scheduling platform',
    'Create a roadside mechanic app',
  ],
};
