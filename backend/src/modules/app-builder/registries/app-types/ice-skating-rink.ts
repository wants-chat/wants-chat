/**
 * Ice Skating Rink App Type Definition
 *
 * Complete definition for ice skating rink operations.
 * Essential for ice rinks, skating centers, and winter sports facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ICE_SKATING_RINK_APP_TYPE: AppTypeDefinition = {
  id: 'ice-skating-rink',
  name: 'Ice Skating Rink',
  category: 'sports',
  description: 'Ice skating rink platform with session scheduling, skate rental, lesson booking, and ice time management',
  icon: 'snowflake',

  keywords: [
    'ice skating rink',
    'skating center',
    'ice skating rink software',
    'winter sports',
    'ice arena',
    'ice skating rink management',
    'session scheduling',
    'ice skating rink practice',
    'ice skating rink scheduling',
    'skate rental',
    'ice skating rink crm',
    'lesson booking',
    'ice skating rink business',
    'ice time',
    'ice skating rink pos',
    'figure skating',
    'ice skating rink operations',
    'hockey rink',
    'ice skating rink platform',
    'public skate',
  ],

  synonyms: [
    'ice skating rink platform',
    'ice skating rink software',
    'skating center software',
    'winter sports software',
    'ice arena software',
    'session scheduling software',
    'ice skating rink practice software',
    'skate rental software',
    'lesson booking software',
    'figure skating software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Sessions and lessons' },
    { id: 'admin', name: 'Rink Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Ice time and rentals' },
  ],

  roles: [
    { id: 'admin', name: 'Rink Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Rink Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'instructor', name: 'Skating Coach', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/lessons' },
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
  complexity: 'complex',
  industry: 'sports',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'winter',

  examplePrompts: [
    'Build an ice skating rink platform',
    'Create a skating center app',
    'I need an ice rink management system',
    'Build an ice arena app',
    'Create an ice skating business portal',
  ],
};
