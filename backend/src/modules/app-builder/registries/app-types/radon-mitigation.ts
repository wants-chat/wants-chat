/**
 * Radon Mitigation App Type Definition
 *
 * Complete definition for radon testing and mitigation operations.
 * Essential for radon contractors, indoor air quality specialists, and environmental testing.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RADON_MITIGATION_APP_TYPE: AppTypeDefinition = {
  id: 'radon-mitigation',
  name: 'Radon Mitigation',
  category: 'services',
  description: 'Radon mitigation platform with testing scheduling, mitigation design, installation tracking, and compliance reporting',
  icon: 'wind',

  keywords: [
    'radon mitigation',
    'radon testing',
    'radon mitigation software',
    'indoor air quality',
    'environmental testing',
    'radon mitigation management',
    'testing scheduling',
    'radon mitigation practice',
    'radon mitigation scheduling',
    'mitigation design',
    'radon mitigation crm',
    'installation tracking',
    'radon mitigation business',
    'compliance reporting',
    'radon mitigation pos',
    'radon reduction',
    'radon mitigation operations',
    'sub slab depressurization',
    'radon mitigation platform',
    'real estate testing',
  ],

  synonyms: [
    'radon mitigation platform',
    'radon mitigation software',
    'radon testing software',
    'indoor air quality software',
    'environmental testing software',
    'testing scheduling software',
    'radon mitigation practice software',
    'mitigation design software',
    'installation tracking software',
    'radon reduction software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Testing and reports' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Tests and installs' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'tester', name: 'Radon Tester', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/tests' },
    { id: 'installer', name: 'Mitigation Tech', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/installs' },
    { id: 'customer', name: 'Homeowner', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'reporting',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'safety',

  examplePrompts: [
    'Build a radon mitigation platform',
    'Create a radon testing company app',
    'I need a radon service system',
    'Build a radon contractor app',
    'Create a radon mitigation portal',
  ],
};
