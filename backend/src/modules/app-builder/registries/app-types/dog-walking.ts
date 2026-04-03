/**
 * Dog Walking App Type Definition
 *
 * Complete definition for dog walking and pet walking applications.
 * Essential for dog walkers, pet walking services, and walking companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DOG_WALKING_APP_TYPE: AppTypeDefinition = {
  id: 'dog-walking',
  name: 'Dog Walking',
  category: 'pets',
  description: 'Dog walking platform with walk booking, GPS tracking, route management, and live updates',
  icon: 'map-pin',

  keywords: [
    'dog walking',
    'pet walking',
    'dog walker',
    'walking software',
    'walk booking',
    'dog walking service',
    'walking scheduling',
    'gps tracking',
    'walking crm',
    'walking business',
    'dog walker app',
    'walking management',
    'pet walking service',
    'walking routes',
    'walking pos',
    'group walks',
    'private walks',
    'walking company',
    'dog walk',
    'walking operations',
  ],

  synonyms: [
    'dog walking platform',
    'dog walking software',
    'pet walking software',
    'dog walker software',
    'walk booking software',
    'walking scheduling software',
    'walking service software',
    'walking management software',
    'gps walking software',
    'walking company software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'hiking trails'],

  sections: [
    { id: 'frontend', name: 'Pet Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and tracking' },
    { id: 'admin', name: 'Walking Dashboard', enabled: true, basePath: '/admin', requiredRole: 'walker', layout: 'admin', description: 'Walks and routes' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'walker', name: 'Dog Walker', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/walks' },
    { id: 'client', name: 'Pet Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'pets',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a dog walking booking platform',
    'Create a pet walking service app',
    'I need a dog walker GPS tracking system',
    'Build a walking company management app',
    'Create a group dog walk platform',
  ],
};
