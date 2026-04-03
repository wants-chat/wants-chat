/**
 * Summer Camp App Type Definition
 *
 * Complete definition for summer camps and youth camp applications.
 * Essential for day camps, overnight camps, and specialty camps.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SUMMER_CAMP_APP_TYPE: AppTypeDefinition = {
  id: 'summer-camp',
  name: 'Summer Camp',
  category: 'children',
  description: 'Summer camp platform with session registration, camper management, health forms, and parent communication',
  icon: 'sun',

  keywords: [
    'summer camp',
    'day camp',
    'camp software',
    'youth camp',
    'camp registration',
    'camp management',
    'overnight camp',
    'camp booking',
    'camp scheduling',
    'specialty camp',
    'camp crm',
    'sports camp',
    'camp business',
    'arts camp',
    'camp pos',
    'stem camp',
    'camp operations',
    'camper management',
    'camp services',
    'adventure camp',
  ],

  synonyms: [
    'summer camp platform',
    'summer camp software',
    'day camp software',
    'youth camp software',
    'camp registration software',
    'camp management software',
    'overnight camp software',
    'camp booking software',
    'specialty camp software',
    'camp operations software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'boot camp'],

  sections: [
    { id: 'frontend', name: 'Parent Portal', enabled: true, basePath: '/', layout: 'public', description: 'Registration and updates' },
    { id: 'admin', name: 'Camp Dashboard', enabled: true, basePath: '/admin', requiredRole: 'counselor', layout: 'admin', description: 'Campers and sessions' },
  ],

  roles: [
    { id: 'admin', name: 'Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Program Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/sessions' },
    { id: 'counselor', name: 'Counselor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/campers' },
    { id: 'parent', name: 'Parent', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'waitlist',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'children',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a summer camp registration platform',
    'Create a day camp management app',
    'I need a youth camp booking system',
    'Build a specialty camp scheduling platform',
    'Create a camp parent communication app',
  ],
};
