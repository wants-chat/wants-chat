/**
 * Helicopter Tour App Type Definition
 *
 * Complete definition for helicopter tour and charter operations.
 * Essential for helicopter tour operators, aerial sightseeing, and charter services.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HELICOPTER_TOUR_APP_TYPE: AppTypeDefinition = {
  id: 'helicopter-tour',
  name: 'Helicopter Tour',
  category: 'entertainment',
  description: 'Helicopter tour platform with flight booking, aircraft scheduling, pilot dispatch, and FAA compliance tracking',
  icon: 'plane',

  keywords: [
    'helicopter tour',
    'aerial sightseeing',
    'helicopter tour software',
    'charter service',
    'scenic flight',
    'helicopter tour management',
    'flight booking',
    'helicopter tour practice',
    'helicopter tour scheduling',
    'aircraft scheduling',
    'helicopter tour crm',
    'pilot dispatch',
    'helicopter tour business',
    'faa compliance',
    'helicopter tour pos',
    'city tour',
    'helicopter tour operations',
    'private charter',
    'helicopter tour platform',
    'aerial photography',
  ],

  synonyms: [
    'helicopter tour platform',
    'helicopter tour software',
    'aerial sightseeing software',
    'charter service software',
    'scenic flight software',
    'flight booking software',
    'helicopter tour practice software',
    'aircraft scheduling software',
    'pilot dispatch software',
    'city tour software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tours and charters' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Fleet and pilots' },
  ],

  roles: [
    { id: 'admin', name: 'Tour Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'pilot', name: 'Helicopter Pilot', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/flights' },
    { id: 'dispatch', name: 'Flight Dispatcher', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Passenger', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'sky',
  defaultDesignVariant: 'premium',

  examplePrompts: [
    'Build a helicopter tour platform',
    'Create an aerial sightseeing portal',
    'I need a charter service system',
    'Build a scenic flight booking platform',
    'Create a helicopter charter app',
  ],
};
