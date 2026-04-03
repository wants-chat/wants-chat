/**
 * Retreat Center App Type Definition
 *
 * Complete definition for spiritual retreat centers and wellness retreats.
 * Essential for retreat centers, spiritual communities, and wellness resorts.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RETREAT_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'retreat-center',
  name: 'Retreat Center',
  category: 'religious',
  description: 'Retreat center platform with program registration, accommodation booking, facilitator management, and guest services',
  icon: 'mountain',

  keywords: [
    'retreat center',
    'spiritual retreat',
    'retreat software',
    'wellness retreat',
    'retreat booking',
    'retreat management',
    'meditation retreat',
    'retreat programs',
    'retreat scheduling',
    'yoga retreat',
    'retreat crm',
    'silent retreat',
    'retreat business',
    'healing retreat',
    'retreat pos',
    'workshop retreat',
    'retreat operations',
    'nature retreat',
    'retreat services',
    'conference retreat',
  ],

  synonyms: [
    'retreat center platform',
    'retreat center software',
    'spiritual retreat software',
    'wellness retreat software',
    'retreat booking software',
    'retreat management software',
    'retreat program software',
    'retreat scheduling software',
    'retreat operations software',
    'retreat registration software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness center', 'military retreat'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Programs and booking' },
    { id: 'admin', name: 'Retreat Dashboard', enabled: true, basePath: '/admin', requiredRole: 'facilitator', layout: 'admin', description: 'Guests and programs' },
  ],

  roles: [
    { id: 'admin', name: 'Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Program Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/programs' },
    { id: 'facilitator', name: 'Facilitator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/retreats' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'documents',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'religious',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'natural',

  examplePrompts: [
    'Build a retreat center booking platform',
    'Create a spiritual retreat registration app',
    'I need a wellness retreat management system',
    'Build a meditation retreat program platform',
    'Create a retreat accommodation booking app',
  ],
};
