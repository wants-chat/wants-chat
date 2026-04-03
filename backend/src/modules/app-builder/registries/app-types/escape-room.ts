/**
 * Escape Room App Type Definition
 *
 * Complete definition for escape room and puzzle room applications.
 * Essential for escape room businesses, puzzle rooms, and immersive experiences.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ESCAPE_ROOM_APP_TYPE: AppTypeDefinition = {
  id: 'escape-room',
  name: 'Escape Room',
  category: 'entertainment',
  description: 'Escape room platform with room booking, group management, leaderboards, and game mastering',
  icon: 'door-open',

  keywords: [
    'escape room',
    'escape game',
    'puzzle room',
    'mystery room',
    'escape the room',
    'immersive experience',
    'team building',
    'escape room booking',
    'escape room business',
    'room escape',
    'adventure room',
    'breakout room',
    'exit game',
    'escape challenge',
    'escape room franchise',
    'escape room birthday',
    'corporate escape room',
    'virtual escape room',
    'horror escape room',
    'family escape room',
    'escape room clues',
    'game master',
  ],

  synonyms: [
    'escape room platform',
    'escape room software',
    'escape game booking',
    'puzzle room software',
    'escape room management',
    'escape room app',
    'escape room business software',
    'escape game platform',
    'room escape software',
    'escape room scheduling',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Browse rooms and book experiences' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Booking and game management' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Manager', level: 70, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/bookings' },
    { id: 'gamemaster', name: 'Game Master', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/games' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/rooms' },
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
    'gallery',
    'reviews',
    'analytics',
    'season-passes',
    'backstage-access',
  ],

  incompatibleFeatures: ['shopping-cart', 'course-management', 'inventory'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build an escape room booking platform',
    'Create an escape room business management app',
    'I need an escape room scheduling software',
    'Build an escape game booking system with leaderboards',
    'Create an escape room franchise management platform',
  ],
};
