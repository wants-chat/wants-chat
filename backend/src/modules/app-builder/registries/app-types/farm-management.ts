/**
 * Farm Management App Type Definition
 *
 * Complete definition for farm management and agricultural operations applications.
 * Essential for farms, ranches, and agricultural operations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FARM_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'farm-management',
  name: 'Farm Management',
  category: 'agriculture',
  description: 'Farm management platform with field tracking, crop planning, equipment management, and farm analytics',
  icon: 'tractor',

  keywords: [
    'farm management',
    'farming software',
    'agriculture management',
    'farm operations',
    'crop management',
    'field management',
    'farm planning',
    'farm records',
    'agricultural software',
    'farm tracking',
    'precision agriculture',
    'farm analytics',
    'farm inventory',
    'farm equipment',
    'harvest tracking',
    'planting schedule',
    'farm labor',
    'farm accounting',
    'agri-tech',
    'smart farming',
  ],

  synonyms: [
    'farm management platform',
    'farm management software',
    'farming software',
    'agricultural management software',
    'farm operations software',
    'crop planning software',
    'farm tracking software',
    'precision farming software',
    'farm record keeping',
    'agricultural operations platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'game farm'],

  sections: [
    { id: 'frontend', name: 'Farm Portal', enabled: true, basePath: '/', layout: 'public', description: 'Farm overview and reports' },
    { id: 'admin', name: 'Farm Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Operations and planning' },
  ],

  roles: [
    { id: 'admin', name: 'Farm Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Farm Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/fields' },
    { id: 'supervisor', name: 'Field Supervisor', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'worker', name: 'Farm Worker', level: 35, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/assignments' },
    { id: 'viewer', name: 'Viewer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'tasks',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'ticket-sales', 'course-management'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'agriculture',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a farm management platform',
    'Create an agriculture operations app',
    'I need a crop planning system',
    'Build a smart farming application',
    'Create a farm record keeping system',
  ],
};
