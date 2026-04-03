/**
 * Board Game Cafe App Type Definition
 *
 * Complete definition for board game cafe operations.
 * Essential for board game cafes, tabletop gaming venues, and game lounges.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BOARD_GAME_CAFE_APP_TYPE: AppTypeDefinition = {
  id: 'board-game-cafe',
  name: 'Board Game Cafe',
  category: 'entertainment',
  description: 'Board game cafe platform with table reservations, game library, food ordering, and event scheduling',
  icon: 'dice',

  keywords: [
    'board game cafe',
    'tabletop gaming',
    'board game cafe software',
    'game lounge',
    'gaming cafe',
    'board game cafe management',
    'table reservations',
    'board game cafe practice',
    'board game cafe scheduling',
    'game library',
    'board game cafe crm',
    'food ordering',
    'board game cafe business',
    'event scheduling',
    'board game cafe pos',
    'game nights',
    'board game cafe operations',
    'tournaments',
    'board game cafe platform',
    'strategy games',
  ],

  synonyms: [
    'board game cafe platform',
    'board game cafe software',
    'tabletop gaming software',
    'game lounge software',
    'gaming cafe software',
    'table reservations software',
    'board game cafe practice software',
    'game library software',
    'food ordering software',
    'game nights software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Gamer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Games and events' },
    { id: 'admin', name: 'Cafe Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Tables and orders' },
  ],

  roles: [
    { id: 'admin', name: 'Cafe Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Cafe Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/tables' },
    { id: 'staff', name: 'Game Guru', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/library' },
    { id: 'gamer', name: 'Gamer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'table-reservations',
    'menu-management',
    'food-ordering',
    'pos-system',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'kitchen-display',
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

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a board game cafe platform',
    'Create a tabletop gaming venue app',
    'I need a game lounge system',
    'Build a gaming cafe app',
    'Create a board game cafe portal',
  ],
};
