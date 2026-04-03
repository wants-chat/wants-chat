/**
 * Bingo Hall App Type Definition
 *
 * Complete definition for bingo halls and gaming parlors.
 * Essential for bingo halls, gaming centers, and community gaming venues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const BINGO_HALL_APP_TYPE: AppTypeDefinition = {
  id: 'bingo-hall',
  name: 'Bingo Hall',
  category: 'entertainment',
  description: 'Bingo hall platform with session scheduling, card sales, prize tracking, and player management',
  icon: 'grid',

  keywords: [
    'bingo hall',
    'bingo software',
    'bingo management',
    'bingo sessions',
    'bingo cards',
    'bingo scheduling',
    'bingo prizes',
    'bingo games',
    'bingo venue',
    'bingo pos',
    'bingo crm',
    'bingo business',
    'bingo night',
    'charity bingo',
    'bingo parlor',
    'electronic bingo',
    'bingo player',
    'bingo jackpot',
    'bingo operations',
    'bingo center',
  ],

  synonyms: [
    'bingo hall platform',
    'bingo hall software',
    'bingo management software',
    'bingo session software',
    'bingo scheduling software',
    'bingo venue software',
    'bingo pos software',
    'bingo player software',
    'bingo operations software',
    'bingo center software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'online bingo'],

  sections: [
    { id: 'frontend', name: 'Player Portal', enabled: true, basePath: '/', layout: 'public', description: 'Sessions and cards' },
    { id: 'admin', name: 'Bingo Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Games and prizes' },
  ],

  roles: [
    { id: 'admin', name: 'Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Hall Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/sessions' },
    { id: 'staff', name: 'Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/games' },
    { id: 'caller', name: 'Caller', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/calling' },
    { id: 'player', name: 'Player', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reservations',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['course-management', 'patient-records', 'property-listings'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'entertainment',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'playful',

  examplePrompts: [
    'Build a bingo hall management platform',
    'Create a bingo session scheduling app',
    'I need a bingo prize tracking system',
    'Build a bingo player management app',
    'Create a charity bingo platform',
  ],
};
