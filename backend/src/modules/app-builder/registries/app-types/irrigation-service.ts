/**
 * Irrigation Service App Type Definition
 *
 * Complete definition for irrigation and sprinkler system operations.
 * Essential for irrigation contractors, sprinkler services, and landscape watering.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const IRRIGATION_SERVICE_APP_TYPE: AppTypeDefinition = {
  id: 'irrigation-service',
  name: 'Irrigation Service',
  category: 'services',
  description: 'Irrigation service platform with system design, maintenance scheduling, winterization tracking, and smart controller integration',
  icon: 'droplets',

  keywords: [
    'irrigation service',
    'sprinkler system',
    'irrigation service software',
    'landscape watering',
    'drip irrigation',
    'irrigation service management',
    'system design',
    'irrigation service practice',
    'irrigation service scheduling',
    'maintenance scheduling',
    'irrigation service crm',
    'winterization',
    'irrigation service business',
    'smart controller',
    'irrigation service pos',
    'lawn sprinkler',
    'irrigation service operations',
    'water management',
    'irrigation service platform',
    'backflow testing',
  ],

  synonyms: [
    'irrigation service platform',
    'irrigation service software',
    'sprinkler system software',
    'landscape watering software',
    'drip irrigation software',
    'system design software',
    'irrigation service practice software',
    'maintenance scheduling software',
    'winterization software',
    'lawn sprinkler software',
  ],

  negativeKeywords: ['blog', 'portfolio', 'restaurant', 'medical'],

  sections: [
    { id: 'frontend', name: 'Customer Portal', enabled: true, basePath: '/', layout: 'public', description: 'Systems and service' },
    { id: 'admin', name: 'Service Dashboard', enabled: true, basePath: '/admin', requiredRole: 'staff', layout: 'admin', description: 'Jobs and routes' },
  ],

  roles: [
    { id: 'admin', name: 'Business Owner', level: 100, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/dashboard' },
    { id: 'designer', name: 'System Designer', level: 80, isDefault: false, accessibleSections: ['frontend', 'admin'], defaultRoute: '/admin/designs' },
    { id: 'tech', name: 'Field Technician', level: 50, isDefault: false, accessibleSections: ['admin'], defaultRoute: '/admin/jobs' },
    { id: 'customer', name: 'Customer', level: 20, isDefault: true, accessibleSections: ['frontend'], defaultRoute: '/' },
  ],

  defaultFeatures: [
    'user-auth',
    'scheduling',
    'invoicing',
    'notifications',
    'search',
  ],

  optionalFeatures: [
    'payments',
    'inventory',
    'reporting',
    'analytics',
  ],

  incompatibleFeatures: ['property-listings', 'restaurant-tables', 'medical-records'],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'moderate',
  industry: 'services',

  defaultColorScheme: 'green',
  defaultDesignVariant: 'professional',

  examplePrompts: [
    'Build an irrigation service platform',
    'Create a sprinkler service portal',
    'I need a lawn irrigation system',
    'Build an irrigation maintenance platform',
    'Create a sprinkler contractor app',
  ],
};
