/**
 * Convention Center App Type Definition
 *
 * Complete definition for convention centers and expo halls.
 * Essential for convention centers, expo halls, and trade show venues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CONVENTION_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'convention-center',
  name: 'Convention Center',
  category: 'entertainment',
  description: 'Convention center platform with space booking, exhibitor management, event scheduling, and attendee registration',
  icon: 'building',

  keywords: [
    'convention center',
    'expo hall',
    'convention software',
    'trade show',
    'exhibitor management',
    'convention booking',
    'expo venue',
    'convention scheduling',
    'conference center',
    'convention crm',
    'trade show management',
    'convention space',
    'expo management',
    'convention pos',
    'convention business',
    'booth sales',
    'convention registration',
    'convention operations',
    'exhibit hall',
    'convention events',
  ],

  synonyms: [
    'convention center platform',
    'convention center software',
    'expo hall software',
    'trade show software',
    'convention management software',
    'conference center software',
    'exhibitor management software',
    'convention booking software',
    'expo venue software',
    'trade show management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'small meeting room'],

  sections: [
    { id: 'frontend', name: 'Exhibitor Portal', enabled: true, basePath: '/', layout: 'public', description: 'Booking and registration' },
    { id: 'admin', name: 'Convention Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Events and exhibitors' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Venue Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/events' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'exhibitor', name: 'Exhibitor', level: 35, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/exhibitor' },
    { id: 'attendee', name: 'Attendee', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
    'venue-booking',
    'show-scheduling',
    'seating-charts',
  ],

  optionalFeatures: [
    'payments',
    'scheduling',
    'reporting',
    'analytics',
    'box-office',
    'season-passes',
    'backstage-access',
    'performer-profiles',
  ],

  incompatibleFeatures: ['table-reservations', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a convention center booking platform',
    'Create a trade show management app',
    'I need an exhibitor management system',
    'Build an expo hall scheduling platform',
    'Create a conference center app',
  ],
};
