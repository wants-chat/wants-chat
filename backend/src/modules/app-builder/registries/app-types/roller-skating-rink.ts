/**
 * Roller Skating Rink App Type Definition
 *
 * Complete definition for roller skating rink operations.
 * Essential for roller rinks, skate centers, and roller entertainment venues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ROLLER_SKATING_RINK_APP_TYPE: AppTypeDefinition = {
  id: 'roller-skating-rink',
  name: 'Roller Skating Rink',
  category: 'entertainment',
  description: 'Roller skating rink platform with session management, skate rental, party booking, and DJ scheduling',
  icon: 'disc',

  keywords: [
    'roller skating rink',
    'skate center',
    'roller skating rink software',
    'roller entertainment',
    'roller disco',
    'roller skating rink management',
    'session management',
    'roller skating rink practice',
    'roller skating rink scheduling',
    'skate rental',
    'roller skating rink crm',
    'party booking',
    'roller skating rink business',
    'dj scheduling',
    'roller skating rink pos',
    'inline skating',
    'roller skating rink operations',
    'theme nights',
    'roller skating rink platform',
    'adult skate',
  ],

  synonyms: [
    'roller skating rink platform',
    'roller skating rink software',
    'skate center software',
    'roller entertainment software',
    'roller disco software',
    'session management software',
    'roller skating rink practice software',
    'skate rental software',
    'party booking software',
    'inline skating software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Sessions and parties' },
    { id: 'admin', name: 'Rink Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Floor and rentals' },
  ],

  roles: [
    { id: 'admin', name: 'Rink Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Rink Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/sessions' },
    { id: 'staff', name: 'Floor Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/rentals' },
    { id: 'customer', name: 'Skater', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
    'show-scheduling',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'retro',

  examplePrompts: [
    'Build a roller skating rink platform',
    'Create a skate center app',
    'I need a roller rink management system',
    'Build a roller disco app',
    'Create a roller skating business portal',
  ],
};
