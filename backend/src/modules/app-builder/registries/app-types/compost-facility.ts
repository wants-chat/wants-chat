/**
 * Compost Facility App Type Definition
 *
 * Complete definition for compost facility operations.
 * Essential for composting facilities, organic waste processors, and soil amendment producers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COMPOST_FACILITY_APP_TYPE: AppTypeDefinition = {
  id: 'compost-facility',
  name: 'Compost Facility',
  category: 'environmental',
  description: 'Compost facility platform with material intake, process monitoring, product sales, and environmental compliance',
  icon: 'leaf',

  keywords: [
    'compost facility',
    'organic waste',
    'compost facility software',
    'soil amendment',
    'green waste',
    'compost facility management',
    'material intake',
    'compost facility practice',
    'compost facility scheduling',
    'process monitoring',
    'compost facility crm',
    'product sales',
    'compost facility business',
    'environmental compliance',
    'compost facility pos',
    'food waste composting',
    'compost facility operations',
    'windrow composting',
    'compost facility platform',
    'biosolids',
  ],

  synonyms: [
    'compost facility platform',
    'compost facility software',
    'organic waste software',
    'soil amendment software',
    'green waste software',
    'material intake software',
    'compost facility practice software',
    'process monitoring software',
    'product sales software',
    'food waste composting software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'real-estate'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Products and drop-offs' },
    { id: 'admin', name: 'Facility Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Operations and compliance' },
  ],

  roles: [
    { id: 'admin', name: 'Facility Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/processing' },
    { id: 'staff', name: 'Facility Staff', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/intake' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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
  industry: 'environmental',

  defaultColorScheme: 'brown',
  defaultDesignVariant: 'earthy',

  examplePrompts: [
    'Build a compost facility platform',
    'Create an organic waste processing app',
    'I need a composting operation system',
    'Build a soil amendment producer app',
    'Create a compost facility portal',
  ],
};
