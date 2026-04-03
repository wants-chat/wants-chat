/**
 * Sports League App Type Definition
 *
 * Complete definition for sports league and recreational sports applications.
 * Essential for sports leagues, intramurals, and recreational sports organizations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTS_LEAGUE_APP_TYPE: AppTypeDefinition = {
  id: 'sports-league',
  name: 'Sports League',
  category: 'sports',
  description: 'Sports league platform with team registration, scheduling, standings, and player management',
  icon: 'trophy',

  keywords: [
    'sports league',
    'recreational sports',
    'adult sports league',
    'youth sports league',
    'intramural sports',
    'league management',
    'team registration',
    'sports scheduling',
    'league standings',
    'team sports',
    'basketball league',
    'soccer league',
    'softball league',
    'volleyball league',
    'kickball league',
    'flag football',
    'sports organization',
    'league play',
    'sports season',
    'team management',
    'sports club',
  ],

  synonyms: [
    'sports league platform',
    'sports league software',
    'league management software',
    'recreational sports software',
    'team sports app',
    'league scheduling software',
    'sports organization app',
    'intramural software',
    'league management app',
    'sports team software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'church'],

  sections: [
    { id: 'frontend', name: 'Player Portal', enabled: true, basePath: '/', layout: 'public', description: 'Register and view schedules' },
    { id: 'admin', name: 'League Dashboard', enabled: true, basePath: '/admin', requiredRole: 'commissioner', layout: 'admin', description: 'Teams and scheduling' },
  ],

  roles: [
    { id: 'admin', name: 'League Admin', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'commissioner', name: 'Commissioner', level: 85, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/seasons' },
    { id: 'referee', name: 'Referee/Official', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/games' },
    { id: 'captain', name: 'Team Captain', level: 45, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/team' },
    { id: 'player', name: 'Player', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'membership-plans',
    'class-scheduling',
    'group-training',
    'check-in',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'fitness-challenges',
    'equipment-booking',
    'workout-tracking',
    'body-measurements',
    'analytics',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'sports',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'sporty',

  examplePrompts: [
    'Build a sports league management platform',
    'Create a recreational sports league app',
    'I need an adult sports league system',
    'Build a youth sports organization platform',
    'Create a league scheduling and standings app',
  ],
};
