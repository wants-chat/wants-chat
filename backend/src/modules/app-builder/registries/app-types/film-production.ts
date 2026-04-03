/**
 * Film Production App Type Definition
 *
 * Complete definition for film production and video production company applications.
 * Essential for production companies, film studios, and video production teams.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FILM_PRODUCTION_APP_TYPE: AppTypeDefinition = {
  id: 'film-production',
  name: 'Film Production',
  category: 'media',
  description: 'Film production platform with project management, crew scheduling, call sheets, and asset management',
  icon: 'clapperboard',

  keywords: [
    'film production',
    'video production',
    'production company',
    'film studio',
    'movie production',
    'production management',
    'crew scheduling',
    'call sheets',
    'production planning',
    'film crew',
    'shooting schedule',
    'production budget',
    'casting',
    'location scouting',
    'pre-production',
    'post-production',
    'film project',
    'video shoot',
    'production coordinator',
    'filmmaking',
    'studiobinder',
  ],

  synonyms: [
    'film production platform',
    'film production software',
    'video production software',
    'production management software',
    'film studio software',
    'production company app',
    'crew scheduling software',
    'call sheet software',
    'filmmaking software',
    'production planning platform',
  ],

  negativeKeywords: ['blog', 'portfolio website', 'restaurant', 'fitness'],

  sections: [
    { id: 'frontend', name: 'Crew Portal', enabled: true, basePath: '/', layout: 'public', description: 'View schedules and call sheets' },
    { id: 'admin', name: 'Production Dashboard', enabled: true, basePath: '/admin', requiredRole: 'producer', layout: 'admin', description: 'Projects and crew' },
  ],

  roles: [
    { id: 'admin', name: 'Executive Producer', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'producer', name: 'Producer', level: 85, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'director', name: 'Director', level: 75, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/production' },
    { id: 'coordinator', name: 'Production Coordinator', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'department', name: 'Department Head', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/crew' },
    { id: 'crew', name: 'Crew Member', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'contracts',
    'analytics',
  ],

  incompatibleFeatures: ['inventory-warehouse', 'medical-records', 'table-reservations'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'media',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a film production management platform',
    'Create a video production company app',
    'I need a crew scheduling system',
    'Build a production company with call sheets',
    'Create a film project management tool',
  ],
};
