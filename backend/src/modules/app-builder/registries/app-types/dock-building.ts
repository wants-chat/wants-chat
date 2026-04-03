/**
 * Dock Building App Type Definition
 *
 * Complete definition for dock construction and marine structure operations.
 * Essential for dock builders, pier contractors, and marine construction companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DOCK_BUILDING_APP_TYPE: AppTypeDefinition = {
  id: 'dock-building',
  name: 'Dock Building',
  category: 'construction',
  description: 'Dock building platform with project estimation, permit tracking, material management, and installation scheduling',
  icon: 'anchor',

  keywords: [
    'dock building',
    'pier construction',
    'dock building software',
    'marine construction',
    'boat lift',
    'dock building management',
    'project estimation',
    'dock building practice',
    'dock building scheduling',
    'permit tracking',
    'dock building crm',
    'material management',
    'dock building business',
    'installation scheduling',
    'dock building pos',
    'seawall',
    'dock building operations',
    'floating dock',
    'dock building platform',
    'bulkhead',
  ],

  synonyms: [
    'dock building platform',
    'dock building software',
    'pier construction software',
    'marine construction software',
    'boat lift software',
    'project estimation software',
    'dock building practice software',
    'permit tracking software',
    'material management software',
    'seawall software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and quotes' },
    { id: 'admin', name: 'Contractor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and permits' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'crew', name: 'Crew Lead', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/schedule' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'appointments',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'team-management',
    'gallery',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'construction',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a dock building platform',
    'Create a pier construction portal',
    'I need a marine contractor system',
    'Build a dock project management platform',
    'Create a seawall contractor app',
  ],
};
