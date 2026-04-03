/**
 * Roller Rink App Type Definition
 *
 * Complete definition for roller skating entertainment operations.
 * Essential for roller rinks, skating centers, and rollerblade venues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ROLLER_RINK_APP_TYPE: AppTypeDefinition = {
  id: 'roller-rink',
  name: 'Roller Rink',
  category: 'entertainment',
  description: 'Roller rink platform with session scheduling, party bookings, lesson programs, and DJ event management',
  icon: 'disc',

  keywords: [
    'roller rink',
    'skating center',
    'roller rink software',
    'rollerblade',
    'inline skating',
    'roller rink management',
    'session scheduling',
    'roller rink practice',
    'roller rink scheduling',
    'party bookings',
    'roller rink crm',
    'lesson programs',
    'roller rink business',
    'dj events',
    'roller rink pos',
    'disco skating',
    'roller rink operations',
    'roller derby',
    'roller rink platform',
    'family skating',
  ],

  synonyms: [
    'roller rink platform',
    'roller rink software',
    'skating center software',
    'rollerblade software',
    'inline skating software',
    'session scheduling software',
    'roller rink practice software',
    'party bookings software',
    'lesson programs software',
    'disco skating software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Sessions and parties' },
    { id: 'admin', name: 'Rink Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Bookings and events' },
  ],

  roles: [
    { id: 'admin', name: 'Rink Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Rink Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/events' },
    { id: 'staff', name: 'Skate Guard', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/sessions' },
    { id: 'customer', name: 'Skater', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
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
    'show-scheduling',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'pink',
  defaultDesignVariant: 'retro',

  examplePrompts: [
    'Build a roller rink platform',
    'Create a skating center portal',
    'I need a rollerblade facility system',
    'Build a session booking platform',
    'Create a roller skating party app',
  ],
};
