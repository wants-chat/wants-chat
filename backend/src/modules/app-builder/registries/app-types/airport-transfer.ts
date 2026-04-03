/**
 * Airport Transfer App Type Definition
 *
 * Complete definition for airport transfer and ground transportation applications.
 * Essential for transfer services, shuttle operators, and ground transportation.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIRPORT_TRANSFER_APP_TYPE: AppTypeDefinition = {
  id: 'airport-transfer',
  name: 'Airport Transfer',
  category: 'travel',
  description: 'Airport transfer platform with booking, fleet management, driver dispatch, and flight tracking',
  icon: 'car',

  keywords: [
    'airport transfer',
    'airport shuttle',
    'airport taxi',
    'airport transfer software',
    'ground transportation',
    'airport pickup',
    'airport drop-off',
    'transfer service',
    'airport limo',
    'airport booking',
    'shuttle service',
    'airport transportation',
    'private transfer',
    'airport dispatch',
    'transfer booking',
    'hotel transfer',
    'airport ride',
    'meet and greet',
    'airport transfer business',
    'ground transport',
  ],

  synonyms: [
    'airport transfer platform',
    'airport transfer software',
    'airport shuttle software',
    'ground transportation software',
    'airport taxi software',
    'transfer booking software',
    'airport pickup software',
    'shuttle service software',
    'airport transportation software',
    'transfer dispatch software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'bank transfer'],

  sections: [
    { id: 'frontend', name: 'Passenger Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and tracking' },
    { id: 'admin', name: 'Transfer Dashboard', enabled: true, basePath: '/admin', requiredRole: 'dispatcher', layout: 'admin', description: 'Bookings and drivers' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'dispatcher', name: 'Dispatcher', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/dispatch' },
    { id: 'driver', name: 'Driver', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/trips' },
    { id: 'passenger', name: 'Passenger', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'clients',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'manufacturing'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'travel',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an airport transfer booking platform',
    'Create an airport shuttle service app',
    'I need an airport transportation system',
    'Build a ground transport booking app',
    'Create an airport taxi dispatch platform',
  ],
};
