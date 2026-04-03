/**
 * Driving Range App Type Definition
 *
 * Complete definition for golf driving range operations.
 * Essential for driving ranges, golf practice facilities, and Topgolf-style venues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DRIVING_RANGE_APP_TYPE: AppTypeDefinition = {
  id: 'driving-range',
  name: 'Driving Range',
  category: 'entertainment',
  description: 'Driving range platform with bay reservations, ball tracking, lesson booking, and membership management',
  icon: 'target',

  keywords: [
    'driving range',
    'golf practice',
    'driving range software',
    'golf facility',
    'topgolf',
    'driving range management',
    'bay reservations',
    'driving range practice',
    'driving range scheduling',
    'ball tracking',
    'driving range crm',
    'lesson booking',
    'driving range business',
    'membership management',
    'driving range pos',
    'swing analysis',
    'driving range operations',
    'golf technology',
    'driving range platform',
    'hitting bays',
  ],

  synonyms: [
    'driving range platform',
    'driving range software',
    'golf practice software',
    'golf facility software',
    'topgolf software',
    'bay reservations software',
    'driving range practice software',
    'ball tracking software',
    'lesson booking software',
    'swing analysis software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Bays and lessons' },
    { id: 'admin', name: 'Range Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Reservations and pros' },
  ],

  roles: [
    { id: 'admin', name: 'Range Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'pro', name: 'Golf Pro', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/lessons' },
    { id: 'staff', name: 'Range Attendant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bays' },
    { id: 'customer', name: 'Golfer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'subscriptions',
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

  defaultColorScheme: 'green',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a driving range platform',
    'Create a golf practice portal',
    'I need a range booking system',
    'Build a bay reservation platform',
    'Create a golf lesson app',
  ],
};
