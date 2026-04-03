/**
 * Event Venue App Type Definition
 *
 * Complete definition for event venue operations.
 * Essential for banquet halls, conference centers, and event spaces.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const EVENT_VENUE_APP_TYPE: AppTypeDefinition = {
  id: 'event-venue',
  name: 'Event Venue',
  category: 'hospitality',
  description: 'Event venue platform with space booking, catering coordination, floor planning, and event coordination',
  icon: 'building-2',

  keywords: [
    'event venue',
    'banquet hall',
    'event venue software',
    'conference center',
    'event space',
    'event venue management',
    'space booking',
    'event venue practice',
    'event venue scheduling',
    'catering coordination',
    'event venue crm',
    'floor planning',
    'event venue business',
    'event coordination',
    'event venue pos',
    'reception hall',
    'event venue operations',
    'meeting rooms',
    'event venue platform',
    'ballroom',
  ],

  synonyms: [
    'event venue platform',
    'event venue software',
    'banquet hall software',
    'conference center software',
    'event space software',
    'space booking software',
    'event venue practice software',
    'catering coordination software',
    'floor planning software',
    'ballroom software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'restaurant'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Bookings and tours' },
    { id: 'admin', name: 'Venue Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Events and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Venue Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Venue Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'coordinator', name: 'Event Coordinator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/events' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
    'venue-booking',
    'seating-charts',
  ],

  optionalFeatures: [
    'payments',
    'discounts',
    'reporting',
    'analytics',
    'show-scheduling',
    'box-office',
    'season-passes',
    'backstage-access',
    'performer-profiles',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'hospitality',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'elegant',

  examplePrompts: [
    'Build an event venue platform',
    'Create a banquet hall portal',
    'I need an event venue management system',
    'Build a space booking platform',
    'Create a floor planning and coordination app',
  ],
};
