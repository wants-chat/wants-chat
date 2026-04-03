/**
 * Escape Game Design App Type Definition
 *
 * Complete definition for escape game design and puzzle creation.
 * Essential for escape room designers, puzzle creators, and game developers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ESCAPE_GAME_DESIGN_APP_TYPE: AppTypeDefinition = {
  id: 'escape-game-design',
  name: 'Escape Game Design',
  category: 'creative',
  description: 'Escape game design platform with puzzle building, prop management, flow charting, and playtest scheduling',
  icon: 'puzzle',

  keywords: [
    'escape game design',
    'puzzle creation',
    'escape game design software',
    'room design',
    'game development',
    'escape game design management',
    'puzzle building',
    'escape game design practice',
    'escape game design scheduling',
    'prop management',
    'escape game design crm',
    'flow charting',
    'escape game design business',
    'playtest scheduling',
    'escape game design pos',
    'narrative design',
    'escape game design operations',
    'immersive experience',
    'escape game design platform',
    'puzzle mechanics',
  ],

  synonyms: [
    'escape game design platform',
    'escape game design software',
    'puzzle creation software',
    'room design software',
    'game development software',
    'puzzle building software',
    'escape game design practice software',
    'prop management software',
    'flow charting software',
    'narrative design software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Designer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Games and puzzles' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Projects and props' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'designer', name: 'Game Designer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'builder', name: 'Prop Builder', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/props' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'appointments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'creative',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'creative',

  examplePrompts: [
    'Build an escape game design platform',
    'Create a puzzle creation portal',
    'I need a room design system',
    'Build a game development platform',
    'Create a prop management app',
  ],
};
