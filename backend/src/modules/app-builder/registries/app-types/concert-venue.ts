/**
 * Concert Venue App Type Definition
 *
 * Complete definition for concert venues and live music halls.
 * Essential for concert halls, live music venues, and performance spaces.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CONCERT_VENUE_APP_TYPE: AppTypeDefinition = {
  id: 'concert-venue',
  name: 'Concert Venue',
  category: 'entertainment',
  description: 'Concert venue platform with ticket sales, seating management, artist booking, and event scheduling',
  icon: 'music',

  keywords: [
    'concert venue',
    'live music venue',
    'concert hall',
    'concert ticketing',
    'venue management',
    'concert booking',
    'music venue software',
    'performance venue',
    'concert events',
    'venue scheduling',
    'artist booking',
    'venue crm',
    'concert production',
    'venue pos',
    'amphitheater',
    'live performance',
    'concert promotions',
    'venue business',
    'concert hall management',
    'music venue booking',
  ],

  synonyms: [
    'concert venue platform',
    'concert venue software',
    'live music venue software',
    'concert hall software',
    'venue ticketing software',
    'music venue management software',
    'concert booking software',
    'performance venue software',
    'venue event software',
    'concert production software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'wedding venue'],

  sections: [
    { id: 'frontend', name: 'Fan Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tickets and events' },
    { id: 'admin', name: 'Venue Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Events and bookings' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Venue Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/events' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/shows' },
    { id: 'artist', name: 'Artist', level: 35, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/artist' },
    { id: 'fan', name: 'Fan', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
    'seating-charts',
    'box-office',
    'show-scheduling',
    'performer-profiles',
    'venue-booking',
  ],

  optionalFeatures: [
    'payments',
    'gallery',
    'reviews',
    'reporting',
    'analytics',
    'season-passes',
    'backstage-access',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a concert venue ticketing platform',
    'Create a live music venue management app',
    'I need a concert hall booking system',
    'Build a venue event management platform',
    'Create a concert production app',
  ],
};
