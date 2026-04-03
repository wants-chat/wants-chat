/**
 * Batting Cage App Type Definition
 *
 * Complete definition for batting cages and baseball training facilities.
 * Essential for batting cage centers, baseball academies, and softball training.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BATTING_CAGE_APP_TYPE: AppTypeDefinition = {
  id: 'batting-cage',
  name: 'Batting Cage',
  category: 'sports',
  description: 'Batting cage platform with cage reservations, pitching machine settings, training programs, and performance tracking',
  icon: 'target',

  keywords: [
    'batting cage',
    'baseball training',
    'batting cage software',
    'softball training',
    'hitting center',
    'batting cage management',
    'cage reservations',
    'batting cage practice',
    'batting cage scheduling',
    'pitching machines',
    'batting cage crm',
    'hitting lessons',
    'batting cage business',
    'speed settings',
    'batting cage pos',
    'baseball academy',
    'batting cage operations',
    'performance tracking',
    'batting cage services',
    'batting practice',
  ],

  synonyms: [
    'batting cage platform',
    'batting cage software',
    'baseball training software',
    'softball training software',
    'hitting center software',
    'cage reservations software',
    'batting cage practice software',
    'pitching machines software',
    'hitting lessons software',
    'batting practice software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Player Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cages and training' },
    { id: 'admin', name: 'Facility Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Reservations and programs' },
  ],

  roles: [
    { id: 'admin', name: 'Facility Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'coach', name: 'Head Coach', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/training' },
    { id: 'instructor', name: 'Hitting Instructor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/lessons' },
    { id: 'player', name: 'Player', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'sports',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build a batting cage platform',
    'Create a baseball training facility portal',
    'I need a batting cage management system',
    'Build a hitting center business platform',
    'Create a cage booking and training app',
  ],
};
