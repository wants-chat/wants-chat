/**
 * Water Utility App Type Definition
 *
 * Complete definition for water utility and water service applications.
 * Essential for water utilities, water districts, and water management companies.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATER_UTILITY_APP_TYPE: AppTypeDefinition = {
  id: 'water-utility',
  name: 'Water Utility',
  category: 'energy',
  description: 'Water utility platform with billing, meter management, service requests, and infrastructure monitoring',
  icon: 'droplet',

  keywords: [
    'water utility',
    'water district',
    'water service',
    'water utility software',
    'water billing',
    'water meter',
    'water management',
    'water infrastructure',
    'water customer service',
    'water rates',
    'water system',
    'municipal water',
    'water supply',
    'water operations',
    'water quality',
    'water conservation',
    'water utility business',
    'water accounts',
    'water usage',
    'water reporting',
  ],

  synonyms: [
    'water utility platform',
    'water utility software',
    'water district software',
    'water billing software',
    'water meter software',
    'water management software',
    'water service software',
    'water customer software',
    'municipal water software',
    'water operations software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'bottled water'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Bills and service' },
    { id: 'admin', name: 'Utility Dashboard', enabled: true, basePath: '/admin', requiredRole: 'operator', layout: 'admin', description: 'Accounts and infrastructure' },
  ],

  roles: [
    { id: 'admin', name: 'Utility Director', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/operations' },
    { id: 'operator', name: 'System Operator', level: 55, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/infrastructure' },
    { id: 'csr', name: 'Customer Service', level: 45, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/accounts' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'payments',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'analytics',
  ],

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'energy',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build a water utility platform',
    'Create a water billing app',
    'I need a water meter management system',
    'Build a water district app',
    'Create a water utility customer portal',
  ],
};
