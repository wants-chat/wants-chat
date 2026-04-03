/**
 * Heliport App Type Definition
 *
 * Complete definition for heliports and helicopter operations.
 * Essential for heliports, helicopter bases, and rotorcraft operations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HELIPORT_APP_TYPE: AppTypeDefinition = {
  id: 'heliport',
  name: 'Heliport Operations',
  category: 'aviation',
  description: 'Heliport platform with landing scheduling, fuel services, hangar management, and flight operations',
  icon: 'helicopter',

  keywords: [
    'heliport',
    'helicopter base',
    'heliport software',
    'rotorcraft operations',
    'landing pad',
    'heliport management',
    'landing scheduling',
    'heliport practice',
    'heliport scheduling',
    'helicopter services',
    'heliport crm',
    'heli-skiing',
    'heliport business',
    'offshore operations',
    'heliport pos',
    'ems helicopter',
    'heliport operations',
    'vip transport',
    'heliport services',
    'helicopter tours',
  ],

  synonyms: [
    'heliport platform',
    'heliport software',
    'helicopter base software',
    'rotorcraft operations software',
    'landing pad software',
    'landing scheduling software',
    'heliport practice software',
    'helicopter services software',
    'offshore operations software',
    'helicopter tours software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Operator Portal', enabled: true, basePath: '/', layout: 'public', description: 'Landings and services' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Flights and facilities' },
  ],

  roles: [
    { id: 'admin', name: 'Heliport Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'supervisor', name: 'Operations Supervisor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'ground', name: 'Ground Crew', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/landings' },
    { id: 'operator', name: 'Helicopter Operator', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'aviation',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a heliport operations platform',
    'Create a helicopter base portal',
    'I need a heliport management system',
    'Build a rotorcraft operations platform',
    'Create a landing and helicopter services app',
  ],
};
