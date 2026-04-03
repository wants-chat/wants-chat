/**
 * Indoor Soccer App Type Definition
 *
 * Complete definition for indoor soccer facility operations.
 * Essential for indoor soccer facilities, futsal centers, and sports complexes.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const INDOOR_SOCCER_APP_TYPE: AppTypeDefinition = {
  id: 'indoor-soccer',
  name: 'Indoor Soccer',
  category: 'sports',
  description: 'Indoor soccer platform with field scheduling, league management, team registration, and tournament organization',
  icon: 'trophy',

  keywords: [
    'indoor soccer',
    'futsal center',
    'indoor soccer software',
    'sports complex',
    'soccer facility',
    'indoor soccer management',
    'field scheduling',
    'indoor soccer practice',
    'indoor soccer scheduling',
    'league management',
    'indoor soccer crm',
    'team registration',
    'indoor soccer business',
    'tournament organization',
    'indoor soccer pos',
    'adult leagues',
    'indoor soccer operations',
    'youth soccer',
    'indoor soccer platform',
    'pickup games',
  ],

  synonyms: [
    'indoor soccer platform',
    'indoor soccer software',
    'futsal center software',
    'sports complex software',
    'soccer facility software',
    'field scheduling software',
    'indoor soccer practice software',
    'league management software',
    'team registration software',
    'adult leagues software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Player Portal', enabled: true, basePath: '/', layout: 'public', description: 'Leagues and fields' },
    { id: 'admin', name: 'Facility Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Fields and leagues' },
  ],

  roles: [
    { id: 'admin', name: 'Facility Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'League Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/leagues' },
    { id: 'referee', name: 'Referee', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/games' },
    { id: 'player', name: 'Player', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'sports',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build an indoor soccer platform',
    'Create a futsal facility app',
    'I need a soccer league management system',
    'Build a sports complex app',
    'Create an indoor soccer portal',
  ],
};
