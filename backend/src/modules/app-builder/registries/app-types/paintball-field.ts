/**
 * Paintball Field App Type Definition
 *
 * Complete definition for paintball and airsoft operations.
 * Essential for paintball fields, airsoft arenas, and tactical gaming venues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PAINTBALL_FIELD_APP_TYPE: AppTypeDefinition = {
  id: 'paintball-field',
  name: 'Paintball Field',
  category: 'entertainment',
  description: 'Paintball field platform with game scheduling, team management, equipment rentals, and tournament hosting',
  icon: 'target',

  keywords: [
    'paintball field',
    'airsoft arena',
    'paintball field software',
    'tactical gaming',
    'combat simulation',
    'paintball field management',
    'game scheduling',
    'paintball field practice',
    'paintball field scheduling',
    'team management',
    'paintball field crm',
    'equipment rentals',
    'paintball field business',
    'tournament hosting',
    'paintball field pos',
    'woodsball',
    'paintball field operations',
    'speedball',
    'paintball field platform',
    'scenario games',
  ],

  synonyms: [
    'paintball field platform',
    'paintball field software',
    'airsoft arena software',
    'tactical gaming software',
    'combat simulation software',
    'game scheduling software',
    'paintball field practice software',
    'team management software',
    'equipment rentals software',
    'woodsball software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Player Portal', enabled: true, basePath: '/', layout: 'public', description: 'Games and rentals' },
    { id: 'admin', name: 'Field Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Bookings and equipment' },
  ],

  roles: [
    { id: 'admin', name: 'Field Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'ref', name: 'Head Referee', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/games' },
    { id: 'staff', name: 'Field Marshal', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/rentals' },
    { id: 'customer', name: 'Player', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'team-management',
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

  defaultColorScheme: 'olive',
  defaultDesignVariant: 'tactical',

  examplePrompts: [
    'Build a paintball field platform',
    'Create an airsoft arena portal',
    'I need a tactical gaming system',
    'Build a game booking platform',
    'Create a paintball tournament app',
  ],
};
