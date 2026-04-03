/**
 * Axe Throwing App Type Definition
 *
 * Complete definition for axe throwing entertainment venues.
 * Essential for axe throwing bars, hatchet houses, and throwing ranges.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AXE_THROWING_APP_TYPE: AppTypeDefinition = {
  id: 'axe-throwing',
  name: 'Axe Throwing',
  category: 'entertainment',
  description: 'Axe throwing venue platform with lane booking, league management, tournament scoring, and waiver handling',
  icon: 'target',

  keywords: [
    'axe throwing',
    'hatchet house',
    'axe throwing software',
    'throwing range',
    'urban recreation',
    'axe throwing management',
    'lane booking',
    'axe throwing practice',
    'axe throwing scheduling',
    'league management',
    'axe throwing crm',
    'tournament scoring',
    'axe throwing business',
    'waiver handling',
    'axe throwing pos',
    'team building',
    'axe throwing operations',
    'corporate events',
    'axe throwing platform',
    'throwing sports',
  ],

  synonyms: [
    'axe throwing platform',
    'axe throwing software',
    'hatchet house software',
    'throwing range software',
    'urban recreation software',
    'lane booking software',
    'axe throwing practice software',
    'league management software',
    'tournament scoring software',
    'throwing sports software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Lanes and leagues' },
    { id: 'admin', name: 'Venue Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Bookings and events' },
  ],

  roles: [
    { id: 'admin', name: 'Venue Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coach', name: 'Axe Coach', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/lanes' },
    { id: 'staff', name: 'Lane Host', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/bookings' },
    { id: 'customer', name: 'Thrower', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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

  defaultColorScheme: 'red',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build an axe throwing platform',
    'Create a hatchet venue portal',
    'I need a throwing range system',
    'Build a lane booking platform',
    'Create a throwing league app',
  ],
};
