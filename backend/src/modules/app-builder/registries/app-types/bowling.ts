/**
 * Bowling Alley App Type Definition
 *
 * Complete definition for bowling alley and entertainment center applications.
 * Essential for bowling alleys, entertainment centers, and family fun centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOWLING_APP_TYPE: AppTypeDefinition = {
  id: 'bowling',
  name: 'Bowling Alley',
  category: 'entertainment',
  description: 'Bowling platform with lane reservations, league management, scoring, and food service',
  icon: 'bowling-ball',

  keywords: [
    'bowling',
    'bowling alley',
    'bowling center',
    'bowling lanes',
    'bowling league',
    'bowling reservation',
    'cosmic bowling',
    'glow bowling',
    'amf bowling',
    'bowlero',
    'brunswick bowling',
    'bowling party',
    'bowling birthday',
    'bowling tournament',
    'bowling shoes',
    'bowling scoring',
    'kids bowling',
    'family bowling',
    'bowling entertainment',
    'bowling bar',
    'bowling food',
    'lane booking',
  ],

  synonyms: [
    'bowling platform',
    'bowling software',
    'bowling lane booking',
    'bowling alley software',
    'bowling management',
    'bowling center software',
    'bowling reservation system',
    'bowling league software',
    'lane reservation system',
    'bowling business app',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant only', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reserve lanes and join leagues' },
    { id: 'admin', name: 'Center Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Lane and league management' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/lanes' },
    { id: 'staff', name: 'Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'league', name: 'League Bowler', level: 25, isDefault: false, accessibleSections: ['frontend'], defaultRoute: '/league' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'search',
    'ticket-sales',
    'venue-booking',
  ],

  optionalFeatures: [
    'payments',
    'waitlist',
    'analytics',
    'season-passes',
  ],

  incompatibleFeatures: ['course-management', 'inventory', 'workout-plans'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'fun',

  examplePrompts: [
    'Build a bowling alley reservation platform',
    'Create a bowling league management app',
    'I need a bowling center booking software',
    'Build a bowling entertainment center app',
    'Create a bowling alley management system',
  ],
};
