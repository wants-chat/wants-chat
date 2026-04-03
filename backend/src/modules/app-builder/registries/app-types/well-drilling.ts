/**
 * Well Drilling App Type Definition
 *
 * Complete definition for well drilling operations.
 * Essential for well drillers, water well contractors, and geothermal installers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WELL_DRILLING_APP_TYPE: AppTypeDefinition = {
  id: 'well-drilling',
  name: 'Well Drilling',
  category: 'construction',
  description: 'Well drilling platform with project estimation, permit tracking, drilling logs, and pump installation',
  icon: 'drill',

  keywords: [
    'well drilling',
    'water well',
    'well drilling software',
    'geothermal',
    'well contractor',
    'well drilling management',
    'project estimation',
    'well drilling practice',
    'well drilling scheduling',
    'permit tracking',
    'well drilling crm',
    'drilling logs',
    'well drilling business',
    'pump installation',
    'well drilling pos',
    'well pump service',
    'well drilling operations',
    'water testing',
    'well drilling platform',
    'hydrofracturing',
  ],

  synonyms: [
    'well drilling platform',
    'well drilling software',
    'water well software',
    'geothermal software',
    'well contractor software',
    'project estimation software',
    'well drilling practice software',
    'permit tracking software',
    'drilling logs software',
    'well pump service software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Projects and quotes' },
    { id: 'admin', name: 'Contractor Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Drilling and permits' },
  ],

  roles: [
    { id: 'admin', name: 'Company Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Project Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/projects' },
    { id: 'driller', name: 'Well Driller', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/drilling' },
    { id: 'customer', name: 'Property Owner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  industry: 'construction',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build a well drilling platform',
    'Create a water well contractor app',
    'I need a well drilling project system',
    'Build a geothermal drilling app',
    'Create a well drilling company portal',
  ],
};
