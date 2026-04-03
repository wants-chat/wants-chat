/**
 * Animation Studio App Type Definition
 *
 * Complete definition for animation studio operations.
 * Essential for animation studios, VFX houses, and motion graphics companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANIMATION_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'animation-studio',
  name: 'Animation Studio',
  category: 'entertainment',
  description: 'Animation studio platform with project pipeline, asset management, render farm tracking, and client approvals',
  icon: 'sparkles',

  keywords: [
    'animation studio',
    'animation production',
    'animation studio software',
    'vfx house',
    'motion graphics',
    'animation studio management',
    'project pipeline',
    'animation studio practice',
    'animation studio scheduling',
    'asset management',
    'animation studio crm',
    'render farm',
    'animation studio business',
    'client approvals',
    'animation studio pos',
    '3d animation',
    'animation studio operations',
    'character animation',
    'animation studio platform',
    'compositing',
  ],

  synonyms: [
    'animation studio platform',
    'animation studio software',
    'animation production software',
    'vfx house software',
    'motion graphics software',
    'project pipeline software',
    'animation studio practice software',
    'asset management software',
    'render farm software',
    '3d animation software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and reviews' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Pipeline and assets' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'supervisor', name: 'Art Director', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'animator', name: 'Animator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
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
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'violet',
  defaultDesignVariant: 'modern',

  examplePrompts: [
    'Build an animation studio platform',
    'Create a VFX production portal',
    'I need an animation pipeline system',
    'Build an asset and render platform',
    'Create a project review app',
  ],
};
