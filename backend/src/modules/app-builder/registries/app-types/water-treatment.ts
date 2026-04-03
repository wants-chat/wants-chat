/**
 * Water Treatment App Type Definition
 *
 * Complete definition for water treatment facilities and services.
 * Essential for water treatment plants, purification services, and wastewater facilities.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WATER_TREATMENT_APP_TYPE: AppTypeDefinition = {
  id: 'water-treatment',
  name: 'Water Treatment',
  category: 'environmental',
  description: 'Water treatment platform with plant monitoring, quality testing, maintenance scheduling, and compliance reporting',
  icon: 'droplet',

  keywords: [
    'water treatment',
    'water purification',
    'water treatment software',
    'wastewater treatment',
    'water quality',
    'water treatment management',
    'plant monitoring',
    'water treatment practice',
    'water treatment scheduling',
    'quality testing',
    'water treatment crm',
    'potable water',
    'water treatment business',
    'sewage treatment',
    'water treatment pos',
    'filtration systems',
    'water treatment operations',
    'chlorination',
    'water treatment services',
    'effluent treatment',
  ],

  synonyms: [
    'water treatment platform',
    'water treatment software',
    'water purification software',
    'wastewater treatment software',
    'water quality software',
    'plant monitoring software',
    'water treatment practice software',
    'quality testing software',
    'potable water software',
    'effluent treatment software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'retail', 'food'],

  sections: [
    { id: 'frontend', name: 'Public Portal', enabled: true, basePath: '/', layout: 'public', description: 'Quality reports' },
    { id: 'admin', name: 'Plant Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Operations and testing' },
  ],

  roles: [
    { id: 'admin', name: 'Plant Manager', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'supervisor', name: 'Operations Supervisor', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/operations' },
    { id: 'operator', name: 'Plant Operator', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/monitoring' },
    { id: 'public', name: 'Public User', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'reporting',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'medical-records', 'restaurant-tables'],

  requiresAuth: true,
  requiresPayment: false,
  multiTenant: true,
  complexity: 'complex',
  industry: 'environmental',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'industrial',

  examplePrompts: [
    'Build a water treatment platform',
    'Create a water plant monitoring portal',
    'I need a wastewater treatment management system',
    'Build a water quality testing platform',
    'Create a plant operations and compliance app',
  ],
};
