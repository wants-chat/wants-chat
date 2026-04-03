/**
 * Design Studio App Type Definition
 *
 * Complete definition for design studio and creative agency applications.
 * Essential for graphic design studios, branding agencies, and creative firms.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DESIGN_STUDIO_APP_TYPE: AppTypeDefinition = {
  id: 'design-studio',
  name: 'Design Studio',
  category: 'professional-services',
  description: 'Design studio platform with project management, creative briefs, asset delivery, and client approval workflows',
  icon: 'palette',

  keywords: [
    'design studio',
    'graphic design',
    'branding agency',
    'creative studio',
    'design agency',
    'design software',
    'creative projects',
    'design management',
    'creative briefs',
    'design approval',
    'asset delivery',
    'design workflow',
    'brand design',
    'visual design',
    'design clients',
    'creative services',
    'design portfolio',
    'design billing',
    'design revisions',
    'creative agency',
  ],

  synonyms: [
    'design studio platform',
    'design studio software',
    'graphic design software',
    'branding agency software',
    'creative studio software',
    'design management software',
    'creative project software',
    'design approval software',
    'design workflow software',
    'creative agency software',
  ],

  negativeKeywords: ['blog', 'portfolio only', 'fitness', 'interior design'],

  sections: [
    { id: 'frontend', name: 'Client Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and approvals' },
    { id: 'admin', name: 'Studio Dashboard', enabled: true, basePath: '/admin', requiredRole: 'designer', layout: 'admin', description: 'Projects and assets' },
  ],

  roles: [
    { id: 'admin', name: 'Studio Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'director', name: 'Creative Director', level: 85, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'manager', name: 'Project Manager', level: 70, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'designer', name: 'Senior Designer', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'junior', name: 'Junior Designer', level: 40, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/assignments' },
    { id: 'client', name: 'Client', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'projects',
    'time-tracking',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'inventory-warehouse'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'professional-services',

  defaultColorScheme: 'fuchsia',
  defaultDesignVariant: 'creative',

  examplePrompts: [
    'Build a design studio platform',
    'Create a creative agency management app',
    'I need a design approval workflow',
    'Build a branding agency system',
    'Create a design project tracker',
  ],
};
