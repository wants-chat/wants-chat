/**
 * Oil & Gas App Type Definition
 *
 * Complete definition for oil and gas operations applications.
 * Essential for oil companies, gas producers, and energy service providers.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OIL_GAS_APP_TYPE: AppTypeDefinition = {
  id: 'oil-gas',
  name: 'Oil & Gas',
  category: 'energy',
  description: 'Oil and gas platform with field operations, production tracking, safety compliance, and asset management',
  icon: 'fuel',

  keywords: [
    'oil and gas',
    'oil gas software',
    'oilfield',
    'petroleum',
    'oil production',
    'gas production',
    'drilling operations',
    'well management',
    'oil field service',
    'production tracking',
    'oil gas safety',
    'pipeline management',
    'upstream oil gas',
    'midstream',
    'downstream',
    'oil gas compliance',
    'oil gas operations',
    'energy production',
    'oil gas business',
    'oil gas assets',
  ],

  synonyms: [
    'oil gas platform',
    'oil gas software',
    'oilfield software',
    'petroleum software',
    'oil production software',
    'drilling software',
    'well management software',
    'oil field service software',
    'production tracking software',
    'pipeline management software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'fitness', 'cooking oil'],

  sections: [
    { id: 'frontend', name: 'Partner Portal', enabled: true, basePath: '/', layout: 'public', description: 'Reports and data' },
    { id: 'admin', name: 'Operations Dashboard', enabled: true, basePath: '/admin', requiredRole: 'operator', layout: 'admin', description: 'Fields and production' },
  ],

  roles: [
    { id: 'admin', name: 'Executive', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'manager', name: 'Operations Manager', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/production' },
    { id: 'engineer', name: 'Field Engineer', level: 60, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/wells' },
    { id: 'operator', name: 'Field Operator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/operations' },
    { id: 'partner', name: 'Partner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
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

  incompatibleFeatures: ['table-reservations', 'course-management', 'ticket-sales'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'energy',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an oil and gas operations platform',
    'Create an oilfield management app',
    'I need a production tracking system',
    'Build a well management app',
    'Create an oil gas safety platform',
  ],
};
