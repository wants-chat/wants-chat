/**
 * Laser Tag App Type Definition
 *
 * Complete definition for laser tag and tactical gaming applications.
 * Essential for laser tag arenas, tactical gaming centers, and entertainment venues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LASER_TAG_APP_TYPE: AppTypeDefinition = {
  id: 'laser-tag',
  name: 'Laser Tag',
  category: 'entertainment',
  description: 'Laser tag platform with game booking, scoring, team management, and party packages',
  icon: 'crosshairs',

  keywords: [
    'laser tag',
    'laser quest',
    'laser arena',
    'laser game',
    'tactical gaming',
    'laser combat',
    'laser battle',
    'laser tag arena',
    'laser tag party',
    'laser tag birthday',
    'team laser tag',
    'glow laser tag',
    'indoor laser tag',
    'outdoor laser tag',
    'laser tag scoring',
    'laser tag mission',
    'laser tag equipment',
    'laser warfare',
    'family laser tag',
    'corporate laser tag',
    'laser tag tournament',
    'laser tag league',
  ],

  synonyms: [
    'laser tag platform',
    'laser tag software',
    'laser arena software',
    'laser tag booking',
    'laser tag management',
    'laser game software',
    'laser tag business app',
    'tactical gaming software',
    'laser tag scheduling',
    'laser arena management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Player Portal', enabled: true, basePath: '/', layout: 'public', description: 'Book games and view scores' },
    { id: 'admin', name: 'Arena Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Game and arena management' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/games' },
    { id: 'marshal', name: 'Game Marshal', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/arena' },
    { id: 'staff', name: 'Staff', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/check-in' },
    { id: 'player', name: 'Player', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'calendar',
    'ticket-sales',
    'venue-booking',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
    'season-passes',
  ],

  incompatibleFeatures: ['course-management', 'inventory', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build a laser tag booking platform',
    'Create a laser tag arena management app',
    'I need a laser tag scoring system',
    'Build a laser tag party booking system',
    'Create a laser tag leaderboard platform',
  ],
};
