/**
 * Game Studio App Type Definition
 *
 * Complete definition for game development studio operations.
 * Essential for indie game studios, AAA developers, and mobile game companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GAME_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'game-studio',
  name: 'Game Studio',
  category: 'entertainment',
  description: 'Game studio platform with project management, asset pipeline, bug tracking, and release management',
  icon: 'gamepad-2',

  keywords: [
    'game studio',
    'game development',
    'game studio software',
    'indie game',
    'mobile games',
    'game studio management',
    'project management',
    'game studio practice',
    'game studio scheduling',
    'asset pipeline',
    'game studio crm',
    'bug tracking',
    'game studio business',
    'release management',
    'game studio pos',
    'level design',
    'game studio operations',
    'playtesting',
    'game studio platform',
    'qa testing',
  ],

  synonyms: [
    'game studio platform',
    'game studio software',
    'game development software',
    'indie game software',
    'mobile games software',
    'project management software',
    'game studio practice software',
    'asset pipeline software',
    'bug tracking software',
    'release management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Publisher Portal', enabled: true, basePath: '/', layout: 'public', description: 'Builds and milestones' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and builds' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Head', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'producer', name: 'Producer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'developer', name: 'Developer', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'publisher', name: 'Publisher', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
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
  industry: 'entertainment',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build a game studio platform',
    'Create a game development portal',
    'I need a game production system',
    'Build a build and release platform',
    'Create a game bug tracking app',
  ],
};
