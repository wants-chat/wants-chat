/**
 * Soccer Facility App Type Definition
 *
 * Complete definition for soccer facilities and football complexes.
 * Essential for soccer fields, futsal courts, and football training centers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOCCER_FACILITY_APP_TYPE: AppTypeDefinition = {
  id: 'soccer-facility',
  name: 'Soccer Facility',
  category: 'sports',
  description: 'Soccer facility platform with field booking, league scheduling, team management, and tournament organization',
  icon: 'circle',

  keywords: [
    'soccer facility',
    'football complex',
    'soccer facility software',
    'futsal court',
    'soccer fields',
    'soccer facility management',
    'field booking',
    'soccer facility practice',
    'soccer facility scheduling',
    'soccer leagues',
    'soccer facility crm',
    'youth soccer',
    'soccer facility business',
    'indoor soccer',
    'soccer facility pos',
    'tournaments',
    'soccer facility operations',
    'training academy',
    'soccer facility services',
    'football pitch',
  ],

  synonyms: [
    'soccer facility platform',
    'soccer facility software',
    'football complex software',
    'futsal court software',
    'soccer fields software',
    'field booking software',
    'soccer facility practice software',
    'soccer leagues software',
    'indoor soccer software',
    'football pitch software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'technology'],

  sections: [
    { id: 'frontend', name: 'Player Portal', enabled: true, basePath: '/', layout: 'public', description: 'Fields and leagues' },
    { id: 'admin', name: 'Facility Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Bookings and teams' },
  ],

  roles: [
    { id: 'admin', name: 'Facility Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Field Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/schedule' },
    { id: 'referee', name: 'Referee', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/matches' },
    { id: 'player', name: 'Player', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'team-management',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'sports',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'athletic',

  examplePrompts: [
    'Build a soccer facility platform',
    'Create a football complex portal',
    'I need a soccer field management system',
    'Build a futsal court business platform',
    'Create a field booking and league app',
  ],
};
