/**
 * Forestry App Type Definition
 *
 * Complete definition for forestry management and timber operations applications.
 * Essential for forestry companies, timber operations, and land management.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FORESTRY_APP_TYPE: AppTypeDefinition = {
  id: 'forestry',
  name: 'Forestry',
  category: 'agriculture',
  description: 'Forestry management platform with timber inventory, harvest planning, land mapping, and sustainability tracking',
  icon: 'tree',

  keywords: [
    'forestry',
    'forestry management',
    'timber management',
    'forest inventory',
    'logging operations',
    'timber harvesting',
    'forest land',
    'silviculture',
    'forest planning',
    'timber tracking',
    'forest mapping',
    'forestry software',
    'wood inventory',
    'forest health',
    'reforestation',
    'tree planting',
    'forest sustainability',
    'timber sales',
    'log tracking',
    'forest operations',
  ],

  synonyms: [
    'forestry management platform',
    'forestry management software',
    'timber management software',
    'forest inventory software',
    'logging operations software',
    'silviculture software',
    'forest planning software',
    'timber tracking software',
    'forestry operations software',
    'forest land management',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'random forest ml'],

  sections: [
    { id: 'frontend', name: 'Forest Portal', enabled: true, basePath: '/', layout: 'public', description: 'Land overview and reports' },
    { id: 'admin', name: 'Forestry Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Timber and operations' },
  ],

  roles: [
    { id: 'admin', name: 'Landowner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Forest Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/lands' },
    { id: 'forester', name: 'Forester', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/inventory' },
    { id: 'logger', name: 'Logging Supervisor', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/harvest' },
    { id: 'worker', name: 'Field Worker', level: 30, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'viewer', name: 'Viewer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'agriculture',

  defaultColorScheme: 'emerald',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a forestry management platform',
    'Create a timber tracking app',
    'I need a forest inventory system',
    'Build a logging operations manager',
    'Create a sustainable forestry app',
  ],
};
