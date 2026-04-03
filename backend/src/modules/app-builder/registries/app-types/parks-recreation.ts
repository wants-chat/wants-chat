/**
 * Parks & Recreation App Type Definition
 *
 * Complete definition for parks and recreation department applications.
 * Essential for parks departments, recreation programs, and community facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PARKS_RECREATION_APP_TYPE: AppTypeDefinition = {
  id: 'parks-recreation',
  name: 'Parks & Recreation',
  category: 'government',
  description: 'Parks & recreation platform with program registration, facility reservations, park information, and activity scheduling',
  icon: 'trees',

  keywords: [
    'parks recreation',
    'parks department',
    'recreation programs',
    'program registration',
    'facility booking',
    'sports leagues',
    'recreation center',
    'park reservations',
    'youth programs',
    'senior programs',
    'swim lessons',
    'summer camps',
    'parks software',
    'recreation software',
    'activity registration',
    'pavilion rental',
    'sports fields',
    'community programs',
    'park events',
    'recreation management',
  ],

  synonyms: [
    'parks recreation platform',
    'parks department software',
    'recreation management software',
    'program registration software',
    'facility reservation software',
    'recreation center software',
    'sports league software',
    'park booking software',
    'activity registration software',
    'community recreation software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness gym', 'theme park'],

  sections: [
    { id: 'frontend', name: 'Community Portal', enabled: true, basePath: '/', layout: 'public', description: 'Programs and facilities' },
    { id: 'admin', name: 'Parks Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Programs and reservations' },
  ],

  roles: [
    { id: 'admin', name: 'Parks Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Recreation Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/programs' },
    { id: 'staff', name: 'Recreation Staff', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/registrations' },
    { id: 'instructor', name: 'Instructor', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/classes' },
    { id: 'resident', name: 'Resident', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'payments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'ecommerce'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'government',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'friendly',

  examplePrompts: [
    'Build a parks and recreation platform',
    'Create a program registration system',
    'I need a facility booking app',
    'Build a recreation department portal',
    'Create a community programs system',
  ],
};
