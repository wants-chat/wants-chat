/**
 * Pool Hall App Type Definition
 *
 * Complete definition for billiards and pool entertainment operations.
 * Essential for pool halls, billiard clubs, and cue sports venues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const POOL_HALL_APP_TYPE: AppTypeDefinition = {
  id: 'pool-hall',
  name: 'Pool Hall',
  category: 'entertainment',
  description: 'Pool hall platform with table reservations, hourly billing, league management, and tournament hosting',
  icon: 'circle',

  keywords: [
    'pool hall',
    'billiards club',
    'pool hall software',
    'cue sports',
    'snooker',
    'pool hall management',
    'table reservations',
    'pool hall practice',
    'pool hall scheduling',
    'hourly billing',
    'pool hall crm',
    'league management',
    'pool hall business',
    'tournament hosting',
    'pool hall pos',
    'eight ball',
    'pool hall operations',
    'nine ball',
    'pool hall platform',
    'pool league',
  ],

  synonyms: [
    'pool hall platform',
    'pool hall software',
    'billiards club software',
    'cue sports software',
    'snooker software',
    'table reservations software',
    'pool hall practice software',
    'hourly billing software',
    'league management software',
    'eight ball software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Tables and leagues' },
    { id: 'admin', name: 'Hall Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Reservations and events' },
  ],

  roles: [
    { id: 'admin', name: 'Hall Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Floor Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/tables' },
    { id: 'staff', name: 'Attendant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/reservations' },
    { id: 'customer', name: 'Player', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reservations',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'classic',

  examplePrompts: [
    'Build a pool hall platform',
    'Create a billiards club portal',
    'I need a cue sports system',
    'Build a table reservation platform',
    'Create a pool league app',
  ],
};
