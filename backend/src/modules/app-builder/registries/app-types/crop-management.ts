/**
 * Crop Management App Type Definition
 *
 * Complete definition for crop management and precision agriculture applications.
 * Essential for crop farms, agribusinesses, and precision farming operations.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CROP_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'crop-management',
  name: 'Crop Management',
  category: 'agriculture',
  description: 'Crop management platform with growth tracking, pest monitoring, input management, and yield analytics',
  icon: 'wheat',

  keywords: [
    'crop management',
    'crop tracking',
    'precision agriculture',
    'crop planning',
    'crop monitoring',
    'growth tracking',
    'pest management',
    'crop inputs',
    'crop analytics',
    'yield tracking',
    'field scouting',
    'crop health',
    'fertilizer management',
    'pesticide tracking',
    'crop rotation',
    'planting records',
    'harvest management',
    'crop software',
    'agronomy',
    'crop protection',
  ],

  synonyms: [
    'crop management platform',
    'crop management software',
    'crop tracking software',
    'precision agriculture software',
    'crop monitoring software',
    'field management software',
    'crop planning software',
    'yield management software',
    'agronomy software',
    'crop analytics platform',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'image crop'],

  sections: [
    { id: 'frontend', name: 'Field Portal', enabled: true, basePath: '/', layout: 'public', description: 'Crop status and reports' },
    { id: 'admin', name: 'Crop Dashboard', enabled: true, basePath: '/admin', requiredRole: 'manager', layout: 'admin', description: 'Fields and crop planning' },
  ],

  roles: [
    { id: 'admin', name: 'Farm Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Crop Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/fields' },
    { id: 'agronomist', name: 'Agronomist', level: 65, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/scouting' },
    { id: 'operator', name: 'Equipment Operator', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/tasks' },
    { id: 'viewer', name: 'Viewer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
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

  defaultColorScheme: 'lime',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a crop management platform',
    'Create a precision agriculture app',
    'I need a crop tracking system',
    'Build a field scouting application',
    'Create a yield analytics platform',
  ],
};
