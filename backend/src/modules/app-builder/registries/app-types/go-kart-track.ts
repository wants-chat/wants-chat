/**
 * Go-Kart Track App Type Definition
 *
 * Complete definition for go-kart racing entertainment operations.
 * Essential for go-kart tracks, racing centers, and motorsport venues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GO_KART_TRACK_APP_TYPE: AppTypeDefinition = {
  id: 'go-kart-track',
  name: 'Go-Kart Track',
  category: 'entertainment',
  description: 'Go-kart track platform with race booking, lap timing, league standings, and event management',
  icon: 'gauge',

  keywords: [
    'go-kart track',
    'karting center',
    'go-kart track software',
    'racing venue',
    'motorsport',
    'go-kart track management',
    'race booking',
    'go-kart track practice',
    'go-kart track scheduling',
    'lap timing',
    'go-kart track crm',
    'league standings',
    'go-kart track business',
    'event management',
    'go-kart track pos',
    'indoor karting',
    'go-kart track operations',
    'corporate racing',
    'go-kart track platform',
    'electric karts',
  ],

  synonyms: [
    'go-kart track platform',
    'go-kart track software',
    'karting center software',
    'racing venue software',
    'motorsport software',
    'race booking software',
    'go-kart track practice software',
    'lap timing software',
    'league standings software',
    'indoor karting software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Racer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Races and times' },
    { id: 'admin', name: 'Track Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Bookings and events' },
  ],

  roles: [
    { id: 'admin', name: 'Track Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Race Director', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/races' },
    { id: 'staff', name: 'Marshal', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/track' },
    { id: 'customer', name: 'Racer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
    'venue-booking',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'season-passes',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a go-kart track platform',
    'Create a karting center portal',
    'I need a racing venue system',
    'Build a lap timing platform',
    'Create a racing league app',
  ],
};
