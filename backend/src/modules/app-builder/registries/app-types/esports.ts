/**
 * Esports App Type Definition
 *
 * Complete definition for esports and competitive gaming applications.
 * Essential for esports organizations, tournament platforms, and competitive gaming leagues.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ESPORTS_APP_TYPE: AppTypeDefinition = {
  id: 'esports',
  name: 'Esports',
  category: 'sports',
  description: 'Esports platform with tournament management, team rosters, match scheduling, and prize pool tracking',
  icon: 'trophy',

  keywords: [
    'esports',
    'esports tournament',
    'competitive gaming',
    'esports organization',
    'gaming tournament',
    'esports league',
    'pro gaming',
    'esports team',
    'tournament bracket',
    'match scheduling',
    'prize pool',
    'esports event',
    'battlefy',
    'faceit',
    'esports arena',
    'gaming competition',
    'esports platform',
    'team roster',
    'player stats',
    'esports broadcast',
    'gaming league',
  ],

  synonyms: [
    'esports platform',
    'esports software',
    'tournament management software',
    'esports organization software',
    'competitive gaming platform',
    'esports tournament platform',
    'gaming tournament software',
    'esports management system',
    'esports league software',
    'pro gaming platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'fitness gym'],

  sections: [
    { id: 'frontend', name: 'Fan Portal', enabled: true, basePath: '/', layout: 'public', description: 'Watch and follow teams' },
    { id: 'admin', name: 'Org Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Teams and tournaments' },
  ],

  roles: [
    { id: 'admin', name: 'Org Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Team Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/teams' },
    { id: 'coach', name: 'Coach', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/roster' },
    { id: 'player', name: 'Pro Player', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'caster', name: 'Caster/Analyst', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/broadcasts' },
    { id: 'fan', name: 'Fan', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'team-management',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'bold',

  examplePrompts: [
    'Build an esports tournament platform',
    'Create an esports organization app',
    'I need a competitive gaming league system',
    'Build an esports team management platform',
    'Create a gaming tournament bracket system',
  ],
};
