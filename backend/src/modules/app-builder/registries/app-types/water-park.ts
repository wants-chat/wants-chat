/**
 * Water Park App Type Definition
 *
 * Complete definition for water parks and aquatic centers.
 * Essential for water parks, wave pools, and water attraction venues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATER_PARK_APP_TYPE: AppTypeDefinition = {
  id: 'water-park',
  name: 'Water Park',
  category: 'entertainment',
  description: 'Water park platform with ticket sales, cabana rentals, locker management, and attraction scheduling',
  icon: 'waves',

  keywords: [
    'water park',
    'aquatic center',
    'water park software',
    'water slides',
    'wave pool',
    'water park ticketing',
    'cabana rentals',
    'water attractions',
    'splash pad',
    'water park management',
    'lazy river',
    'water park pos',
    'water park crm',
    'water park business',
    'pool complex',
    'water park scheduling',
    'locker rental',
    'water park operations',
    'aquatic entertainment',
    'water fun',
  ],

  synonyms: [
    'water park platform',
    'water park software',
    'aquatic center software',
    'water park ticketing software',
    'water park management software',
    'pool complex software',
    'water attraction software',
    'water park pos software',
    'water park operations software',
    'aquatic entertainment software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'swimming lessons'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tickets and rentals' },
    { id: 'admin', name: 'Park Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Operations and safety' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Park Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/operations' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/attractions' },
    { id: 'lifeguard', name: 'Lifeguard', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/safety' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
    'season-passes',
  ],

  optionalFeatures: [
    'payments',
    'reservations',
    'reporting',
    'analytics',
    'venue-booking',
    'box-office',
  ],

  incompatibleFeatures: ['course-management', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a water park ticketing platform',
    'Create a water park management app',
    'I need a water park cabana rental system',
    'Build a water attraction scheduling app',
    'Create an aquatic center platform',
  ],
};
