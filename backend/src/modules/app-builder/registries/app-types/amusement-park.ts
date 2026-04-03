/**
 * Amusement Park App Type Definition
 *
 * Complete definition for amusement park and theme park applications.
 * Essential for amusement parks, theme parks, and attraction operators.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AMUSEMENT_PARK_APP_TYPE: AppTypeDefinition = {
  id: 'amusement-park',
  name: 'Amusement Park',
  category: 'entertainment',
  description: 'Amusement park platform with ticketing, ride reservations, mobile ordering, and park navigation',
  icon: 'ferris-wheel',

  keywords: [
    'amusement park',
    'theme park',
    'disney',
    'six flags',
    'universal studios',
    'cedar point',
    'water park',
    'roller coaster',
    'rides',
    'attractions',
    'park tickets',
    'season pass',
    'express pass',
    'fastpass',
    'park map',
    'wait times',
    'park dining',
    'character meet',
    'park shows',
    'family entertainment',
    'park resort',
    'park hotel',
  ],

  synonyms: [
    'amusement park platform',
    'theme park software',
    'park ticketing system',
    'amusement park app',
    'theme park management',
    'park operations software',
    'attraction management',
    'park booking system',
    'amusement software',
    'theme park booking',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant only', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Guest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Buy tickets and plan visit' },
    { id: 'admin', name: 'Park Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Park operations management' },
  ],

  roles: [
    { id: 'admin', name: 'Park Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/operations' },
    { id: 'supervisor', name: 'Area Supervisor', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/rides' },
    { id: 'staff', name: 'Team Member', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/my-area' },
    { id: 'guest', name: 'Guest', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'calendar',
    'notifications',
    'ticket-sales',
    'season-passes',
    'show-scheduling',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
    'venue-booking',
    'backstage-access',
    'box-office',
  ],

  incompatibleFeatures: ['course-management', 'workout-plans', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'amber',
  defaultDesignVariant: 'fun',

  examplePrompts: [
    'Build an amusement park ticketing platform',
    'Create a theme park mobile app',
    'I need a water park booking system',
    'Build a park like Disney or Six Flags app',
    'Create an amusement park operations system',
  ],
};
