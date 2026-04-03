/**
 * Senior Transportation App Type Definition
 *
 * Complete definition for senior transportation and medical transport services.
 * Essential for senior ride services, medical transportation, and mobility assistance.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SENIOR_TRANSPORTATION_APP_TYPE: AppTypeDefinition = {
  id: 'senior-transportation',
  name: 'Senior Transportation',
  category: 'seniors',
  description: 'Senior transportation platform with ride scheduling, driver management, wheelchair accessibility, and recurring appointments',
  icon: 'car',

  keywords: [
    'senior transportation',
    'senior transport',
    'senior transportation software',
    'medical transport',
    'senior rides',
    'senior transportation management',
    'elderly transport',
    'senior shuttle',
    'senior transportation scheduling',
    'wheelchair transport',
    'senior transportation crm',
    'NEMT',
    'senior transportation business',
    'dial-a-ride',
    'senior transportation pos',
    'accessible transport',
    'senior transportation operations',
    'medical appointments',
    'senior transportation services',
    'mobility transport',
  ],

  synonyms: [
    'senior transportation platform',
    'senior transportation software',
    'medical transport software',
    'senior rides software',
    'elderly transport software',
    'senior shuttle software',
    'wheelchair transport software',
    'NEMT software',
    'dial-a-ride software',
    'accessible transport software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'taxi general'],

  sections: [
    { id: 'frontend', name: 'Rider Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book rides and history' },
    { id: 'admin', name: 'Dispatch Dashboard', enabled: true, basePath: '/admin', requiredRole: 'driver', layout: 'admin', description: 'Routes and drivers' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Dispatcher', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dispatch' },
    { id: 'driver', name: 'Driver', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/trips' },
    { id: 'rider', name: 'Rider', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['table-reservations', 'student-enrollment', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'seniors',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a senior transportation service platform',
    'Create a medical transport scheduling app',
    'I need a senior rides booking system',
    'Build a NEMT dispatch platform',
    'Create a wheelchair accessible transport app',
  ],
};
