/**
 * Ice Rink App Type Definition
 *
 * Complete definition for ice rinks and skating facilities.
 * Essential for ice arenas, skating rinks, and hockey facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ICE_RINK_APP_TYPE: AppTypeDefinition = {
  id: 'ice-rink',
  name: 'Ice Rink',
  category: 'sports',
  description: 'Ice rink platform with ice time booking, skating lessons, hockey leagues, and figure skating programs',
  icon: 'snowflake',

  keywords: [
    'ice rink',
    'skating rink',
    'ice rink software',
    'hockey arena',
    'ice arena',
    'ice rink management',
    'ice time booking',
    'ice rink practice',
    'ice rink scheduling',
    'skating lessons',
    'ice rink crm',
    'hockey leagues',
    'ice rink business',
    'figure skating',
    'ice rink pos',
    'public skating',
    'ice rink operations',
    'curling',
    'ice rink services',
    'ice sports',
  ],

  synonyms: [
    'ice rink platform',
    'ice rink software',
    'skating rink software',
    'hockey arena software',
    'ice arena software',
    'ice time booking software',
    'ice rink practice software',
    'skating lessons software',
    'hockey leagues software',
    'ice sports software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Skater Portal', enabled: true, basePath: '/', layout: 'public', description: 'Ice time and programs' },
    { id: 'admin', name: 'Rink Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Schedules and leagues' },
  ],

  roles: [
    { id: 'admin', name: 'Rink Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coordinator', name: 'Ice Coordinator', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'instructor', name: 'Skating Instructor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/lessons' },
    { id: 'skater', name: 'Skater', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'sports',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'winter',

  examplePrompts: [
    'Build an ice rink platform',
    'Create a skating facility portal',
    'I need an ice arena management system',
    'Build a hockey rink business platform',
    'Create an ice time booking and lessons app',
  ],
};
