/**
 * Arcade Center App Type Definition
 *
 * Complete definition for arcade and gaming center operations.
 * Essential for arcades, game rooms, and family entertainment centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ARCADE_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'arcade-center',
  name: 'Arcade Center',
  category: 'entertainment',
  description: 'Arcade center platform with game card management, prize redemption, machine tracking, and party booking',
  icon: 'gamepad',

  keywords: [
    'arcade center',
    'game room',
    'arcade center software',
    'family entertainment',
    'gaming center',
    'arcade center management',
    'game card',
    'arcade center practice',
    'arcade center scheduling',
    'prize redemption',
    'arcade center crm',
    'machine tracking',
    'arcade center business',
    'party booking',
    'arcade center pos',
    'ticket games',
    'arcade center operations',
    'claw machines',
    'arcade center platform',
    'prize counter',
  ],

  synonyms: [
    'arcade center platform',
    'arcade center software',
    'game room software',
    'family entertainment software',
    'gaming center software',
    'game card software',
    'arcade center practice software',
    'prize redemption software',
    'machine tracking software',
    'ticket games software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Cards and prizes' },
    { id: 'admin', name: 'Arcade Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Games and redemption' },
  ],

  roles: [
    { id: 'admin', name: 'Arcade Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Floor Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/games' },
    { id: 'attendant', name: 'Game Attendant', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/prizes' },
    { id: 'customer', name: 'Player', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
    'ticket-sales',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
    'season-passes',
    'venue-booking',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'neon',

  examplePrompts: [
    'Build an arcade center platform',
    'Create a game room management app',
    'I need an arcade business system',
    'Build a family entertainment center app',
    'Create an arcade center portal',
  ],
};
