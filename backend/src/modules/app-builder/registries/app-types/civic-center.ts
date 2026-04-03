/**
 * Civic Center App Type Definition
 *
 * Complete definition for civic center services.
 * Essential for civic centers, convention centers, and public venues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CIVIC_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'civic-center',
  name: 'Civic Center',
  category: 'community',
  description: 'Civic center platform with venue booking, event management, catering coordination, and public meetings',
  icon: 'building',

  keywords: [
    'civic center',
    'convention center',
    'civic center software',
    'public venue',
    'event space',
    'civic center management',
    'venue booking',
    'civic center practice',
    'civic center scheduling',
    'event management',
    'civic center crm',
    'catering coordination',
    'civic center business',
    'public meetings',
    'civic center pos',
    'conferences',
    'civic center operations',
    'exhibitions',
    'civic center platform',
    'community events',
  ],

  synonyms: [
    'civic center platform',
    'civic center software',
    'convention center software',
    'public venue software',
    'event space software',
    'venue booking software',
    'civic center practice software',
    'event management software',
    'catering coordination software',
    'community events software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'medical', 'automotive'],

  sections: [
    { id: 'frontend', name: 'Public Portal', enabled: true, basePath: '/', layout: 'public', description: 'Events and bookings' },
    { id: 'admin', name: 'Venue Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Events and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Venue Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Event Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/events' },
    { id: 'staff', name: 'Operations Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'client', name: 'Event Organizer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'reporting',
    'analytics',
    'show-scheduling',
    'box-office',
    'season-passes',
  ],

  incompatibleFeatures: ['property-listings', 'car-inventory', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'government',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a civic center management platform',
    'Create a convention center booking portal',
    'I need a public venue management system',
    'Build an event space platform',
    'Create a venue booking and event app',
  ],
};
